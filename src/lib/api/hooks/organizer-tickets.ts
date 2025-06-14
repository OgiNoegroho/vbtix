import { useState, useEffect } from "react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";

// Types
interface TicketStats {
  totalSold: number;
  totalRevenue: number;
  todayCheckIns: number;
  totalCheckIns: number;
  activeTickets: number;
  cancelledTickets: number;
  refundedTickets: number;
  usedTickets: number;
  expiredTickets: number;
  upcomingEvents: number;
}

interface SoldTicket {
  id: string;
  qrCode: string;
  status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
  checkedIn: boolean;
  checkInTime?: string;
  createdAt: string;
  attendee: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  ticketType: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  event: {
    id: string;
    title: string;
    startDate: string;
    venue: string;
  };
  transaction: {
    id: string;
    invoiceNumber: string;
    paymentMethod: string;
  };
}

interface SoldTicketsResponse {
  success: boolean;
  data: SoldTicket[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  status?: string;
  checkInStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Hook to get ticket statistics for an organizer
 */
export function useOrganizerTicketStats(organizerId: string) {
  const [data, setData] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/organizer/${organizerId}/sold-tickets/stats`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch ticket statistics");
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizerId) {
      fetchStats();
    }
  }, [organizerId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook to get sold tickets for an organizer with filtering
 */
export function useOrganizerSoldTickets(organizerId: string, filters: FilterParams = {}) {
  const [data, setData] = useState<SoldTicketsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `/api/organizer/${organizerId}/sold-tickets?${params.toString()}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch sold tickets");
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizerId) {
      fetchTickets();
    }
  }, [organizerId, JSON.stringify(filters)]);

  return {
    data: data,
    isLoading,
    error,
    refetch: fetchTickets,
  };
}

/**
 * Hook to get detailed information about a specific ticket
 */
export function useOrganizerTicketDetail(organizerId: string, ticketId: string) {
  const [data, setData] = useState<SoldTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/organizer/${organizerId}/sold-tickets/${ticketId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch ticket detail");
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizerId && ticketId) {
      fetchTicketDetail();
    }
  }, [organizerId, ticketId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTicketDetail,
  };
}

/**
 * Hook to check in/out tickets
 */
export function useTicketCheckIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInTicket = async (
    organizerId: string,
    ticketId: string,
    checkIn: boolean = true,
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/organizer/${organizerId}/sold-tickets/${ticketId}/check-in`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkIn,
            notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to check in ticket");
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkInTicket,
    isLoading,
    error,
  };
}

/**
 * Hook to export ticket data
 */
export function useTicketExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportTickets = async (
    organizerId: string,
    filters: FilterParams = {},
    format: "csv" | "excel" = "csv"
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
      params.append("format", format);

      const response = await fetch(
        `/api/organizer/${organizerId}/sold-tickets/export?${params.toString()}`
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to export tickets");
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportTickets,
    isLoading,
    error,
  };
}
