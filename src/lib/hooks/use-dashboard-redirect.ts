"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export interface RedirectConfig {
  /** Target path to redirect to */
  targetPath: string;
  /** Whether to replace the current history entry (default: true) */
  replace?: boolean;
  /** Whether to check authentication before redirecting (default: false) */
  requireAuth?: boolean;
  /** Fallback path if authentication check fails */
  fallbackPath?: string;
}

/**
 * Custom hook for handling dashboard redirects in a clean and consistent way
 * 
 * @param config - Redirect configuration
 * @returns Object with redirect status and session data
 */
export function useDashboardRedirect(config: RedirectConfig) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    targetPath,
    replace = true,
    requireAuth = false,
    fallbackPath = "/login"
  } = config;

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    // Don't redirect while session is still loading
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const redirectMethod = replace ? router.replace : router.push;
      redirectMethod(fallbackPath);
      return;
    }

    // If authentication is not required OR user is authenticated, proceed with redirect
    if (!requireAuth || isAuthenticated) {
      const redirectMethod = replace ? router.replace : router.push;
      redirectMethod(targetPath);
    }
  }, [
    targetPath,
    replace,
    requireAuth,
    fallbackPath,
    isLoading,
    isAuthenticated,
    router
  ]);

  return {
    isLoading,
    isAuthenticated,
    session,
    isRedirecting: !isLoading
  };
}

/**
 * Hook for admin dashboard redirect
 */
export function useAdminDashboardRedirect() {
  return useDashboardRedirect({
    targetPath: "/admin/dashboard",
    replace: true,
    requireAuth: false // AdminRoute component handles auth
  });
}

/**
 * Hook for organizer dashboard redirect with dynamic ID
 */
export function useOrganizerDashboardRedirect(organizerId: string) {
  return useDashboardRedirect({
    targetPath: `/organizer/${organizerId}/dashboard`,
    replace: true,
    requireAuth: false
  });
}

/**
 * Hook for organizer redirect with session-based ID resolution
 * This hook fetches the actual organizer ID and redirects to the correct URL
 */
export function useOrganizerRedirectWithSession() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [isLoadingOrganizer, setIsLoadingOrganizer] = useState(false);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Fetch organizer ID when session is available
  useEffect(() => {
    const fetchOrganizerId = async () => {
      if (!isAuthenticated || !session?.user?.id || isLoadingOrganizer) return;

      try {
        setIsLoadingOrganizer(true);

        // Fetch organizer data to get the actual organizer ID
        const response = await fetch('/api/organizer/profile');

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.id) {
            setOrganizerId(data.data.id);
          } else {
            console.error('No organizer profile found');
            router.replace('/login');
          }
        } else {
          console.error('Failed to fetch organizer profile');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error fetching organizer profile:', error);
        router.replace('/login');
      } finally {
        setIsLoadingOrganizer(false);
      }
    };

    fetchOrganizerId();
  }, [isAuthenticated, session?.user?.id, router, isLoadingOrganizer]);

  // Redirect when organizer ID is available
  useEffect(() => {
    if (!isLoading && !isLoadingOrganizer) {
      if (isAuthenticated && organizerId) {
        // Redirect to the correct organizer dashboard with actual organizer ID
        router.replace(`/organizer/${organizerId}/dashboard`);
      } else if (!isAuthenticated) {
        // If not logged in, redirect to login
        router.replace("/login");
      }
    }
  }, [isLoading, isLoadingOrganizer, isAuthenticated, organizerId, router]);

  return {
    isLoading: isLoading || isLoadingOrganizer,
    isAuthenticated,
    session,
    organizerId,
    isRedirecting: !isLoading && !isLoadingOrganizer
  };
}
