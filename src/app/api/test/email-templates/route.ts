import { NextRequest, NextResponse } from "next/server";
import { emailService } from "~/lib/email-service";

/**
 * POST /api/test/email-templates
 * Test email templates by sending sample emails
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'verification':
        result = await emailService.sendAccountVerification({
          to: email,
          userName: "John Doe",
          verificationUrl: "https://vbticket.com/verify?token=sample-token-123"
        });
        break;

      case 'ticket':
        result = await emailService.sendTicketDelivery({
          to: email,
          customerName: "John Doe",
          event: {
            title: "Tech Conference 2024 - Sample Event",
            date: "Sabtu, 15 Juni 2025",
            time: "09:00 - 17:00 WIB",
            location: "Jakarta Convention Center",
            address: "Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta 10270",
            image: "https://placehold.co/600x300/3b82f6/ffffff?text=Tech+Conference+2024"
          },
          order: {
            invoiceNumber: "INV-1234567890-123",
            totalAmount: 500000,
            paymentDate: "10 Juni 2025, 14:30 WIB"
          },
          tickets: [
            {
              id: "ticket-1",
              ticketNumber: "TC2024-001-123456",
              ticketType: "Early Bird",
              holderName: "John Doe",
              qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TC2024-001-123456"
            },
            {
              id: "ticket-2",
              ticketNumber: "TC2024-001-123457",
              ticketType: "Early Bird",
              holderName: "Jane Smith",
              qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TC2024-001-123457"
            }
          ]
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid email type. Use 'verification' or 'ticket'" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully`,
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Error testing email template:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/email-templates
 * Get information about available email templates
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      templates: [
        {
          type: "verification",
          name: "Account Verification",
          description: "Email sent to users to verify their email address",
          testEndpoint: "POST /api/test/email-templates",
          payload: {
            type: "verification",
            email: "test@example.com"
          }
        },
        {
          type: "ticket",
          name: "Ticket Delivery",
          description: "Email sent to customers with their purchased tickets",
          testEndpoint: "POST /api/test/email-templates",
          payload: {
            type: "ticket",
            email: "test@example.com"
          }
        }
      ],
      configuration: {
        provider: "Resend",        from: process.env.EMAIL_FROM || "noreply@vbticket.com",
        replyTo: "support@vbticket.com",
        companyName: "VBTicket"
      }
    }
  });
}
