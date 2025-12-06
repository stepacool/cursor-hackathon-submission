import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";


export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return NextResponse.json({
      success: true,
      data: enrichedRows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: offset + rows.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 },
    );
  }
