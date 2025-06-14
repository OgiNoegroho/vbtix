import { eventService } from "~/server/services/event.service";
import { organizerService } from "~/server/services/organizer.service";
import { ticketService } from "~/server/services/ticket.service";
import { EventStatus } from "@prisma/client";
import { deleteImage } from "~/lib/cloudinary-utils";

/**
 * Get events for a specific organizer
 */
export async function handleGetOrganizerEvents(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  status?: EventStatus;
  search?: string;
}) {
  const { userId, page = 1, limit = 10, status, search } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Call service to get events
  const { events, total } = await eventService.findAll({
    page: validPage,
    limit: validLimit,
    status,
    organizerId: organizer.id,
    search,
  });

  // Transform data if needed
  const processedEvents = events.map((event) => ({
    ...event,
    formattedDate: formatDate(event.startDate),
  }));

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    events: processedEvents,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Get event details for an organizer
 */
export async function handleGetOrganizerEventById(params: {
  userId: string;
  eventId: string;
}) {
  const { userId, eventId } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get event details
  const event = await eventService.findById(eventId);
  if (!event) throw new Error("Event not found");

  // Check if the event belongs to the organizer
  if (event.organizerId !== organizer.id) {
    throw new Error("Event does not belong to this organizer");
  }

  // Get additional statistics
  const ticketsSold = await ticketService.countSoldTicketsByEventId(eventId);
  const revenue = await ticketService.calculateRevenueByEventId(eventId);

  return {
    ...event,
    formattedDate: formatDate(event.startDate),
    stats: {
      ticketsSold,
      revenue,
    },
  };
}

/**
 * Create a new event for an organizer
 * ALL organizer events require admin approval regardless of verification status
 */
export async function handleCreateOrganizerEvent(params: {
  userId: string;
  eventData: any;
}) {
  const { userId, eventData } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Prepare event data - ALL organizer events start as DRAFT and require approval
  const data = {
    ...eventData,
    organizerId: organizer.id,
    status: EventStatus.DRAFT, // Always DRAFT for organizer events
  };

  // Create event
  const event = await eventService.createEvent(data, organizer.id);

  return event;
}

/**
 * Submit an organizer event for admin review
 */
export async function handleSubmitOrganizerEventForReview(params: {
  userId: string;
  eventId: string;
}) {
  const { userId, eventId } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if event exists and belongs to the organizer
  const existingEvent = await eventService.findById(eventId);
  if (!existingEvent) throw new Error("Event not found");

  if (existingEvent.organizerId !== organizer.id) {
    throw new Error("Event does not belong to this organizer");
  }

  // Check if event is in DRAFT status
  if (existingEvent.status !== EventStatus.DRAFT) {
    throw new Error("Only draft events can be submitted for review");
  }

  // Submit event for review
  const updatedEvent = await eventService.submitForReview(eventId);

  return {
    ...updatedEvent,
    formattedDate: formatDate(updatedEvent.startDate),
  };
}

/**
 * Update an event for an organizer
 */
export async function handleUpdateOrganizerEvent(params: {
  userId: string;
  eventId: string;
  eventData: any;
}) {
  const { userId, eventId, eventData } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if event exists
  const existingEvent = await eventService.findById(eventId);
  if (!existingEvent) throw new Error("Event not found");

  // Check if the event belongs to the organizer
  if (existingEvent.organizerId !== organizer.id) {
    throw new Error("Event does not belong to this organizer");
  }

  // Handle Cloudinary image updates
  const event = existingEvent as any;
  const newData = eventData as any;

  // If poster image has changed, delete the old one
  if (
    newData.posterPublicId &&
    event.posterPublicId &&
    newData.posterPublicId !== event.posterPublicId
  ) {
    await deleteImage(event.posterPublicId);
  }

  // If banner image has changed, delete the old one
  if (
    newData.bannerPublicId &&
    event.bannerPublicId &&
    newData.bannerPublicId !== event.bannerPublicId
  ) {
    await deleteImage(event.bannerPublicId);
  }

  // Handle additional images
  if (newData.imagePublicIds && event.imagePublicIds) {
    // Find images that were removed
    const removedPublicIds = event.imagePublicIds.filter(
      (id: string) => !newData.imagePublicIds.includes(id),
    );

    // Delete removed images from Cloudinary
    for (const publicId of removedPublicIds) {
      await deleteImage(publicId);
    }
  }

  // Update event
  return await eventService.updateEvent(eventId, eventData);
}

/**
 * Delete an event for an organizer
 */
export async function handleDeleteOrganizerEvent(params: {
  userId: string;
  eventId: string;
}) {
  const { userId, eventId } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if event exists
  const existingEvent = await eventService.findById(eventId);
  if (!existingEvent) throw new Error("Event not found");

  // Check if the event belongs to the organizer
  if (existingEvent.organizerId !== organizer.id) {
    throw new Error("Event does not belong to this organizer");
  }

  // Delete Cloudinary images if they exist
  const event = existingEvent as any;

  if (event.posterPublicId) {
    await deleteImage(event.posterPublicId);
  }

  if (event.bannerPublicId) {
    await deleteImage(event.bannerPublicId);
  }

  if (event.imagePublicIds && event.imagePublicIds.length > 0) {
    for (const publicId of event.imagePublicIds) {
      await deleteImage(publicId);
    }
  }

  // Delete event
  return await eventService.deleteEvent(eventId);
}

/**
 * Get dashboard statistics for an organizer
 */
export async function handleGetOrganizerDashboardStats(params: {
  userId: string;
}) {
  const { userId } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get total events
  const { total: totalEvents } = await eventService.findAll({
    organizerId: organizer.id,
  });

  // Get upcoming events
  // Since we can't directly filter by date in the findAll method,
  // we'll get more events and filter them in memory
  const { events } = await eventService.findAll({
    organizerId: organizer.id,
    limit: 20, // Get more events to filter from
  });

  // Filter for upcoming events
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => new Date(event.startDate) >= now)
    .slice(0, 5); // Limit to 5 events

  // Get total tickets sold
  const totalTicketsSold = await ticketService.countSoldTicketsByOrganizerId(
    organizer.id,
  );

  // Get total revenue
  const totalRevenue = await ticketService.calculateRevenueByOrganizerId(
    organizer.id,
  );

  return {
    stats: {
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      upcomingEventsCount: upcomingEvents.length,
    },
    upcomingEvents: upcomingEvents.map((event) => ({
      ...event,
      formattedDate: formatDate(event.startDate),
    })),
  };
}

/**
 * Format date helper function
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
