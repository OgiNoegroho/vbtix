"use client";

import * as React from "react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "~/lib/hooks/use-mobile";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { ChartConfig } from "~/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

// Sample chart data - replace with actual data from API
const chartData = [
  { date: "2024-04-01", tickets: 222, revenue: 15000000 },
  { date: "2024-04-02", tickets: 97, revenue: 8000000 },
  { date: "2024-04-03", tickets: 167, revenue: 12000000 },
  { date: "2024-04-04", tickets: 242, revenue: 18000000 },
  { date: "2024-04-05", tickets: 373, revenue: 25000000 },
  { date: "2024-04-06", tickets: 301, revenue: 20000000 },
  { date: "2024-04-07", tickets: 217, revenue: 16000000 },
  { date: "2024-04-08", tickets: 146, revenue: 10000000 },
  { date: "2024-04-09", tickets: 189, revenue: 14000000 },
  { date: "2024-04-10", tickets: 251, revenue: 19000000 },
  { date: "2024-04-11", tickets: 322, revenue: 22000000 },
  { date: "2024-04-12", tickets: 298, revenue: 21000000 },
  { date: "2024-04-13", tickets: 275, revenue: 20000000 },
  { date: "2024-04-14", tickets: 201, revenue: 15000000 },
];

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("tickets");
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    // For demo purposes, we're just returning all data
    // In a real app, you would filter based on the date
    return chartData;
  }, [timeRange]);

  // Configure chart based on selected type
  const chartConfig: ChartConfig = {
    tickets: {
      color: "indigo",
      label: "Tickets",
    },
    revenue: {
      color: "emerald",
      label: "Revenue",
    },
  };
  return (
    <MagicCard 
      className="border-0 bg-background/50 backdrop-blur-sm shadow-xl"
      gradientColor="rgba(34, 197, 94, 0.1)"
    >
      <CardHeader className="relative pb-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Ringkasan Penjualan
          </CardTitle>
          <CardDescription className="text-base">
            <span className="hidden @[540px]/card:block">
              {timeRange === "7d"
                ? "7 hari terakhir"
                : timeRange === "30d"
                  ? "30 hari terakhir"
                  : "3 bulan terakhir"}
            </span>
            <span className="@[540px]/card:hidden">
              {timeRange === "7d" ? "7h" : timeRange === "30d" ? "30h" : "3bl"}
            </span>
          </CardDescription>
        </div>
        <div className="absolute top-4 right-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-4">
            <ToggleGroup
              type="single"
              size="sm"
              value={chartType}
              onValueChange={setChartType}
              variant="outline"
            >
              <ToggleGroupItem value="tickets">Tickets</ToggleGroupItem>
              <ToggleGroupItem value="revenue">Revenue</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <div className="h-[240px]">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-tickets)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-tickets)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              {chartType === "tickets" ? (
                <Area
                  dataKey="tickets"
                  type="natural"
                  fill="url(#fillTickets)"
                  stroke="var(--color-tickets)"
                />
              ) : (
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"                />
              )}
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </MagicCard>
  );
}
