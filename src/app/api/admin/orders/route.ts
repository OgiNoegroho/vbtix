import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { handleGetAdminOrders } from "~/server/api/admin-orders";

// Validation schema for query parameters
const adminOrdersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.union([z.nativeEnum(PaymentStatus), z.literal("MANUAL_PENDING")]).optional(),
  search: z.string().optional(),
});

/**
 * GET /api/admin/orders
 * Get all orders for admin with pagination and filtering
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

    // Parse and validate query parameters
    const parsedParams = adminOrdersQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit, status, search } = parsedParams.data;

    // Get orders for admin
    const result = await handleGetAdminOrders({
      page,
      limit,
      status,
      search,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.orders,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting admin orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get orders" },
      { status: 500 },
    );
  }
}
