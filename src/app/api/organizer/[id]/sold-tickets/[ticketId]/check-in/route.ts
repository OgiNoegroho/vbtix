import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleTicketCheckIn } from "~/server/api/organizer-tickets";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for check-in request
const checkInSchema = z.object({
  checkIn: z.boolean().default(true),
  notes: z.string().optional(),
});

/**
 * PUT /api/organizer/[id]/sold-tickets/[ticketId]/check-in
 * Check in or check out a ticket
 */
export async function PUT(
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkInSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Call business logic
    const result = await handleTicketCheckIn({
      organizerId,
      ticketId,
      checkIn: validatedData.data.checkIn,
      notes: validatedData.data.notes,
      checkedInBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: validatedData.data.checkIn 
        ? "Ticket checked in successfully" 
        : "Ticket check-in reversed successfully",
    });
  } catch (error: any) {
    console.error("Error checking in ticket:", error);
    
    if (error.message === "Ticket not found") {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (error.message === "Ticket already checked in") {
      return NextResponse.json(
        { success: false, error: "Ticket is already checked in" },
        { status: 400 }
      );
    }

    if (error.message === "Ticket not active") {
      return NextResponse.json(
        { success: false, error: "Only active tickets can be checked in" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to check in ticket" 
      },
      { status: 500 }
    );
  }
}
