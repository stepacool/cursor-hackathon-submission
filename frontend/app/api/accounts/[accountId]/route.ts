import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";
import mysqlPool from "@/db/tibd";

// GET - Query specific account details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { accountId } = await params;
    const connection = await mysqlPool.getConnection();

    try {
      // Query specific account
      const [rows] = await connection.query(
        `SELECT 
          id,
          account_number,
          user_id,
          title,
          balance,
          status,
          created_at,
          updated_at,
          closed_at
        FROM bank_accounts
        WHERE id = ? AND user_id = ?`,
        [accountId, session.user.id]
      );

      const accounts = rows as any[];

      if (accounts.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { success: true, data: accounts[0] },
        { status: 200 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bank account' },
      { status: 500 },
    );
  }
}

// PATCH - Update account status (freeze/unfreeze/close)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { accountId } = await params;
    const body = await request.json();
    const { action } = body; // action: 'freeze', 'unfreeze', 'close'

    if (!action || !['freeze', 'unfreeze', 'close'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "freeze", "unfreeze", or "close"' },
        { status: 400 },
      );
    }

    const connection = await mysqlPool.getConnection();

    try {
      // First, check if account exists and belongs to user
      const [existingAccounts] = await connection.query(
        `SELECT id, status, closed_at FROM bank_accounts WHERE id = ? AND user_id = ?`,
        [accountId, session.user.id]
      );

      const accounts = existingAccounts as any[];

      if (accounts.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Account not found' },
          { status: 404 },
        );
      }

      const account = accounts[0];

      // Check if account is already closed
      if (account.closed_at !== null) {
        return NextResponse.json(
          { success: false, error: 'Cannot modify a closed account' },
          { status: 400 },
        );
      }

      let newStatus: string;
      let closedAt = null;
      let message = '';

      switch (action) {
        case 'freeze':
          if (account.status === 'SUSPENDED') {
            return NextResponse.json(
              { success: false, error: 'Account is already frozen' },
              { status: 400 },
            );
          }
          newStatus = 'SUSPENDED';
          message = 'Account frozen successfully';
          break;

        case 'unfreeze':
          if (account.status !== 'SUSPENDED') {
            return NextResponse.json(
              { success: false, error: 'Account is not frozen' },
              { status: 400 },
            );
          }
          newStatus = 'ACTIVE';
          message = 'Account unfrozen successfully';
          break;

        case 'close':
          if (account.status === 'CLOSED') {
            return NextResponse.json(
              { success: false, error: 'Account is already closed' },
              { status: 400 },
            );
          }
          newStatus = 'CLOSED';
          closedAt = new Date();
          message = 'Account closed successfully';
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 },
          );
      }

      // Update account status
      const now = new Date();
      await connection.query(
        `UPDATE bank_accounts 
         SET status = ?, updated_at = ?, closed_at = ?
         WHERE id = ? AND user_id = ?`,
        [newStatus, now, closedAt, accountId, session.user.id]
      );

      // Fetch updated account
      const [updatedRows] = await connection.query(
        `SELECT 
          id,
          account_number,
          user_id,
          title,
          balance,
          status,
          created_at,
          updated_at,
          closed_at
        FROM bank_accounts
        WHERE id = ?`,
        [accountId]
      );

      return NextResponse.json(
        { 
          success: true, 
          data: (updatedRows as any[])[0],
          message 
        },
        { status: 200 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bank account' },
      { status: 500 },
    );
  }
}

