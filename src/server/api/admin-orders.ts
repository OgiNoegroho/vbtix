import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";

/**
 * Get all orders for admin with filtering and pagination
 */
export async function handleGetAdminOrders(params: {
  page?: number | string;
  limit?: number | string;
  status?: PaymentStatus | "MANUAL_PENDING";
  search?: string;
}) {
  const { page = 1, limit = 10, status, search } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Build where clause
  const where: any = {};

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

  // Add search filter
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { event: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Get orders with pagination
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
                price: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            gateway: true,
            status: true,
            paymentId: true,
            createdAt: true,
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

  // Format orders for response
  const formattedOrders = orders.map((order) => ({
    id: order.id,
    invoiceNumber: order.invoiceNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    amount: Number(order.amount),
    currency: order.currency,
    details: order.details,
    createdAt: order.createdAt.toISOString(),
    formattedCreatedAt: formatDate(order.createdAt),
    user: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
    },
    event: {
      id: order.event.id,
      title: order.event.title,
      startDate: order.event.startDate?.toISOString(),
      formattedStartDate: order.event.startDate ? formatDate(order.event.startDate) : null,
      venue: order.event.venue,
      organizer: order.event.organizer,
    },
    items: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.price) * item.quantity,
      ticketType: {
        id: item.ticketType.id,
        name: item.ticketType.name,
        price: Number(item.ticketType.price),
      },
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      gateway: payment.gateway,
      status: payment.status,
      paymentId: payment.paymentId,
      createdAt: payment.createdAt.toISOString(),
      formattedCreatedAt: formatDate(payment.createdAt),
    })),
    tickets: order.tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
    })),
  }));

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    orders: formattedOrders,
    meta: {
      currentPage: validPage,
      totalPages,
      totalItems: total,
      itemsPerPage: validLimit,
    },
  };
}

/**
 * Update order status (for manual payment verification)
 */
export async function handleUpdateOrderStatus(params: {
  orderId: string;
  status: PaymentStatus;
  notes?: string;
  adminId: string;
}) {
  const { orderId, status, notes, adminId } = params;

  // Get the order first
  const order = await prisma.transaction.findUnique({
    where: { id: orderId },
    include: {
      payments: true,
      tickets: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update order status
  const updatedOrder = await prisma.transaction.update({
    where: { id: orderId },
    data: {
      status,
      details: {
        ...(order.details as any),
        awaitingVerification: false,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId,
        verificationNotes: notes,
      },
    },
  });

  // Update payment status if exists
  if (order.payments.length > 0) {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status },
    });
  }

  // If approved, generate tickets
  if (status === "SUCCESS" && order.tickets.length === 0) {
    // Generate tickets for successful manual payment
    const ticketData = order.orderItems?.map((item: any) => 
      Array.from({ length: item.quantity }, (_, index) => ({
        ticketTypeId: item.ticketTypeId,
        transactionId: order.id,
        userId: order.userId,
        qrCode: `${order.id}-${item.ticketTypeId}-${index + 1}`,
        status: "ACTIVE" as const,
        checkedIn: false,
      }))
    ).flat() || [];

    if (ticketData.length > 0) {
      await prisma.ticket.createMany({
        data: ticketData,
      });

      // Generate QR codes for the newly created tickets
      try {
        const qrResult = await generateTransactionQRCodes(order.id);
        console.log(`QR code generation result: ${qrResult.generatedCount} generated, errors:`, qrResult.errors);
      } catch (qrError) {
        console.error("Error generating QR codes:", qrError);
        // Don't fail the approval process if QR generation fails
      }
    }
  }

  return updatedOrder;
}
