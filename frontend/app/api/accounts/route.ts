import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";
import mysqlPool from "@/db/tibd";

// GET - Query all accounts for the authenticated user
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
      // Query to get all accounts for the user
      const [rows] = await connection.query(
        `SELECT 
          id,
          account_number,
          user_id,
          title,
          balance,
          currency,
          status,
          created_at,
          updated_at,
          closed_at
        FROM bank_accounts
        WHERE user_id = ?
        ORDER BY created_at DESC`,
        [session.user.id]
      );

      return NextResponse.json(
        { success: true, data: rows },
        { status: 200 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bank accounts' },
      { status: 500 },
    );
  }
}

// POST - Create a new bank account
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { title, currency = 'USD', initialBalance = 0 } = body;

    // Validate title
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Account title is required' },
        { status: 400 },
      );
    }

    // Validate currency (basic validation)
    if (!currency || currency.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid currency code' },
        { status: 400 },
      );
    }

    // Validate initial balance
    if (initialBalance < 0) {
      return NextResponse.json(
        { success: false, error: 'Initial balance cannot be negative' },
        { status: 400 },
      );
    }

    const connection = await mysqlPool.getConnection();

    try {
      // Generate a unique account number (format: ACC-XXXXXXXXXX)
      const accountNumber = `ACC-${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const now = new Date();

      // Insert new account
      const [result] = await connection.query(
        `INSERT INTO bank_accounts (
          account_number,
          user_id,
          title,
          balance,
          currency,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [
          accountNumber,
          session.user.id,
          title.trim(),
          initialBalance,
          currency.toUpperCase(),
          now,
          now
        ]
      );

      // Fetch the created account
      const [accounts] = await connection.query(
        `SELECT 
          id,
          account_number,
          user_id,
          title,
          balance,
          currency,
          status,
          created_at,
          updated_at,
          closed_at
        FROM bank_accounts
        WHERE id = ?`,
        [(result as any).insertId]
      );

      return NextResponse.json(
        { 
          success: true, 
          data: (accounts as any[])[0],
          message: 'Bank account created successfully'
        },
        { status: 201 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bank account' },
      { status: 500 },
    );
  }
}

