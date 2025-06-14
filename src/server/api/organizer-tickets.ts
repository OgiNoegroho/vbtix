import { prisma } from "~/server/db";
import { TicketStatus } from "@prisma/client";

/**
 * Get all sold tickets for an organizer's events with filtering and pagination
 */
export async function handleGetOrganizerSoldTickets(params: {
  organizerId: string;
  page: number;
  limit: number;
  search?: string;
  eventId?: string;
  status?: string;
  checkInStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const {
    organizerId,
    page = 1,
    limit = 20,
    search = "",
    eventId = "",
    status = "",
    checkInStatus = "",
    dateFrom = "",
    dateTo = "",
  } = params;

  const offset = (page - 1) * limit;

  // Build where conditions
  const whereConditions: any = {
    ticketType: {
      event: {
        organizerId,
      },
    },
  };

  // Add search filter (attendee name or email)
  if (search) {
    whereConditions.transaction = {
      user: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    };
  }

  // Add event filter
  if (eventId) {
    whereConditions.ticketType.event.id = eventId;
  }

  // Add status filter
  if (status) {
    whereConditions.status = status as TicketStatus;
  }

  // Add check-in status filter
  if (checkInStatus === "checked-in") {
    whereConditions.checkedIn = true;
  } else if (checkInStatus === "not-checked-in") {
    whereConditions.checkedIn = false;
  }

  // Add date range filter
  if (dateFrom || dateTo) {
    whereConditions.createdAt = {};
    if (dateFrom) {
      whereConditions.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      whereConditions.createdAt.lte = new Date(dateTo);
    }
  }

  // Get tickets with pagination
  const [tickets, totalCount] = await Promise.all([
    prisma.ticket.findMany({
      where: whereConditions,
      include: {
        ticketType: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                venue: true,
              },
            },
          },
        },
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.ticket.count({
      where: whereConditions,
    }),
  ]);

  // Process tickets for response
  const processedTickets = tickets.map((ticket) => ({
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    checkInTime: ticket.checkInTime,
    createdAt: ticket.createdAt,
    attendee: {
      name: ticket.transaction.user.name || "Unknown",
      email: ticket.transaction.user.email,
      phone: ticket.transaction.user.phone,
      avatar: ticket.transaction.user.image,
    },
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
      currency: ticket.ticketType.currency,
    },
    event: {
      id: ticket.ticketType.event.id,
      title: ticket.ticketType.event.title,
      startDate: ticket.ticketType.event.startDate,
      venue: ticket.ticketType.event.venue,
    },
    transaction: {
      id: ticket.transaction.id,
      invoiceNumber: ticket.transaction.invoiceNumber,
      paymentMethod: ticket.transaction.paymentMethod,
    },
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return {
    tickets: processedTickets,
    meta: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Get ticket statistics for an organizer
 */
export async function handleGetOrganizerTicketStats(organizerId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get all tickets for organizer's events
  const baseWhere = {
    ticketType: {
      event: {
        organizerId,
      },
    },
  };

  const [
    totalSold,
    totalRevenue,
    todayCheckIns,
    totalCheckIns,
    statusCounts,
    upcomingEvents,
  ] = await Promise.all([
    // Total tickets sold
    prisma.ticket.count({
      where: baseWhere,
    }),

    // Total revenue - calculate from successful transactions
    prisma.orderItem.aggregate({
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
    }),

    // Today's check-ins
    prisma.ticket.count({
      where: {
        ...baseWhere,
        checkedIn: true,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),

    // Total check-ins
    prisma.ticket.count({
      where: {
        ...baseWhere,
        checkedIn: true,
      },
    }),

    // Status counts
    prisma.ticket.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: {
        status: true,
      },
    }),

    // Upcoming events count
    prisma.event.count({
      where: {
        organizerId,
        startDate: {
          gte: new Date(),
        },
        status: "PUBLISHED",
      },
    }),
  ]);

  // Process status counts
  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalSold,
    totalRevenue: Number(totalRevenue._sum.price || 0),
    todayCheckIns,
    totalCheckIns,
    activeTickets: statusMap.ACTIVE || 0,
    cancelledTickets: statusMap.CANCELLED || 0,
    refundedTickets: statusMap.REFUNDED || 0,
    usedTickets: statusMap.USED || 0,
    expiredTickets: statusMap.EXPIRED || 0,
    upcomingEvents,
  };
}

/**
 * Get detailed information about a specific ticket
 */
export async function handleGetOrganizerTicketDetail(params: {
  organizerId: string;
  ticketId: string;
}) {
  const { organizerId, ticketId } = params;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      ticketType: {
        event: {
          organizerId,
        },
      },
    },
    include: {
      ticketType: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              venue: true,
              address: true,
            },
          },
        },
      },
      transaction: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return {
    id: ticket.id,
    qrCode: ticket.qrCode,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    checkInTime: ticket.checkInTime,
    createdAt: ticket.createdAt,
    attendee: {
      name: ticket.transaction.user.name || "Unknown",
      email: ticket.transaction.user.email,
      phone: ticket.transaction.user.phone,
      avatar: ticket.transaction.user.image,
    },
    ticketType: {
      id: ticket.ticketType.id,
      name: ticket.ticketType.name,
      price: Number(ticket.ticketType.price),
      currency: ticket.ticketType.currency,
    },
    event: {
      id: ticket.ticketType.event.id,
      title: ticket.ticketType.event.title,
      startDate: ticket.ticketType.event.startDate,
      venue: ticket.ticketType.event.venue,
      address: ticket.ticketType.event.address,
    },
    transaction: {
      id: ticket.transaction.id,
      invoiceNumber: ticket.transaction.invoiceNumber,
      paymentMethod: ticket.transaction.paymentMethod,
    },
  };
}

/**
 * Check in or check out a ticket
 */
export async function handleTicketCheckIn(params: {
  organizerId: string;
  ticketId: string;
  checkIn: boolean;
  notes?: string;
  checkedInBy: string;
}) {
  const { organizerId, ticketId, checkIn } = params;

  // First verify the ticket belongs to this organizer
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      ticketType: {
        event: {
          organizerId,
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Check if ticket is active
  if (ticket.status !== "ACTIVE") {
    throw new Error("Ticket not active");
  }

  // Check current check-in status
  if (checkIn && ticket.checkedIn) {
    throw new Error("Ticket already checked in");
  }

  // Update ticket check-in status
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      checkedIn: checkIn,
      checkInTime: checkIn ? new Date() : null,
      scannedAt: checkIn ? new Date() : null,
    },
  });

  return {
    id: updatedTicket.id,
    checkedIn: updatedTicket.checkedIn,
    checkInTime: updatedTicket.checkInTime,
    message: checkIn ? "Ticket checked in successfully" : "Check-in reversed",
  };
}

/**
 * Export tickets data as CSV or Excel
 */
export async function handleExportOrganizerTickets(params: {
  organizerId: string;
  format: "csv" | "excel";
  search?: string;
  eventId?: string;
  status?: string;
  checkInStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const {
    organizerId,
    format,
    search = "",
    eventId = "",
    status = "",
    checkInStatus = "",
    dateFrom = "",
    dateTo = "",
  } = params;

  // Build where conditions (same as in handleGetOrganizerSoldTickets)
  const whereConditions: any = {
    ticketType: {
      event: {
        organizerId,
      },
    },
  };

  // Add filters
  if (search) {
    whereConditions.transaction = {
      user: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    };
  }

  if (eventId) {
    whereConditions.ticketType.event.id = eventId;
  }

  if (status) {
    whereConditions.status = status as any;
  }

  if (checkInStatus === "checked-in") {
    whereConditions.checkedIn = true;
  } else if (checkInStatus === "not-checked-in") {
    whereConditions.checkedIn = false;
  }

  if (dateFrom || dateTo) {
    whereConditions.createdAt = {};
    if (dateFrom) {
      whereConditions.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      whereConditions.createdAt.lte = new Date(dateTo);
    }
  }

  // Get all tickets (no pagination for export)
  const tickets = await prisma.ticket.findMany({
    where: whereConditions,
    include: {
      ticketType: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              venue: true,
            },
          },
        },
      },
      transaction: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Prepare data for export
  const exportData = tickets.map((ticket) => ({
    "Ticket ID": ticket.id,
    "QR Code": ticket.qrCode,
    "Attendee Name": ticket.transaction.user.name || "Unknown",
    "Attendee Email": ticket.transaction.user.email,
    "Attendee Phone": ticket.transaction.user.phone || "",
    "Event Title": ticket.ticketType.event.title,
    "Event Date": ticket.ticketType.event.startDate.toISOString().split('T')[0],
    "Event Venue": ticket.ticketType.event.venue,
    "Ticket Type": ticket.ticketType.name,
    "Price": Number(ticket.ticketType.price),
    "Status": ticket.status,
    "Checked In": ticket.checkedIn ? "Yes" : "No",
    "Check-in Time": ticket.checkInTime ? ticket.checkInTime.toISOString() : "",
    "Purchase Date": ticket.createdAt.toISOString().split('T')[0],
    "Invoice Number": ticket.transaction.invoiceNumber,
    "Payment Method": ticket.transaction.paymentMethod,
  }));

  if (format === "csv") {
    // Generate CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(","),
      ...exportData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV
          return typeof value === "string" && (value.includes(",") || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(",")
      )
    ].join("\n");

    return {
      data: csvContent,
      contentType: "text/csv",
      filename: `tickets-export-${new Date().toISOString().split('T')[0]}.csv`,
    };
  } else {
    // For Excel format, we'll return CSV for now
    // In a real implementation, you'd use a library like xlsx
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(","),
      ...exportData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === "string" && (value.includes(",") || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(",")
      )
    ].join("\n");

    return {
      data: csvContent,
      contentType: "application/vnd.ms-excel",
      filename: `tickets-export-${new Date().toISOString().split('T')[0]}.xls`,
    };
  }
}
