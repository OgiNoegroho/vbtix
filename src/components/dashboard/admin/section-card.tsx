"use client";

import Link from "next/link";
import { TrendingUpIcon, Users, Calendar, SparklesIcon, ArrowUpIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useAdminDashboard } from "~/lib/api/hooks";
import { formatPrice } from "~/lib/utils";

export function SectionCards() {
  const { dashboardData, isLoading, error } = useAdminDashboard();

  // Display error message if there's an error
  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  // Mock data for development
  const mockData = {
    stats: {
      totalUsers: 20,
      totalEvents: 10,
      totalSales: 2450000,
    },
  };

  // Use mock data if there's an error or no data
  const finalData = error || !dashboardData ? mockData : dashboardData;

  // Extract data with fallback to mock values
  const totalUsers = finalData.stats.totalUsers;
  const totalEvents = finalData.stats.totalEvents;
  const totalSales = finalData.stats.totalSales;

  return (
    <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 px-4 lg:px-6">
      {/* Users Card */}
      <Link href="/admin/organizers" className="block group">
        <MagicCard 
          className="cursor-pointer border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-orange-500" />
                  Total Pengguna
                </CardDescription>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {isLoading ? (
                    <div className="h-10 w-24 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    totalUsers.toLocaleString()
                  )}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg">
                <Users className="text-white size-8" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-3 text-sm pt-0">
            <div className="flex items-center gap-2">
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">+8.2%</span>
              <span className="text-muted-foreground">dari bulan lalu</span>
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              Pengguna aktif yang terdaftar di platform
            </div>
          </CardFooter>
        </MagicCard>
      </Link>

      {/* Events Card */}
      <Link href="/admin/events" className="block group">
        <MagicCard 
          className="cursor-pointer border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
          gradientColor="rgba(147, 51, 234, 0.1)"
        >
          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-purple-500" />
                  Total Event
                </CardDescription>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {isLoading ? (
                    <div className="h-10 w-24 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    totalEvents.toLocaleString()
                  )}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-4 shadow-lg">
                <Calendar className="text-white size-8" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-3 text-sm pt-0">
            <div className="flex items-center gap-2">
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">+15.3%</span>
              <span className="text-muted-foreground">dari bulan lalu</span>
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              Event aktif yang tersedia di platform
            </div>
          </CardFooter>
        </MagicCard>
      </Link>

      {/* Sales Card */}
      <MagicCard 
        className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        gradientColor="rgba(34, 197, 94, 0.1)"
      >
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-green-500" />
                Total Penjualan
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {isLoading ? (
                  <div className="h-10 w-32 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  formatPrice(totalSales)
                )}
              </CardTitle>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 shadow-lg">
                <TrendingUpIcon className="text-white size-8" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 font-semibold px-3 py-1">
                <TrendingUpIcon className="size-3 mr-1" />
                +12.5%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-3 text-sm pt-0">
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">+12.5%</span>
            <span className="text-muted-foreground">dari bulan lalu</span>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed">
            Total pendapatan dari semua event
          </div>
        </CardFooter>
      </MagicCard>
    </div>
  );
}
