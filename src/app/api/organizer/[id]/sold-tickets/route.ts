import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleGetOrganizerSoldTickets } from "~/server/api/organizer-tickets";
import { prisma } from "~/server/db";

/**
 * GET /api/organizer/[id]/sold-tickets
 * Get all sold tickets for the organizer's events with filtering and pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers and admins can access this endpoint
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId } = await params;

    // For organizers, ensure they can only access their own data
    if (session.user.role === UserRole.ORGANIZER) {
      // Get organizer record to verify ownership
      const organizer = await prisma.organizer.findFirst({
        where: { userId: session.user.id },
      });

      if (!organizer || organizer.id !== organizerId) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const search = searchParams.get("search") || "";
    const eventId = searchParams.get("eventId") || "";
    const status = searchParams.get("status") || "";
    const checkInStatus = searchParams.get("checkInStatus") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Call business logic
    const result = await handleGetOrganizerSoldTickets({
      organizerId,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      eventId,
      status,
      checkInStatus,
      dateFrom,
      dateTo,
    });

    return NextResponse.json({
      success: true,
      data: result.tickets,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting organizer sold tickets:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get sold tickets" 
      },
      { status: 500 }
    );
  }
}
