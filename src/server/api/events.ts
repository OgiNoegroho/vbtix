import { eventService } from "~/server/services/event.service";
import { organizerService } from "~/server/services/organizer.service";
import { EventStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";
import type {
  EventQuerySchema,
  CreateEventSchema,
  UpdateEventSchema,
} from "~/lib/validations/event.schema";

/**
 * Mendapatkan daftar event dengan pagination
 */
export async function handleGetEvents(params: EventQuerySchema) {
  console.log("handleGetEvents params:", params);

  // Memanggil service with isAdminView flag for admin endpoints
  const { events, total } = await eventService.findAll({
    page: params.page,
    limit: params.limit,
    status: params.status,
    organizerId: params.organizerId || undefined, // Convert null to undefined
    search: params.search,
    featured: params.featured,
    isAdminView: true, // Set to true for admin endpoints
  });

  // Transformasi data jika diperlukan
  const processedEvents = events.map((event) => ({
    ...event,
    formattedStartDate: formatDate(event.startDate),
    formattedEndDate: formatDate(event.endDate),
    ticketPrice:
      event.ticketTypes && event.ticketTypes.length > 0
        ? {
            min: Math.min(...event.ticketTypes.map((t) => Number(t.price))),
            max: Math.max(...event.ticketTypes.map((t) => Number(t.price))),
          }
        : null,
    ticketsAvailable:
      event.ticketTypes && event.ticketTypes.length > 0
        ? event.ticketTypes.reduce((acc, t) => acc + (t.quantity - t.sold), 0)
        : 0,
  }));

  // Menghitung metadata pagination
  const totalPages = Math.ceil(total / params.limit);

  return {
    events: processedEvents,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
    },
  };
}

/**
 * Create event - handles both admin and organizer creation with different workflows
 */
export async function handleCreateEvent(
  data: CreateEventSchema,
  userId: string,
) {
  console.log("handleCreateEvent data:", data);
  console.log("handleCreateEvent userId:", userId);

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Call service to create event
  const event = await eventService.createEvent(data, organizer.id);

  return {
    ...event,
    formattedStartDate: formatDate(event.startDate),
    formattedEndDate: formatDate(event.endDate),
  };
}

/**
 * Create event specifically for admin users - bypasses approval workflow
 */
export async function handleCreateAdminEvent(
  data: CreateEventSchema,
  adminUserId: string,
) {
  console.log("handleCreateAdminEvent data:", data);
  console.log("handleCreateAdminEvent adminUserId:", adminUserId);

  // For admin events, we need to create a temporary organizer record or handle differently
  // Admin events are published directly without approval
  const eventData = {
    ...data,
    status: EventStatus.PUBLISHED, // Admin events are published immediately
  };

  // Create event with admin as organizer (or handle admin events differently)
  const event = await eventService.createEvent(eventData, adminUserId);

  return {
    ...event,
    formattedStartDate: formatDate(event.startDate),
    formattedEndDate: formatDate(event.endDate),
  };
}

/**
 * Mendapatkan detail event berdasarkan ID
 */
export async function handleGetEventById(id: string) {
  if (!id) throw new Error("Event ID is required");

  const event = await eventService.findById(id);
  if (!event) throw new Error("Event not found");

  // Get event statistics
  const statistics = await eventService.getEventStatistics(id);

  return {
    ...event,
    formattedStartDate: formatDate(event.startDate),
    formattedEndDate: formatDate(event.endDate),
    statistics: statistics.stats,
  };
}

/**
 * Memperbarui event
 */
export async function handleUpdateEvent(
  id: string,
  data: UpdateEventSchema,
  userId: string,
) {
  if (!id) throw new Error("Event ID is required");

  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");

  // Verifikasi user adalah pemilik event atau admin
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer || existingEvent.organizerId !== organizer.id) {
    throw new Error("You don't have permission to update this event");
  }

  const updatedEvent = await eventService.updateEvent(id, data);

  return {
    ...updatedEvent,
    formattedStartDate: formatDate(updatedEvent.startDate),
    formattedEndDate: formatDate(updatedEvent.endDate),
  };
}

/**
 * Menghapus event
 */
export async function handleDeleteEvent(id: string, userId: string) {
  if (!id) throw new Error("Event ID is required");

  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");

  // Verifikasi user adalah pemilik event atau admin
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer || existingEvent.organizerId !== organizer.id) {
    throw new Error("You don't have permission to delete this event");
  }

  return await eventService.deleteEvent(id);
}

/**
 * Mengatur event sebagai featured
 */
export async function handleSetEventFeatured(id: string, featured: boolean) {
  if (!id) throw new Error("Event ID is required");

  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");

  const updatedEvent = await eventService.setFeatured(id, featured);

  return {
    ...updatedEvent,
    formattedStartDate: formatDate(updatedEvent.startDate),
    formattedEndDate: formatDate(updatedEvent.endDate),
  };
}

/**
 * Mendapatkan statistik event
 */
export async function handleGetEventStatistics(id: string) {
  if (!id) throw new Error("Event ID is required");

  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");

  return await eventService.getEventStatistics(id);
}

/**
 * Menyetujui atau menolak event
 */
export async function handleReviewEvent(
  id: string,
  status: EventStatus,
  notes?: string,
) {
  if (!id) throw new Error("Event ID is required");

  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");

  // Verifikasi event dalam status PENDING_REVIEW
  if (existingEvent.status !== EventStatus.PENDING_REVIEW) {
    throw new Error("Event is not pending review");
  }

  // Perbarui status event
  const updatedEvent = await eventService.reviewEvent(id, status, notes);

  return {
    ...updatedEvent,
    formattedStartDate: formatDate(updatedEvent.startDate),
    formattedEndDate: formatDate(updatedEvent.endDate),
  };
}

/**
 * Submit event for review
 */
export async function handleSubmitEventForReview(id: string, userId: string) {
  if (!id) throw new Error("Event ID is required");

  // Verifikasi event ada
  const existingEvent = await eventService.findById(id);
  if (!existingEvent) throw new Error("Event not found");

  // Verifikasi user adalah pemilik event
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer || existingEvent.organizerId !== organizer.id) {
    throw new Error(
      "You don't have permission to submit this event for review",
    );
  }

  // Verifikasi event dalam status DRAFT
  if (existingEvent.status !== EventStatus.DRAFT) {
    throw new Error("Only draft events can be submitted for review");
  }

  const updatedEvent = await eventService.submitForReview(id);

  return {
    ...updatedEvent,
    formattedStartDate: formatDate(updatedEvent.startDate),
    formattedEndDate: formatDate(updatedEvent.endDate),
  };
}
