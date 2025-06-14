"use client";

import React from "react";
import useSWR from "swr";
import { ADMIN_ENDPOINTS } from "../endpoints";
import { fetcher, postData, putData, deleteData } from "../client";

// Types for dashboard data
export interface AdminDashboardData {
  stats: {
    totalEvents: number;
    totalOrganizers: number;
    totalUsers: number;
    totalSales: number;
    pendingEvents: number;
    verifiedOrganizers: number;
    pendingOrganizers: number;
    organizerVerificationRate: number;
  };
  recentEvents: any[];
  recentOrganizers: any[];
  recentUsers: any[];
  salesOverview: any[];
  pendingEvents: any[];
  pendingOrganizers: any[];
}

export interface AdminOrganizerDashboardData {
  stats: {
    totalOrganizers: number;
    verifiedOrganizers: number;
    pendingOrganizers: number;
    verificationRate: number;
    avgEventsPerOrganizer: number;
    topOrganizer: {
      id: string;
      name: string;
      eventCount: number;
    } | null;
  };
  recentOrganizers: any[];
  pendingOrganizers: any[];
}

export interface AdminEventDashboardData {
  stats: {
    totalEvents: number;
    pendingEvents: number;
    publishedEvents: number;
    rejectedEvents: number;
    approvalRate: number;
  };
  recentEvents: any[];
  pendingEvents: any[];
}

// Hook to fetch admin dashboard data
export const useAdminDashboard = (limit: number = 5) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: AdminDashboardData;
  }>(`${ADMIN_ENDPOINTS.DASHBOARD}?limit=${limit}`, fetcher);

  return {
    dashboardData: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch admin organizer dashboard data
export const useAdminOrganizerDashboard = (limit: number = 5) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: AdminOrganizerDashboardData;
  }>(`${ADMIN_ENDPOINTS.DASHBOARD_ORGANIZERS}?limit=${limit}`, fetcher);

  return {
    organizerData: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch admin event dashboard data
export const useAdminEventDashboard = (limit: number = 5) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: AdminEventDashboardData;
  }>(`${ADMIN_ENDPOINTS.DASHBOARD_EVENTS}?limit=${limit}`, fetcher);

  return {
    eventData: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch all admin events
export const useAdminEvents = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  featured?: boolean;
}) => {
  // Build query string
  let url = ADMIN_ENDPOINTS.EVENTS;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.featured !== undefined)
      queryParams.append("featured", params.featured.toString());

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  console.log("useAdminEvents URL:", url);

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url, fetcher);

  return {
    events: data?.data,
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch pending events
export const useAdminPendingEvents = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  // Build query string
  let url = ADMIN_ENDPOINTS.PENDING_EVENTS;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url, fetcher);

  return {
    pendingEvents: data?.data,
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch a specific admin event by ID
export const useAdminEventDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any;
  }>(id ? ADMIN_ENDPOINTS.EVENT_DETAIL(id) : null, fetcher);

  return {
    event: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to update event status (approve/reject)
export const useUpdateEventStatus = () => {
  const updateStatus = async (id: string, status: string, notes?: string) => {
    return await putData(ADMIN_ENDPOINTS.EVENT_STATUS(id), { status, notes });
  };

  return { updateStatus };
};

// Hook to set event as featured
export const useSetEventFeatured = () => {
  const setFeatured = async (id: string, featured: boolean) => {
    return await putData(ADMIN_ENDPOINTS.EVENT_FEATURED(id), { featured });
  };

  return { setFeatured };
};

// Hook to fetch all admin organizers
export const useAdminOrganizers = (params?: {
  page?: number;
  limit?: number;
  verified?: boolean;
  search?: string;
}) => {
  // Build query string
  let url = ADMIN_ENDPOINTS.ORGANIZERS;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.verified !== undefined)
      queryParams.append("verified", params.verified.toString());
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url, fetcher);

  return {
    organizers: data?.data,
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch a specific admin organizer by ID
export const useAdminOrganizerDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any;
  }>(id ? ADMIN_ENDPOINTS.ORGANIZER_DETAIL(id) : null, fetcher);

  return {
    organizer: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to verify organizer
export const useVerifyOrganizer = () => {
  const verifyOrganizer = async (
    id: string,
    verified: boolean,
    notes?: string,
  ) => {
    return await putData(ADMIN_ENDPOINTS.ORGANIZER_VERIFY(id), {
      verified,
      notes,
    });
  };

  return { verifyOrganizer };
};

// Hook to fetch organizer verification history
export const useOrganizerVerificationHistory = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any[];
  }>(
    id ? `${ADMIN_ENDPOINTS.ORGANIZER_DETAIL(id)}/verification-history` : null,
    fetcher,
  );

  return {
    verificationHistory: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch organizer statistics
export const useOrganizerStats = () => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any;
  }>(ADMIN_ENDPOINTS.ORGANIZER_STATS, fetcher);

  return {
    stats: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch all admin users
export const useAdminUsers = (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) => {
  // Build query string
  let url = ADMIN_ENDPOINTS.USERS;
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.role) queryParams.append("role", params.role);
    if (params.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(url, fetcher);

  return {
    users: data?.data,
    meta: data?.meta,
    error,
    isLoading,
    mutate,
  };
};

// Hook to fetch a specific admin user by ID
export const useAdminUserDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: any;
  }>(id ? ADMIN_ENDPOINTS.USER_DETAIL(id) : null, fetcher);

  return {
    user: data?.data,
    error,
    isLoading,
    mutate,
  };
};

// Alias for useAdminUsers to match the component usage
export const useUsers = useAdminUsers;

// Hook to update user role
export const useUpdateUserRole = () => {
  const updateUserRole = async (userId: string, role: string) => {
    return await putData(ADMIN_ENDPOINTS.USER_DETAIL(userId), { role });
  };

  return { updateUserRole };
};
