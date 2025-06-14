import { NextRequest, NextResponse } from "next/server";
import { handleSubmitOrganizerEventForReview } from "~/server/api/organizer-events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * POST /api/organizer/[id]/events/[eventId]/submit
 * Submit an organizer event for admin review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
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

    // Only organizers can submit events for review
    if (session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id, eventId } = await params;

    // Validate parameters
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Call business logic
    const event = await handleSubmitOrganizerEventForReview({
      userId: session.user.id,
      eventId,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: event,
      message: "Event submitted for review successfully",
    });
  } catch (error: any) {
    console.error("Error submitting event for review:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit event for review" },
      { status: 500 }
    );
  }
}
