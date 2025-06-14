import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { PaymentStatus } from "@prisma/client";
import { emailService } from "~/lib/email-service";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";

/**
 * Get orders for an organizer's events
 */
export async function handleGetOrganizerOrders(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
  status?: PaymentStatus | "MANUAL_PENDING";
  eventId?: string;
  search?: string;
}) {
  console.log("[Business Logic] handleGetOrganizerOrders called with params:", params);

  const { userId, page = 1, limit = 10, status, eventId, search } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  console.log("[Business Logic] Validated parameters:", { validPage, validLimit, skip });

  // Check if user is an organizer
  console.log("[Business Logic] Looking up organizer for userId:", userId);
  const organizer = await organizerService.findByUserId(userId);

  if (!organizer) {
    console.log("[Business Logic] No organizer found for userId:", userId);
    throw new Error("User is not an organizer");
  }

  console.log("[Business Logic] Organizer found:", {
    organizerId: organizer.id,
    orgName: organizer.orgName,
    verified: organizer.verified
  });

  // Build where clause
  const where: any = {
    event: {
      organizerId: organizer.id,
    },
  };

  // Add optional filters
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

  if (eventId) {
    where.eventId = eventId;
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Get orders
  console.log("[Business Logic] Executing database query with where clause:", JSON.stringify(where, null, 2));

  const [orders, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            venue: true,
          },
        },
        orderItems: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  console.log("[Business Logic] Database query completed:", {
    ordersFound: orders.length,
    totalCount: total
  });

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    orders: orders.map((order) => ({
      ...order,
      formattedDate: formatDate(order.createdAt),
    })),
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Get order details for an organizer
 */
export async function handleGetOrganizerOrderById(params: {
  userId: string;
  orderId: string;
}) {
  const { userId, orderId } = params;

  if (!orderId) throw new Error("Order ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get order details
  const order = await prisma.transaction.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
        },
      },
      orderItems: {
        include: {
          ticketType: true,
        },
      },
      tickets: true,
      payments: true,
    },
  });

  if (!order) throw new Error("Order not found");

  // Check if the order is for an event organized by this organizer
  if (order.event.organizerId !== organizer.id) {
    throw new Error("Order does not belong to this organizer's events");
  }

  return {
    ...order,
    formattedDate: formatDate(order.createdAt),
  };
}

/**
 * Get recent orders for an organizer's dashboard
 */
export async function handleGetRecentOrganizerOrders(params: {
  userId: string;
  limit?: number;
}) {
  const { userId, limit = 5 } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get recent orders
  const recentOrders = await prisma.transaction.findMany({
    where: {
      event: {
        organizerId: organizer.id,
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
        },
      },
      orderItems: {
        include: {
          ticketType: true,
        },
      },
    },
  });

  return recentOrders.map((order) => ({
    ...order,
    formattedDate: formatDate(order.createdAt),
  }));
}

/**
 * Get order statistics for an organizer
 */
export async function handleGetOrganizerOrderStats(params: {
  userId: string;
  eventId?: string;
}) {
  const { userId, eventId } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Build where clause
  const where: any = {
    event: {
      organizerId: organizer.id,
    },
  };

  // Add optional event filter
  if (eventId) {
    where.eventId = eventId;
  }

  // Get order statistics
  const [totalOrders, pendingOrders, successfulOrders, failedOrders] =
    await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, status: "PENDING" } }),
      prisma.transaction.count({ where: { ...where, status: "SUCCESS" } }),
      prisma.transaction.count({ where: { ...where, status: "FAILED" } }),
    ]);

  // Calculate total revenue
  const revenue = await prisma.transaction.aggregate({
    where: { ...where, status: "SUCCESS" },
    _sum: {
      amount: true,
    },
  });

  return {
    totalOrders,
    pendingOrders,
    successfulOrders,
    failedOrders,
    totalRevenue: revenue._sum.amount || 0,
  };
}

/**
 * Update order status (for manual payment approval by organizer)
 */
export async function handleUpdateOrganizerOrderStatus(params: {
  userId: string;
  orderId: string;
  status: PaymentStatus;
  notes?: string;
}) {
  const { userId, orderId, status, notes } = params;
  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get order with all related data and verify it belongs to this organizer
  const order = await prisma.transaction.findFirst({
    where: {
      id: orderId,
      event: {
        organizerId: organizer.id,
      },
    },
    include: {
      user: true,
      event: {
        include: {
          organizer: true,
        },
      },
      orderItems: {
        include: {
          ticketType: true,
        },
      },
      tickets: {
        include: {
          ticketHolder: true,
          ticketType: {
            include: {
              event: true,
            },
          },
        },
      },
      buyerInfo: true,
      payments: true,
    },
  });

  if (!order) {
    throw new Error(
      "Order not found or you don't have permission to update it",
    );
  }

  // Update order status in a transaction
  const result = await prisma.$transaction(
    async (tx) => {
      // Update order status
      const updatedOrder = await tx.transaction.update({
        where: { id: orderId },
        data: {
          status,
          details: {
            ...(order.details as any),
            awaitingVerification: false,
            verifiedAt: new Date().toISOString(),
            verifiedBy: userId,
            verificationNotes: notes,
            verifiedByType: "organizer",
          },
          updatedAt: new Date(),
        },
      });

      // If status is SUCCESS (approved), update tickets and send email
      if (status === "SUCCESS") {
        // Update ticket statuses to ACTIVE
        await tx.ticket.updateMany({
          where: { transactionId: orderId },
          data: {
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });

        // Update payment status if exists
        if (order.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: "SUCCESS",
              receivedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        // Mark tickets as delivered (since we're sending via email)
        await tx.ticket.updateMany({
          where: { transactionId: orderId },
          data: {
            delivered: true,
            deliveredAt: new Date(),
          },
        });
      }

      // If status is FAILED (rejected), update tickets to CANCELLED
      if (status === "FAILED") {
        await tx.ticket.updateMany({
          where: { transactionId: orderId },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
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

        // Update payment status if exists
        if (order.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: "FAILED",
              updatedAt: new Date(),
            },
          });
        }
      }

      return updatedOrder;
    },
    {
      maxWait: 10000, // 10 seconds
      timeout: 15000, // 15 seconds
    },
  );

  // Generate QR codes for approved orders
  if (status === "SUCCESS") {
    try {
      console.log(`🎫 Generating QR codes for approved order: ${orderId}`);
      const qrResult = await generateTransactionQRCodes(orderId);
      console.log(`🎫 QR code generation result: ${qrResult.generatedCount} generated, errors:`, qrResult.errors);

      if (!qrResult.success && qrResult.errors.length > 0) {
        console.warn(`⚠️ Some QR codes failed to generate for order ${orderId}:`, qrResult.errors);
        // Don't fail the entire process if QR generation fails
      }
    } catch (qrError) {
      console.error(`❌ Error generating QR codes for order ${orderId}:`, qrError);
      // Don't fail the entire process if QR generation fails
    }
  }

  // Send email notification if order is approved
  if (status === "SUCCESS") {
    try {
      // Get the email to send to (buyer info email or user email)
      const emailTo = order.buyerInfo?.email || order.user.email;

      if (emailTo) {
        // Format event date and time
        const eventDate = new Date(order.event.startDate).toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        );

        const eventTime = order.event.startTime || "Waktu akan diumumkan";
        const customerName =
          order.buyerInfo?.fullName || order.user.name || "Customer";

        // Format payment date
        const paymentDate =
          new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) + " WIB";

        await emailService.sendTicketDelivery({
          to: emailTo,
          customerName,
          event: {
            title: order.event.title,
            date: eventDate,
            time: eventTime,
            location: order.event.venue,
            address: `${order.event.address}, ${order.event.city}, ${order.event.province}`,
            image: order.event.posterUrl || undefined,
          },
          order: {
            invoiceNumber: order.invoiceNumber,
            totalAmount: Number(order.amount),
            paymentDate,
          },
          tickets: order.tickets.map((ticket) => ({
            id: ticket.id,
            ticketNumber: ticket.id,
            ticketType: ticket.ticketType.name,
            holderName: ticket.ticketHolder?.fullName || customerName,
            qrCode: ticket.qrCode || undefined,
          })),
        });

        console.log(
          `✅ Ticket delivery email sent to ${emailTo} for order ${order.invoiceNumber}`,
        );
      }
    } catch (emailError) {
      console.error("Failed to send ticket email:", emailError);
      // Don't throw error here, order update should still succeed
    }
  }

  return result;
}

/**
 * Format date helper function
 */
function formatDate(date: Date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
