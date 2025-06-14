"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  useAdminEventDetail,
  useUpdateEventStatus,
} from "~/lib/api/hooks/admin";
import {
  EventDetailSkeleton,
  EventDetailErrorState,
} from "~/components/dashboard/admin/event-detail-loading";
import { AdminRoute } from "~/components/auth/admin-route";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  User,
  ImageIcon,
  Check,
  X,
  Shield,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { formatDate, formatPrice } from "~/lib/utils";

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant:
        | "default"
        | "outline"
        | "secondary"
        | "destructive"
        | "success"
        | "warning";
    }
  > = {
    DRAFT: { label: "Draft", variant: "outline" },
    PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
    PUBLISHED: { label: "Published", variant: "success" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    COMPLETED: { label: "Completed", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "default" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch event detail from API
  const {
    event,
    isLoading: isEventLoading,
    error: eventError,
    mutate: mutateEvent,
  } = useAdminEventDetail(id);

  // Get event statistics from the event data
  const statistics = event?.statistics || {
    totalTicketsSold: 0,
    totalCapacity: 0,
    totalRevenue: 0,
    soldPercentage: 0,
    totalTransactions: 0,
  };

  const isStatsLoading = isEventLoading;

  // Use the update event status hook
  const { updateStatus } = useUpdateEventStatus();

  // State for feedback
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine event origin and permissions
  const isOrganizerSubmitted = event?.organizer?.user?.id !== session?.user?.id;
  const isPendingApproval = event?.status === "PENDING_REVIEW";
  const isPublished = event?.status === "PUBLISHED";

  // Admin can only edit events they created directly, not organizer-submitted events
  const canEdit = !isOrganizerSubmitted;
  const needsApproval = isOrganizerSubmitted && isPendingApproval;
  const isOrganizerPublished = isOrganizerSubmitted && isPublished;

  const handleApproveEvent = async () => {
    try {
      setIsSubmitting(true);
      await updateStatus(id, "PUBLISHED", feedback);
      setFeedback("");
      // Refresh the event data
      mutateEvent();
    } catch (error) {
      console.error("Error approving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectEvent = async () => {
    try {
      setIsSubmitting(true);
      await updateStatus(id, "REJECTED", feedback);
      setFeedback("");
      // Refresh the event data
      mutateEvent();
    } catch (error) {
      console.error("Error rejecting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isEventLoading) {
    return (
      <AdminRoute>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <EventDetailSkeleton />
          </div>
        </div>
      </AdminRoute>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <AdminRoute>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Event Details</h1>
            </div>
            <EventDetailErrorState message="Failed to load event details. Please try again later." />
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-2xl font-semibold">{event.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {isOrganizerSubmitted ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <UserCheck className="h-3 w-3" />
                      <span>Diajukan oleh organizer</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>Dibuat oleh admin</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {needsApproval ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Membutuhkan persetujuan</span>
                </div>
              ) : isOrganizerPublished ? (
                <div className="flex items-center gap-2 text-green-600">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">Event organizer telah disetujui</span>
                </div>
              ) : canEdit ? (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/events/${id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Event
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">Event organizer - hanya bisa direview</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Event Information</CardTitle>
                        <StatusBadge status={event.status} />
                      </div>
                      <CardDescription>Details about the event</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Event Images */}
                      <div className="mb-6 space-y-4">
                        {event.posterUrl && (
                          <div>
                            <h3 className="flex items-center font-medium">
                              <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                              Event Poster
                            </h3>
                            <div className="mt-2 overflow-hidden rounded-md">
                              <div className="relative h-[200px] w-full">
                                <Image
                                  src={event.posterUrl}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-sm font-medium">
                            Organizer
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="text-muted-foreground h-4 w-4" />
                            <span>
                              {event?.organizer?.orgName ||
                                event?.organizer?.user?.name ||
                                "Unknown"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-sm font-medium">
                            Date
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            <span>
                              {formatDate(event.startDate)} -{" "}
                              {formatDate(event.endDate)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-sm font-medium">
                            Location
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <span>
                              {event.venue}
                              {event.city && `, ${event.city}`}
                              {event.province && `, ${event.province}`}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-sm font-medium">
                            Category
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag className="text-muted-foreground h-4 w-4" />
                            <span>{event.category || "Uncategorized"}</span>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <h3 className="mb-2 text-lg font-medium">
                          Description
                        </h3>
                        <p className="text-muted-foreground">
                          {event.description || "No description provided."}
                        </p>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <h3 className="mb-2 text-lg font-medium">
                          Additional Information
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1">
                            <div className="text-muted-foreground text-sm font-medium">
                              Created At
                            </div>
                            <div>
                              {event?.createdAt
                                ? formatDate(event.createdAt)
                                : "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground text-sm font-medium">
                              Last Updated
                            </div>
                            <div>
                              {event?.updatedAt
                                ? formatDate(event.updatedAt)
                                : "N/A"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground text-sm font-medium">
                              Event ID
                            </div>
                            <div>{event?.id || id}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground text-sm font-medium">
                              Organizer ID
                            </div>
                            <div>{event?.organizerId || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Event Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Capacity
                          </span>
                          <span className="font-medium">
                            {isStatsLoading
                              ? "Loading..."
                              : statistics?.totalCapacity || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Tickets Sold
                          </span>
                          <span className="font-medium">
                            {isStatsLoading
                              ? "Loading..."
                              : statistics?.totalTicketsSold || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium">
                            {isStatsLoading
                              ? "Loading..."
                              : formatPrice(statistics?.totalRevenue || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Sold Percentage
                          </span>
                          <span className="font-medium">
                            {isStatsLoading
                              ? "Loading..."
                              : `${statistics?.soldPercentage || 0}%`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {needsApproval && (
                      <Card className="border-amber-200 bg-amber-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-amber-800">
                            <AlertTriangle className="h-5 w-5" />
                            Review Actions
                          </CardTitle>
                          <CardDescription className="text-amber-700">
                            Event ini diajukan oleh organizer dan membutuhkan persetujuan admin
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Textarea
                            placeholder="Feedback untuk organizer (opsional)"
                            className="mb-4 bg-white"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={handleApproveEvent}
                            disabled={isSubmitting}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Processing..." : "Setujui Event"}
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleRejectEvent}
                            disabled={isSubmitting}
                          >
                            <X className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Processing..." : "Tolak Event"}
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {!isOrganizerSubmitted && (
                      <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Shield className="h-5 w-5" />
                            Admin Event
                          </CardTitle>
                          <CardDescription className="text-blue-700">
                            Event ini dibuat langsung oleh admin dan memiliki akses penuh untuk editing
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}

                    {isOrganizerPublished && (
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-800">
                            <UserCheck className="h-5 w-5" />
                            Event Organizer Disetujui
                          </CardTitle>
                          <CardDescription className="text-green-700">
                            Event ini telah disetujui dan dipublikasikan. Admin tidak dapat mengedit event organizer yang sudah disetujui.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Types</CardTitle>
                    <CardDescription>
                      Manage ticket types for this event
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event?.ticketTypes && event.ticketTypes.length > 0 ? (
                      <div className="space-y-4">
                        {event.ticketTypes.map((ticket: any) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between rounded-md border p-4"
                          >
                            <div>
                              <div className="font-medium">{ticket.name}</div>
                              <div className="text-muted-foreground text-sm">
                                {ticket.quantity - ticket.sold} of{" "}
                                {ticket.quantity} remaining
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatPrice(ticket.price)}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                <Ticket className="mr-1 inline h-3 w-3" />
                                {ticket.sold} sold
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <h3 className="mb-2 text-lg font-semibold">
                          No Tickets
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          This event doesn't have any ticket types yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Information</CardTitle>
                    <CardDescription>
                      View sales data for this event
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <div className="text-muted-foreground text-sm">
                          Total Revenue
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                          {formatPrice(statistics?.totalRevenue || 0)}
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-muted-foreground text-sm">
                          Tickets Sold
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                          {statistics?.totalTicketsSold || 0}
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="text-muted-foreground text-sm">
                          Transactions
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                          {statistics?.totalTransactions || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
