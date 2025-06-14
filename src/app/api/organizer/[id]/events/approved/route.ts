import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { ticketService } from "~/server/services/ticket.service";
import { organizerService } from "~/server/services/organizer.service";

/**
 * GET /api/organizer/[id]/events/approved
 * Get approved events for an organizer that can have tickets created
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // Only organizers and admins can access this endpoint
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id: organizerId } = await params;

    // For organizers, ensure they can only access their own data
    if (session.user.role === UserRole.ORGANIZER) {
      const organizer = await organizerService.findByUserId(session.user.id);
      if (!organizer || organizer.id !== organizerId) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 },
        );
      }
    }

    // Get approved events for the organizer
    const approvedEvents = await ticketService.getApprovedEventsForOrganizer(organizerId);

    return NextResponse.json({
      success: true,
      data: approvedEvents,
      message: `Found ${approvedEvents.length} approved events`,
    });
  } catch (error: any) {
    console.error("Error getting approved events:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get approved events" },
      { status: 500 },
    );
  }
}
