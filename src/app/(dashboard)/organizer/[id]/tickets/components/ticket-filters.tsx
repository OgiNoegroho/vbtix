"use client";

import { useState, useEffect } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useOrganizerEvents } from "~/lib/api/hooks/organizer";
import { cn } from "~/lib/utils";
import {
  FilterIcon,
  CalendarIcon,
  XIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react";
import { format } from "date-fns";

interface TicketFiltersProps {
  organizerId: string;
  onFiltersChange: (filters: any) => void;
}

export function TicketFilters({ organizerId, onFiltersChange }: TicketFiltersProps) {
  const [filters, setFilters] = useState({
    status: "all",
    eventId: "all",
    checkedIn: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    search: "",
  });

  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  const { data: eventsData } = useOrganizerEvents(organizerId);
  const events = eventsData?.data || [];

  useEffect(() => {
    // Convert "all" values to empty strings for the API
    const apiFilters = {
      ...filters,
      status: filters.status === "all" ? "" : filters.status,
      eventId: filters.eventId === "all" ? "" : filters.eventId,
      checkedIn: filters.checkedIn === "all" ? "" : filters.checkedIn,
    };
    onFiltersChange(apiFilters);
  }, [filters]); // Removed onFiltersChange from dependencies to prevent infinite loop

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      eventId: "all",
      checkedIn: "all",
      dateFrom: undefined,
      dateTo: undefined,
      search: "",
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value =>
      value !== "" && value !== "all" && value !== undefined && value !== null
    ).length;
  };

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "USED", label: "Used" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "REFUNDED", label: "Refunded" },
    { value: "EXPIRED", label: "Expired" },
  ];

  const checkInOptions = [
    { value: "true", label: "Checked In" },
    { value: "false", label: "Not Checked In" },
  ];

  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={getActiveFiltersCount() === 0}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Ticket ID, buyer name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event */}
          <div className="space-y-2">
            <Label>Event</Label>
            <Select
              value={filters.eventId}
              onValueChange={(value) => handleFilterChange("eventId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {events.map((event: any) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Check-in Status */}
          <div className="space-y-2">
            <Label>Check-in Status</Label>
            <Select
              value={filters.checkedIn}
              onValueChange={(value) => handleFilterChange("checkedIn", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All tickets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tickets</SelectItem>
                {checkInOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? (
                    format(filters.dateFrom, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => {
                    handleFilterChange("dateFrom", date);
                    setIsDateFromOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? (
                    format(filters.dateTo, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => {
                    handleFilterChange("dateTo", date);
                    setIsDateToOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Filters:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.status && filters.status !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {statusOptions.find(s => s.value === filters.status)?.label}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("status", "all")}
                    />
                  </Badge>
                )}
                {filters.eventId && filters.eventId !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Event: {events.find((e: any) => e.id === filters.eventId)?.title}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("eventId", "all")}
                    />
                  </Badge>
                )}
                {filters.checkedIn && filters.checkedIn !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Check-in: {checkInOptions.find(c => c.value === filters.checkedIn)?.label}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("checkedIn", "all")}
                    />
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    From: {format(filters.dateFrom, "MMM dd, yyyy")}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("dateFrom", undefined)}
                    />
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    To: {format(filters.dateTo, "MMM dd, yyyy")}
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("dateTo", undefined)}
                    />
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{filters.search}"
                    <XIcon
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange("search", "")}
                    />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MagicCard>
  );
}
