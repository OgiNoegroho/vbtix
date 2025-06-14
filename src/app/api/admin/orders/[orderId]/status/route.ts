import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { handleUpdateOrderStatus } from "~/server/api/admin-orders";

// Validation schema for order status update
const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  notes: z.string().optional(),
});

/**
 * PATCH /api/admin/orders/[orderId]/status
 * Update order status (approve/reject manual payment) by admin
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
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

    // Only admins can update order status
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { orderId } = await params;
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = orderStatusUpdateSchema.parse(body);

      // Update order status
      const updatedOrder = await handleUpdateOrderStatus({
        orderId: orderId,
        status: validatedData.status,
        notes: validatedData.notes,
        adminId: session.user.id,
      });

      return NextResponse.json({
        success: true,
        data: updatedOrder,
        message: "Order status updated successfully",
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    const { orderId } = await params;
    console.error(`Error updating order status for ${orderId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update order status",
      },
      { status: 500 },
    );
  }
}
