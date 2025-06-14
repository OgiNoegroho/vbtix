/**
 * Debug utilities for organizer ID issues
 * Helps diagnose and resolve organizer ID mismatch problems
 */

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export interface OrganizerDebugInfo {
  sessionUserId: string | null;
  sessionUserRole: string | null;
  urlOrganizerId: string | null;
  currentPath: string;
  expectedOrganizerIdFromSession: string | null;
  isIdMismatch: boolean;
  recommendations: string[];
}

/**
 * Hook to get comprehensive debug information about organizer ID issues
 */
export function useOrganizerDebugInfo(): OrganizerDebugInfo {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Extract organizer ID from URL
  const getOrganizerIdFromPath = () => {
    if (pathname.startsWith("/organizer/")) {
      const pathParts = pathname.split("/");
      return pathParts[2] || null;
    }
    return null;
  };

  const urlOrganizerId = getOrganizerIdFromPath();
  const sessionUserId = session?.user?.id || null;
  const sessionUserRole = session?.user?.role || null;

  // For now, we assume the expected organizer ID should be fetched from API
  // In a real scenario, this would be the actual organizer ID from the database
  const expectedOrganizerIdFromSession = null; // This would be fetched from API

  // Check for ID mismatch
  const isIdMismatch = Boolean(
    sessionUserId &&
    urlOrganizerId &&
    sessionUserId === urlOrganizerId // This is the problem - user ID should not equal organizer ID
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (isIdMismatch) {
    recommendations.push(
      "The URL contains a user ID instead of an organizer ID. The URL should contain the organizer's database ID, not the user's ID."
    );
  }

  if (sessionUserId && urlOrganizerId && sessionUserId !== urlOrganizerId) {
    recommendations.push(
      "The URL organizer ID doesn't match the session user ID. This is expected - they should be different values."
    );
  }

  if (!urlOrganizerId && pathname.startsWith("/organizer/")) {
    recommendations.push(
      "No organizer ID found in URL. Make sure the URL follows the pattern /organizer/[organizerId]/..."
    );
  }

  if (sessionUserRole !== "ORGANIZER" && sessionUserRole !== "ADMIN") {
    recommendations.push(
      "User doesn't have organizer or admin role. Check user permissions."
    );
  }

  return {
    sessionUserId,
    sessionUserRole,
    urlOrganizerId,
    currentPath: pathname,
    expectedOrganizerIdFromSession,
    isIdMismatch,
    recommendations,
  };
}

/**
 * Console debug function to log organizer ID information
 */
export function debugOrganizerIds() {
  // This function can be called from browser console for debugging
  console.group("🔍 Organizer ID Debug Information");
  
  const currentPath = window.location.pathname;
  console.log("Current Path:", currentPath);
  
  // Extract organizer ID from URL
  if (currentPath.startsWith("/organizer/")) {
    const pathParts = currentPath.split("/");
    const urlOrganizerId = pathParts[2];
    console.log("URL Organizer ID:", urlOrganizerId);
    
    // Check if it looks like a user ID (if it matches session user ID)
    console.log("URL Organizer ID Length:", urlOrganizerId?.length);
    console.log("URL Organizer ID Format:", /^[a-f0-9-]{36}$/.test(urlOrganizerId || "") ? "UUID" : "Other");
  }
  
  // Try to get session info from localStorage or other sources
  console.log("Local Storage Keys:", Object.keys(localStorage));
  
  console.groupEnd();
}

/**
 * Utility to generate the correct organizer dashboard URL
 */
export async function getCorrectOrganizerDashboardUrl(): Promise<string> {
  try {
    const response = await fetch('/api/organizer/profile');
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.id) {
        return `/organizer/${data.data.id}/dashboard`;
      }
    }
    
    throw new Error("Failed to get organizer profile");
  } catch (error) {
    console.error("Error getting correct organizer URL:", error);
    throw error;
  }
}

/**
 * Component to display debug information (for development)
 */
export function OrganizerDebugPanel() {
  const debugInfo = useOrganizerDebugInfo();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h4 className="font-bold mb-2">🔍 Organizer Debug Info</h4>
      <div className="space-y-1">
        <div>Session User ID: {debugInfo.sessionUserId || "None"}</div>
        <div>Session Role: {debugInfo.sessionUserRole || "None"}</div>
        <div>URL Organizer ID: {debugInfo.urlOrganizerId || "None"}</div>
        <div>Path: {debugInfo.currentPath}</div>
        {debugInfo.isIdMismatch && (
          <div className="text-red-400 font-bold">⚠️ ID Mismatch Detected!</div>
        )}
        {debugInfo.recommendations.length > 0 && (
          <div className="mt-2">
            <div className="font-bold">Recommendations:</div>
            {debugInfo.recommendations.map((rec, index) => (
              <div key={index} className="text-yellow-300 text-xs">
                • {rec}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Export for browser console access
if (typeof window !== "undefined") {
  (window as any).debugOrganizerIds = debugOrganizerIds;
  (window as any).getCorrectOrganizerDashboardUrl = getCorrectOrganizerDashboardUrl;
}
