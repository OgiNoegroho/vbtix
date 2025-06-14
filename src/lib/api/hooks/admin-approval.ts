/**
 * Admin Event Approval Hooks
 * Specialized hooks for admin event approval workflow
 */

import useSWR from "swr";
import { fetcher, postData } from "~/lib/api/client";

interface ApprovalStatistics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalEvents: number;
  approvalRate: number;
  recentApprovals: number;
  averageApprovalTimeHours: number;
  dataConsistency: {
    isConsistent: boolean;
    totalEventsInDb: number;
    calculatedTotal: number;
  };
}

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  formattedStartDate: string;
  formattedEndDate: string;
  formattedCreatedAt: string;
  venue: string;
  city: string;
  province: string;
  category: string;
  tags: string[];
  posterUrl?: string;
  maxAttendees?: number;
  status: string; // Add status field to track approval status
  ticketPrice: {
    min: number;
    max: number;
  };
  ticketsAvailable: number;
  totalOrders: number;
  organizer: {
    id: string;
    orgName: string;
    verified: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    sold: number;
  }>;
}

interface ApprovalResponse {
  events: PendingEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics?: ApprovalStatistics;
}

/**
 * Hook to fetch events for approval dashboard with admin-specific features
 */
export const useAdminEventApproval = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  organizerId?: string;
  status?: string;
  includeStats?: boolean;
}) => {
  // Build query string
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.search) queryParams.set("search", params.search);
  if (params?.organizerId) queryParams.set("organizerId", params.organizerId);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.includeStats) queryParams.set("includeStats", "true");

  const url = `/api/admin/events/approval${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: ApprovalResponse;
  }>(url, fetcher);

  return {
    events: data?.data?.events || [],
    meta: data?.data?.meta || { page: 1, limit: 12, total: 0, totalPages: 0 },
    statistics: data?.data?.statistics || null,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to handle event approval actions
 */
export const useEventApproval = () => {
  const approveEvent = async (eventId: string, notes?: string) => {
    return await postData(`/api/admin/events/${eventId}/approval`, {
      action: "approve",
      notes,
    });
  };

  const rejectEvent = async (eventId: string, notes: string) => {
    if (!notes?.trim()) {
      throw new Error("Notes are required for rejection");
    }
    
    return await postData(`/api/admin/events/${eventId}/approval`, {
      action: "reject",
      notes,
    });
  };

  return {
    approveEvent,
    rejectEvent,
  };
};

/**
 * Hook to get approval statistics only
 */
export const useApprovalStatistics = () => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: {
      events: PendingEvent[];
      meta: any;
      statistics: ApprovalStatistics;
    };
  }>("/api/admin/events/approval?includeStats=true", fetcher);

  return {
    statistics: data?.data?.statistics || null,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to get event details for admin review
 */
export const useEventForReview = (eventId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any;
  }>(eventId ? `/api/admin/events/${eventId}` : null, fetcher);

  return {
    event: data?.data || null,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook for batch operations on events
 */
export const useBatchEventApproval = () => {
  const batchApprove = async (eventIds: string[], notes?: string) => {
    // Since we don't have a batch endpoint yet, we'll do sequential calls
    const results = await Promise.allSettled(
      eventIds.map(eventId => 
        postData(`/api/admin/events/${eventId}/approval`, {
          action: "approve",
          notes,
        })
      )
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message || "Unknown error");

    return {
      successful,
      failed,
      totalProcessed: eventIds.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  };

  const batchReject = async (eventIds: string[], notes: string) => {
    if (!notes?.trim()) {
      throw new Error("Notes are required for batch rejection");
    }

    // Since we don't have a batch endpoint yet, we'll do sequential calls
    const results = await Promise.allSettled(
      eventIds.map(eventId => 
        postData(`/api/admin/events/${eventId}/approval`, {
          action: "reject",
          notes,
        })
      )
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message || "Unknown error");

    return {
      successful,
      failed,
      totalProcessed: eventIds.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  };

  return {
    batchApprove,
    batchReject,
  };
};
