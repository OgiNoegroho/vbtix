import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";
import { ticketService } from "~/server/services/ticket.service";
import { Prisma, TicketStatus } from "@prisma/client";

/**
 * Get ticket types for an event
 */
export async function handleGetTicketTypes(params: {
  eventId: string;
  page?: number | string;
  limit?: number | string;
}) {
  const { eventId, page = 1, limit = 10 } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Check if event exists
  const event = await eventService.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Get ticket types
  const [ticketTypes, total] = await Promise.all([
    prisma.ticketType.findMany({
      where: { eventId },
      skip,
      take: validLimit,
      orderBy: { price: "asc" },
    }),
    prisma.ticketType.count({
      where: { eventId },
    }),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    ticketTypes,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Get a specific ticket type by ID
 */
export async function handleGetTicketTypeById(params: {
  userId: string;
  ticketTypeId: string;
}) {
  const { userId, ticketTypeId } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get ticket type
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: {
      event: true,
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the ticket type belongs to the organizer's event
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Get sold tickets count
  const soldCount = await prisma.ticket.count({
    where: {
      ticketTypeId,
      status: {
        in: ["ACTIVE", "USED"],
      },
    },
  });

  return {
    ...ticketType,
    sold: soldCount,
    available: ticketType.quantity - soldCount,
  };
}

/**
 * Create a new ticket type for an event
 * Only allows ticket creation for PUBLISHED (approved) events
 */
export async function handleCreateTicketType(params: {
  userId: string;
  eventId: string;
  ticketTypeData: any; // Use any to avoid type conflicts with transformed data
}) {
  const { userId, eventId, ticketTypeData } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // CRITICAL: Validate event approval status and ownership using service layer
  const validationResult = await ticketService.validateEventApprovalForTickets(
    eventId,
    organizer.id
  );

  console.log("Event validation result:", validationResult);

  // Prepare data for Prisma, ensuring datetime fields are properly handled
  const prismaData: Prisma.TicketTypeCreateInput = {
    name: ticketTypeData.name,
    description: ticketTypeData.description || null,
    price: ticketTypeData.price,
    currency: ticketTypeData.currency || "IDR",
    quantity: ticketTypeData.quantity,
    maxPerPurchase: ticketTypeData.maxPerPurchase || 10,
    isVisible: ticketTypeData.isVisible ?? true,
    allowTransfer: ticketTypeData.allowTransfer ?? false,
    ticketFeatures: ticketTypeData.ticketFeatures || null,
    perks: ticketTypeData.perks || null,
    // Convert datetime strings to Date objects for Prisma
    earlyBirdDeadline: ticketTypeData.earlyBirdDeadline ? new Date(ticketTypeData.earlyBirdDeadline) : null,
    saleStartDate: ticketTypeData.saleStartDate ? new Date(ticketTypeData.saleStartDate) : null,
    saleEndDate: ticketTypeData.saleEndDate ? new Date(ticketTypeData.saleEndDate) : null,
    event: { connect: { id: eventId } },
  };

  console.log("Creating ticket type with data:", JSON.stringify(prismaData, null, 2));

  // Create ticket type
  const ticketType = await prisma.ticketType.create({
    data: prismaData,
  });

  return ticketType;
}

/**
 * Update a ticket type
 */
export async function handleUpdateTicketType(params: {
  userId: string;
  ticketTypeId: string;
  ticketTypeData: Prisma.TicketTypeUpdateInput;
}) {
  const { userId, ticketTypeId, ticketTypeData } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if ticket type exists
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the event belongs to the organizer
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Update ticket type
  const updatedTicketType = await prisma.ticketType.update({
    where: { id: ticketTypeId },
    data: ticketTypeData,
  });

  return updatedTicketType;
}

/**
 * Delete a ticket type
 */
export async function handleDeleteTicketType(params: {
  userId: string;
  ticketTypeId: string;
}) {
  const { userId, ticketTypeId } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if ticket type exists
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the event belongs to the organizer
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Check if tickets have been sold for this ticket type
  const soldTicketsCount = await prisma.ticket.count({
    where: {
      ticketTypeId,
      status: { not: "CANCELLED" },
    },
  });

  if (soldTicketsCount > 0) {
    throw new Error("Cannot delete ticket type with sold tickets");
  }

  // Delete ticket type
  const deletedTicketType = await prisma.ticketType.delete({
    where: { id: ticketTypeId },
  });

  return deletedTicketType;
}

/**
 * Count sold tickets by event ID
 */
export async function countSoldTicketsByEventId(eventId: string) {
  if (!eventId) throw new Error("Event ID is required");

  return await prisma.ticket.count({
    where: {
      ticketType: {
        eventId,
      },
      status: "ACTIVE",
    },
  });
}

/**
 * Calculate revenue by event ID
 */
export async function calculateRevenueByEventId(eventId: string) {
  if (!eventId) throw new Error("Event ID is required");

  const result = await prisma.orderItem.aggregate({
    where: {
      ticketType: {
        eventId,
      },
      order: {
        status: "SUCCESS",
      },
    },
    _sum: {
      price: true,
    },
  });

  return result._sum.price || 0;
}

/**
 * Count sold tickets by organizer ID
 */
export async function countSoldTicketsByOrganizerId(organizerId: string) {
  if (!organizerId) throw new Error("Organizer ID is required");

  return await prisma.ticket.count({
    where: {
      ticketType: {
        event: {
          organizerId,
        },
      },
      status: "ACTIVE",
    },
  });
}

/**
 * Calculate revenue by organizer ID
 */
export async function calculateRevenueByOrganizerId(organizerId: string) {
  if (!organizerId) throw new Error("Organizer ID is required");

  const result = await prisma.orderItem.aggregate({
    where: {
      ticketType: {
        event: {
          organizerId,
        },
      },
      order: {
        status: "SUCCESS",
      },
    },
    _sum: {
      price: true,
    },
  });

  return result._sum.price || 0;
}

/**
 * Get all ticket types for an organizer with pagination
 */
export async function handleGetOrganizerTickets(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  eventId?: string;
  search?: string;
}) {
  const { userId, page = 1, limit = 10, eventId, search } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Build where clause
  const where: Prisma.TicketTypeWhereInput = {
    event: {
      organizerId: organizer.id,
    },
  };

  // Add optional event filter
  if (eventId) {
    where.eventId = eventId;
  }

  // Add search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get ticket types
  const [ticketTypes, total] = await Promise.all([
    prisma.ticketType.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: [{ eventId: "asc" }, { price: "asc" }],
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    }),
    prisma.ticketType.count({ where }),
  ]);

  // Calculate sold and available tickets
  const ticketTypesWithStats = await Promise.all(
    ticketTypes.map(async (ticketType) => {
      const soldCount = await prisma.ticket.count({
        where: {
          ticketTypeId: ticketType.id,
          status: {
            in: ["ACTIVE", "USED"],
          },
        },
      });

      return {
        ...ticketType,
        sold: soldCount,
        available: ticketType.quantity - soldCount,
      };
    }),
  );

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    ticketTypes: ticketTypesWithStats,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}
