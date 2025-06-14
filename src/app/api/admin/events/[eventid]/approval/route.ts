import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import {
  handleApproveEvent,
  handleRejectEvent,
} from "~/server/api/admin-events";
import { z } from "zod";

// Validation schemas
const approvalSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

/**
 * POST /api/admin/events/[eventid]/approval
 * Approve or reject an event with simplified workflow
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

    // Only admins can approve/reject events
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
    
    const body = await request.json();

    try {
      // Validate input
      const { action, notes } = approvalSchema.parse(body);

      let result;
      if (action === "approve") {
        result = await handleApproveEvent(eventid, session.user.id, notes);
      } else {
        // For rejection, notes should be required
        if (!notes?.trim()) {
          return NextResponse.json(
            { success: false, error: "Notes are required for rejection" },
            { status: 400 },
          );
        }
        result = await handleRejectEvent(eventid, session.user.id, notes);
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: action === "approve" 
          ? "Event berhasil disetujui" 
          : "Event berhasil ditolak",
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    const { eventid } = await params;
    console.error(`Error processing event approval ${eventid}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process event approval",
      },
      {
        status:
          error.message === "Event not found"
            ? 404
            : error.message === "Event is not pending review"
              ? 400
              : 500,
      },
    );
  }
}
