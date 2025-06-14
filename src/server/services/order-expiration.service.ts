import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";

/**
 * Service for handling order expiration and cleanup
 */
export class OrderExpirationService {
  /**
   * Check if an order should be expired (1 day after creation)
   */
  static isOrderExpired(createdAt: Date): boolean {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    return createdAt < oneDayAgo;
  }

  /**
   * Find all orders that should be expired
   */
  static async findExpiredOrders() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1); // 1 day ago

    const expiredOrders = await prisma.transaction.findMany({
      where: {
        status: {
          in: ["PENDING", "PENDING_PAYMENT"], // Only unpaid orders
        },
        createdAt: {
          lt: oneDayAgo, // Created more than 1 day ago
        },
      },
      include: {
        orderItems: {
          include: {
            ticketType: true,
          },
        },
        tickets: true,
        payments: true,
      },
    });

    return expiredOrders;
  }

  /**
   * Expire a single order and return tickets to inventory
   */
  static async expireOrder(orderId: string) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get order details
        const order = await tx.transaction.findUnique({
          where: { id: orderId },
          include: {
            orderItems: {
              include: {
                ticketType: true,
              },
            },
            tickets: true,
            payments: true,
          },
        });

        if (!order) {
          throw new Error(`Order ${orderId} not found`);
        }

        // Only expire pending orders, but skip manual payments awaiting verification
        if (order.status !== "PENDING") {
          console.log(`Order ${orderId} is not pending, skipping expiration`);
          return null;
        }

        // Skip manual payments awaiting verification
        if (order.paymentMethod === "MANUAL_PAYMENT" &&
            order.details &&
            typeof order.details === 'object' &&
            (order.details as any).awaitingVerification) {
          console.log(`Order ${orderId} is manual payment awaiting verification, skipping expiration`);
          return null;
        }

        // Check if order is actually expired (1 day old)
        if (!this.isOrderExpired(order.createdAt)) {
          console.log(`Order ${orderId} is not yet expired, skipping`);
          return null;
        }

        // Update order status to EXPIRED
        const updatedOrder = await tx.transaction.update({
          where: { id: orderId },
          data: {
            status: "EXPIRED",
            updatedAt: new Date(),
          },
        });

        // Cancel all tickets
        await tx.ticket.updateMany({
          where: { transactionId: orderId },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });

        // Return ticket quantities to inventory
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
              status: "EXPIRED",
              updatedAt: new Date(),
            },
          });
        }

        console.log(`✅ Order ${orderId} expired successfully`);
        return updatedOrder;
      }, {
        maxWait: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      });

      return result;
    } catch (error) {
      console.error(`❌ Failed to expire order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Expire all orders that are past their deadline
   */
  static async expireAllOverdueOrders() {
    try {
      console.log("🔍 Checking for expired orders...");
      
      const expiredOrders = await this.findExpiredOrders();
      
      if (expiredOrders.length === 0) {
        console.log("✅ No expired orders found");
        return { expired: 0, errors: [] };
      }

      console.log(`📋 Found ${expiredOrders.length} expired orders`);

      const results = {
        expired: 0,
        errors: [] as string[],
      };

      // Process each expired order
      for (const order of expiredOrders) {
        try {
          await this.expireOrder(order.id);
          results.expired++;
        } catch (error: any) {
          console.error(`❌ Failed to expire order ${order.id}:`, error);
          results.errors.push(`Order ${order.id}: ${error.message}`);
        }
      }

      console.log(`✅ Expired ${results.expired} orders`);
      if (results.errors.length > 0) {
        console.log(`⚠️  ${results.errors.length} errors occurred`);
      }

      return results;
    } catch (error) {
      console.error("❌ Failed to expire orders:", error);
      throw error;
    }
  }

  /**
   * Get order expiration status
   */
  static getOrderExpirationInfo(createdAt: Date) {
    const now = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours after creation
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    return {
      expiresAt,
      isExpired: timeLeft <= 0,
      timeLeftMs: Math.max(0, timeLeft),
      timeLeftHours: Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60))),
      timeLeftMinutes: Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))),
    };
  }

  /**
   * Format time remaining for display
   */
  static formatTimeRemaining(createdAt: Date): string {
    const info = this.getOrderExpirationInfo(createdAt);
    
    if (info.isExpired) {
      return "Expired";
    }
    
    if (info.timeLeftHours > 0) {
      return `${info.timeLeftHours}h ${info.timeLeftMinutes}m remaining`;
    } else {
      return `${info.timeLeftMinutes}m remaining`;
    }
  }
}

export default OrderExpirationService;
