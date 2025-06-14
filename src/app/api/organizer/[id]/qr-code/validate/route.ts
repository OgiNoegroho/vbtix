import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { validateTicketQRCode, checkInTicketWithQR } from "~/server/services/ticket-qr.service";
import { z } from "zod";

// Validation schema for request body
const validateQRSchema = z.object({
  qrCodeData: z.string().min(1, "QR code data is required"),
  checkIn: z.boolean().optional().default(false),
});

// Validation schema for route parameters
const paramsSchema = z.object({
  id: z.string().min(1),
});

/**
 * POST /api/organizer/[id]/qr-code/validate
 * Validate QR code and optionally check in ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid organizer ID",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { id: organizerId } = validatedParams.data;

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

    // Parse request body
    const body = await request.json();
    const validatedData = validateQRSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    const { qrCodeData, checkIn } = validatedData.data;

    if (checkIn) {
      // Check in the ticket
      const result = await checkInTicketWithQR(qrCodeData, organizerId);

      if (!result.success) {
        // Log failed check-in attempt
        console.warn(`❌ Failed check-in attempt by organizer ${organizerId}: ${result.error}`);

        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }

      // Log successful check-in
      console.log(`✅ Ticket checked in successfully by organizer ${organizerId} for ticket ${result.ticket?.id}`);

      return NextResponse.json({
        success: true,
        message: "Ticket checked in successfully",
        data: {
          ticket: {
            id: result.ticket?.id,
            checkedIn: result.ticket?.checkedIn,
            checkInTime: result.ticket?.checkInTime,
            event: {
              title: result.ticket?.transaction?.event?.title,
              startDate: result.ticket?.transaction?.event?.startDate,
              venue: result.ticket?.transaction?.event?.venue,
            },
            ticketType: {
              name: result.ticket?.ticketType?.name,
              price: result.ticket?.ticketType?.price,
            },
            holder: result.ticket?.ticketHolder || {
              fullName: result.ticket?.user?.name,
              email: result.ticket?.user?.email,
            },
            transaction: {
              invoiceNumber: result.ticket?.transaction?.invoiceNumber,
              status: result.ticket?.transaction?.status,
            },
          },
        },
      });
    } else {
      // Just validate the QR code
      const result = await validateTicketQRCode(qrCodeData);
      
      if (!result.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }

      // Log validation activity
      console.log(`🎫 QR code validated by organizer ${organizerId} for ticket ${result.ticket?.id}`);

      return NextResponse.json({
        success: true,
        message: "QR code is valid",
        data: {
          ticket: {
            id: result.ticket?.id,
            checkedIn: result.ticket?.checkedIn,
            checkInTime: result.ticket?.checkInTime,
            event: {
              title: result.ticket?.transaction?.event?.title,
              startDate: result.ticket?.transaction?.event?.startDate,
              venue: result.ticket?.transaction?.event?.venue,
            },
            ticketType: {
              name: result.ticket?.ticketType?.name,
              price: result.ticket?.ticketType?.price,
            },
            holder: result.ticket?.ticketHolder || {
              fullName: result.ticket?.user?.name,
              email: result.ticket?.user?.email,
            },
            transaction: {
              invoiceNumber: result.ticket?.transaction?.invoiceNumber,
              status: result.ticket?.transaction?.status,
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error validating QR code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
