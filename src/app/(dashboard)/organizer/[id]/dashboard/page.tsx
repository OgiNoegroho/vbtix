"use client";

import { ChartAreaInteractive } from "~/components/dashboard/organizer/chart-area-interactive";
import { DataTable } from "~/components/dashboard/organizer/data-table";
import { SectionCards } from "~/components/dashboard/organizer/section-card";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { useOrganizerEvents } from "~/lib/api/hooks/organizer";
import { MagicCard } from "~/components/ui/magic-card";
import { SparklesIcon, CalendarIcon, TrendingUpIcon } from "lucide-react";

// Import the useParams hook from next/navigation
import { useParams } from "next/navigation";

export default function Page() {
  // Use the useParams hook to get the id parameter
  const params = useParams();
  const organizerId = params.id as string;

  // Fetch events data for the table
  const { data, isLoading } = useOrganizerEvents(organizerId);

  return (
    <OrganizerRoute>
      <div className="space-y-8">
        {/* Enhanced Welcome Section for Organizer */}
        <div className="px-4 lg:px-6">
          <MagicCard 
            className="border-0 bg-gradient-to-r from-green-50/50 to-teal-50/50 dark:from-green-950/20 dark:to-teal-950/20 backdrop-blur-sm"
            gradientColor="rgba(34, 197, 94, 0.15)"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 shadow-lg">
                  <CalendarIcon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-green-800 bg-clip-text text-transparent mb-3">
                    Dashboard Organizer
                  </h1>
                  <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                    Kelola event Anda dengan mudah. Monitor penjualan, peserta, dan performa event secara real-time.
                  </p>
                </div>
              </div>
              
              {/* Quick Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <SparklesIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Event Aktif</p>
                      <p className="text-lg font-bold text-green-600">{data?.data?.length || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <TrendingUpIcon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Penjualan</p>
                      <p className="text-lg font-bold text-teal-600">Rp 2.4M</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="text-lg font-bold text-blue-600">Aktif</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Section Cards */}
        <SectionCards />
        
        {/* Chart Area */}
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        
        {/* Data Table */}
        {isLoading ? (
          <div className="px-4 lg:px-6">
            <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                  <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 mx-auto"></div>
                  <p className="text-muted-foreground">Memuat data event...</p>
                </div>
              </div>
            </MagicCard>
          </div>
        ) : (
          <DataTable data={(data?.data as any) || []} />
        )}
      </div>
    </OrganizerRoute>
  );
}
