import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getTicketQRCode } from "~/server/services/ticket-qr.service";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  ticketId: z.string().min(1),
});

/**
 * GET /api/public/tickets/[ticketId]/qr-code
 * Get QR code for a specific ticket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("QR code endpoint called with params:", resolvedParams);

    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      console.log("QR code validation failed:", validatedParams.error);
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

    // Get user session
    const session = await auth();
    const userId = session?.user?.id;

    // Get QR code for the ticket
    const result = await getTicketQRCode(ticketId, userId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.error === "Access denied" ? 403 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ticketId,
        qrCodeImageUrl: result.qrCodeImageUrl,
      },
    });
  } catch (error) {
    console.error("Error getting ticket QR code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
