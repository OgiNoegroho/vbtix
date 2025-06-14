import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  ticketId: z.string().min(1),
});

/**
 * GET /api/debug/ticket/[ticketId]
 * Debug ticket information including QR code status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("Debug endpoint called with params:", resolvedParams);

    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      console.log("Validation failed:", validatedParams.error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ticket ID",
          details: validatedParams.error.format(),
          receivedParams: resolvedParams,
        },
        { status: 400 }
      );
    }

    const { ticketId } = validatedParams.data;

    // Get ticket with all related data
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: {
          include: {
            event: {
              include: {
                organizer: true,
              },
            },
          },
        },
        ticketType: true,
        user: true,
        ticketHolder: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket not found",
        },
        { status: 404 }
      );
    }

    // Debug information
    const debugInfo = {
      ticket: {
        id: ticket.id,
        status: ticket.status,
        qrCode: ticket.qrCode,
        qrCodeImageUrl: ticket.qrCodeImageUrl,
        qrCodeData: ticket.qrCodeData ? "Present" : "Missing",
        qrCodeGeneratedAt: ticket.qrCodeGeneratedAt,
        qrCodeStatus: ticket.qrCodeStatus,
        checkedIn: ticket.checkedIn,
        checkInTime: ticket.checkInTime,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      transaction: {
        id: ticket.transaction.id,
        status: ticket.transaction.status,
        eventId: ticket.transaction.eventId,
        createdAt: ticket.transaction.createdAt,
        updatedAt: ticket.transaction.updatedAt,
      },
      event: {
        id: ticket.transaction.event.id,
        title: ticket.transaction.event.title,
        startDate: ticket.transaction.event.startDate,
        endDate: ticket.transaction.event.endDate,
        organizerId: ticket.transaction.event.organizerId,
      },
      user: {
        id: ticket.user.id,
        name: ticket.user.name,
        email: ticket.user.email,
      },
      ticketType: {
        id: ticket.ticketType.id,
        name: ticket.ticketType.name,
        price: ticket.ticketType.price,
      },
      qrCodeChecks: {
        hasQRCodeImageUrl: !!ticket.qrCodeImageUrl,
        hasQRCodeData: !!ticket.qrCodeData,
        qrCodeStatusIsPending: ticket.qrCodeStatus === "PENDING",
        qrCodeStatusIsGenerated: ticket.qrCodeStatus === "GENERATED",
        qrCodeStatusIsActive: ticket.qrCodeStatus === "ACTIVE",
        transactionIsSuccess: ticket.transaction.status === "SUCCESS",
        canGenerateQR: ticket.transaction.status === "SUCCESS" && 
                      (ticket.qrCodeStatus === "PENDING" || !ticket.qrCodeImageUrl),
        canAccessQR: !!ticket.qrCodeImageUrl && ticket.qrCodeStatus !== "PENDING",
      },
    };

    return NextResponse.json({
      success: true,
      data: debugInfo,
    });
  } catch (error) {
    console.error("Error debugging ticket:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
