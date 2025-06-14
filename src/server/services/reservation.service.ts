import { prisma } from "~/server/db";
import { Prisma, ReservationStatus } from "@prisma/client";

/**
 * Reservation Service
 * Handles ticket reservation operations
 */

export const reservationService = {
  /**
   * Create a new ticket reservation
   */
  async createReservation(data: {
    sessionId: string;
    ticketTypeId: string;
    quantity: number;
    expirationMinutes?: number;
  }) {
    const { sessionId, ticketTypeId, quantity, expirationMinutes = 10 } = data;

    // Calculate expiration time (default 10 minutes)
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Check if ticket type exists and has enough available tickets
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!ticketType) {
      throw new Error("Ticket type not found");
    }

    if (ticketType.event.status !== "PUBLISHED") {
      throw new Error("Event is not available for booking");
    }

    // Calculate available tickets (total - sold - currently reserved)
    const activeReservations = await prisma.ticketReservation.aggregate({
      where: {
        ticketTypeId,
        status: "ACTIVE",
        expiresAt: {
          gt: new Date(),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const currentlyReserved = activeReservations._sum.quantity || 0;
    const availableTickets =
      ticketType.quantity - ticketType.sold - currentlyReserved;

    if (availableTickets < quantity) {
      throw new Error(`Only ${availableTickets} tickets available`);
    }

    // Check if session already has active reservations for this ticket type
    const existingReservation = await prisma.ticketReservation.findFirst({
      where: {
        ticketTypeId,
        status: "ACTIVE", // Only check for ACTIVE reservations
        expiresAt: {
          gt: new Date(),
        },
        sessionId,
      },
    });

    if (existingReservation) {
      throw new Error("You already have a reservation for this ticket type");
    }

    // Create the reservation (explicitly set to ACTIVE status - user is in checkout)
    const reservation = await prisma.ticketReservation.create({
      data: {
        sessionId,
        ticketTypeId,
        quantity,
        expiresAt,
        status: "ACTIVE", // Explicitly set status
        metadata: {
          eventId: ticketType.event.id,
          eventTitle: ticketType.event.title,
          ticketTypeName: ticketType.name,
          ticketTypePrice: ticketType.price.toString(),
        },
      },
      include: {
        ticketType: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                startDate: true,
              },
            },
          },
        },
      },
    });

    // Update the reserved count in ticket type
    await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        reserved: {
          increment: quantity,
        },
      },
    });

    return reservation;
  },

  /**
   * Get reservation by ID
   */
  async getReservationById(id: string) {
    console.log("reservationService.getReservationById called with ID:", id);
    const reservation = await prisma.ticketReservation.findUnique({
      where: { id },
      include: {
        ticketType: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                startDate: true,
              },
            },
          },
        },
      },
    });
    console.log("reservationService.getReservationById result:", reservation);
    return reservation;
  },

  /**
   * Get active reservations for a session (only ACTIVE reservations)
   */
  async getActiveReservations(params: { sessionId: string }) {
    const { sessionId } = params;

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    return await prisma.ticketReservation.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: {
          gt: new Date(),
        },
        sessionId,
      },
      include: {
        ticketType: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                startDate: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Cancel a reservation
   */
  async cancelReservation(id: string, params: { sessionId: string }) {
    const { sessionId } = params;

    // Find the reservation
    const reservation = await prisma.ticketReservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // Check ownership
    if (reservation.sessionId !== sessionId) {
      throw new Error("You don't have permission to cancel this reservation");
    }

    if (reservation.status !== "ACTIVE") {
      throw new Error("Only active reservations can be cancelled");
    }

    // Update reservation status and release reserved tickets
    const [updatedReservation] = await prisma.$transaction([
      prisma.ticketReservation.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      }),
      prisma.ticketType.update({
        where: { id: reservation.ticketTypeId },
        data: {
          reserved: {
            decrement: reservation.quantity,
          },
        },
      }),
    ]);

    return updatedReservation;
  },

  /**
   * Delete a reservation (permanent removal)
   */
  async deleteReservation(id: string, params: { sessionId: string }) {
    const { sessionId } = params;

    // Find the reservation
    const reservation = await prisma.ticketReservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // Check ownership
    if (reservation.sessionId !== sessionId) {
      throw new Error("You don't have permission to delete this reservation");
    }

    if (reservation.status !== "ACTIVE") {
      throw new Error("Only active reservations can be deleted");
    }

    // Delete reservation and release reserved tickets
    const [deletedReservation] = await prisma.$transaction([
      prisma.ticketReservation.delete({
        where: { id },
      }),
      prisma.ticketType.update({
        where: { id: reservation.ticketTypeId },
        data: {
          reserved: {
            decrement: reservation.quantity,
          },
        },
      }),
    ]);

    return deletedReservation;
  },

  /**
   * Delete multiple reservations by session ID
   */
  async deleteReservationsBySession(
    sessionId: string,
    reservationIds?: string[],
  ) {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Build where clause - only cleanup ACTIVE reservations (user left checkout)
    const whereClause: any = {
      sessionId,
      status: "ACTIVE",
    };

    // If specific reservation IDs are provided, filter by them
    if (reservationIds && reservationIds.length > 0) {
      whereClause.id = { in: reservationIds };
    }

    // Find reservations to delete
    const reservationsToDelete = await prisma.ticketReservation.findMany({
      where: whereClause,
    });

    if (reservationsToDelete.length === 0) {
      return { deleted: 0, reservations: [] };
    }

    // Delete reservations and release reserved tickets in a transaction
    const deleteOperations = [];
    const updateOperations = [];

    for (const reservation of reservationsToDelete) {
      deleteOperations.push(
        prisma.ticketReservation.delete({
          where: { id: reservation.id },
        }),
      );

      updateOperations.push(
        prisma.ticketType.update({
          where: { id: reservation.ticketTypeId },
          data: {
            reserved: {
              decrement: reservation.quantity,
            },
          },
        }),
      );
    }

    // Execute all operations in a transaction
    await prisma.$transaction([...deleteOperations, ...updateOperations]);

    return {
      deleted: reservationsToDelete.length,
      reservations: reservationsToDelete,
    };
  },



  /**
   * Convert reservation to purchase (used during checkout)
   */
  async convertReservationToPurchase(id: string, transactionId: string) {
    const reservation = await prisma.ticketReservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.status !== "ACTIVE") {
      throw new Error("Reservation is not active");
    }

    if (reservation.expiresAt < new Date()) {
      throw new Error("Reservation has expired");
    }

    // Update reservation status
    const updatedReservation = await prisma.ticketReservation.update({
      where: { id },
      data: {
        status: "CONVERTED",
        metadata: {
          ...((reservation.metadata as any) || {}),
          transactionId,
          convertedAt: new Date().toISOString(),
        },
      },
    });

    // Note: Reserved count will be decremented when tickets are actually sold
    // This happens in the ticket purchase flow

    return updatedReservation;
  },

  /**
   * Clean up expired reservations (delete them permanently)
   */
  async cleanupExpiredReservations() {
    // Find expired reservations (only ACTIVE ones can expire)
    const expiredReservations = await prisma.ticketReservation.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (expiredReservations.length === 0) {
      return { cleaned: 0 };
    }

    // Delete expired reservations and release reserved tickets
    const deleteOperations = [];
    const updateOperations = [];

    for (const reservation of expiredReservations) {
      deleteOperations.push(
        prisma.ticketReservation.delete({
          where: { id: reservation.id },
        }),
      );

      updateOperations.push(
        prisma.ticketType.update({
          where: { id: reservation.ticketTypeId },
          data: {
            reserved: {
              decrement: reservation.quantity,
            },
          },
        }),
      );
    }

    await prisma.$transaction([...deleteOperations, ...updateOperations]);

    return { cleaned: expiredReservations.length };
  },

  /**
   * Get available ticket count for a ticket type
   */
  async getAvailableTicketCount(ticketTypeId: string) {
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });

    if (!ticketType) {
      throw new Error("Ticket type not found");
    }

    // Calculate active reservations (only ACTIVE reservations count)
    const activeReservations = await prisma.ticketReservation.aggregate({
      where: {
        ticketTypeId,
        status: "ACTIVE",
        expiresAt: {
          gt: new Date(),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const currentlyReserved = activeReservations._sum.quantity || 0;
    const availableTickets =
      ticketType.quantity - ticketType.sold - currentlyReserved;

    return {
      total: ticketType.quantity,
      sold: ticketType.sold,
      reserved: currentlyReserved,
      available: Math.max(0, availableTickets),
    };
  },
};
