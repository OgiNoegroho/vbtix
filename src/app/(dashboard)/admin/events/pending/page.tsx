"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { AdminRoute } from "~/components/auth/admin-route";
import { useAdminPendingEvents, useUpdateEventStatus } from "~/lib/api/hooks/admin";
import { EventApprovalCard } from "~/components/dashboard/admin/event-approval-card";
import { toast } from "sonner";

export default function PendingEventsPage() {
  const { pendingEvents, error, isLoading, mutate } = useAdminPendingEvents();
  const { updateStatus } = useUpdateEventStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);



  const handleApprove = async (eventId: string, feedback?: string) => {
    try {
      await updateStatus(eventId, "PUBLISHED", feedback);
      
      toast.success("Event disetujui", {
        description: "Event telah berhasil dipublikasikan.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      mutate();
    } catch (error) {
      console.error("Error approving event:", error);
      toast.error("Gagal menyetujui event", {
        description: "Terjadi kesalahan saat menyetujui event. Silakan coba lagi.",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const handleReject = async (eventId: string, feedback?: string) => {
    try {
      await updateStatus(eventId, "REJECTED", feedback);
      
      toast.success("Event ditolak", {
        description: "Event telah ditolak dan organizer akan diberitahu.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Refresh data
      mutate();
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast.error("Gagal menolak event", {
        description: "Terjadi kesalahan saat menolak event. Silakan coba lagi.",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat event yang menunggu review...</span>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Pending Review</h1>
            <p className="text-muted-foreground">
              Kelola event yang menunggu persetujuan dari organizer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {pendingEvents?.length || 0} event menunggu
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Terjadi kesalahan saat memuat data: {error.message}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-2"
              >
                Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
                <h3 className="mb-2 text-lg font-semibold">
                  Memuat data...
                </h3>
                <p className="text-muted-foreground">
                  Sedang mengambil data event pending.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !pendingEvents || pendingEvents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold">
                  Tidak ada event menunggu
                </h3>
                <p className="text-muted-foreground">
                  Semua event telah diproses atau belum ada pengajuan baru.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingEvents.map((event) => (
              <EventApprovalCard
                key={event.id}
                event={event}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
