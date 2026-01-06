import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import backendDb, { type ResultSetHeader } from "@/db/backend-db";

type DbCallStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

type DbCall = {
  id: number;
  user_id: string;
  phone_number: string;
  scheduled_at: Date;
  started_at: Date | null;
  ended_at: Date | null;
  status: DbCallStatus;
  call_sid: string | null;
  duration_seconds: number | null;
  created_at: Date;
  updated_at: Date | null;
};

const VALID_STATUSES: DbCallStatus[] = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const connection = await backendDb.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT 
          id,
          user_id,
          phone_number,
          scheduled_at,
          started_at,
          ended_at,
          status,
          call_sid,
          duration_seconds,
          created_at,
          updated_at
        FROM calls
        WHERE user_id = ?
        ORDER BY scheduled_at DESC`,
        [session.user.id],
      );

      return NextResponse.json(
        { success: true, data: rows as DbCall[] },
        { status: 200 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calls" },
      { status: 500 },
    );
  }
}

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
    const { phoneNumber, scheduledAt, status: initialStatus, customerName, language } = body ?? {};

    const sanitizedPhoneNumber =
      typeof phoneNumber === "string" ? phoneNumber.trim() : "";

    if (!sanitizedPhoneNumber) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 },
      );
    }

    if (sanitizedPhoneNumber.length > 255) {
      return NextResponse.json(
        { success: false, error: "Phone number is too long" },
        { status: 400 },
      );
    }

    const sanitizedCustomerName =
      typeof customerName === "string" ? customerName.trim() : "";

    if (!sanitizedCustomerName) {
      return NextResponse.json(
        { success: false, error: "Customer name is required" },
        { status: 400 },
      );
    }

    const scheduledDate =
      typeof scheduledAt === "string" || scheduledAt instanceof Date
        ? new Date(scheduledAt)
        : null;

    if (!scheduledDate || Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid scheduled time" },
        { status: 400 },
      );
    }

    // Validate and set status (default to FAILED for pending confirmation)
    const status: DbCallStatus =
      typeof initialStatus === "string" &&
      VALID_STATUSES.includes(initialStatus as DbCallStatus)
        ? (initialStatus as DbCallStatus)
        : "FAILED";

    // Validate and set language (default to "en")
    const validLanguages = ["en", "zh", "ms"];
    const callLanguage: string =
      typeof language === "string" && validLanguages.includes(language)
        ? language
        : "en";

    const now = new Date();

    const connection = await backendDb.getConnection();

    try {
      const [insertResult] = await connection.query(
        `INSERT INTO calls (
          user_id,
          phone_number,
          scheduled_at,
          started_at,
          ended_at,
          status,
          call_sid,
          duration_seconds,
          language,
          customer_name,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, NULL, NULL, ?, NULL, NULL, ?, ?, ?, ?)`,
        [session.user.id, sanitizedPhoneNumber, scheduledDate, status, callLanguage, sanitizedCustomerName, now, now],
      );

      const callId = (insertResult as unknown as ResultSetHeader).insertId;

      const [rows] = await connection.query(
        `SELECT 
          id,
          user_id,
          phone_number,
          scheduled_at,
          started_at,
          ended_at,
          status,
          call_sid,
          duration_seconds,
          created_at,
          updated_at
        FROM calls
        WHERE id = ? AND user_id = ?
        LIMIT 1`,
        [callId, session.user.id],
      );

      const createdCall = (rows as DbCall[])[0] ?? null;

      return NextResponse.json(
        {
          success: true,
          message: "Call created successfully",
          data: createdCall,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Error creating call:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create call" },
        { status: 500 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing call request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process call request" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id, status } = body ?? {};

    const callId = Number(id);
    if (!Number.isInteger(callId) || callId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid call ID" },
        { status: 400 },
      );
    }

    if (
      typeof status !== "string" ||
      !VALID_STATUSES.includes(status as DbCallStatus)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    const now = new Date();
    const connection = await backendDb.getConnection();

    try {
      // Check if the call belongs to the user
      const [existingRows] = await connection.query(
        `SELECT id, status FROM calls WHERE id = ? AND user_id = ? LIMIT 1`,
        [callId, session.user.id],
      );

      const existingCall = (existingRows as DbCall[])[0];

      if (!existingCall) {
        return NextResponse.json(
          { success: false, error: "Call not found" },
          { status: 404 },
        );
      }

      // Update the call status
      await connection.query(
        `UPDATE calls SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
        [status, now, callId, session.user.id],
      );

      // Fetch the updated call
      const [rows] = await connection.query(
        `SELECT 
          id,
          user_id,
          phone_number,
          scheduled_at,
          started_at,
          ended_at,
          status,
          call_sid,
          duration_seconds,
          created_at,
          updated_at
        FROM calls
        WHERE id = ? AND user_id = ?
        LIMIT 1`,
        [callId, session.user.id],
      );

      const updatedCall = (rows as DbCall[])[0] ?? null;

      return NextResponse.json(
        {
          success: true,
          message: "Call status updated successfully",
          data: updatedCall,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error updating call:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update call" },
        { status: 500 },
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error processing call update request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process call update request" },
      { status: 500 },
    );
  }
}


