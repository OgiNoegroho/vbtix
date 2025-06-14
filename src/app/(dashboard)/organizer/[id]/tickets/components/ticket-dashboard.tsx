"use client";

import { useState, useEffect } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useOrganizerTicketStats } from "~/lib/api/hooks/organizer-tickets";
import { formatPrice } from "~/lib/utils";
import {
  TicketIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  ClockIcon,
  DollarSignIcon,
  BarChart3Icon,
  ActivityIcon,
  AlertCircleIcon,
} from "lucide-react";

interface TicketDashboardProps {
  organizerId: string;
}

export function TicketDashboard({ organizerId }: TicketDashboardProps) {
  const { data: stats, isLoading, error, refetch } = useOrganizerTicketStats(organizerId);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <MagicCard key={index} className="border-0 bg-background/50 backdrop-blur-sm">
            <div className="p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </MagicCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <AlertCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      </MagicCard>
    );
  }

  if (!stats) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            No ticket data found for this organizer.
          </p>
        </div>
      </MagicCard>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      description: "Total earnings from ticket sales",
      icon: DollarSignIcon,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      trend: "+12.5%",
    },
    {
      title: "Tickets Sold",
      value: stats.totalSold.toLocaleString(),
      description: "Total tickets sold across all events",
      icon: TicketIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      trend: "+8.2%",
    },
    {
      title: "Today's Check-ins",
      value: stats.todayCheckIns.toLocaleString(),
      description: "Tickets checked in today",
      icon: CheckCircleIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      trend: "Today",
    },
    {
      title: "Total Check-ins",
      value: stats.totalCheckIns.toLocaleString(),
      description: "All-time check-ins",
      icon: UsersIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      trend: `${((stats.totalCheckIns / stats.totalSold) * 100).toFixed(1)}%`,
    },
    {
      title: "Active Tickets",
      value: stats.activeTickets.toLocaleString(),
      description: "Valid and unused tickets",
      icon: ActivityIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      trend: "Active",
    },
    {
      title: "Cancelled Tickets",
      value: stats.cancelledTickets.toLocaleString(),
      description: "Cancelled ticket count",
      icon: XCircleIcon,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      trend: `${((stats.cancelledTickets / stats.totalSold) * 100).toFixed(1)}%`,
    },
    {
      title: "Refunded Tickets",
      value: stats.refundedTickets.toLocaleString(),
      description: "Refunded ticket count",
      icon: RefreshCwIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      trend: `${((stats.refundedTickets / stats.totalSold) * 100).toFixed(1)}%`,
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toLocaleString(),
      description: "Events scheduled ahead",
      icon: CalendarIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      trend: "Scheduled",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <MagicCard
            key={index}
            className="border-0 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-300"
            gradientColor="rgba(59, 130, 246, 0.1)"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {card.trend}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>

      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5" />
              Ticket Status Overview
            </CardTitle>
            <CardDescription>
              Current status distribution of all tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Tickets</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {stats.activeTickets}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Used Tickets</span>
                <Badge variant="secondary">
                  {stats.usedTickets}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cancelled Tickets</span>
                <Badge variant="destructive">
                  {stats.cancelledTickets}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expired Tickets</span>
                <Badge variant="outline">
                  {stats.expiredTickets}
                </Badge>
              </div>
            </div>
          </CardContent>
        </MagicCard>

        <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators for your events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check-in Rate</span>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  {((stats.totalCheckIns / stats.totalSold) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cancellation Rate</span>
                <Badge variant="secondary">
                  {((stats.cancelledTickets / stats.totalSold) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Refund Rate</span>
                <Badge variant="outline">
                  {((stats.refundedTickets / stats.totalSold) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Revenue</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {formatPrice(stats.totalRevenue / Math.max(stats.totalSold, 1))}
                </Badge>
              </div>
            </div>
          </CardContent>
        </MagicCard>
      </div>
    </div>
  );
}
