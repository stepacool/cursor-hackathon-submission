import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";
import mysqlPool from "@/db/tibd";
import type {ResultSetHeader} from "mysql2";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const connection = await mysqlPool.getConnection();

    try {
      // Query to get all transactions where the user is involved
      // This includes transactions where the user is either the sender (from_account) or receiver (to_account)
      const [rows] = await connection.query(
        `SELECT 
          t.*,
          from_acc.account_number as from_account_number,
          from_acc.user_id as from_user_id,
          to_acc.account_number as to_account_number,
          to_acc.user_id as to_user_id
        FROM transactions t
        LEFT JOIN bank_accounts from_acc ON t.from_account_id = from_acc.id
        LEFT JOIN bank_accounts to_acc ON t.to_account_id = to_acc.id
        WHERE from_acc.user_id = ? OR to_acc.user_id = ?
        ORDER BY t.created_at DESC`,
        [session.user.id, session.user.id]
      );

      return NextResponse.json(
        { success: true, data: rows },
        { status: 200 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 },
    );
  }
}

type DbAccount = {
  id: number;
  user_id: string;
  balance: string;
  currency: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  account_number?: string;
  title?: string;
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      fromAccountId,
      toAccountNumber,
      amount,
      recipientName,
      note,
    } = body ?? {};

    const parsedFromAccountId = Number(fromAccountId);
    if (!Number.isInteger(parsedFromAccountId) || parsedFromAccountId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid source account" },
        { status: 400 },
      );
    }

    const sanitizedAccountNumber = typeof toAccountNumber === "string"
      ? toAccountNumber.trim().toUpperCase()
      : "";

    if (!sanitizedAccountNumber) {
      return NextResponse.json(
        { success: false, error: "Destination account number is required" },
        { status: 400 },
      );
    }

    const parsedAmount = Number(amount);
    const amountInCents = Math.round(parsedAmount * 100);
    if (!Number.isFinite(parsedAmount) || amountInCents <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid transfer amount" },
        { status: 400 },
      );
    }

    const trimmedRecipientName = typeof recipientName === "string"
      ? recipientName.trim()
      : "";
    const trimmedNote = typeof note === "string" ? note.trim() : "";

    const connection = await mysqlPool.getConnection();
    let transactionActive = false;
    let rolledBack = false;

    try {
      await connection.beginTransaction();
      transactionActive = true;

      const fail = async (errorMessage: string, status = 400) => {
        if (transactionActive && !rolledBack) {
          await connection.rollback();
          rolledBack = true;
        }
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status },
        );
      };

      const [fromRows] = await connection.query(
        `SELECT id, user_id, balance, currency, status 
         FROM bank_accounts 
         WHERE id = ? AND user_id = ? 
         LIMIT 1
         FOR UPDATE`,
        [parsedFromAccountId, session.user.id],
      );
      const fromAccount = (fromRows as DbAccount[])[0];

      if (!fromAccount) {
        return fail("Source account not found", 404);
      }

      if (fromAccount.status !== "ACTIVE") {
        return fail("Source account is not active");
      }

      const [toRows] = await connection.query(
        `SELECT id, user_id, balance, currency, status, account_number, title 
         FROM bank_accounts 
         WHERE UPPER(account_number) = ? 
         LIMIT 1
         FOR UPDATE`,
        [sanitizedAccountNumber],
      );
      const toAccount = (toRows as DbAccount[])[0];

      if (!toAccount) {
        return fail("Destination account not found", 404);
      }

      if (toAccount.status !== "ACTIVE") {
        return fail("Destination account is not active");
      }

      if (toAccount.id === fromAccount.id) {
        return fail("Cannot transfer to the same account");
      }

      if (toAccount.currency !== fromAccount.currency) {
        return fail("Both accounts must share the same currency");
      }

      const fromBalanceNumber = Number(fromAccount.balance);
      const toBalanceNumber = Number(toAccount.balance);

      if (!Number.isFinite(fromBalanceNumber)) {
        return fail("Invalid source account balance");
      }

      if (!Number.isFinite(toBalanceNumber)) {
        return fail("Invalid destination account balance");
      }

      const fromBalanceInCents = Math.round(fromBalanceNumber * 100);
      const toBalanceInCents = Math.round(toBalanceNumber * 100);

      if (amountInCents > fromBalanceInCents) {
        return fail("Insufficient balance for this transfer");
      }

      const newFromBalanceInCents = fromBalanceInCents - amountInCents;
      const newToBalanceInCents = toBalanceInCents + amountInCents;

      const newFromBalance = (newFromBalanceInCents / 100).toFixed(2);
      const newToBalance = (newToBalanceInCents / 100).toFixed(2);

      const now = new Date();

      await connection.query(
        `UPDATE bank_accounts 
         SET balance = ?, updated_at = ? 
         WHERE id = ?`,
        [newFromBalance, now, fromAccount.id],
      );

      await connection.query(
        `UPDATE bank_accounts 
         SET balance = ?, updated_at = ? 
         WHERE id = ?`,
        [newToBalance, now, toAccount.id],
      );

      const reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;

      const descriptionParts = [];
      if (trimmedRecipientName) {
        descriptionParts.push(`Transfer to ${trimmedRecipientName}`);
      } else {
        descriptionParts.push(`Transfer to ${toAccount.title ?? "recipient"}`);
      }

      if (trimmedNote) {
        descriptionParts.push(trimmedNote);
      }

      const description = descriptionParts.join(" • ");

      const [insertResult] = await connection.query(
        `INSERT INTO transactions (
          reference,
          from_account_id,
          to_account_id,
          amount,
          currency,
          type,
          status,
          description,
          created_at,
          completed_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 'TRANSFER', 'COMPLETED', ?, ?, ?, ?)`,
        [
          reference,
          fromAccount.id,
          toAccount.id,
          (amountInCents / 100).toFixed(2),
          fromAccount.currency,
          description,
          now,
          now,
          now,
        ],
      );

      const transactionId = (insertResult as ResultSetHeader).insertId;

      const [transactionRows] = await connection.query(
        `SELECT 
          t.*,
          from_acc.account_number as from_account_number,
          from_acc.user_id as from_user_id,
          to_acc.account_number as to_account_number,
          to_acc.user_id as to_user_id
        FROM transactions t
        LEFT JOIN bank_accounts from_acc ON t.from_account_id = from_acc.id
        LEFT JOIN bank_accounts to_acc ON t.to_account_id = to_acc.id
        WHERE t.id = ?`,
        [transactionId],
      );

      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: "Transfer completed successfully",
          data: {
            transaction: (transactionRows as any[])[0],
            balances: {
              fromAccount: { id: fromAccount.id, balance: newFromBalance },
              toAccount: { id: toAccount.id, balance: newToBalance },
            },
          },
        },
        { status: 201 },
      );
    } catch (error) {
      if (transactionActive && !rolledBack) {
        await connection.rollback();
      }
      console.error("Error creating transaction:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create transaction" },
        { status: 500 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing transaction request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process transaction request" },
      { status: 500 },
    );
  }
}
