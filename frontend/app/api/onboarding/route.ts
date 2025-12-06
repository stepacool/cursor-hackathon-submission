import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";


export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Return empty onboarding data for now
    // This can be extended to fetch actual onboarding data from database if needed
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onboarding data' },
      { status: 500 },
    );
  }
}
