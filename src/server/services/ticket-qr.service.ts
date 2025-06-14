import { prisma } from "~/server/db";
import {
  generateQRCodeData,
  generateQRCodeImage,
  generateQRCodeBuffer,
  encryptQRCodeData,
  validateScannedQRCode,
  type TicketQRData,
  type QRCodeOptions,
} from "~/lib/services/qr-code.service";
import { QRCodeStatus, TicketStatus } from "@prisma/client";

/**
 * Generate QR code for a ticket after payment verification
 */
export async function generateTicketQRCode(ticketId: string): Promise<{
  success: boolean;
  qrCodeImageUrl?: string;
  error?: string;
}> {
  try {
    // Get ticket with related data
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
        ticketType: true,
        user: true,
      },
    });

    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }

    // Check if ticket is eligible for QR code generation
    if (ticket.transaction.status !== "SUCCESS") {
      return {
        success: false,
        error: "Payment not verified yet",
      };
    }

    // Check if QR code already generated
    if (ticket.qrCodeStatus === QRCodeStatus.GENERATED || ticket.qrCodeStatus === QRCodeStatus.ACTIVE) {
      return {
        success: true,
        qrCodeImageUrl: ticket.qrCodeImageUrl || undefined,
      };
    }

    // Generate QR code data
    const qrData = generateQRCodeData({
      ticketId: ticket.id,
      eventId: ticket.transaction.eventId,
      userId: ticket.userId,
      transactionId: ticket.transactionId,
      ticketTypeId: ticket.ticketTypeId,
      eventDate: ticket.transaction.event.startDate,
    });

    // Generate QR code image
    const qrCodeImageUrl = await generateQRCodeImage(qrData, {
      width: 300,
      height: 300,
      errorCorrectionLevel: "M",
    });

    // Encrypt QR data for storage
    const encryptedQRData = encryptQRCodeData(qrData);

    // Update ticket with QR code information
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        qrCodeImageUrl,
        qrCodeData: encryptedQRData,
        qrCodeGeneratedAt: new Date(),
        qrCodeStatus: QRCodeStatus.ACTIVE,
      },
    });

    return {
      success: true,
      qrCodeImageUrl: updatedTicket.qrCodeImageUrl || undefined,
    };
  } catch (error) {
    console.error("Error generating ticket QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate QR code",
    };
  }
}

/**
 * Generate QR codes for all tickets in a transaction
 */
export async function generateTransactionQRCodes(transactionId: string): Promise<{
  success: boolean;
  generatedCount: number;
  errors: string[];
}> {
  try {
    // Get all tickets for the transaction
    const tickets = await prisma.ticket.findMany({
      where: { transactionId },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
      },
    });

    if (tickets.length === 0) {
      return {
        success: false,
        generatedCount: 0,
        errors: ["No tickets found for transaction"],
      };
    }

    // Check transaction status
    const transaction = tickets[0]?.transaction;
    if (!transaction || transaction.status !== "SUCCESS") {
      return {
        success: false,
        generatedCount: 0,
        errors: ["Transaction payment not verified"],
      };
    }

    const errors: string[] = [];
    let generatedCount = 0;

    // Generate QR codes for each ticket
    for (const ticket of tickets) {
      try {
        const result = await generateTicketQRCode(ticket.id);
        if (result.success) {
          generatedCount++;
        } else {
          errors.push(`Ticket ${ticket.id}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`Ticket ${ticket.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      success: generatedCount > 0,
      generatedCount,
      errors,
    };
  } catch (error) {
    console.error("Error generating transaction QR codes:", error);
    return {
      success: false,
      generatedCount: 0,
      errors: [error instanceof Error ? error.message : "Failed to generate QR codes"],
    };
  }
}

/**
 * Validate a scanned QR code
 */
export async function validateTicketQRCode(encryptedData: string): Promise<{
  isValid: boolean;
  ticket?: any;
  error?: string;
}> {
  try {
    // Validate and decrypt QR code data
    const validation = validateScannedQRCode(encryptedData);
    
    if (!validation.isValid || !validation.data) {
      return {
        isValid: false,
        error: validation.error || "Invalid QR code",
      };
    }

    const qrData = validation.data;

    // Get ticket from database
    const ticket = await prisma.ticket.findUnique({
      where: { id: qrData.ticketId },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
        ticketType: true,
        user: true,
        ticketHolder: true,
      },
    });

    if (!ticket) {
      return {
        isValid: false,
        error: "Ticket not found",
      };
    }

    // Verify QR data matches ticket
    if (
      ticket.transaction.eventId !== qrData.eventId ||
      ticket.userId !== qrData.userId ||
      ticket.transactionId !== qrData.transactionId ||
      ticket.ticketTypeId !== qrData.ticketTypeId
    ) {
      return {
        isValid: false,
        error: "QR code data does not match ticket",
      };
    }

    // Check ticket status
    if (ticket.status !== TicketStatus.ACTIVE) {
      return {
        isValid: false,
        error: `Ticket is ${ticket.status.toLowerCase()}`,
      };
    }

    // Check if already checked in
    if (ticket.checkedIn) {
      const checkInTime = ticket.checkInTime ? new Date(ticket.checkInTime).toLocaleString() : "Unknown time";
      return {
        isValid: false,
        error: `Ticket already checked in at ${checkInTime}`,
      };
    }

    return {
      isValid: true,
      ticket,
    };
  } catch (error) {
    console.error("Error validating ticket QR code:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}

/**
 * Check in a ticket using QR code
 */
export async function checkInTicketWithQR(
  encryptedData: string,
  organizerId: string
): Promise<{
  success: boolean;
  ticket?: any;
  error?: string;
}> {
  try {
    // First validate the QR code
    const validation = await validateTicketQRCode(encryptedData);
    
    if (!validation.isValid || !validation.ticket) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const ticket = validation.ticket;

    // Verify organizer has permission to check in this ticket
    if (ticket.transaction.event.organizerId !== organizerId) {
      return {
        success: false,
        error: "You don't have permission to check in this ticket",
      };
    }

    // Additional check for already checked in (double-check for race conditions)
    if (ticket.checkedIn) {
      const checkInTime = ticket.checkInTime ? new Date(ticket.checkInTime).toLocaleString() : "Unknown time";
      return {
        success: false,
        error: `Ticket was already checked in at ${checkInTime}`,
      };
    }

    // Check in the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        checkedIn: true,
        checkInTime: new Date(),
        scannedAt: new Date(),
        qrCodeStatus: QRCodeStatus.USED,
      },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
        ticketType: true,
        user: true,
        ticketHolder: true,
      },
    });

    return {
      success: true,
      ticket: updatedTicket,
    };
  } catch (error) {
    console.error("Error checking in ticket with QR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Check-in failed",
    };
  }
}

/**
 * Get QR code image for a ticket
 */
export async function getTicketQRCode(ticketId: string, userId?: string): Promise<{
  success: boolean;
  qrCodeImageUrl?: string;
  error?: string;
}> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        transaction: {
          include: {
            event: {
              include: {
                organizer: {
                  select: {
                    id: true,
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
      };
    }

    // Check access permissions if userId provided
    if (userId) {
      const isTicketOwner = ticket.userId === userId;
      const isEventOrganizer = ticket.transaction.event.organizer?.userId === userId;

      // Allow access if user is either the ticket owner or the event organizer
      if (!isTicketOwner && !isEventOrganizer) {
        console.log("QR code access denied:", {
          ticketId,
          requestingUserId: userId,
          ticketOwnerId: ticket.userId,
          eventOrganizerId: ticket.transaction.event.organizer?.userId,
          isTicketOwner,
          isEventOrganizer,
        });

        return {
          success: false,
          error: "Access denied",
        };
      }
    }

    // Check if QR code exists
    if (!ticket.qrCodeImageUrl || ticket.qrCodeStatus === QRCodeStatus.PENDING) {
      // If payment is verified but QR code not generated, try to generate it
      if (ticket.transaction.status === "SUCCESS") {
        console.log(`🎫 Payment verified but QR code missing for ticket ${ticketId}, attempting generation...`);
        const generateResult = await generateTicketQRCode(ticketId);

        if (generateResult.success && generateResult.qrCodeImageUrl) {
          return {
            success: true,
            qrCodeImageUrl: generateResult.qrCodeImageUrl,
          };
        } else {
          console.warn(`⚠️ Failed to generate QR code for ticket ${ticketId}:`, generateResult.error);
        }
      }

      return {
        success: false,
        error: "QR code not generated yet",
      };
    }

    return {
      success: true,
      qrCodeImageUrl: ticket.qrCodeImageUrl,
    };
  } catch (error) {
    console.error("Error getting ticket QR code:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get QR code",
    };
  }
}
