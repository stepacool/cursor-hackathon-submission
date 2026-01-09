import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import backendDb from "@/db/backend-db";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const connection = await backendDb.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT 
          o.id,
          o.user_id,
          o.token,
          o.transaction_id,
          o.status,
          o.expires_at,
          o.created_at,
          o.updated_at,
          o.used_at,
          t.amount as transaction_amount,
          t.description as transaction_description,
          t.status as transaction_status,
          from_acc.title as from_account_title,
          to_acc.title as to_account_title
        FROM otps o
        LEFT JOIN transactions t ON o.transaction_id = t.id
        LEFT JOIN bank_accounts from_acc ON t.from_account_id = from_acc.id
        LEFT JOIN bank_accounts to_acc ON t.to_account_id = to_acc.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        LIMIT 50`,
        [session.user.id]
      );

      return NextResponse.json({ success: true, data: rows }, { status: 200 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching OTPs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch OTPs" },
      { status: 500 }
    );
  }
}
