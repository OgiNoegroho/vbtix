import { NextRequest, NextResponse } from "next/server";
import {
  handleGetTicketTypes,
  handleCreateTicketType,
} from "~/server/api/tickets";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { createTicketTypeSchema } from "~/lib/validations/ticket.schema";

/**
 * GET /api/organizer/events/[id]/tickets
 * Get all tickets for a specific event
 */
export async function GET(
  request: NextRequest,
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

    // Get params
    const { eventId } = await params;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || undefined;
    const limit = searchParams.get("limit") || undefined;

    // Call business logic
    const result = await handleGetTicketTypes({
      eventId,
      page,
      limit,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.ticketTypes,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error(`Error getting tickets:`, error);

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to get tickets" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizer/events/[id]/tickets
 * Create a new ticket type for a specific event
 */
export async function POST(
  request: NextRequest,
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

    // Only organizers and admins can create ticket types
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
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = createTicketTypeSchema.parse(body);

      // Call business logic
      const ticketType = await handleCreateTicketType({
        userId: session.user.id,
        eventId,
        ticketTypeData: {
          ...validatedData,
          event: { connect: { id: eventId } },
        },
      });

      // Return response
      return NextResponse.json({
        success: true,
        data: ticketType,
        message: "Ticket type created successfully",
      });
    } catch (validationError: any) {
      // Handle Zod validation errors
      if (validationError.errors) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: validationError.errors,
          },
          { status: 400 },
        );
      }

      // Handle business logic errors (event approval, authorization, etc.)
      const errorMessage = validationError.message || "Failed to create ticket type";

      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (errorMessage.includes("not found")) {
        statusCode = 404;
      } else if (errorMessage.includes("not an organizer") ||
                 errorMessage.includes("does not belong")) {
        statusCode = 403;
      } else if (errorMessage.includes("approval") ||
                 errorMessage.includes("status") ||
                 errorMessage.includes("draft") ||
                 errorMessage.includes("pending") ||
                 errorMessage.includes("rejected")) {
        statusCode = 422; // Unprocessable Entity
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: statusCode },
      );
    }
  } catch (error: any) {
    console.error(`Error creating ticket type:`, error);

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
          error: "You don't have permission to add tickets to this event",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create ticket type",
      },
      { status: 500 },
    );
  }
}
