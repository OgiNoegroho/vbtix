"use client";

import { useState, useEffect } from "react";

interface SidebarStats {
  pendingEventsCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useAdminSidebarStats(): SidebarStats {
  const [stats, setStats] = useState<SidebarStats>({
    pendingEventsCount: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/events/approval?includeStats=true&limit=1");
        
        if (!response.ok) {
          throw new Error("Failed to fetch sidebar stats");
        }

        const data = await response.json();

        if (data.success) {
          setStats({
            pendingEventsCount: data.statistics?.totalPending || 0,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error(data.error || "Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching sidebar stats:", error);
        setStats({
          pendingEventsCount: 0,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
