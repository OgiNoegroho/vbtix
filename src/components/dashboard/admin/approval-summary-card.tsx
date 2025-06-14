"use client";

import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Clock, CheckCircle2, XCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ApprovalSummaryProps {
  pendingCount: number;
  totalApproved: number;
  totalRejected: number;
  totalEvents: number;
  approvalRate: number;
  averageApprovalTime: string;
  isDataConsistent: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

// Helper function to format approval time
function formatApprovalTime(timeString: string): { display: string; tooltip: string } {
  const hours = parseInt(timeString.replace('h', ''));

  if (hours === 0) {
    return {
      display: "< 1h",
      tooltip: "Kurang dari 1 jam rata-rata waktu review"
    };
  } else if (hours < 24) {
    return {
      display: `${hours}h`,
      tooltip: `${hours} jam rata-rata waktu review`
    };
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return {
        display: `${days}d`,
        tooltip: `${days} hari rata-rata waktu review`
      };
    } else {
      return {
        display: `${days}d ${remainingHours}h`,
        tooltip: `${days} hari ${remainingHours} jam rata-rata waktu review`
      };
    }
  }
}

export function ApprovalSummaryCard({
  pendingCount,
  totalApproved,
  totalRejected,
  totalEvents,
  approvalRate,
  averageApprovalTime,
  isDataConsistent,
  isLoading = false,
  error = null,
}: ApprovalSummaryProps) {
  const formattedApprovalTime = formatApprovalTime(averageApprovalTime);

  // Error state
  if (error) {
    return (
      <MagicCard 
        className="p-6 bg-gradient-to-br from-red-50/90 to-pink-50/90 backdrop-blur-sm border-red-200/50"
        gradientColor="rgba(239, 68, 68, 0.1)"
      >
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-sm text-red-600 mb-3">
            Gagal memuat statistik approval
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Coba Lagi
          </Button>
        </div>
      </MagicCard>
    );
  }

  if (isLoading) {
    return (
      <MagicCard 
        className="p-6 bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-amber-200/50"
        gradientColor="rgba(245, 158, 11, 0.1)"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-pulse text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-800">Approval Dashboard</h3>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-amber-200 rounded w-3/4"></div>
            <div className="h-4 bg-amber-200 rounded w-1/2"></div>
            <div className="h-8 bg-amber-200 rounded w-full"></div>
          </div>
        </div>
      </MagicCard>
    );
  }

  return (
    <MagicCard 
      className="p-6 bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-amber-200/50"
      gradientColor="rgba(245, 158, 11, 0.1)"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-amber-800">Approval Dashboard</h3>
        </div>

        {/* Pending Events Alert */}
        {pendingCount > 0 && (
          <div className="rounded-lg bg-amber-100 p-3 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">
                  {pendingCount} event menunggu review
                </span>
              </div>
              <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                Urgent
              </Badge>
            </div>
          </div>
        )}

        {/* Data Consistency Warning */}
        {!isDataConsistent && (
          <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-200">
            <div className="text-center">
              <div className="text-sm font-medium text-yellow-800">
                ⚠️ Data Inconsistency Detected
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Some statistics may be temporarily inconsistent. Please refresh if needed.
              </div>
            </div>
          </div>
        )}

        {/* Overall Statistics Summary */}
        {totalEvents > 0 && (
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <div className="text-center">
              <div className="text-sm font-medium text-blue-800">
                Total Event Statistics
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {totalEvents} total events • {approvalRate}% approval rate
              </div>
            </div>
          </div>
        )}

        {/* Reliable Statistics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1 p-3 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 transition-colors">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
            <div className="text-xs text-green-600 font-medium">Disetujui</div>
            {totalApproved > 0 && (
              <div className="text-xs text-green-500">
                ✓ {Math.round((totalApproved / Math.max(totalEvents, 1)) * 100)}% dari total
              </div>
            )}
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{totalRejected}</div>
            <div className="text-xs text-red-600 font-medium">Ditolak</div>
            {totalRejected > 0 && (
              <div className="text-xs text-red-500">
                ⚠ {Math.round((totalRejected / Math.max(totalEvents, 1)) * 100)}% dari total
              </div>
            )}
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground font-medium">Rata-rata</span>
            </div>
            <div
              className="text-2xl font-bold text-blue-600 cursor-help"
              title={formattedApprovalTime.tooltip}
            >
              {formattedApprovalTime.display}
            </div>
            <div className="text-xs text-blue-600 font-medium">Waktu Review</div>
          </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 transition-colors">
          <Link href="/admin/approval">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Review Pengajuan Event
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {pendingCount === 0 && !isLoading && (
          <div className="text-center py-2">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Semua pengajuan telah diproses
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tidak ada event yang menunggu persetujuan
            </p>
          </div>
        )}
      </div>
    </MagicCard>
  );
}
