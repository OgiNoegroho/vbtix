import { NextRequest, NextResponse } from "next/server";
import { handleReviewEvent } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole, EventStatus } from "@prisma/client";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum([EventStatus.PUBLISHED, EventStatus.REJECTED]),
  feedback: z.string().optional(),
});

/**
 * POST /api/admin/events/[eventid]/review
 * Review (approve/reject) an event
 */
export async function POST(
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

    // Only admins can review events
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { eventid } = await params;
    
    // Validate eventid exists
    if (!eventid) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 },
      );
    }
    
    const body = await request.json();    try {
      // Validate input
      const { status, feedback } = reviewSchema.parse(body);

      // Review event
      const result = await handleReviewEvent(eventid, status, feedback);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    const { eventid } = await params;
    console.error(`Error reviewing event ${eventid}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to review event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}
