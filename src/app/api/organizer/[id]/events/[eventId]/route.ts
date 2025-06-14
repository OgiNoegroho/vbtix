import { NextRequest, NextResponse } from "next/server";
import {
  handleGetOrganizerEventById,
  handleUpdateOrganizerEvent,
  handleDeleteOrganizerEvent,
} from "~/server/api/organizer-events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/organizer/[organizerId]/events/[eventId]
 * Get event details for the authenticated organizer
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> },
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

    // Get params - await params to avoid "sync-dynamic-apis" error
    const { eventId } = await params;

    // Call business logic
    const event = await handleGetOrganizerEventById({
      userId: session.user.id,
      eventId: eventId,
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error(`Error fetching event:`, error);

    // Handle database connectivity errors
    if (error.code === 'P1001' || error.code === 'P1017') {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error",
          details: "Unable to connect to database. Please try again later.",
          code: error.code
        },
        { status: 503 },
      );
    }

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (error.message === "Event does not belong to this organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to access this event",
        },
        { status: 403 },
      );
    }

    if (error.message === "User is not an organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "User is not an organizer",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch event details",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/organizer/[organizerId]/events/[eventId]
 * Update an event for the authenticated organizer
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> },
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

    // Only organizers and admins can update events
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { eventId } = await params;
    const body = await req.json();

    try {
      // Validate input using Zod schema
      const validatedData = updateEventSchema.parse(body);

      // Call business logic
      const updatedEvent = await handleUpdateOrganizerEvent({
        userId: session.user.id,
        eventId: eventId,
        eventData: validatedData,
      });

      return NextResponse.json({
        success: true,
        data: updatedEvent,
      });
    } catch (validationError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error(`Error updating event:`, error);

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (error.message === "Event does not belong to this organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update this event",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update event" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizer/[organizerId]/events/[eventId]
 * Delete an event for the authenticated organizer
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> },
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

    // Only organizers and admins can delete events
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { eventId } = await params;

    // Call business logic
    await handleDeleteOrganizerEvent({
      userId: session.user.id,
      eventId: eventId,
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error(`Error deleting event:`, error);

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (error.message === "Event does not belong to this organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this event",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete event" },
      { status: 500 },
    );
  }
}
