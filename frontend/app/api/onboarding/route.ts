import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's onboarding status
    const [userRecord] = await db
      .select({
        isOnboardingCompleted: user.isOnboardingCompleted,
        phoneNumber: user.phoneNumber,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        isOnboardingCompleted: userRecord?.isOnboardingCompleted ?? false,
        phoneNumber: userRecord?.phoneNumber ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}

// POST - Complete onboarding
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phoneNumber, initialBalance, accountTitle } = body;

    // Validate required fields
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!accountTitle || !accountTitle.trim()) {
      return NextResponse.json(
        { success: false, error: "Account title is required" },
        { status: 400 }
      );
    }

    if (
      initialBalance === undefined ||
      initialBalance === null ||
      initialBalance < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Initial balance is required and must be at least 0",
        },
        { status: 400 }
      );
    }

    // Import mysqlPool dynamically
    const mysqlPool = (await import("@/db/tibd")).default;
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
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)`,
        [
          accountNumber,
          session.user.id,
          accountTitle.trim(),
          initialBalance,
          now,
          now,
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
          status,
          created_at,
          updated_at,
          closed_at
        FROM bank_accounts
        WHERE id = ?`,
        [(result as any).insertId]
      );

      const accountData = (accounts as any[])[0];

      // Now update user with phone number and mark onboarding as completed
      await db
        .update(user)
        .set({
          phoneNumber: phoneNumber.trim(),
          isOnboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));

      connection.release();

      return NextResponse.json({
        success: true,
        message: "Onboarding completed successfully",
        data: {
          user: {
            phoneNumber: phoneNumber.trim(),
            isOnboardingCompleted: true,
          },
          account: accountData,
        },
      });
    } catch (error) {
      connection.release();
      console.error("Error creating bank account or updating user:", error);
      return NextResponse.json(
        { success: false, error: "Failed to complete onboarding" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
