import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import {
  handleGetPendingEventsForApproval,
  handleGetApprovalStatistics,
} from "~/server/api/admin-events";
import { z } from "zod";

// Validation schema for query parameters
const approvalQuerySchema = z.object({
  page: z.union([z.string(), z.null()]).optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.union([z.string(), z.null()]).optional().transform(val => val ? parseInt(val, 10) : 12),
  search: z.union([z.string(), z.null()]).optional().transform(val => val || undefined),
  organizerId: z.union([z.string(), z.null()]).optional().transform(val => val || undefined),
  status: z.union([z.string(), z.null()]).optional().transform(val => val || undefined),
  includeStats: z.union([z.string(), z.null()]).optional().transform(val => val === "true"),
});

/**
 * GET /api/admin/events/approval
 * Get events pending approval with simplified admin workflow
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      organizerId: searchParams.get("organizerId"),
      status: searchParams.get("status"),
      includeStats: searchParams.get("includeStats"),
    };

    console.log("Raw approval params:", rawParams);

    const parsedParams = approvalQuerySchema.safeParse(rawParams);

    if (!parsedParams.success) {
      console.error("Approval validation error:", parsedParams.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format()
        },
        { status: 400 }
      );
    }

    const { includeStats, ...queryParams } = parsedParams.data;

    // Get pending events for approval
    const eventsResult = await handleGetPendingEventsForApproval(queryParams);
    console.log("Events result:", {
      eventsCount: eventsResult.events.length,
      meta: eventsResult.meta,
      firstEvent: eventsResult.events[0] ? {
        id: eventsResult.events[0].id,
        title: eventsResult.events[0].title,
        status: eventsResult.events[0].status
      } : null
    });

    // Optionally include approval statistics
    let statistics = null;
    if (includeStats) {
      try {
        statistics = await handleGetApprovalStatistics();
        console.log("Approval statistics:", statistics);
      } catch (error) {
        console.warn("Failed to get approval statistics:", error);
        // Don't fail the whole request if stats fail
      }
    }

    const response: any = {
      success: true,
      data: {
        events: eventsResult.events,
        meta: eventsResult.meta,
        statistics: statistics,
      },
    };

    console.log("Final response structure:", {
      success: response.success,
      dataLength: response.data.events.length,
      meta: response.data.meta,
      hasStatistics: !!response.data.statistics
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error getting events for approval:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get events for approval" },
      { status: 500 }
    );
  }
}
