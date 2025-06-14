import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole, EventStatus } from "@prisma/client";
import { eventQuerySchema } from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events/pending
 * Get all events with PENDING_REVIEW status
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: EventStatus.PENDING_REVIEW, // Force status to PENDING_REVIEW
      organizerId: searchParams.get("organizerId"),
      search: searchParams.get("search"),
      featured: undefined, // Not relevant for pending events
    };



    // Validate query parameters
    const validatedParams = eventQuerySchema.safeParse(queryParams);

    if (!validatedParams.success) {
      console.error("Validation error:", validatedParams.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validatedParams.error.format()
        },
        { status: 400 }
      );
    }

    // Call business logic to get events with PENDING_REVIEW status
    const result = await handleGetEvents({
      ...validatedParams.data,
      status: EventStatus.PENDING_REVIEW, // Ensure status is PENDING_REVIEW
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta
    });
  } catch (error: any) {
    console.error("Error getting pending events:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get pending events" },
      { status: 500 }
    );
  }
}
