"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UseOrganizerIdResult {
  organizerId: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to get the current user's organizer ID
 * This hook fetches the organizer profile and returns the organizer ID
 */
export function useOrganizerId(): UseOrganizerIdResult {
  const { data: session, status } = useSession();
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizerId = async () => {
    if (status === "loading" || !session?.user?.id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/organizer/profile');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        } else if (response.status === 403) {
          throw new Error("Access denied");
        } else {
          throw new Error("Failed to fetch organizer profile");
        }
      }

      const data = await response.json();
      
      if (data.success && data.data?.id) {
        setOrganizerId(data.data.id);
      } else {
        throw new Error("No organizer profile found");
      }
    } catch (err: any) {
      console.error("Error fetching organizer ID:", err);
      setError(err.message);
      setOrganizerId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerId();
  }, [session?.user?.id, status]);

  return {
    organizerId,
    isLoading,
    error,
    refetch: fetchOrganizerId,
  };
}

/**
 * Hook to validate that the current URL organizer ID matches the user's organizer ID
 * This is useful for components that receive organizer ID from URL params
 */
export function useValidateOrganizerAccess(urlOrganizerId: string) {
  const { organizerId: userOrganizerId, isLoading, error } = useOrganizerId();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !userOrganizerId || !urlOrganizerId) {
      setIsValid(null);
      setValidationError(null);
      return;
    }

    if (userOrganizerId === urlOrganizerId) {
      setIsValid(true);
      setValidationError(null);
    } else {
      setIsValid(false);
      setValidationError(
        `Access denied: You don't have permission to access organizer ${urlOrganizerId}`
      );
    }
  }, [userOrganizerId, urlOrganizerId, isLoading]);

  return {
    isValid,
    isLoading,
    error: error || validationError,
    userOrganizerId,
  };
}
