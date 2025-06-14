import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";

/**
 * Get orders for a user
 */
export async function handleGetUserOrders(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  status?: PaymentStatus | "MANUAL_PENDING";
}) {
  const { userId, page = 1, limit = 10, status } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Build where clause
  const where: any = {
    userId,
  };

  // Add status filter
  if (status) {
    if (status === "MANUAL_PENDING") {
      // Filter for manual payments awaiting verification
      where.status = "PENDING";
      where.paymentMethod = "MANUAL_PAYMENT";
      where.details = {
        path: ["awaitingVerification"],
        equals: true,
      };
    } else {
      where.status = status;
    }
  }

  // Get orders with pagination
  const [orders, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            startDate: true,
            venue: true,
            organizer: {
              select: {
                id: true,
                orgName: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  // Process orders for response
  const processedOrders = orders.map((order) => ({
    id: order.id,
    invoiceNumber: order.invoiceNumber,
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    formattedCreatedAt: formatDate(order.createdAt),
    event: {
      id: order.event.id,
      title: order.event.title,
      posterUrl: order.event.posterUrl,
      startDate: order.event.startDate,
      formattedStartDate: formatDate(order.event.startDate),
      venue: order.event.venue,
      organizer: order.event.organizer,
    },
    items: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      ticketType: item.ticketType,
    })),
    ticketCount: order.tickets.length,
  }));

  // Return orders with pagination metadata
  return {
    orders: processedOrders,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    },
  };
}

/**
 * Get a specific order by ID
 */
export async function handleGetOrderById(params: {
  orderId: string;
  userId?: string | null;
  sessionId?: string;
}) {
  const { orderId, userId, sessionId } = params;

  // Build where clause for order lookup
  let whereClause: any = {
    id: orderId,
  };

  if (userId) {
    // For authenticated users
    whereClause.userId = userId;
  } else if (sessionId) {
    // For guest users, find orders created by guest users with matching session ID
    whereClause.user = {
      phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
    };
  } else {
    throw new Error("Either userId or sessionId must be provided");
  }

  // Get order
  const order = await prisma.transaction.findFirst({
    where: whereClause,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          posterUrl: true,
          startDate: true,
          endDate: true,
          venue: true,
          address: true,
          city: true,
          province: true,
          organizer: {
            select: {
              id: true,
              orgName: true,
            },
          },
        },
      },
      orderItems: {
        include: {
          ticketType: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
      tickets: {
        select: {
          id: true,
          qrCode: true,
          status: true,
          checkedIn: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Process order for response
  const processedOrder = {
    id: order.id,
    invoiceNumber: order.invoiceNumber,
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentReference: order.paymentReference,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    formattedCreatedAt: formatDate(order.createdAt),
    event: {
      id: order.event.id,
      title: order.event.title,
      posterUrl: order.event.posterUrl,
      startDate: order.event.startDate,
      endDate: order.event.endDate,
      formattedStartDate: formatDate(order.event.startDate),
      formattedEndDate: formatDate(order.event.endDate),
      venue: order.event.venue,
      address: order.event.address,
      city: order.event.city,
      province: order.event.province,
      organizer: order.event.organizer,
    },
    items: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.price) * item.quantity,
      ticketType: item.ticketType,
    })),
    tickets: order.tickets.map((ticket) => ({
      id: ticket.id,
      qrCode: ticket.qrCode,
      status: ticket.status,
      checkedIn: ticket.checkedIn,
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      gateway: payment.gateway,
      amount: Number(payment.amount),
      status: payment.status,
      createdAt: payment.createdAt,
      formattedCreatedAt: formatDate(payment.createdAt),
    })),
    user: order.user,
  };

  return processedOrder;
}

/**
 * Cancel an order
 */
export async function handleCancelOrder(params: {
  orderId: string;
  userId: string;
}) {
  const { orderId, userId } = params;

  // Get order
  const order = await prisma.transaction.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      tickets: true,
      orderItems: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Check if order can be cancelled
  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be cancelled");
  }

  // Cancel order in a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update order status
    const updatedOrder = await tx.transaction.update({
      where: { id: orderId },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    // Update ticket statuses
    await tx.ticket.updateMany({
      where: { transactionId: orderId },
      data: {
        status: "CANCELLED", // This is valid for TicketStatus
      },
    });

    // Restore ticket type quantities
    for (const item of order.orderItems) {
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: {
          sold: {
            decrement: item.quantity,
          },
        },
      });
    }

    return updatedOrder;
  });

  return result;
}
