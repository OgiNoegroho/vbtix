import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleGetOrganizerTicketStats } from "~/server/api/organizer-tickets";
import { prisma } from "~/server/db";

/**
 * GET /api/organizer/[id]/sold-tickets/stats
 * Get ticket statistics for the organizer's events
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

    // Call business logic
    const stats = await handleGetOrganizerTicketStats(organizerId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error getting organizer ticket stats:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get ticket statistics" 
      },
      { status: 500 }
    );
  }
}
