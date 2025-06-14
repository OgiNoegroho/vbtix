import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizerOrders } from "~/server/api/organizer-orders";
import { auth } from "~/server/auth";
import { UserRole, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { organizerService } from "~/server/services/organizer.service";

// Validation schema for query parameters
const organizerOrdersQuerySchema = z.object({
  page: z.string().nullable().optional(),
  limit: z.string().nullable().optional(),
  status: z.union([z.nativeEnum(PaymentStatus), z.literal("MANUAL_PENDING")]).nullable().optional(),
  eventId: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
});

/**
 * GET /api/organizer/[id]/orders
 * Get all orders for the authenticated organizer with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("[API] GET /api/organizer/[id]/orders called");

    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      console.log("[API] Unauthorized access attempt");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.log("[API] User authenticated:", {
      userId: session.user.id,
      role: session.user.role
    });

    // Only organizers and admins can access this endpoint
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      console.log("[API] Forbidden access attempt by role:", session.user.role);
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Extract organizer ID from URL params
    const { id: organizerId } = await params;
    console.log("[API] Organizer ID from URL:", organizerId);

    // Validate organizerId format
    if (
      !organizerId ||
      organizerId === "events" ||
      organizerId === "undefined"
    ) {
      console.log("[API] Invalid organizer ID:", organizerId);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid organizer ID. Please access this page from your organizer dashboard.",
          details: `Received organizerId: ${organizerId}`,
        },
        { status: 400 },
      );
    }

    // For organizers, ensure they can only access their own data
    if (session.user.role === UserRole.ORGANIZER) {
      // Get organizer record to verify ownership
      const organizer = await organizerService.findByUserId(session.user.id);

      if (!organizer) {
        console.log("[API] No organizer record found for user:", session.user.id);
        return NextResponse.json(
          { success: false, error: "Organizer record not found for current user" },
          { status: 403 },
        );
      }

      if (organizer.id !== organizerId) {
        console.log("[API] Organizer ID mismatch:", {
          userOrganizerId: organizer.id,
          requestedOrganizerId: organizerId
        });
        return NextResponse.json(
          { success: false, error: "Forbidden - You can only access your own orders" },
          { status: 403 },
        );
      }

      console.log("[API] Organizer ownership verified:", {
        organizerId: organizer.id,
        orgName: organizer.orgName
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      eventId: searchParams.get("eventId"),
      search: searchParams.get("search"),
    };

    console.log("[API] Raw query parameters:", queryParams);

    const parsedParams = organizerOrdersQuerySchema.safeParse(queryParams);

    if (!parsedParams.success) {
      console.log("[API] Query parameter validation failed:", parsedParams.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit, status, eventId, search } = parsedParams.data;

    console.log("[API] Query parameters:", { page, limit, status, eventId, search });

    // Convert null values to undefined for business logic
    const cleanParams = {
      userId: session.user.id,
      page: page ?? undefined,
      limit: limit ?? undefined,
      status: status ?? undefined,
      eventId: eventId ?? undefined,
      search: search ?? undefined,
    };

    console.log("[API] Clean parameters:", cleanParams);

    // Call business logic
    console.log("[API] Calling handleGetOrganizerOrders...");
    const result = await handleGetOrganizerOrders(cleanParams);

    console.log("[API] Orders retrieved successfully:", {
      ordersCount: result.orders.length,
      total: result.meta.total,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.orders,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("[API] Error getting organizer orders:", error);
    console.error("[API] Error stack:", error.stack);

    // Handle specific error types
    if (error.message.includes("not an organizer")) {
      return NextResponse.json(
        { success: false, error: "User is not an organizer" },
        { status: 403 },
      );
    }

    if (error.message.includes("Database connection")) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to get orders" },
      { status: 500 },
    );
  }
}
