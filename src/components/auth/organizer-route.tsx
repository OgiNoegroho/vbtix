"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { useEffect } from "react";

import { LoadingScreen } from "~/components/ui/loading-screen";
import { useValidateOrganizerAccess } from "~/lib/hooks/use-organizer-id";

export function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Extract organizer ID from URL path
  const getOrganizerIdFromPath = () => {
    if (pathname.startsWith("/organizer/")) {
      const pathParts = pathname.split("/");
      return pathParts[2]; // /organizer/[id]/...
    }
    return null;
  };

  const urlOrganizerId = getOrganizerIdFromPath();

  // Validate organizer access only if we have an organizer ID in the URL
  const {
    isValid,
    isLoading: isValidatingAccess,
    error: accessError
  } = useValidateOrganizerAccess(urlOrganizerId || "");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Check if user is an organizer or admin
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      router.push("/");
      return;
    }

    // For organizer users (not admins), validate access to the specific organizer ID
    if (
      session.user.role === UserRole.ORGANIZER &&
      urlOrganizerId &&
      isValid === false &&
      !isValidatingAccess
    ) {
      console.error("Access denied to organizer ID:", urlOrganizerId);
      router.push("/organizer"); // Redirect to organizer root to get correct ID
      return;
    }
  }, [session, status, router, urlOrganizerId, isValid, isValidatingAccess]);

  if (status === "loading" || isValidatingAccess) {
    return <LoadingScreen />;
  }

  if (!session) {
    return null;
  }

  if (
    session.user.role !== UserRole.ORGANIZER &&
    session.user.role !== UserRole.ADMIN
  ) {
    return null;
  }

  // For organizer users, check access validation
  if (
    session.user.role === UserRole.ORGANIZER &&
    urlOrganizerId &&
    isValid === false
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">
            {accessError || "You don't have permission to access this organizer account."}
          </p>
          <button
            onClick={() => router.push("/organizer")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
