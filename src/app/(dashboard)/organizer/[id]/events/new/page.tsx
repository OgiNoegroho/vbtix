"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { OrganizerPageWrapper } from "~/components/dashboard/organizer/organizer-page-wrapper";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Save,
  ImageIcon,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { DeferredImageUpload } from "~/components/ui/image-upload";
import { DeferredMultiImageUpload } from "~/components/ui/multi-image-upload";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
} from "~/lib/upload-helpers";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { ImagePreviewGallery } from "~/components/ui/image-preview-gallery";
import { useOrganizerSettings } from "~/lib/api/hooks/organizer";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { MagicCard, MagicInput, MagicTextarea } from "~/components/ui/magic-card";

// Create a schema for event creation
const createEventSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  venue: z.string().min(3, { message: "Venue is required" }),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().min(2, { message: "Province is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  category: z.string().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  posterUrl: z.string().optional(),
  posterPublicId: z.string().optional(),
  bannerUrl: z.string().optional(),
  bannerPublicId: z.string().optional(),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizer settings to check verification status
  const { settings, isLoading: isLoadingSettings } =
    useOrganizerSettings(organizerId);

  // Note: Removed verification redirect - unverified organizers can create events
  // but they will require admin approval before publication

  // State for image uploads
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for image files (local preview)
  const [posterFile, setPosterFile] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  const [bannerFile, setBannerFile] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  const [eventImageFiles, setEventImageFiles] = useState<
    { file: File; previewUrl: string }[]
  >([]);

  // State for uploaded images (after form submission)
  const [poster, setPoster] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  const [banner, setBanner] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  const [eventImages, setEventImages] = useState<
    { url: string; publicId: string }[]
  >([]);

  // Initialize form with default values
  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: "",
      address: "",
      city: "",
      province: "",
      country: "Indonesia",
      category: "",
      startDate: "",
      endDate: "",
      posterUrl: "",
      posterPublicId: "",
      bannerUrl: "",
      bannerPublicId: "",
      images: [],
      imagePublicIds: [],
    },
  });

  // Debug: Add click handler untuk memastikan focus bekerja
  const handleInputFocus = (fieldName: string) => {
    console.log(`Focus on field: ${fieldName}`);
  };

  const handleInputClick = (fieldName: string) => {
    console.log(`Click on field: ${fieldName}`);
  };

  // Handle form submission
  const onSubmit = async (data: CreateEventFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload images to Cloudinary
      let posterResult = null;
      let bannerResult = null;
      let additionalImagesResults: { url: string; publicId: string }[] = [];

      // Upload poster if exists
      if (posterFile) {
        setUploadProgress(10);
        posterResult = await uploadToCloudinary(posterFile.file);
        setPoster(posterResult);
        data.posterUrl = posterResult.url;
        data.posterPublicId = posterResult.publicId;
        setUploadProgress(30);
      }

      // Upload banner if exists
      if (bannerFile) {
        setUploadProgress(40);
        bannerResult = await uploadToCloudinary(bannerFile.file);
        setBanner(bannerResult);
        data.bannerUrl = bannerResult.url;
        data.bannerPublicId = bannerResult.publicId;
        setUploadProgress(60);
      }

      // Upload additional images if any
      if (eventImageFiles.length > 0) {
        setUploadProgress(70);
        additionalImagesResults = await uploadMultipleToCloudinary(
          eventImageFiles.map((item) => item.file),
          {
            onProgress: (completed, total) => {
              const progress = 70 + (completed / total) * 20;
              setUploadProgress(progress);
            },
          },
        );

        setEventImages(additionalImagesResults);
        data.images = additionalImagesResults.map((img) => img.url);
        data.imagePublicIds = additionalImagesResults.map(
          (img) => img.publicId,
        );
      }

      setUploadProgress(90);
      setIsUploading(false);

      // Format dates properly
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      // Send request to create event
      const response = await fetch(ORGANIZER_ENDPOINTS.EVENTS(organizerId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create event");
      }

      // Redirect to the event detail page
      router.push(`/organizer/${organizerId}/events/${result.data.id}`);
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message || "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrganizerRoute>
      <OrganizerPageWrapper>
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Create New Event</h1>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Fill in the details for your new event. All events require admin approval before publication.
              </CardDescription>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Approval Required</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Your event will be saved as a draft and must be submitted for admin approval before it becomes visible to the public.
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {settings && !settings.verified && (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <ShieldAlert className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">
                    Account Not Verified
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    <p className="mb-2">
                      Your organizer account is not verified. You can still create events,
                      but they will require admin approval before publication.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() =>
                        router.push(`/organizer/${organizerId}/verification`)
                      }
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Verify Your Account
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <div className="bg-destructive/15 text-destructive mb-4 rounded-md p-3 text-sm">
                  <p>{error}</p>
                </div>
              )}

              {/* Image Preview Gallery - only show if there are images */}
              {(posterFile || bannerFile || eventImageFiles.length > 0) && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-medium">
                    Event Images Preview
                  </h3>
                  <ImagePreviewGallery
                    poster={posterFile}
                    banner={bannerFile}
                    additionalImages={eventImageFiles}
                    className="mb-4"
                  />
                </div>
              )}

              <MagicCard className="p-6 bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <MagicInput
                                placeholder="Enter event title"
                                {...field}
                                onFocus={() => handleInputFocus("title")}
                                onClick={() => handleInputClick("title")}
                              />
                            </FormControl>
                            <FormDescription>
                              The name of your event as it will appear to
                              attendees
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <MagicTextarea
                                placeholder="Describe your event"
                                className="min-h-32"
                                {...field}
                                onFocus={() => handleInputFocus("description")}
                                onClick={() => handleInputClick("description")}
                              />
                            </FormControl>
                            <FormDescription>
                              Provide details about your event
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date & Time</FormLabel>
                              <FormControl>
                                <MagicInput
                                  type="datetime-local"
                                  {...field}
                                  onFocus={() => handleInputFocus("startDate")}
                                  onClick={() => handleInputClick("startDate")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date & Time</FormLabel>
                              <FormControl>
                                <MagicInput
                                  type="datetime-local"
                                  {...field}
                                  onFocus={() => handleInputFocus("endDate")}
                                  onClick={() => handleInputClick("endDate")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="venue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Venue</FormLabel>
                            <FormControl>
                              <MagicInput
                                placeholder="Enter venue name"
                                {...field}
                                onFocus={() => handleInputFocus("venue")}
                                onClick={() => handleInputClick("venue")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Enter address"
                                  {...field}
                                  onFocus={() => handleInputFocus("address")}
                                  onClick={() => handleInputClick("address")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Enter city"
                                  {...field}
                                  onFocus={() => handleInputFocus("city")}
                                  onClick={() => handleInputClick("city")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Province</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Enter province"
                                  {...field}
                                  onFocus={() => handleInputFocus("province")}
                                  onClick={() => handleInputClick("province")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Enter country"
                                  {...field}
                                  onFocus={() => handleInputFocus("country")}
                                  onClick={() => handleInputClick("country")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter event category"
                              {...field}
                              onFocus={() => handleInputFocus("category")}
                              onClick={() => handleInputClick("category")}
                            />
                          </FormControl>
                          <FormDescription>
                            The type of event (e.g., Concert, Conference,
                            Workshop)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/10 space-y-6 rounded-lg border p-4">
                      <h3 className="border-b pb-2 text-lg font-medium">
                        Event Images
                      </h3>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="bg-card rounded-lg border p-4">
                            <h4 className="text-md mb-3 font-medium">
                              Event Poster
                            </h4>
                            <p className="text-muted-foreground mb-4 text-sm">
                              This will be the main image displayed for your
                              event. Use a 3:2 aspect ratio (1200×800px) for
                              best results.
                            </p>
                            <DeferredImageUpload
                              onChange={(imageFile) => {
                                setPosterFile(imageFile);
                              }}
                              onRemove={() => {
                                setPosterFile(null);
                                form.setValue("posterUrl", "");
                                form.setValue("posterPublicId", "");
                              }}
                              value={posterFile}
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="bg-card rounded-lg border p-4">
                            <h4 className="text-md mb-3 font-medium">
                              Event Banner
                            </h4>
                            <p className="text-muted-foreground mb-4 text-sm">
                              This will appear at the top of your event page.
                              Recommended size: 1920×640px (3:1 ratio), max 2MB.
                            </p>
                            <DeferredImageUpload
                              onChange={(imageFile) => {
                                setBannerFile(imageFile);
                              }}
                              onRemove={() => {
                                setBannerFile(null);
                                form.setValue("bannerUrl", "");
                                form.setValue("bannerPublicId", "");
                              }}
                              value={bannerFile}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="bg-card rounded-lg border p-4">
                          <h4 className="text-md mb-3 font-medium">
                            Additional Event Images
                          </h4>
                          <p className="text-muted-foreground mb-4 text-sm">
                            Add up to 5 more images to showcase your event. Use
                            square or 3:2 ratio images (1200×800px) for best
                            results, max 2MB each.
                          </p>
                          <DeferredMultiImageUpload
                            onChange={(imageFiles) => {
                              setEventImageFiles(imageFiles);
                            }}
                            onRemove={(index) => {
                              const newImageFiles = [...eventImageFiles];
                              newImageFiles.splice(index, 1);
                              setEventImageFiles(newImageFiles);
                            }}
                            values={eventImageFiles}
                            disabled={isSubmitting}
                            maxImages={5}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        router.push(`/organizer/${params.id}/events`)
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      title=""
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          {isUploading
                            ? `Uploading Images (${Math.round(uploadProgress)}%)`
                            : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save as Draft
                        </>
                      )}
                    </Button>
                    </div>
                  </form>
                </Form>
              </MagicCard>
            </CardContent>
          </Card>
        </div>
      </OrganizerPageWrapper>
    </OrganizerRoute>
  );
}
