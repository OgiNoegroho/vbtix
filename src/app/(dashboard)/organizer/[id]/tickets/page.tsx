"use client";

import { useState, useEffect, useCallback } from "react";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { TicketDashboard } from "./components/ticket-dashboard";
import { TicketList } from "./components/ticket-list";
import { TicketFilters } from "./components/ticket-filters";
import { RecentTicketsQR } from "./components/recent-tickets-qr";
import { QRCodeScanner } from "~/components/ui/qr-code-scanner";
import { MagicCard } from "~/components/ui/magic-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  TicketIcon,
  BarChart3Icon,
  ListIcon,
  ScanIcon,
  CalendarIcon
} from "lucide-react";

export default function OrganizerTicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [organizerId, setOrganizerId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    params.then((resolvedParams) => {
      setOrganizerId(resolvedParams.id);
    });
  }, [params]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  if (!organizerId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <OrganizerRoute>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="px-4 lg:px-6">
          <MagicCard
            className="border-0 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 backdrop-blur-sm"
            gradientColor="rgba(59, 130, 246, 0.15)"
          >
            <div className="p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
                  <TicketIcon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent mb-3">
                    Ticket Management
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                    Comprehensive ticket management system for your events. Monitor sales, validate tickets, and manage attendees.
                  </p>
                </div>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Tickets</span>
              </TabsTrigger>
              <TabsTrigger value="checkin" className="flex items-center gap-2">
                <ScanIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Check-in</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <TicketDashboard organizerId={organizerId} />
              <div className="grid gap-6 lg:grid-cols-2">
                <RecentTicketsQR organizerId={organizerId} />
                <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
                  <div className="p-8 text-center">
                    <ScanIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
                    <p className="text-muted-foreground mb-4">
                      Access frequently used ticket management features.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setActiveTab("checkin")}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Scan QR Code
                      </button>
                      <button
                        onClick={() => setActiveTab("tickets")}
                        className="px-4 py-2 border border-input rounded-md hover:bg-accent"
                      >
                        View All Tickets
                      </button>
                    </div>
                  </div>
                </MagicCard>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="space-y-6">
              <TicketFilters organizerId={organizerId} onFiltersChange={handleFiltersChange} />
              <TicketList organizerId={organizerId} filters={filters} />
            </TabsContent>

            <TabsContent value="checkin" className="space-y-6">
              <QRCodeScanner
                organizerId={organizerId}
                onScanSuccess={(result) => {
                  console.log("Scan successful:", result);
                  // You can add additional success handling here
                }}
                onScanError={(error) => {
                  console.error("Scan error:", error);
                  // You can add additional error handling here
                }}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
                <div className="p-8 text-center">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features coming soon.
                  </p>
                </div>
              </MagicCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OrganizerRoute>
  );
}
