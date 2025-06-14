import { NextRequest, NextResponse } from "next/server";
import { handleGetEventStatistics } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/events/[eventid]/statistics
 * Get event statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventid: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can access statistics
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }    const { eventid } = await params;
    
    // Validate eventid exists
    if (!eventid) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 },
      );
    }

    const statistics = await handleGetEventStatistics(eventid);

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    const { eventid } = await params;
    console.error(`Error getting statistics for event ${eventid}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get event statistics",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}
