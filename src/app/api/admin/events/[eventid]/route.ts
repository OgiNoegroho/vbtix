import { NextRequest, NextResponse } from "next/server";
import {
  handleGetEventById,
  handleUpdateEvent,
  handleDeleteEvent,
} from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events/[eventid]
 * Get event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventid: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

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
    }    const event = await handleGetEventById(eventid);

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    const { eventid } = await params;
    console.error(`Error getting event ${eventid}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}

/**
 * PUT /api/admin/events/[eventid]
 * Update an event
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventid: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

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
      const validatedData = updateEventSchema.parse(body);
      const updatedEvent = await handleUpdateEvent(
        eventid,
        validatedData,
        session.user.id,
      );

      return NextResponse.json({
        success: true,
        data: updatedEvent,
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    const { eventid } = await params;
    console.error(`Error updating event ${eventid}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}

/**
 * DELETE /api/admin/events/[eventid]
 * Delete an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventid: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

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
    
    await handleDeleteEvent(eventid, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    const { eventid } = await params;
    console.error(`Error deleting event ${eventid}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}
