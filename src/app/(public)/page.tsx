"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatPrice, formatDate } from "~/lib/utils";
import { generateBannerUrl, defaultBanners } from "~/lib/banner-helpers";
import { MagicCard, GradientText, FloatingElement, Shimmer } from "~/components/ui/magic-card";
import { AnimatedBackground, Particles } from "~/components/ui/animated-background";

// Banner carousel component
const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Generate banner URLs using Cloudinary
  const banners = defaultBanners.map((banner) => ({
    ...banner,
    imageUrl: generateBannerUrl(`VBTicket ${banner.title}`, {
      backgroundColor: banner.backgroundColor,
      textColor: "white",
    }),
  }));

  // Auto-change banner every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl sm:mb-8 lg:mb-10">
      <div className="relative h-[200px] w-full sm:h-[280px] md:h-[320px] lg:h-[360px] xl:h-[400px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-4 text-white sm:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">
                <h2 className="mb-2 text-lg font-bold sm:mb-3 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-tight">
                  {banner.title}
                </h2>
                <p className="mb-4 max-w-sm text-sm sm:mb-5 sm:max-w-md sm:text-base md:max-w-lg lg:max-w-xl opacity-90">
                  {banner.description}
                </p>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="sm:size-default font-semibold"
                >
                  <Link href={banner.link}>Jelajahi Sekarang</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 space-x-1.5 sm:bottom-4 sm:space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-200 sm:h-2 sm:w-2 ${
              index === currentSlide
                ? "scale-125 bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Enhanced Event card component with Magic UI
const EventCard = ({ event, index }: { event: any; index: number }) => {
  // Generate a placeholder image URL using placeholder.co if no poster is available
  const placeholderImage = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(event.title || "No Image")}`;

  return (
    <FloatingElement delay={index * 0.1} duration={3 + index * 0.2}>
      <MagicCard className="group h-full overflow-hidden border-border/30 hover:border-primary/30 rounded-xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={event.posterUrl || placeholderImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
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

          {/* Magic overlay effect */}
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
                <span className="truncate font-medium">{formatDate(event.startDate)}</span>
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
              {event.lowestPrice ? `${formatPrice(event.lowestPrice)}` : "Gratis"}
            </span>
          </div>
          <Shimmer>
            <Button size="sm" variant="magic" asChild className="text-xs font-semibold shadow-md px-3 py-1.5">
              <Link href={`/events/${event.id}`}>
                <Sparkles className="mr-1.5 h-3 w-3" />
                Beli Tiket
              </Link>
            </Button>
          </Shimmer>
        </CardFooter>
      </MagicCard>
    </FloatingElement>
  );
};

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

// Enhanced Section title component with Magic UI
const SectionTitle = ({
  title,
  viewAllLink,
  subtitle,
}: {
  title: string;
  viewAllLink: string;
  subtitle?: string;
}) => (
  <div className="mb-6 flex items-center justify-between sm:mb-8">
    <div className="space-y-1">
      <h2 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
        <GradientText className="leading-tight">
          {title}
        </GradientText>
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
    <Shimmer>
      <Button
        variant="outline"
        size="default"
        asChild
        className="text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <Link href={viewAllLink} className="flex items-center gap-2">
          <span className="hidden sm:inline">Lihat Semua</span>
          <span className="sm:hidden">Semua</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Button>
    </Shimmer>
  </div>
);

export default function BuyerHomePage() {
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching featured events...");
        // Fetch featured events (recommended)
        const featuredResponse = await fetch(
          "/api/public/events?featured=true&limit=4",
        );
        const featuredData = await featuredResponse.json();
        console.log("Featured events response:", featuredData);

        console.log("Fetching upcoming events...");
        // Fetch upcoming events (sorted by date)
        const upcomingResponse = await fetch("/api/public/events?limit=4");
        const upcomingData = await upcomingResponse.json();
        console.log("Upcoming events response:", upcomingData);

        if (featuredData.success && upcomingData.success) {
          console.log("Setting events data...");
          setRecommendedEvents(featuredData.data);
          setUpcomingEvents(upcomingData.data);
        } else {
          console.error("API returned unsuccessful response:", {
            featuredSuccess: featuredData.success,
            upcomingSuccess: upcomingData.success,
            featuredError: featuredData.error,
            upcomingError: upcomingData.error,
          });
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <AnimatedBackground variant="gradient" className="min-h-screen">
      <Particles className="absolute inset-0" quantity={50} />

      <div className="relative z-10">
        <div className="container mx-auto space-y-10 px-4 py-6 sm:space-y-12 sm:px-6 sm:py-8 lg:space-y-16 lg:px-8 lg:py-12">
          {/* Enhanced Banner Carousel */}
          <div className="relative">
            <BannerCarousel />
            <div className="absolute inset-0 bg-gradient-to-t from-background/15 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Recommended Events Section */}
          <section className="space-y-6 sm:space-y-8">
            <SectionTitle
              title="✨ Event Rekomendasi"
              subtitle="Event pilihan terbaik yang tidak boleh Anda lewatkan"
              viewAllLink="/events?featured=true"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <FloatingElement key={index} delay={index * 0.1}>
                    <EventCardSkeleton />
                  </FloatingElement>
                ))
              ) : recommendedEvents.length > 0 ? (
                recommendedEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center sm:py-16">
                  <FloatingElement>
                    <MagicCard className="max-w-sm p-6">
                      <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-4 mb-4 mx-auto w-fit">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-base font-bold mb-2">
                        <GradientText>Belum Ada Event Rekomendasi</GradientText>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Event menarik akan segera hadir. Pantau terus untuk mendapatkan event terbaik!
                      </p>
                      <Button variant="magic" size="sm" asChild>
                        <Link href="/events">
                          <Star className="mr-2 h-4 w-4" />
                          Jelajahi Semua Event
                        </Link>
                      </Button>
                    </MagicCard>
                  </FloatingElement>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Events Section */}
          <section className="space-y-6 sm:space-y-8">
            <SectionTitle
              title="� Event Terdekat"
              subtitle="Jangan sampai terlewat! Event seru yang akan segera dimulai"
              viewAllLink="/events"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <FloatingElement key={index} delay={index * 0.1}>
                    <EventCardSkeleton />
                  </FloatingElement>
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center sm:py-16">
                  <FloatingElement>
                    <MagicCard className="max-w-sm p-6">
                      <div className="rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 p-4 mb-4 mx-auto w-fit">
                        <Calendar className="h-10 w-10 text-secondary" />
                      </div>
                      <h3 className="text-base font-bold mb-2">
                        <GradientText>Belum Ada Event Terdekat</GradientText>
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Event baru akan segera ditambahkan. Kembali lagi nanti untuk melihat event terbaru!
                      </p>
                      <Button variant="magic" size="sm" asChild>
                        <Link href="/events">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Lihat Semua Event
                        </Link>
                      </Button>
                    </MagicCard>
                  </FloatingElement>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AnimatedBackground>
  );
}
