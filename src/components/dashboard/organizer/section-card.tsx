"use client";

import {
  TrendingUpIcon,
  Calendar,
  Ticket,
  DollarSign,
  Users,
  SparklesIcon,
  ArrowUpIcon,
} from "lucide-react";
import { useParams } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useOrganizerDashboard } from "~/lib/api/hooks/organizer";
import { formatPrice } from "~/lib/utils";

export function SectionCards() {
  const params = useParams();
  const organizerId = params.id as string;
  const { data, isLoading, error } = useOrganizerDashboard(organizerId);

  // Show error message if there's an error
  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  // Default values if data is loading or there's an error - using nullish coalescing
  const totalEvents = data?.data?.stats?.totalEvents ?? 5;
  const totalTicketsSold = data?.data?.stats?.totalTicketsSold ?? 127;
  const totalRevenue = data?.data?.stats?.totalRevenue ?? 2450000;
  const upcomingEventsCount = data?.data?.stats?.upcomingEventsCount ?? 3;

  return (
    <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Events Card */}
      <MagicCard 
        className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        gradientColor="rgba(34, 197, 94, 0.1)"
      >
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-green-500" />
                Total Events
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  totalEvents.toLocaleString()
                )}
              </CardTitle>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-3 shadow-lg">
              <Calendar className="text-white size-6" />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex items-center gap-2">
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">+2</span>
            <span className="text-muted-foreground">bulan ini</span>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
            <TrendingUpIcon className="mr-1 size-3" />
            Active
          </Badge>
        </CardFooter>
      </MagicCard>

      {/* Tickets Sold Card */}
      <MagicCard 
        className="border-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        gradientColor="rgba(59, 130, 246, 0.1)"
      >
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-blue-500" />
                Tickets Sold
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {isLoading ? (
                  <div className="h-8 w-20 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  totalTicketsSold.toLocaleString()
                )}
              </CardTitle>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-3 shadow-lg">
              <Ticket className="text-white size-6" />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex items-center gap-2">            <ArrowUpIcon className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-600">+23</span>
            <span className="text-muted-foreground">minggu ini</span>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
            <TrendingUpIcon className="mr-1 size-3" />
            Selling
          </Badge>
        </CardFooter>
      </MagicCard>

      {/* Total Revenue Card */}
      <MagicCard 
        className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        gradientColor="rgba(147, 51, 234, 0.1)"
      >
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-orange-500" />
                Total Revenue
              </CardDescription>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {isLoading ? (
                  <div className="h-8 w-28 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  formatPrice(totalRevenue)
                )}
              </CardTitle>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 p-3 shadow-lg">
              <DollarSign className="text-white size-6" />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex items-center gap-2">            <ArrowUpIcon className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-600">+18.2%</span>
            <span className="text-muted-foreground">dari bulan lalu</span>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
            <TrendingUpIcon className="mr-1 size-3" />
            Increasing
          </Badge>
        </CardFooter>
      </MagicCard>

      {/* Upcoming Events Card */}
      <MagicCard 
        className="border-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        gradientColor="rgba(249, 115, 22, 0.1)"
      >
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-orange-500" />
                Upcoming Events
              </CardDescription>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  upcomingEventsCount.toLocaleString()
                )}
              </CardTitle>
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 p-3 shadow-lg">
              <Users className="text-white size-6" />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm pt-0">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-600">2</span>
            <span className="text-muted-foreground">minggu ke depan</span>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
            <TrendingUpIcon className="mr-1 size-3" />
            Scheduled
          </Badge>
        </CardFooter>
      </MagicCard>
    </div>
  );
}
