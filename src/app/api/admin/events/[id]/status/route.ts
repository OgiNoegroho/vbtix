import { NextRequest, NextResponse } from "next/server";
import { handleReviewEvent } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { eventApprovalSchema } from "~/lib/validations/event.schema";

/**
 * PUT /api/admin/events/[id]/status
 * Approve or reject an event
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can approve/reject events
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    try {
      // Validate input using Zod schema
      const validatedData = eventApprovalSchema.parse({
        id,
        ...body
      });
      
      // Update event status
      const updatedEvent = await handleReviewEvent(
        validatedData.id,
        validatedData.status,
        validatedData.notes
      );
      
      return NextResponse.json({
        success: true,
        data: updatedEvent
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error reviewing event ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to review event" 
      },
      { 
        status: error.message === "Event not found" 
          ? 404 
          : error.message === "Event is not pending review"
            ? 400
            : 500 
      }
    );
  }
}
