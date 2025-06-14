import { eventService } from "~/server/services/event.service";
import { ticketService } from "~/server/services/ticket.service";
import { formatDate } from "~/lib/utils";
import { EventStatus } from "@prisma/client";
import { prisma } from "~/server/db";

/**
 * Get all published events with pagination and filtering
 */
export async function handleGetPublishedEvents(params: {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
}) {
  console.log("handleGetPublishedEvents called with params:", params);

  const {
    page = 1,
    limit = 10,
    search,
    category,
    startDate,
    endDate,
    featured,
  } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  console.log("Validated page and limit:", { validPage, validLimit });

  // Build where conditions for the service
  const serviceParams: any = {
    page: validPage,
    limit: validLimit,
    search,
    featured,
    status: "PUBLISHED", // Explicitly set status to PUBLISHED
  };
  console.log("Service params:", serviceParams);
  // Call the event service to get events
  console.log("Calling eventService.findAll...");
  const { events, total } = await eventService.findAll({
    ...serviceParams,
    isAdminView: false, // Explicitly set to false for buyer endpoints
  });
  console.log(
    `eventService.findAll returned ${events.length} events out of ${total} total`,
  );

  // Process events for response
  const processedEvents = events.map((event) => {
    // Check if ticketTypes exists
    const ticketTypes = event.ticketTypes || [];

    // Calculate lowest ticket price
    const lowestPrice =
      ticketTypes.length > 0
        ? Math.min(...ticketTypes.map((t) => Number(t.price)))
        : 0;

    // Calculate total tickets and sold tickets
    const totalTickets = ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
    const soldTickets = ticketTypes.reduce((sum, t) => sum + t.sold, 0);
    const availableTickets = totalTickets - soldTickets;

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      posterUrl: event.posterUrl,
      bannerUrl: event.bannerUrl,
      category: event.category,
      venue: event.venue,
      address: event.address,
      city: event.city,
      province: event.province,
      country: event.country,
      tags: event.tags,
      featured: event.featured,
      startDate: event.startDate,
      endDate: event.endDate,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate),
      organizer: event.organizer,
      lowestPrice, // Move lowestPrice to top level for consistency with featured events
      ticketInfo: {
        totalTickets,
        soldTickets,
        availableTickets,
        percentageSold:
          totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0,
      },
    };
  });

  // Return events with pagination metadata
  return {
    events: processedEvents,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    },
  };
}

/**
 * Get a specific event by ID or slug
 */
export async function handleGetEventById(params: {
  id?: string;
  slug?: string;
}) {
  const { id, slug } = params;

  if (!id && !slug) {
    throw new Error("Either id or slug must be provided");
  }

  // Get event using the service
  let event;
  if (id) {
    console.log(`Looking up event by ID: ${id}`);
    event = await eventService.findById(id);
  } else if (slug) {
    console.log(`Looking up event by slug: ${slug}`);
    // Find by slug using direct database query
    event = await prisma.event.findFirst({
      where: {
        slug: slug,
        status: EventStatus.PUBLISHED,
      },
      include: {
        organizer: {
          include: {
            user: true,
          },
        },
        ticketTypes: {
          where: {
            isVisible: true,
          },
        },
      },
    });
    console.log(`Found event by slug: ${event ? event.title : "not found"}`);
  }

  if (!event || event.status !== EventStatus.PUBLISHED) {
    throw new Error("Event not found");
  }

  // Get ticket sales statistics
  const ticketStats = await ticketService.getTicketSaleStatsByEventId(event.id);

  // Process event for response
  const processedEvent = {
    ...event,
    formattedStartDate: formatDate(event.startDate),
    formattedEndDate: formatDate(event.endDate),
    ticketTypes: (event.ticketTypes || [])
      .filter((ticketType) => {
        // Use type assertion to handle the case where isVisible might not exist
        const ticketTypeWithIsVisible = ticketType as {
          isVisible?: boolean;
        } & typeof ticketType;
        return ticketTypeWithIsVisible.isVisible !== undefined
          ? ticketTypeWithIsVisible.isVisible
          : true;
      })
      .map((ticketType) => {
        const stats = ticketStats.find(
          (stat) => stat.ticketTypeId === ticketType.id,
        );
        return {
          ...ticketType,
          price: Number(ticketType.price),
          available: stats
            ? stats.available
            : ticketType.quantity - ticketType.sold,
        };
      }),
  };

  return processedEvent;
}

/**
 * Get featured events
 */
export async function handleGetFeaturedEvents(limit: number = 5) {
  console.log("handleGetFeaturedEvents called with limit:", limit);
  // Get featured events using the service
  console.log("Calling eventService.findAll for featured events...");
  const { events } = await eventService.findAll({
    featured: true,
    status: EventStatus.PUBLISHED, // Explicitly set status to PUBLISHED
    limit,
    isAdminView: false, // Explicitly set to false for buyer endpoints
  });
  console.log(`Found ${events.length} featured events`);

  // Process events for response
  const processedEvents = events.map((event) => {
    // Check if ticketTypes exists
    const ticketTypes = event.ticketTypes || [];

    // Calculate lowest ticket price
    const lowestPrice =
      ticketTypes.length > 0
        ? Math.min(...ticketTypes.map((t) => Number(t.price)))
        : 0;

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      posterUrl: event.posterUrl,
      venue: event.venue,
      city: event.city,
      startDate: event.startDate,
      formattedStartDate: formatDate(event.startDate),
      organizer: event.organizer,
      lowestPrice,
    };
  });

  return processedEvents;
}
