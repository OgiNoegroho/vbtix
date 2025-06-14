import { ticketService } from "~/server/services/ticket.service";
import { reservationService } from "~/server/services/reservation.service";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { prisma } from "~/server/db";
import { TicketStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";
import { generateUniqueCode } from "~/lib/utils/generators";

/**
 * Get tickets for a user
 */
export async function handleGetUserTickets(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  status?: TicketStatus;
}) {
  const { userId, page = 1, limit = 10, status } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));

  // Use the ticket service to get tickets
  const { tickets, total } = await ticketService.findAll({
    userId,
    page: validPage,
    limit: validLimit,
    status,
  });

  // Process tickets for response
  const processedTickets = tickets.map((ticket) => ({
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    checkInTime: ticket.checkInTime,
    createdAt: ticket.createdAt,
    formattedCreatedAt: formatDate(ticket.createdAt),
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
      currency: ticket.ticketType.currency,
    },
    event: {
      id: ticket.ticketType.event.id,
      title: ticket.ticketType.event.title,
      venue: ticket.ticketType.event.venue,
      startDate: ticket.ticketType.event.startDate,
      endDate: ticket.ticketType.event.endDate,
      formattedStartDate: formatDate(ticket.ticketType.event.startDate),
      formattedEndDate: formatDate(ticket.ticketType.event.endDate),
      posterUrl: ticket.ticketType.event.posterUrl,
      organizer: ticket.ticketType.event.organizer,
    },
    transaction: ticket.user ? null : ticket.transaction,
  }));

  // Return tickets with pagination metadata
  return {
    tickets: processedTickets,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    },
  };
}

/**
 * Get a specific ticket by ID
 */
export async function handleGetTicketById(params: {
  ticketId: string;
  userId: string;
}) {
  const { ticketId, userId } = params;

  // Get ticket using the service
  const ticket = await ticketService.findById(ticketId);

  if (!ticket || ticket.userId !== userId) {
    throw new Error("Ticket not found");
  }

  // Process ticket for response
  const processedTicket = {
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    checkInTime: ticket.checkInTime,
    createdAt: ticket.createdAt,
    formattedCreatedAt: formatDate(ticket.createdAt),
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
      currency: ticket.ticketType.currency,
    },
    event: {
      id: ticket.ticketType.event.id,
      title: ticket.ticketType.event.title,
      venue: ticket.ticketType.event.venue,
      address: ticket.ticketType.event.address,
      city: ticket.ticketType.event.city,
      province: ticket.ticketType.event.province,
      startDate: ticket.ticketType.event.startDate,
      endDate: ticket.ticketType.event.endDate,
      formattedStartDate: formatDate(ticket.ticketType.event.startDate),
      formattedEndDate: formatDate(ticket.ticketType.event.endDate),
      posterUrl: ticket.ticketType.event.posterUrl,
      organizer: ticket.ticketType.event.organizer,
    },
    transaction: ticket.transaction
      ? {
          ...ticket.transaction,
          amount: Number(ticket.transaction.amount),
          formattedCreatedAt: formatDate(ticket.transaction.createdAt),
        }
      : null,
    user: ticket.user,
  };

  return processedTicket;
}

/**
 * Purchase tickets with buyer and ticket holder information (Single ticket type)
 */
export async function handlePurchaseTickets(params: {
  userId: string;
  ticketPurchase: {
    ticketTypeId: string;
    quantity: number;
  };
  buyerInfo: {
    fullName: string;
    identityType: string;
    identityNumber: string;
    email: string;
    whatsapp: string;
  };
  ticketHolders: Array<{
    fullName: string;
    identityType: string;
    identityNumber: string;
    email: string;
    whatsapp: string;
  }>;
}) {
  const { userId, ticketPurchase, buyerInfo, ticketHolders } = params;

  // Validate ticket purchase
  if (!ticketPurchase || !ticketPurchase.ticketTypeId) {
    throw new Error("Ticket purchase information is required");
  }

  // Validate ticket holders count matches quantity
  if (ticketHolders.length !== ticketPurchase.quantity) {
    throw new Error(
      `Number of ticket holders (${ticketHolders.length}) must match ticket quantity (${ticketPurchase.quantity})`,
    );
  }

  // Get ticket type
  const ticketType = await prisma.ticketType.findUnique({
    where: {
      id: ticketPurchase.ticketTypeId,
      isVisible: true,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
        },
      },
    },
  });

  // Validate ticket type exists
  if (!ticketType) {
    throw new Error("Ticket type not found or not available");
  }

  // Check if tickets are available
  const availableTickets =
    ticketType.quantity - ticketType.sold - ticketType.reserved;
  if (availableTickets < ticketPurchase.quantity) {
    throw new Error(
      `Not enough tickets available for ${ticketType.name}. Available: ${availableTickets}, Requested: ${ticketPurchase.quantity}`,
    );
  }

  // Check max per purchase limit
  if (ticketPurchase.quantity > ticketType.maxPerPurchase) {
    throw new Error(
      `Maximum ${ticketType.maxPerPurchase} tickets allowed per purchase for ${ticketType.name}`,
    );
  }

  // Calculate total amount
  const totalAmount = Number(ticketType.price) * ticketPurchase.quantity;

  // Prepare single order item
  const orderItem = {
    ticketTypeId: ticketPurchase.ticketTypeId,
    quantity: ticketPurchase.quantity,
    price: ticketType.price,
  };

  // Get event ID
  const eventId = ticketType.event.id;

  // Create transaction in a transaction to ensure atomicity
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Create transaction
        const transaction = await tx.transaction.create({
          data: {
            userId,
            eventId,
            amount: totalAmount,
            currency: "IDR", // Default currency
            paymentMethod: "PENDING", // Will be updated after payment
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: "PENDING",
            orderItems: {
              create: [orderItem],
            },
          },
          include: {
            orderItems: true,
          },
        });

        // Create buyer info
        await tx.buyerInfo.create({
          data: {
            transactionId: transaction.id,
            fullName: buyerInfo.fullName,
            identityType: buyerInfo.identityType,
            identityNumber: buyerInfo.identityNumber,
            email: buyerInfo.email,
            whatsapp: buyerInfo.whatsapp,
          },
        });

        // Prepare ticket data for batch creation
        const ticketData = [];
        const ticketHolderData = [];

        for (let i = 0; i < orderItem.quantity; i++) {
          const qrCode = generateUniqueCode();
          const ticketId = `ticket_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`;

          ticketData.push({
            id: ticketId,
            ticketTypeId: orderItem.ticketTypeId,
            transactionId: transaction.id,
            userId,
            qrCode,
            status: TicketStatus.ACTIVE,
          });

          // Prepare ticket holder data if exists
          const holder = ticketHolders[i];
          if (holder) {
            ticketHolderData.push({
              ticketId,
              fullName: holder.fullName,
              identityType: holder.identityType,
              identityNumber: holder.identityNumber,
              email: holder.email,
              whatsapp: holder.whatsapp,
            });
          }
        }

        // Batch create tickets
        const createdTickets = await tx.ticket.createManyAndReturn({
          data: ticketData,
        });

        // Batch create ticket holders if any
        if (ticketHolderData.length > 0) {
          await tx.ticketHolder.createMany({
            data: ticketHolderData,
          });
        }

        // Update ticket type sold count
        await tx.ticketType.update({
          where: { id: orderItem.ticketTypeId },
          data: {
            sold: {
              increment: orderItem.quantity,
            },
          },
        });

        return { transaction, tickets: createdTickets };
      },
      {
        maxWait: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      },
    );

    return result;
  } catch (error: any) {
    console.error("Error purchasing tickets:", error);

    // Handle specific Prisma errors
    if (error.code === "P2028") {
      throw new Error(
        "Transaction timeout - please try again. If the problem persists, the order may have been created successfully.",
      );
    }

    if (error.code === "P2002") {
      throw new Error("A duplicate entry was detected. Please try again.");
    }

    if (error.code === "P2025") {
      throw new Error("The ticket type or related data was not found.");
    }

    // Re-throw the original error if it's not a Prisma error
    throw error;
  }
}

/**
 * Purchase multiple ticket types (for organizer bulk purchases)
 * Legacy function for backward compatibility
 */
export async function handleBulkPurchaseTickets(params: {
  userId: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
  buyerInfo: {
    fullName: string;
    identityType: string;
    identityNumber: string;
    email: string;
    whatsapp: string;
  };
  ticketHolders: Array<{
    fullName: string;
    identityType: string;
    identityNumber: string;
    email: string;
    whatsapp: string;
  }>;
}) {
  const { userId, items, buyerInfo, ticketHolders } = params;

  // Validate items
  if (!items || items.length === 0) {
    throw new Error("No items provided");
  }

  // Calculate total tickets and validate ticket holders
  const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
  if (ticketHolders.length !== totalTickets) {
    throw new Error(
      "Number of ticket holders must match total number of tickets",
    );
  }

  // Get ticket types
  const ticketTypeIds = items.map((item) => item.ticketTypeId);
  const ticketTypes = await prisma.ticketType.findMany({
    where: {
      id: { in: ticketTypeIds },
      isVisible: true,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
        },
      },
    },
  });

  // Validate ticket types
  if (ticketTypes.length !== ticketTypeIds.length) {
    throw new Error("One or more ticket types not found");
  }

  // Check if tickets are available
  for (const item of items) {
    const ticketType = ticketTypes.find((tt) => tt.id === item.ticketTypeId);
    if (!ticketType) {
      throw new Error(`Ticket type not found: ${item.ticketTypeId}`);
    }

    const availableTickets =
      ticketType.quantity - ticketType.sold - ticketType.reserved;
    if (availableTickets < item.quantity) {
      throw new Error(
        `Not enough tickets available for ${ticketType.name}. Available: ${availableTickets}, Requested: ${item.quantity}`,
      );
    }

    if (item.quantity > ticketType.maxPerPurchase) {
      throw new Error(
        `Maximum ${ticketType.maxPerPurchase} tickets per purchase for ${ticketType.name}`,
      );
    }
  }

  // Ensure all tickets belong to the same event
  const eventIds = [...new Set(ticketTypes.map((tt) => tt.event.id))];
  if (eventIds.length > 1) {
    throw new Error("All tickets must belong to the same event");
  }

  const eventId = eventIds[0];
  if (!eventId) {
    throw new Error("Could not determine event ID");
  }

  // Calculate total amount and prepare order items
  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const ticketType = ticketTypes.find((tt) => tt.id === item.ticketTypeId)!;
    const itemTotal = Number(ticketType.price) * item.quantity;
    totalAmount += itemTotal;

    return {
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
      price: ticketType.price,
    };
  });

  // Create transaction in a transaction to ensure atomicity
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Create transaction
        const transaction = await tx.transaction.create({
          data: {
            userId,
            eventId,
            amount: totalAmount,
            currency: "IDR",
            paymentMethod: "PENDING",
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: "PENDING",
            orderItems: {
              create: orderItems.map((item) => ({
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            orderItems: true,
          },
        });

        // Create buyer info
        await tx.buyerInfo.create({
          data: {
            transactionId: transaction.id,
            fullName: buyerInfo.fullName,
            identityType: buyerInfo.identityType,
            identityNumber: buyerInfo.identityNumber,
            email: buyerInfo.email,
            whatsapp: buyerInfo.whatsapp,
          },
        });

        // Prepare ticket data for batch creation
        const ticketData = [];
        const ticketHolderData = [];
        let ticketHolderIndex = 0;

        for (const item of orderItems) {
          for (let i = 0; i < item.quantity; i++) {
            const qrCode = generateUniqueCode();
            const ticketId = `ticket_${Date.now()}_${ticketHolderIndex}_${Math.random().toString(36).substring(2, 11)}`;

            ticketData.push({
              id: ticketId,
              ticketTypeId: item.ticketTypeId,
              transactionId: transaction.id,
              userId,
              qrCode,
              status: TicketStatus.ACTIVE,
            });

            // Prepare ticket holder data if exists
            if (ticketHolderIndex < ticketHolders.length) {
              const holder = ticketHolders[ticketHolderIndex];
              if (holder) {
                ticketHolderData.push({
                  ticketId,
                  fullName: holder.fullName,
                  identityType: holder.identityType,
                  identityNumber: holder.identityNumber,
                  email: holder.email,
                  whatsapp: holder.whatsapp,
                });
              }
            }
            ticketHolderIndex++;
          }
        }

        // Batch create tickets
        const createdTickets = await tx.ticket.createManyAndReturn({
          data: ticketData,
        });

        // Batch create ticket holders if any
        if (ticketHolderData.length > 0) {
          await tx.ticketHolder.createMany({
            data: ticketHolderData,
          });
        }

        // Update ticket type sold counts in parallel
        const updatePromises = orderItems.map((item) =>
          tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              sold: {
                increment: item.quantity,
              },
            },
          }),
        );
        await Promise.all(updatePromises);

        return { transaction, tickets: createdTickets };
      },
      {
        maxWait: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      },
    );

    return result;
  } catch (error: any) {
    console.error("Error bulk purchasing tickets:", error);

    // Handle specific Prisma errors
    if (error.code === "P2028") {
      throw new Error(
        "Transaction timeout - please try again. If the problem persists, the order may have been created successfully.",
      );
    }

    if (error.code === "P2002") {
      throw new Error("A duplicate entry was detected. Please try again.");
    }

    if (error.code === "P2025") {
      throw new Error("One or more ticket types were not found.");
    }

    // Re-throw the original error if it's not a Prisma error
    throw error;
  }
}

/**
 * Purchase tickets from existing reservations
 */
export async function handlePurchaseFromReservation(params: {
  userId: string | null;
  reservationId: string;
  sessionId: string;
  buyerInfo: {
    fullName: string;
    identityType: string;
    identityNumber: string;
    email: string;
    whatsapp: string;
  };
  ticketHolders: Array<{
    fullName: string;
    identityType: string;
    identityNumber: string;
    email: string;
    whatsapp: string;
  }>;
}) {
  const { userId, reservationId, sessionId, buyerInfo, ticketHolders } = params;

  // For guest purchases, create a temporary user or use existing guest user
  let actualUserId: string;
  if (!userId) {
    // Create a temporary guest user for this purchase
    const guestUser = await prisma.user.create({
      data: {
        email: `guest_${sessionId}@vbticket.temp`,
        name: buyerInfo.fullName,
        role: "BUYER",
        // Mark as temporary guest user
        phone: `guest_${sessionId}`,
      },
    });
    actualUserId = guestUser.id;
  } else {
    actualUserId = userId;
  }

  // Get and validate reservation
  console.log("Looking for reservation with ID:", reservationId);
  console.log("Session ID:", sessionId);
  const reservation =
    await reservationService.getReservationById(reservationId);

  console.log("Found reservation:", reservation);

  if (!reservation) {
    console.error("Reservation not found for ID:", reservationId);
    throw new Error("Reservation not found");
  }

  // Check ownership
  if (reservation.sessionId !== sessionId) {
    throw new Error(
      "You don't have permission to purchase from this reservation",
    );
  }

  if (!["PENDING", "ACTIVE"].includes(reservation.status)) {
    throw new Error("Reservation is not available for purchase");
  }

  if (reservation.expiresAt < new Date()) {
    throw new Error("Reservation has expired");
  }

  // Activate reservation if it's still pending
  if (reservation.status === "PENDING") {
    await reservationService.activateReservation(reservationId, { sessionId });
  }

  // Validate ticket holders count matches reservation quantity
  if (ticketHolders.length !== reservation.quantity) {
    throw new Error(
      `Expected ${reservation.quantity} ticket holders, got ${ticketHolders.length}`,
    );
  }

  // Get ticket type and event info
  const ticketType = reservation.ticketType;
  const event = ticketType.event;

  // Calculate total amount
  const totalAmount = Number(ticketType.price) * reservation.quantity;

  // Create transaction in a database transaction to ensure atomicity
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Create transaction
        const transaction = await tx.transaction.create({
          data: {
            userId: actualUserId,
            eventId: event.id,
            amount: totalAmount,
            currency: "IDR",
            paymentMethod: "PENDING",
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            status: "PENDING",
            orderItems: {
              create: [
                {
                  ticketTypeId: ticketType.id,
                  quantity: reservation.quantity,
                  price: ticketType.price,
                },
              ],
            },
          },
          include: {
            orderItems: true,
          },
        });

        // Create buyer info
        await tx.buyerInfo.create({
          data: {
            transactionId: transaction.id,
            fullName: buyerInfo.fullName,
            identityType: buyerInfo.identityType,
            identityNumber: buyerInfo.identityNumber,
            email: buyerInfo.email,
            whatsapp: buyerInfo.whatsapp,
          },
        });

        // Prepare ticket data for batch creation
        const ticketData = [];
        const ticketHolderData = [];

        for (let i = 0; i < reservation.quantity; i++) {
          const qrCode = generateUniqueCode();
          const ticketId = `ticket_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 11)}`;

          ticketData.push({
            id: ticketId,
            ticketTypeId: ticketType.id,
            transactionId: transaction.id,
            userId: actualUserId,
            qrCode,
            status: TicketStatus.ACTIVE,
          });

          // Prepare ticket holder data if exists
          const holder = ticketHolders[i];
          if (holder) {
            ticketHolderData.push({
              ticketId,
              fullName: holder.fullName,
              identityType: holder.identityType,
              identityNumber: holder.identityNumber,
              email: holder.email,
              whatsapp: holder.whatsapp,
            });
          }
        }

        // Batch create tickets
        const createdTickets = await tx.ticket.createManyAndReturn({
          data: ticketData,
        });

        // Batch create ticket holders if any
        if (ticketHolderData.length > 0) {
          await tx.ticketHolder.createMany({
            data: ticketHolderData,
          });
        }

        // Update ticket type counts and reservation status in parallel
        await Promise.all([
          // Update ticket type sold count and decrease reserved count
          tx.ticketType.update({
            where: { id: ticketType.id },
            data: {
              sold: {
                increment: reservation.quantity,
              },
              reserved: {
                decrement: reservation.quantity,
              },
            },
          }),
          // Convert reservation to purchased status
          tx.ticketReservation.update({
            where: { id: reservationId },
            data: {
              status: "CONVERTED",
              metadata: {
                ...((reservation.metadata as any) || {}),
                transactionId: transaction.id,
                convertedAt: new Date().toISOString(),
              },
            },
          }),
        ]);

        return { transaction, tickets: createdTickets, reservation };
      },
      {
        maxWait: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      },
    );

    return result;
  } catch (error: any) {
    console.error("Error purchasing from reservation:", error);

    // Handle specific Prisma errors
    if (error.code === "P2028") {
      throw new Error(
        "Transaction timeout - please try again. If the problem persists, the order may have been created successfully.",
      );
    }

    if (error.code === "P2002") {
      throw new Error("A duplicate entry was detected. Please try again.");
    }

    if (error.code === "P2025") {
      throw new Error(
        "The reservation or related data was not found. It may have been processed by another request.",
      );
    }

    // Re-throw the original error if it's not a Prisma error
    throw error;
  }
}
