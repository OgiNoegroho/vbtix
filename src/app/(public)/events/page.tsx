"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardFooter } from "~/components/ui/card";

import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination";
import { formatPrice } from "~/lib/utils";
import { MagicCard, GradientText, Shimmer, FloatingElement } from "~/components/ui/magic-card";
import { AnimatedBackground, Particles } from "~/components/ui/animated-background";

// Event type definition
interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  category?: string;
  venue: string;
  address?: string;
  city?: string;
  province: string;
  country: string;
  tags: string[];
  featured: boolean;
  startDate: string;
  endDate: string;
  formattedStartDate: string;
  formattedEndDate: string;
  organizer: {
    id: string;
    orgName: string;
    verified: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  };
  ticketInfo: {
    lowestPrice: number;
    totalTickets: number;
    soldTickets: number;
    availableTickets: number;
    percentageSold: number;
  };
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for events and loading
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // State for filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (category) params.append("category", category);

      const page = searchParams.get("page") || "1";
      params.append("page", page);
      params.append("limit", "12");

      // Fetch events from API
      const response = await fetch(`/api/public/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
        setMeta(data.meta);
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (category) params.append("category", category);

    router.push(`/events?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setCategory("");
    router.push("/events");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/events?${params.toString()}`);
  };

  // Fetch events on mount and when search params change
  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  // Event card component
  const EventCard = ({ event, index }: { event: Event; index: number }) => (
    <FloatingElement delay={index * 0.1} duration={3 + index * 0.2}>
      <MagicCard className="group h-full overflow-hidden border-border/30 hover:border-primary/30 rounded-xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={event.posterUrl || "https://placehold.co/400x300?text=No+Image"}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {event.category && (
            <Badge
              variant="magic"
              className="absolute top-2 left-2 shadow-lg text-xs backdrop-blur-sm"
            >
              <Sparkles className="mr-1 h-2.5 w-2.5" />
              {event.category}
            </Badge>
          )}
          {event.featured && (
            <Badge
              variant="glow"
              className="absolute top-2 right-2 shadow-lg text-xs backdrop-blur-sm"
            >
              <Star className="mr-1 h-2.5 w-2.5" />
              Featured
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="relative p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/20" />
          <div className="relative z-10">
            <h3 className="mb-3 line-clamp-2 text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              <GradientText className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 absolute inset-0">
                {event.title}
              </GradientText>
              <span className="group-hover:opacity-0 transition-opacity duration-300">
                {event.title}
              </span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground flex items-center group-hover:text-foreground transition-colors duration-300">
                <div className="mr-2 rounded-full bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors duration-300">
                  <Calendar className="h-3 w-3 text-primary" />
                </div>
                <span className="truncate font-medium">{event.formattedStartDate}</span>
              </div>
              <div className="text-muted-foreground flex items-center group-hover:text-foreground transition-colors duration-300">
                <div className="mr-2 rounded-full bg-secondary/10 p-1 group-hover:bg-secondary/20 transition-colors duration-300">
                  <MapPin className="h-3 w-3 text-secondary flex-shrink-0" />
                </div>
                <span className="line-clamp-1 min-w-0 font-medium">
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="relative flex items-center justify-between border-t border-border/30 p-4 bg-gradient-to-r from-muted/15 to-muted/5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {event.ticketInfo.lowestPrice > 0
                ? `${formatPrice(event.ticketInfo.lowestPrice)}`
                : "Gratis"}
            </span>
          </div>
          <Shimmer>
            <Button size="sm" variant="magic" asChild className="text-xs font-semibold shadow-md px-3 py-1.5">
              <Link href={`/events/${event.id}`}>
                <Sparkles className="mr-1.5 h-3 w-3" />
                Detail
              </Link>
            </Button>
          </Shimmer>
        </CardFooter>
      </MagicCard>
    </FloatingElement>
  );

  // Loading skeleton
  const EventCardSkeleton = () => (
    <Card className="h-full overflow-hidden rounded-xl">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-3 h-5 w-3/4" />
        <div className="mb-3 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-7 w-20" />
      </CardFooter>
    </Card>
  );

  return (
    <AnimatedBackground variant="gradient" className="min-h-screen">
      <Particles className="absolute inset-0" quantity={30} />

      <div className="relative z-10">
        {/* Enhanced Hero section */}
        <div className="bg-gradient-brand py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
              <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
                <GradientText colors={["white", "rgba(255,255,255,0.8)"]}>
                  Jelajahi Event
                </GradientText>
              </h1>
              <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto">
                Temukan event menarik di sekitar Anda dan nikmati pengalaman tak terlupakan
              </p>
            </div>

            {/* Enhanced Search bar */}
            <div className="flex max-w-2xl mx-auto flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari event yang Anda inginkan..."
                  className="pl-12 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <Shimmer>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Filter size={18} className="mr-2" />
                  Filter
                </Button>
              </Shimmer>
              <Shimmer>
                <Button
                  size="lg"
                  onClick={applyFilters}
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                >
                  <Search size={18} className="mr-2" />
                  Cari Event
                </Button>
              </Shimmer>
            </div>

            {/* Enhanced Filters */}
            {showFilters && (
              <div className="mt-6 rounded-2xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 shadow-2xl animate-slide-up">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Kategori
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-[200px] bg-white/20 text-white border-white/30 h-10">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Kategori</SelectItem>
                        <SelectItem value="Konser">Konser</SelectItem>
                        <SelectItem value="Festival">Festival</SelectItem>
                        <SelectItem value="Seminar">Seminar</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Pameran">Pameran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="mt-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <X size={16} className="mr-2" />
                    Reset Filter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Events grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold lg:text-3xl">
                <GradientText>
                  {isLoading
                    ? "Memuat event..."
                    : `${meta.totalItems} Event Ditemukan`}
                </GradientText>
              </h2>
              <p className="text-muted-foreground mt-1">
                Pilih event yang sesuai dengan minat Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 8 }).map((_, index) => (
                <FloatingElement key={index} delay={index * 0.1}>
                  <EventCardSkeleton />
                </FloatingElement>
              ))
            ) : events.length > 0 ? (
              // Show events
              events.map((event, index) => <EventCard key={event.id} event={event} index={index} />)
            ) : (
              // Show empty state
              <div className="col-span-full py-16 text-center">
                <FloatingElement>
                  <MagicCard className="max-w-md mx-auto p-8">
                    <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-6 mb-6 mx-auto w-fit">
                      <Search className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      <GradientText>Tidak ada event ditemukan</GradientText>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Coba ubah filter atau kata kunci pencarian Anda
                    </p>
                    <Button variant="magic" size="sm" onClick={resetFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Reset Pencarian
                    </Button>
                  </MagicCard>
                </FloatingElement>
              </div>
            )}
          </div>

          {/* Enhanced Pagination */}
          {meta.totalPages > 1 && (
            <Pagination className="mt-12">
              <PaginationContent>
                <PaginationItem>
                  <Shimmer>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() =>
                        handlePageChange(Math.max(1, meta.currentPage - 1))
                      }
                      disabled={meta.currentPage === 1}
                      className="gap-2 font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </Button>
                  </Shimmer>
                </PaginationItem>

                {Array.from({ length: Math.min(5, meta.totalPages) }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <PaginationItem key={index}>
                      <Button
                        variant={
                          meta.currentPage === pageNumber ? "magic" : "outline"
                        }
                        size="default"
                        onClick={() => handlePageChange(pageNumber)}
                        className="font-semibold"
                      >
                        {pageNumber}
                      </Button>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <Shimmer>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() =>
                        handlePageChange(
                          Math.min(meta.totalPages, meta.currentPage + 1),
                        )
                      }
                      disabled={meta.currentPage === meta.totalPages}
                      className="gap-2 font-semibold"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Shimmer>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </AnimatedBackground>
  );
}
