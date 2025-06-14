"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  useOrganizerEventDetail,
  useEventSales,
} from "~/lib/api/hooks/organizer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  User,
  Share2,
  BarChart,
  ImageIcon,
  Trash,
  Images,
  Loader2,
  CheckCircle,
  Send,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { formatDate, formatPrice } from "~/lib/utils";
import { EventStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ImageManagerDialog } from "~/components/event/image-manager-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { deleteData } from "~/lib/api/client";
import { toast } from "sonner";

export default function EventDetailPage() {
  // Use the useParams hook to get route parameters
  const params = useParams();
  const organizerId = params.id as string;
  const eventId = params.eventId as string;

  const router = useRouter();

  // State for image manager dialog and delete dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for submit for review
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);

  // Fetch event details
  const { data, isLoading, error, mutate } = useOrganizerEventDetail(
    organizerId,
    eventId,
  );
  const event = data?.data;

  // Fetch event sales data
  const {
    data: salesData,
    isLoading: isSalesLoading,
    error: salesError,
  } = useEventSales(organizerId, { eventId: eventId });

  // Type assertion for sales data
  type SalesDataItem = {
    date: string;
    count: number;
    ticketsSold: number;
    revenue: number;
  };

  type SalesResponse = {
    salesData: SalesDataItem[];
    totalRevenue: number;
    totalTicketsSold: number;
    totalSales: number;
  };

  // Type assertion for the sales data
  const typedSalesData = salesData as
    | { success: boolean; data: SalesResponse; error?: string }
    | undefined;

  // Handle submit for review
  const handleSubmitForReview = async () => {
    setIsSubmittingForReview(true);

    try {
      const response = await fetch(
        ORGANIZER_ENDPOINTS.SUBMIT_EVENT_FOR_REVIEW(organizerId, eventId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit event for review");
      }

      // Show success toast notification
      toast.success("Event submitted for review", {
        description: "Your event has been submitted for admin approval.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Refresh the event data
      mutate();
    } catch (error: any) {
      console.error("Error submitting event for review:", error);

      // Show error toast notification
      toast.error("Error submitting event", {
        description: error.message || "Failed to submit event for review. Please try again.",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsSubmittingForReview(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Call the delete API endpoint
      await deleteData(ORGANIZER_ENDPOINTS.DELETE_EVENT(organizerId, eventId));

      // Show success toast notification
      toast.success("Event deleted successfully", {
        description: "The event has been permanently deleted.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Redirect to events list on success
      router.push(`/organizer/${organizerId}/events`);
    } catch (error: any) {
      console.error("Error deleting event:", error);
      const errorMessage =
        error?.info?.error || "Failed to delete event. Please try again.";

      // Show error toast notification
      toast.error("Error deleting event", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });

      setDeleteError(errorMessage);
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Event Details</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Event Details</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Error loading event</h3>
          <p className="text-muted-foreground text-sm">
            {error?.message ||
              "Failed to load event details. Please try again."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => router.refresh()}>
              Try Again
            </Button>
            <Button
              onClick={() => router.push(`/organizer/${organizerId}/events`)}
            >
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Image Manager Dialog */}
      <ImageManagerDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        posterImage={event?.posterUrl}
        posterPublicId={(event as any)?.posterPublicId}
        bannerImage={event?.bannerUrl}
        bannerPublicId={(event as any)?.bannerPublicId}
        additionalImages={event?.images || []}
        additionalImagePublicIds={(event as any)?.imagePublicIds || []}
        eventId={eventId}
        organizerId={organizerId}
        onSuccess={() => mutate()}
        eventTitle={event?.title || "Event"}
      />

      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">{event.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/organizer/${organizerId}/events/${eventId}/edit`)
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Event
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>

            {/* Delete Event Alert Dialog */}
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the event &quot;{event?.title}&quot; and remove all
                    associated data including tickets, sales records, and
                    attendee information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {deleteError && (
                  <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <p>{deleteError}</p>
                    </div>
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteEvent();
                    }}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete Event
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                  <CardDescription>Details about your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Event Images */}
                  <div className="mb-6 space-y-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="flex items-center font-medium">
                        <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                        Event Images
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setImageDialogOpen(true)}
                      >
                        <Images className="mr-2 h-4 w-4" />
                        Manage Images
                      </Button>
                    </div>

                    {/* Poster Image */}
                    {event.posterUrl && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium">
                          Event Poster
                        </h4>
                        <div className="overflow-hidden rounded-md">
                          <div className="relative h-[200px] w-full">
                            <Image
                              src={event.posterUrl}
                              alt={event.title}
                              fill
                              className="bg-muted/20 object-contain"
                              sizes="(max-width: 768px) 100vw, 600px"
                            />
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Recommended size: 1200×800px (3:2 ratio), max 2MB
                        </p>
                      </div>
                    )}

                    {/* Banner Image */}
                    {event.bannerUrl && (
                      <div className="mt-4">
                        <h4 className="mb-2 text-sm font-medium">
                          Event Banner
                        </h4>
                        <div className="overflow-hidden rounded-md">
                          <div className="relative h-[200px] w-full">
                            <Image
                              src={event.bannerUrl}
                              alt={event.title}
                              fill
                              className="bg-muted/20 object-contain"
                              sizes="(max-width: 768px) 100vw, 800px"
                            />
                          </div>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Recommended size: 1920×640px (3:1 ratio), max 2MB
                        </p>
                      </div>
                    )}

                    {/* Additional Images */}
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium">
                        Additional Images
                      </h4>
                      <p className="text-muted-foreground mb-2 text-xs">
                        Recommended size: 1200×800px (3:2 ratio) or square, max
                        2MB each
                      </p>
                      {event.images && event.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                          {event.images.map((image, index) => (
                            <div
                              key={index}
                              className="bg-muted/20 relative h-[120px] overflow-hidden rounded-md"
                            >
                              <Image
                                src={image}
                                alt={`${event.title} - Image ${index + 1}`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 50vw, 33vw"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                          <p className="text-muted-foreground text-sm">
                            No additional images yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Status</h3>
                      {event.status === EventStatus.DRAFT && (
                        <Button
                          size="sm"
                          onClick={handleSubmitForReview}
                          disabled={isSubmittingForReview}
                        >
                          {isSubmittingForReview ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit for Review
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={
                          event.status === EventStatus.PUBLISHED
                            ? "success"
                            : event.status === EventStatus.DRAFT
                              ? "outline"
                              : event.status === EventStatus.PENDING_REVIEW
                                ? "secondary"
                                : event.status === EventStatus.REJECTED
                                  ? "destructive"
                                  : "outline"
                        }
                        className="mt-1"
                      >
                        {event.status === EventStatus.PUBLISHED && (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Published
                          </>
                        )}
                        {event.status === EventStatus.DRAFT && (
                          <>
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Draft
                          </>
                        )}
                        {event.status === EventStatus.PENDING_REVIEW && (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Pending Review
                          </>
                        )}
                        {event.status === EventStatus.REJECTED && (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Rejected
                          </>
                        )}
                        {event.status === EventStatus.CANCELLED && (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Cancelled
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Status descriptions */}
                    <div className="mt-2">
                      {event.status === EventStatus.DRAFT && (
                        <p className="text-sm text-amber-600">
                          Your event is saved as a draft. Submit it for admin review to publish.
                        </p>
                      )}
                      {event.status === EventStatus.PENDING_REVIEW && (
                        <p className="text-sm text-blue-600">
                          Your event is under admin review. You'll be notified once it's approved or if changes are needed.
                        </p>
                      )}
                      {event.status === EventStatus.PUBLISHED && (
                        <p className="text-sm text-green-600">
                          Your event is live and visible to the public.
                        </p>
                      )}
                      {event.status === EventStatus.REJECTED && (
                        <p className="text-sm text-red-600">
                          Your event was rejected. Please review admin feedback and resubmit.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {event.description || "No description provided."}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="flex items-center font-medium">
                        <CalendarDays className="text-muted-foreground mr-2 h-4 w-4" />
                        Date
                      </h3>
                      <p className="mt-1 text-sm">
                        {formatDate(event.startDate)} -{" "}
                        {formatDate(event.endDate)}
                      </p>
                    </div>

                    <div>
                      <h3 className="flex items-center font-medium">
                        <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                        Time
                      </h3>
                      <p className="mt-1 text-sm">
                        {new Date(event.startDate).toLocaleTimeString()} -{" "}
                        {new Date(event.endDate).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <h3 className="flex items-center font-medium">
                        <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                        Location
                      </h3>
                      <p className="mt-1 text-sm">
                        {event.venue}, {event.city}, {event.province}
                      </p>
                    </div>

                    <div>
                      <h3 className="flex items-center font-medium">
                        <Tag className="text-muted-foreground mr-2 h-4 w-4" />
                        Category
                      </h3>
                      <p className="mt-1 text-sm">
                        {event.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/organizer/${organizerId}/events/${eventId}/edit`,
                      )
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Event
                  </Button>
                </CardFooter>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/organizer/${organizerId}/events/${eventId}/tickets`,
                        )
                      }
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Manage Tickets
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/organizer/${organizerId}/events/${eventId}/attendees`,
                        )
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      View Attendees
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Event Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Tickets Sold
                        </span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Revenue
                        </span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Views
                        </span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Sales Reports</CardTitle>
                <CardDescription>
                  View sales data for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSalesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  </div>
                ) : salesError ? (
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                    Error loading sales data: {salesError.message}
                  </div>
                ) : !typedSalesData?.data ||
                  !typedSalesData.data.salesData ||
                  typedSalesData.data.salesData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <BarChart className="text-muted-foreground mb-2 h-8 w-8" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No sales data yet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      There are no sales recorded for this event yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground mb-2 text-sm">
                          Total Sales
                        </h3>
                        <p className="text-2xl font-bold">
                          {formatPrice(typedSalesData?.data.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground mb-2 text-sm">
                          Tickets Sold
                        </h3>
                        <p className="text-2xl font-bold">
                          {typedSalesData?.data.totalTicketsSold || 0}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-muted-foreground mb-2 text-sm">
                          Orders
                        </h3>
                        <p className="text-2xl font-bold">
                          {typedSalesData?.data.totalSales || 0}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-4 text-lg font-medium">
                        Sales by Date
                      </h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Orders</TableHead>
                              <TableHead>Tickets Sold</TableHead>
                              <TableHead className="text-right">
                                Revenue
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {typedSalesData?.data.salesData.map((item: any) => (
                              <TableRow key={item.date}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.count}</TableCell>
                                <TableCell>{item.ticketsSold}</TableCell>
                                <TableCell className="text-right">
                                  {formatPrice(item.revenue)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
