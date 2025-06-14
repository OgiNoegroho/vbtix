import { reservationService } from "~/server/services/reservation.service";
import { prisma } from "~/server/db";

/**
 * Reservation API Handlers
 * Business logic for ticket reservation operations
 */

/**
 * Create a new ticket reservation
 */
export async function handleCreateReservation(params: {
  sessionId: string;
  ticketTypeId: string;
  quantity: number;
  expirationMinutes?: number;
}) {
  const { sessionId, ticketTypeId, quantity, expirationMinutes } = params;

  if (!ticketTypeId) throw new Error("Ticket type ID is required");
  if (!sessionId) throw new Error("Session ID is required");
  if (!quantity || quantity <= 0) throw new Error("Valid quantity is required");

  // Clean up any expired reservations first
  await reservationService.cleanupExpiredReservations();

  // Create the reservation
  const reservation = await reservationService.createReservation({
    sessionId,
    ticketTypeId,
    quantity,
    expirationMinutes,
  });

  return {
    reservation,
    expiresAt: reservation.expiresAt,
    remainingSeconds: Math.max(
      0,
      Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000),
    ),
  };
}

/**
 * Get reservation by ID
 */
export async function handleGetReservation(params: {
  reservationId: string;
  sessionId: string;
}) {
  const { reservationId, sessionId } = params;

  if (!reservationId) throw new Error("Reservation ID is required");

  const reservation =
    await reservationService.getReservationById(reservationId);

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  // Check ownership
  if (reservation.sessionId !== sessionId) {
    throw new Error("You don't have permission to view this reservation");
  }

  // Calculate remaining time
  const remainingSeconds = Math.max(
    0,
    Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000),
  );
  const isExpired = remainingSeconds === 0;

  return {
    reservation,
    remainingSeconds,
    isExpired,
  };
}

/**
 * Get active reservations for a session
 */
export async function handleGetActiveReservations(params: {
  sessionId: string;
  page?: number;
  limit?: number;
}) {
  const { sessionId, page = 1, limit = 10 } = params;

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  // Clean up expired reservations first
  await reservationService.cleanupExpiredReservations();

  const reservations = await reservationService.getActiveReservations({
    sessionId,
  });

  console.log(`Retrieved ${reservations.length} reservations for session ${sessionId}`);

  // Add remaining time for each reservation
  const reservationsWithTimer = reservations.map((reservation) => {
    const remainingSeconds = Math.max(
      0,
      Math.floor((reservation.expiresAt.getTime() - Date.now()) / 1000),
    );
    return {
      ...reservation,
      remainingSeconds,
      isExpired: remainingSeconds === 0,
    };
  });

  // Filter out expired reservations
  const activeReservations = reservationsWithTimer.filter(r => !r.isExpired);

  console.log(`Returning ${activeReservations.length} active reservations (filtered out ${reservationsWithTimer.length - activeReservations.length} expired)`);

  // Apply pagination
  const skip = (page - 1) * limit;
  const paginatedReservations = activeReservations.slice(skip, skip + limit);

  return {
    reservations: paginatedReservations,
    meta: {
      page,
      limit,
      total: activeReservations.length,
      totalPages: Math.ceil(activeReservations.length / limit),
    },
  };
}

/**
 * Cancel a reservation
 */
export async function handleCancelReservation(params: {
  reservationId: string;
  sessionId: string;
}) {
  const { reservationId, sessionId } = params;

  if (!reservationId) throw new Error("Reservation ID is required");
  if (!sessionId) throw new Error("Session ID is required");

  const cancelledReservation = await reservationService.cancelReservation(
    reservationId,
    { sessionId },
  );

  return cancelledReservation;
}

/**
 * Delete a reservation (permanent removal)
 */
export async function handleDeleteReservation(params: {
  reservationId: string;
  sessionId: string;
}) {
  const { reservationId, sessionId } = params;

  if (!reservationId) throw new Error("Reservation ID is required");
  if (!sessionId) throw new Error("Session ID is required");

  const deletedReservation = await reservationService.deleteReservation(
    reservationId,
    { sessionId },
  );

  return deletedReservation;
}

/**
 * Delete multiple reservations by session
 */
export async function handleDeleteReservationsBySession(params: {
  sessionId: string;
  reservationIds?: string[];
}) {
  const { sessionId, reservationIds } = params;

  if (!sessionId) throw new Error("Session ID is required");

  const result = await reservationService.deleteReservationsBySession(
    sessionId,
    reservationIds,
  );

  return result;
}

/**
 * Convert reservation to purchase (used during checkout)
 */
export async function handleConvertReservation(params: {
  reservationId: string;
  transactionId: string;
  sessionId: string;
}) {
  const { reservationId, transactionId, sessionId } = params;

  if (!reservationId) throw new Error("Reservation ID is required");
  if (!transactionId) throw new Error("Transaction ID is required");

  // Verify reservation ownership
  const reservation =
    await reservationService.getReservationById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (reservation.sessionId !== sessionId) {
    throw new Error("You don't have permission to convert this reservation");
  }

  const convertedReservation =
    await reservationService.convertReservationToPurchase(
      reservationId,
      transactionId,
    );

  return convertedReservation;
}

/**
 * Check ticket availability for a ticket type
 */
export async function handleCheckAvailability(params: {
  ticketTypeId: string;
}) {
  const { ticketTypeId } = params;

  if (!ticketTypeId) throw new Error("Ticket type ID is required");

  // Clean up expired reservations first
  await reservationService.cleanupExpiredReservations();

  const availability =
    await reservationService.getAvailableTicketCount(ticketTypeId);

  return availability;
}

/**
 * Create multiple reservations at once
 */
export async function handleBulkCreateReservations(params: {
  sessionId: string;
  reservations: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
  expirationMinutes?: number;
}) {
  const { sessionId, reservations, expirationMinutes } = params;

  if (!sessionId) throw new Error("Session ID is required");
  if (!reservations || reservations.length === 0) {
    throw new Error("At least one reservation is required");
  }

  // Clean up expired reservations first
  await reservationService.cleanupExpiredReservations();

  // Create reservations sequentially to avoid race conditions
  const createdReservations = [];
  const errors = [];

  console.log(`Creating ${reservations.length} reservations for session ${sessionId}`);

  for (const reservationData of reservations) {
    try {
      console.log(`Creating reservation for ticket type ${reservationData.ticketTypeId}, quantity: ${reservationData.quantity}`);

      const reservation = await reservationService.createReservation({
        sessionId,
        ticketTypeId: reservationData.ticketTypeId,
        quantity: reservationData.quantity,
        expirationMinutes,
      });

      console.log(`Successfully created reservation:`, {
        id: reservation.id,
        status: reservation.status,
        expiresAt: reservation.expiresAt,
        ticketTypeId: reservation.ticketTypeId,
        quantity: reservation.quantity
      });

      createdReservations.push(reservation);
    } catch (error: any) {
      console.error(`Failed to create reservation for ticket type ${reservationData.ticketTypeId}:`, error.message);
      errors.push({
        ticketTypeId: reservationData.ticketTypeId,
        error: error.message,
      });
    }
  }

  console.log(`Bulk reservation completed: ${createdReservations.length} successful, ${errors.length} failed`);

  return {
    successful: createdReservations,
    failed: errors,
    totalCreated: createdReservations.length,
    totalFailed: errors.length,
  };
}

/**
 * Extend reservation time (optional feature)
 */
export async function handleExtendReservation(params: {
  reservationId: string;
  additionalMinutes: number;
  sessionId: string;
}) {
  const { reservationId, additionalMinutes, sessionId } = params;

  if (!reservationId) throw new Error("Reservation ID is required");
  if (!sessionId) throw new Error("Session ID is required");
  if (!additionalMinutes || additionalMinutes <= 0) {
    throw new Error("Valid additional minutes is required");
  }

  // Get current reservation
  const reservation =
    await reservationService.getReservationById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");
  }

  // Check ownership
  if (reservation.sessionId !== sessionId) {
    throw new Error("You don't have permission to extend this reservation");
  }

  if (reservation.status !== "ACTIVE") {
    throw new Error("Only active reservations can be extended");
  }

  // Check if reservation is not already expired
  if (reservation.expiresAt < new Date()) {
    throw new Error("Cannot extend expired reservation");
  }

  // Calculate new expiration time
  const newExpiresAt = new Date(
    reservation.expiresAt.getTime() + additionalMinutes * 60 * 1000,
  );

  // Update reservation
  const updatedReservation = await prisma.ticketReservation.update({
    where: { id: reservationId },
    data: {
      expiresAt: newExpiresAt,
      metadata: {
        ...((reservation.metadata as any) || {}),
        extended: true,
        extensionMinutes: additionalMinutes,
        extendedAt: new Date().toISOString(),
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

  return {
    reservation: updatedReservation,
    newExpiresAt,
    remainingSeconds: Math.max(
      0,
      Math.floor((newExpiresAt.getTime() - Date.now()) / 1000),
    ),
  };
}

/**
 * Clean up expired reservations (admin/system function)
 */
export async function handleCleanupExpiredReservations() {
  const result = await reservationService.cleanupExpiredReservations();

  return {
    ...result,
    message: `Cleaned up ${result.cleaned} expired reservations`,
  };
}
