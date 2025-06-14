import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleExportOrganizerTickets } from "~/server/api/organizer-tickets";
import { prisma } from "~/server/db";

/**
 * GET /api/organizer/[id]/sold-tickets/export
 * Export sold tickets data as CSV or Excel
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
    const format = searchParams.get("format") || "csv";
    const search = searchParams.get("search") || "";
    const eventId = searchParams.get("eventId") || "";
    const status = searchParams.get("status") || "";
    const checkInStatus = searchParams.get("checkInStatus") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Call business logic
    const result = await handleExportOrganizerTickets({
      organizerId,
      format: format as "csv" | "excel",
      search,
      eventId,
      status,
      checkInStatus,
      dateFrom,
      dateTo,
    });

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set("Content-Type", result.contentType);
    headers.set("Content-Disposition", `attachment; filename="${result.filename}"`);

    return new NextResponse(result.data, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Error exporting organizer tickets:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to export tickets" 
      },
      { status: 500 }
    );
  }
}
