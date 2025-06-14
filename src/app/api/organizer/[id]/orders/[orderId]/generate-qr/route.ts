import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
});

/**
 * POST /api/organizer/[id]/orders/[orderId]/generate-qr
 * Generate QR codes for a specific order (organizer only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { id: organizerId, orderId } = validatedParams.data;

    // Get user session and verify organizer access
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check if user is an organizer
    const organizer = await organizerService.findByUserId(session.user.id);
    if (!organizer) {
      return NextResponse.json(
        {
          success: false,
          error: "User is not an organizer",
        },
        { status: 403 }
      );
    }

    // Verify the organizer ID matches
    if (organizer.id !== organizerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 }
      );
    }

    // Verify the order belongs to this organizer
    const order = await prisma.transaction.findFirst({
      where: {
        id: orderId,
        event: {
          organizerId: organizer.id,
        },
      },
      include: {
        event: true,
        tickets: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found or access denied",
        },
        { status: 404 }
      );
    }

    // Check if order is approved
    if (order.status !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,
          error: "Order must be approved before generating QR codes",
        },
        { status: 400 }
      );
    }

    // Generate QR codes for the order
    const result = await generateTransactionQRCodes(orderId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate QR codes",
          details: result.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.generatedCount} QR codes`,
      data: {
        orderId,
        generatedCount: result.generatedCount,
        totalTickets: order.tickets.length,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error generating QR codes for order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
