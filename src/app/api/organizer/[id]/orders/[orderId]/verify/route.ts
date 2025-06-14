import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { handleUpdateOrganizerOrderStatus } from "~/server/api/organizer-orders";

// Validation schema for order verification
const orderVerificationSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  notes: z.string().optional(),
});

/**
 * PATCH /api/organizer/[id]/orders/[orderId]/verify
 * Verify manual payment (approve/reject) by organizer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> },
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

    // Only organizers and admins can verify orders
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id: organizerId, orderId } = await params;
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = orderVerificationSchema.parse(body);

      // Update order status
      const updatedOrder = await handleUpdateOrganizerOrderStatus({
        userId: session.user.id,
        orderId: orderId,
        status: validatedData.status,
        notes: validatedData.notes,
      });

      return NextResponse.json({
        success: true,
        data: updatedOrder,
        message: 
          validatedData.status === "SUCCESS" 
            ? "Manual payment approved successfully. Tickets have been generated and sent to customer."
            : "Manual payment rejected successfully.",
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    const { orderId } = await params;
    console.error(`Error verifying order ${orderId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to verify order",
      },
      { status: 500 },
    );
  }
}
