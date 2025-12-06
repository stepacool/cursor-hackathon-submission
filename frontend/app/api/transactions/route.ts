import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";
import mysqlPool from "@/db/tibd";

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
