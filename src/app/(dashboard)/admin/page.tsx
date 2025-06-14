"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminRoute } from "~/components/auth/admin-route";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the simplified admin approval dashboard
    router.replace("/admin/approval");
  }, [router]);

  // Show loading state while redirecting
  return (
    <AdminRoute>
      <RedirectLoading message="Redirecting to admin approval dashboard..." />
    </AdminRoute>
  );
}
