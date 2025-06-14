import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents } from "~/server/api/events";
import { handleCreateAdminEvent } from "~/server/api/admin-events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import {
  createEventSchema,
  eventQuerySchema,
} from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events
 * Get all events with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      organizerId: searchParams.get("organizerId"),
      search: searchParams.get("search"),
      featured: searchParams.has("featured")
        ? searchParams.get("featured")
        : undefined,
    };

    console.log("Query params:", queryParams);
    console.log(
      "Raw search params:",
      Object.fromEntries(searchParams.entries()),
    );
    console.log("Request URL:", request.nextUrl.toString());

    // Validate query parameters
    const validatedParams = eventQuerySchema.safeParse(queryParams);

    if (!validatedParams.success) {
      console.error("Validation error:", validatedParams.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validatedParams.error.format(),
        },
        { status: 400 },
      );
    }

    // Log validated params
    console.log(
      "Validated params:",
      JSON.stringify(validatedParams.data, null, 2),
    );

    // Call business logic
    const result = await handleGetEvents(validatedParams.data);

    // Log result
    console.log("Found events:", result.events.length);
    console.log("Total events:", result.meta.total);

    // Return response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Error getting events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get events" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins and organizers can create events
    if (
      session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.ORGANIZER
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = createEventSchema.parse(body);

      // Call admin event creation logic (bypasses approval workflow)
      const event = await handleCreateAdminEvent(validatedData, session.user.id);

      // Return response
      return NextResponse.json({
        success: true,
        data: event,
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 },
    );
  }
}
