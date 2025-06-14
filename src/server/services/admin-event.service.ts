/**
 * Admin Event Service - Simplified Admin Approval Workflow
 * Provides specialized services for admin event approval operations
 */

import { prisma } from "~/server/db";
import { EventStatus, ApprovalStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";

export const adminEventService = {
  /**
   * Create an admin event that bypasses approval workflow
   */
  async createAdminEvent(eventData: any, adminUserId: string) {
    try {
      // First, check if admin has an organizer profile, if not create one
      let organizer = await prisma.organizer.findFirst({
        where: { userId: adminUserId },
      });

      if (!organizer) {
        // Create a special admin organizer profile
        organizer = await prisma.organizer.create({
          data: {
            userId: adminUserId,
            orgName: "VBTicket Admin",
            verified: true, // Admin organizer is automatically verified
          },
        });
      }

      // Admin events are published immediately without approval
      const data = {
        ...eventData,
        organizerId: organizer.id,
        status: EventStatus.PUBLISHED,
      };

      // Create event directly with published status
      const event = await prisma.event.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return {
        ...event,
        formattedStartDate: formatDate(event.startDate),
        formattedEndDate: formatDate(event.endDate),
      };
    } catch (error: any) {
      console.error("Error creating admin event:", error);
      throw error;
    }
  },

  /**
   * Get all events for admin approval dashboard (pending, approved, rejected)
   */
  async getPendingEventsForApproval(params?: {
    page?: number;
    limit?: number;
    search?: string;
    organizerId?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, search, organizerId, status } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by approval-related statuses
    if (status && status !== 'all') {
      where.status = status;
    } else {
      // Show all approval-related statuses by default
      where.status = {
        in: [EventStatus.PENDING_REVIEW, EventStatus.PUBLISHED, EventStatus.REJECTED]
      };
    }

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { organizer: { orgName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Add organizer filter
    if (organizerId) {
      where.organizerId = organizerId;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          organizer: {
            select: {
              id: true,
              orgName: true,
              verified: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,                },
              },
            },
          },
          ticketTypes: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              sold: true,
            },
          },
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Transform events with additional data
    const transformedEvents = events.map((event) => {
      const ticketPrice = event.ticketTypes.length > 0
        ? {
            min: Math.min(...event.ticketTypes.map((t: any) => Number(t.price))),
            max: Math.max(...event.ticketTypes.map((t: any) => Number(t.price))),
          }
        : { min: 0, max: 0 };

      const totalCapacity = event.ticketTypes.reduce((sum: number, t: any) => sum + t.quantity, 0);
      const totalSold = event.ticketTypes.reduce((sum: number, t: any) => sum + t.sold, 0);

      return {
        ...event,
        formattedStartDate: formatDate(event.startDate),
        formattedEndDate: formatDate(event.endDate),
        formattedCreatedAt: formatDate(event.createdAt),
        ticketPrice,
        ticketsAvailable: totalCapacity - totalSold,
        totalOrders: event._count.transactions,
      };
    });

    return {
      events: transformedEvents,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get detailed event information for admin review
   */
  async getEventForReview(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            verification: true,
          },
        },
        ticketTypes: {
          orderBy: { createdAt: "asc" },
        },
        transactions: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Calculate statistics
    const totalCapacity = event.ticketTypes.reduce((sum: number, t: any) => sum + t.quantity, 0);
    const totalSold = event.ticketTypes.reduce((sum: number, t: any) => sum + t.sold, 0);
    const totalRevenue = event.transactions
      .filter((o: any) => o.status === "SUCCESS")
      .reduce((sum: number, o: any) => sum + Number(o.amount), 0);

    const statistics = {
      totalTicketsSold: totalSold,
      totalCapacity,
      soldPercentage: totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0,
      totalRevenue,
      totalTransactions: event._count.transactions,
    };

    return {
      ...event,
      formattedStartDate: formatDate(event.startDate),
      formattedEndDate: formatDate(event.endDate),
      formattedCreatedAt: formatDate(event.createdAt),
      statistics,
    };
  },

  /**
   * Approve an event
   */
  async approveEvent(eventId: string, adminId: string, notes?: string) {
    try {
      // Verify event exists and is pending
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      if (event.status !== EventStatus.PENDING_REVIEW) {
        throw new Error("Event is not pending review");
      }

      // Update event status to published
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          status: EventStatus.PUBLISHED,
        },
      });

      // Create approval record
      await prisma.approval.create({
        data: {
          entityType: "EVENT",
          entityId: eventId,
          status: ApprovalStatus.APPROVED,
          notes: notes || "Event approved by admin",
          reviewerId: adminId,
          reviewedAt: new Date(),
        },
      });

      return {
        ...updatedEvent,
        formattedStartDate: formatDate(updatedEvent.startDate),
        formattedEndDate: formatDate(updatedEvent.endDate),
      };
    } catch (error: any) {
      console.error("Error approving event:", error);
      throw error;
    }
  },

  /**
   * Reject an event
   */
  async rejectEvent(eventId: string, adminId: string, notes?: string) {
    try {
      // Verify event exists and is pending
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      if (event.status !== EventStatus.PENDING_REVIEW) {
        throw new Error("Event is not pending review");
      }

      // Update event status to rejected
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          status: EventStatus.REJECTED,
        },
      });

      // Create approval record
      await prisma.approval.create({
        data: {
          entityType: "EVENT",
          entityId: eventId,
          status: ApprovalStatus.REJECTED,
          notes: notes || "Event rejected by admin",
          reviewerId: adminId,
          reviewedAt: new Date(),
        },
      });

      return {
        ...updatedEvent,
        formattedStartDate: formatDate(updatedEvent.startDate),
        formattedEndDate: formatDate(updatedEvent.endDate),
      };
    } catch (error: any) {
      console.error("Error rejecting event:", error);
      throw error;
    }
  },

  /**
   * Get approval statistics for admin dashboard
   * Using consistent data source (event table) for reliable statistics
   */
  async getApprovalStatistics() {
    try {
      console.log("Getting approval statistics...");

      // Use event table as single source of truth for consistency
      const [
        totalPending,
        totalApproved,
        totalRejected,
        allEvents,
        averageApprovalTime,
      ] = await Promise.all([
        // Current pending events
        prisma.event.count({ where: { status: EventStatus.PENDING_REVIEW } }),

        // Total approved events (published)
        prisma.event.count({ where: { status: EventStatus.PUBLISHED } }),

        // Total rejected events
        prisma.event.count({ where: { status: EventStatus.REJECTED } }),

        // Get all events for additional calculations
        prisma.event.count(),

        // Calculate average approval time from approval records
        prisma.approval.findMany({
          where: {
            entityType: "EVENT",
            status: { in: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] },
            reviewedAt: { not: null },
            submittedAt: { not: null },
          },
          select: {
            submittedAt: true,
            reviewedAt: true,
          },
          take: 100, // Last 100 approvals for average calculation
          orderBy: { reviewedAt: "desc" },
        }),
      ]);

      // Calculate average approval time in hours
      let avgApprovalTimeHours = 0;
      if (averageApprovalTime.length > 0) {
        const totalTime = averageApprovalTime.reduce((sum, approval) => {
          if (approval.reviewedAt && approval.submittedAt) {
            return sum + (approval.reviewedAt.getTime() - approval.submittedAt.getTime());
          }
          return sum;
        }, 0);

        avgApprovalTimeHours = Math.round(
          totalTime / (averageApprovalTime.length * 1000 * 60 * 60)
        );
      }

      // Calculate derived statistics
      const totalEvents = totalPending + totalApproved + totalRejected;
      const approvalRate = totalEvents > 0 ? Math.round((totalApproved / totalEvents) * 100) : 0;

      // Get recent approvals count (last 7 days) for context
      const recentApprovals = await prisma.approval.count({
        where: {
          entityType: "EVENT",
          reviewedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          },
        },
      });

      const statistics = {
        totalPending,
        totalApproved,
        totalRejected,
        totalEvents,
        approvalRate,
        recentApprovals,
        averageApprovalTimeHours: avgApprovalTimeHours,
        // Data validation flags
        dataConsistency: {
          isConsistent: totalEvents <= allEvents, // Basic sanity check
          totalEventsInDb: allEvents,
          calculatedTotal: totalEvents,
        }
      };

      console.log("Approval statistics calculated:", statistics);
      return statistics;

    } catch (error: any) {
      console.error("Error getting approval statistics:", error);
      throw error;
    }
  },

  /**
   * Get organizer information for event review
   */
  async getOrganizerInfo(organizerId: string) {
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        verification: true,
        events: {
          where: {
            status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] },
          },
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            _count: {
              select: {
                transactions: true,
              },
            },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    return {
      ...organizer,
      totalEvents: organizer._count.events,
      recentEvents: organizer.events.map((event: any) => ({
        ...event,
        formattedStartDate: formatDate(event.startDate),
        totalOrders: event._count.transactions,
      })),
    };
  },
};
