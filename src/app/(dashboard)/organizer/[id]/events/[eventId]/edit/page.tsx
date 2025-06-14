"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrganizerEventDetail } from "~/lib/api/hooks/organizer";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  MagicInput,
  MagicTextarea,
  MagicButton,
  MagicCard,
} from "~/components/ui/magic-card";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  Save,
  Images,
  ImageIcon,
} from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { EventStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { ImageManagerDialog } from "~/components/event/image-manager-dialog";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  const eventId = params.eventId as string;

  // State for image manager dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const { data, isLoading, error, mutate } = useOrganizerEventDetail(
    organizerId,
    eventId,
  );
  const event = data?.data;

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    venue: "",
    city: "",
    province: "",
    country: "",
    category: "",
    status: EventStatus.DRAFT as string,
    tags: [] as string[],
    images: [] as string[],
    imagePublicIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Populate form with event data when it's loaded
  useEffect(() => {
    if (event) {
      try {
        // Format dates safely
        let startDateStr = "";
        let startTimeStr = "";
        let endDateStr = "";
        let endTimeStr = "";

        if (event.startDate) {
          const date = new Date(event.startDate);
          const isoString = date.toISOString();
          startDateStr = isoString.substring(0, 10); // YYYY-MM-DD

          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          startTimeStr = `${hours}:${minutes}`;
        } else {
          const now = new Date();
          startDateStr = now.toISOString().substring(0, 10);
          startTimeStr = "00:00";
        }

        if (event.endDate) {
          const date = new Date(event.endDate);
          const isoString = date.toISOString();
          endDateStr = isoString.substring(0, 10); // YYYY-MM-DD

          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          endTimeStr = `${hours}:${minutes}`;
        } else {
          const now = new Date();
          endDateStr = now.toISOString().substring(0, 10);
          endTimeStr = "23:59";
        }

        // Update form data
        setFormData({
          title: event.title || "",
          description: event.description || "",
          startDate: startDateStr,
          startTime: startTimeStr,
          endDate: endDateStr,
          endTime: endTimeStr,
          venue: event.venue || "",
          city: event.city || "",
          province: event.province || "",
          country: event.country || "",
          category: event.category || "",
          status: event.status || (EventStatus.DRAFT as string),
          tags: event.tags || [],
          images: event.images || [],
          imagePublicIds: (event as any).imagePublicIds || [],
        });
      } catch (error) {
        console.error("Error formatting event dates:", error);
        // Set default values if there's an error
        const now = new Date();
        const defaultDate = now.toISOString().substring(0, 10);

        setFormData({
          title: event.title || "",
          description: event.description || "",
          startDate: defaultDate,
          startTime: "00:00",
          endDate: defaultDate,
          endTime: "23:59",
          venue: event.venue || "",
          city: event.city || "",
          province: event.province || "",
          country: event.country || "",
          category: event.category || "",
          status: event.status || (EventStatus.DRAFT as string),
          tags: event.tags || [],
          images: event.images || [],
          imagePublicIds: (event as any).imagePublicIds || [],
        });
      }
    }
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    // Ensure the value is a valid EventStatus enum value
    if (value && Object.values(EventStatus).includes(value as EventStatus)) {
      setFormData((prev) => ({
        ...prev,
        status: value,
      }));
    } else {
      // Default to DRAFT if invalid value
      setFormData((prev) => ({
        ...prev,
        status: EventStatus.DRAFT,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      // Combine date and time
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`,
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Validate dates
      if (endDateTime <= startDateTime) {
        throw new Error("End date must be after start date");
      }

      // Generate a slug from the title if needed
      const slug =
        event?.slug || formData.title.toLowerCase().replace(/\s+/g, "-");

      // Ensure status is a valid enum value
      let status = formData.status;
      if (!status || status === "") {
        status = EventStatus.DRAFT;
      }

      const data = {
        title: formData.title,
        description: formData.description,
        slug: slug, // Include the slug
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        venue: formData.venue,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        category: formData.category,
        status: status, // Use the validated status
        tags: formData.tags,
        images: formData.images,
        imagePublicIds: formData.imagePublicIds,
        // Include these fields with default values if they're required
        featured: event?.featured !== undefined ? event.featured : false,
      };

      // Send request to update event
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_DETAIL(organizerId, eventId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const error = new Error(result.error || "Failed to update event");
        // Add details property to the error object if available
        if (result.details) {
          (error as any).details = result.details;
        }
        throw error;
      }

      // Refresh event data
      mutate();

      // Show success toast notification
      toast.success("Event updated successfully", {
        description: "Your event has been updated.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Redirect to the event detail page
      router.push(`/organizer/${organizerId}/events/${eventId}`);
    } catch (err: any) {
      console.error("Error updating event:", err);

      // Try to extract detailed validation errors if available
      let errorMessage = "Failed to update event. Please try again.";

      if (err.message) {
        errorMessage = err.message;
      }

      // If there's a response with details, try to extract them
      if (err.details) {
        console.error(
          "Validation details:",
          JSON.stringify(err.details, null, 2),
        );
        errorMessage += " Validation errors found.";
      }

      // Show error toast notification
      toast.error("Error updating event", {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });

      setFormError(errorMessage);

      // Log the data we're trying to send for debugging
      console.log("Data being sent:", JSON.stringify(data, null, 2));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <OrganizerRoute>
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col">
            <div className="container flex flex-1 flex-col gap-2 pt-4">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-2">
                    <MagicButton
                      variant="ghost"
                      size="icon"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </MagicButton>
                    <h1 className="text-2xl font-semibold">Edit Event</h1>
                  </div>
                </div>
                <div className="flex items-center justify-center p-8">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </OrganizerRoute>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <OrganizerRoute>
        <div className="flex min-h-screen flex-col">
          <div className="flex flex-1 flex-col">
            <div className="container flex flex-1 flex-col gap-2 pt-4">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex items-center gap-2">
                    <MagicButton
                      variant="ghost"
                      size="icon"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </MagicButton>
                    <h1 className="text-2xl font-semibold">Edit Event</h1>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mb-2 text-lg font-semibold">
                    Error loading event
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {error?.message ||
                      "Failed to load event details. Please try again."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <MagicButton variant="outline" onClick={() => router.refresh()}>
                      Try Again
                    </MagicButton>
                    <MagicButton
                      onClick={() =>
                        router.push(`/organizer/${organizerId}/events`)
                      }
                      variant="magic"
                    >
                      Back to Events
                    </MagicButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </OrganizerRoute>
    );
  }

  // Main form
  return (
    <OrganizerRoute>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col">
          <div className="container flex flex-1 flex-col gap-2 pt-4">
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

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-2">
                  <MagicButton
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </MagicButton>
                  <h1 className="text-2xl font-semibold">Edit Event</h1>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>
                      Update your event information
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    {formError && (
                      <div className="mx-6 mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                        {formError}
                      </div>
                    )}
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <MagicInput
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <MagicTextarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            <MagicInput
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <MagicInput
                              id="startTime"
                              name="startTime"
                              type="time"
                              value={formData.startTime}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            <MagicInput
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">End Time</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <MagicInput
                              id="endTime"
                              name="endTime"
                              type="time"
                              value={formData.endTime}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="venue">Venue</Label>
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <MagicInput
                              id="venue"
                              name="venue"
                              value={formData.venue}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <MagicInput
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="province">Province</Label>
                          <MagicInput
                            id="province"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <MagicInput
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <MagicInput
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={handleStatusChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EventStatus.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={EventStatus.PUBLISHED}>
                                Published
                              </SelectItem>
                              <SelectItem value={EventStatus.CANCELLED}>
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Event Images Section */}
                      <div className="mt-6 space-y-4 border-t pt-6">
                        <div className="flex items-center justify-between">
                          <h3 className="flex items-center font-medium">
                            <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                            Event Images
                          </h3>
                          <MagicButton
                            variant="outline"
                            size="sm"
                            onClick={() => setImageDialogOpen(true)}
                            type="button"
                          >
                            <Images className="mr-2 h-4 w-4" />
                            Manage Images
                          </MagicButton>
                        </div>

                        <div className="text-muted-foreground text-sm">
                          <p>
                            Manage your event images including poster, banner,
                            and additional images.
                          </p>
                          <p className="mt-1">For best results:</p>
                          <ul className="mt-1 list-disc pl-5 text-xs">
                            <li>
                              Event poster: 1200×800px (3:2 ratio), max 2MB
                            </li>
                            <li>
                              Event banner: 1920×640px (3:1 ratio), max 2MB
                            </li>
                            <li>
                              Additional images: 1200×800px or square, max 2MB
                              each
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <MagicButton
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </MagicButton>
                      <MagicButton type="submit" disabled={isSubmitting} variant="magic">
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </MagicButton>
                    </CardFooter>
                  </form>
                </MagicCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizerRoute>
  );
}
