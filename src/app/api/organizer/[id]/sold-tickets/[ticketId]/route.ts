import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleGetOrganizerTicketDetail } from "~/server/api/organizer-tickets";
import { prisma } from "~/server/db";

/**
 * GET /api/organizer/[id]/sold-tickets/[ticketId]
 * Get detailed information about a specific ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
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

    const { id: organizerId, ticketId } = await params;

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

    // Call business logic
    const ticket = await handleGetOrganizerTicketDetail({
      organizerId,
      ticketId,
    });

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error("Error getting ticket detail:", error);
    
    if (error.message === "Ticket not found") {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get ticket detail" 
      },
      { status: 500 }
    );
  }
}
