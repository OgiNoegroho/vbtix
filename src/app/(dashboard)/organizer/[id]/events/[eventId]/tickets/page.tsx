"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useOrganizerEventDetail,
  useEventTickets,
} from "~/lib/api/hooks/organizer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Plus,
  Ticket,
  Trash,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { formatPrice } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";

export default function EventTicketsPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const router = useRouter();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketFormData, setTicketFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    maxPerPurchase: "10",
    isVisible: true,
    allowTransfer: false,
    ticketFeatures: "",
    perks: "",
    earlyBirdDeadline: "",
    saleStartDate: "",
    saleEndDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Unwrap params with React.use()
  const { id, eventId } = React.use(params);

  // Fetch event details
  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useOrganizerEventDetail(id, eventId);
  const event = eventData?.data;

  // Fetch event tickets
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    error: ticketsError,
    mutate: mutateTickets,
  } = useEventTickets(id, eventId);

  // Type assertion for TypeScript
  const tickets = ticketsData?.data as any[] | undefined;

  // Handle ticket form change
  const handleTicketFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTicketFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Handle create ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      // Validate required fields before processing
      if (!ticketFormData.name.trim()) {
        throw new Error("Ticket name is required");
      }
      if (!ticketFormData.price || isNaN(Number(ticketFormData.price))) {
        throw new Error("Valid price is required");
      }
      if (!ticketFormData.quantity || isNaN(Number(ticketFormData.quantity))) {
        throw new Error("Valid quantity is required");
      }
      if (!ticketFormData.maxPerPurchase || isNaN(Number(ticketFormData.maxPerPurchase))) {
        throw new Error("Valid max per purchase is required");
      }

      // Parse numeric values
      const price = parseFloat(ticketFormData.price);
      const quantity = parseInt(ticketFormData.quantity, 10);
      const maxPerPurchase = parseInt(ticketFormData.maxPerPurchase, 10);

      // Additional validation
      if (price < 0) {
        throw new Error("Price must be a positive number");
      }
      if (quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
      }
      if (maxPerPurchase <= 0) {
        throw new Error("Max per purchase must be a positive integer");
      }
      if (maxPerPurchase > quantity) {
        throw new Error("Max per purchase cannot exceed total quantity");
      }

      // Create the ticket data with proper types
      const ticketData = {
        name: ticketFormData.name.trim(),
        description: ticketFormData.description.trim() || undefined,
        price: price,
        quantity: quantity,
        maxPerPurchase: maxPerPurchase,
        isVisible: ticketFormData.isVisible,
        allowTransfer: ticketFormData.allowTransfer,
        ticketFeatures: ticketFormData.ticketFeatures.trim() || undefined,
        perks: ticketFormData.perks.trim() || undefined,
        earlyBirdDeadline: ticketFormData.earlyBirdDeadline.trim() || undefined,
        saleStartDate: ticketFormData.saleStartDate.trim() || undefined,
        saleEndDate: ticketFormData.saleEndDate.trim() || undefined,
      };

      // Create the ticket first
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_TICKETS(id, eventId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle specific validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((detail: any) => detail.message).join(", ");
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(result.error || "Failed to create ticket");
      }



      // Reset form and close dialog
      setTicketFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
        maxPerPurchase: "10",
        isVisible: true,
        allowTransfer: false,
        ticketFeatures: "",
        perks: "",
        earlyBirdDeadline: "",
        saleStartDate: "",
        saleEndDate: "",
      });

      setIsTicketDialogOpen(false);

      // Refresh tickets data
      mutateTickets();

      // Navigate to the newly created ticket
      if (result.data?.id) {
        router.push(
          `/organizer/${id}/events/${eventId}/tickets/${result.data.id}`,
        );
      }
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setFormError(err.message || "Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit ticket
  const handleEditTicket = (ticketId: string) => {
    router.push(`/organizer/${id}/events/${eventId}/tickets/${ticketId}`);
  };

  // Handle delete ticket
  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;

    try {
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_TICKET_DETAIL(id, eventId, selectedTicketId),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete ticket");
      }

      // Refresh tickets data
      mutateTickets();
    } catch (err: any) {
      console.error("Error deleting ticket:", err);
      alert(err.message || "Failed to delete ticket. Please try again.");
    } finally {
      setSelectedTicketId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (isEventLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col">
          <div className="container flex flex-1 flex-col gap-2 pt-4">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-2xl font-semibold">Event Tickets</h1>
                </div>
              </div>
              <div className="flex items-center justify-center p-8">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col">
          <div className="container flex flex-1 flex-col gap-2 pt-4">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-2xl font-semibold">Event Tickets</h1>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
                <h3 className="mb-2 text-lg font-semibold">
                  Error loading event
                </h3>
                <p className="text-muted-foreground text-sm">
                  {eventError?.message ||
                    "Failed to load event details. Please try again."}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => router.refresh()}>
                    Try Again
                  </Button>
                  <Button onClick={() => router.push("/organizer/events")}>
                    Back to Events
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">
        <div className="container flex flex-1 flex-col gap-2 pt-4">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold">
                      Ticket Management
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      {event?.title}
                    </p>
                  </div>
                </div>
                <Dialog
                  open={isTicketDialogOpen}
                  onOpenChange={setIsTicketDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Ticket Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Create New Ticket Type</DialogTitle>
                      <DialogDescription>
                        Create a ticket category that defines pricing,
                        availability, and features. Individual tickets will be
                        generated when buyers make purchases.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTicket}>
                      {formError && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                          {formError}
                        </div>
                      )}
                      <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-2">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Basic Information
                          </h3>

                          <div className="grid gap-2">
                            <Label htmlFor="name">Ticket Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={ticketFormData.name}
                              onChange={handleTicketFormChange}
                              required
                            />
                            <p className="text-muted-foreground text-xs">
                              The name of this ticket type (e.g., VIP, Early
                              Bird, General Admission)
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={ticketFormData.description}
                              onChange={handleTicketFormChange}
                              rows={3}
                            />
                            <p className="text-muted-foreground text-xs">
                              Describe what's included with this ticket type,
                              special perks, or any restrictions
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="price">Price</Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="1"
                                value={ticketFormData.price}
                                onChange={handleTicketFormChange}
                                required
                                placeholder="0"
                              />
                              <p className="text-muted-foreground text-xs">
                                Price in Indonesian Rupiah (IDR)
                                {ticketFormData.price &&
                                  !isNaN(Number(ticketFormData.price)) && (
                                    <span className="block font-medium text-blue-600">
                                      Preview:{" "}
                                      {formatPrice(
                                        Number(ticketFormData.price),
                                      )}
                                    </span>
                                  )}
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                value={ticketFormData.quantity}
                                onChange={handleTicketFormChange}
                                required
                              />
                              <p className="text-muted-foreground text-xs">
                                Total number of tickets available for sale
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="maxPerPurchase">
                                Max Per Purchase
                              </Label>
                              <Input
                                id="maxPerPurchase"
                                name="maxPerPurchase"
                                type="number"
                                min="1"
                                value={ticketFormData.maxPerPurchase}
                                onChange={handleTicketFormChange}
                                required
                              />
                              <p className="text-muted-foreground text-xs">
                                Maximum number of tickets a buyer can purchase
                                in a single transaction
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Features & Perks Section */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Features & Perks
                          </h3>

                          <div className="grid gap-2">
                            <Label htmlFor="ticketFeatures">
                              Ticket Features
                            </Label>
                            <Input
                              id="ticketFeatures"
                              name="ticketFeatures"
                              value={ticketFormData.ticketFeatures}
                              onChange={handleTicketFormChange}
                            />
                            <p className="text-muted-foreground text-xs">
                              A comma-separated list of features included with
                              this ticket (e.g., "Reserved Seating, Merchandise,
                              Early Entry")
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="perks">Perks Description</Label>
                            <Textarea
                              id="perks"
                              name="perks"
                              value={ticketFormData.perks}
                              onChange={handleTicketFormChange}
                              rows={2}
                            />
                            <p className="text-muted-foreground text-xs">
                              Detailed description of special perks or benefits
                              included with this ticket type
                            </p>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Sale Period Section */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Sale Period</h3>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="saleStartDate">
                                Sale Start Date
                              </Label>
                              <Input
                                id="saleStartDate"
                                name="saleStartDate"
                                type="datetime-local"
                                value={ticketFormData.saleStartDate}
                                onChange={handleTicketFormChange}
                              />
                              <p className="text-muted-foreground text-xs">
                                When this ticket type will become available for
                                purchase
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="saleEndDate">Sale End Date</Label>
                              <Input
                                id="saleEndDate"
                                name="saleEndDate"
                                type="datetime-local"
                                value={ticketFormData.saleEndDate}
                                onChange={handleTicketFormChange}
                              />
                              <p className="text-muted-foreground text-xs">
                                When this ticket type will no longer be
                                available for purchase
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="earlyBirdDeadline">
                              Early Bird Deadline
                            </Label>
                            <Input
                              id="earlyBirdDeadline"
                              name="earlyBirdDeadline"
                              type="datetime-local"
                              value={ticketFormData.earlyBirdDeadline}
                              onChange={handleTicketFormChange}
                            />
                            <p className="text-muted-foreground text-xs">
                              If this is an early bird ticket, when the special
                              pricing ends
                            </p>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Visibility & Transfer Options */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Visibility & Transfer Options
                          </h3>

                          <div className="flex items-start space-x-2">
                            <div className="pt-1">
                              <Checkbox
                                id="isVisible"
                                checked={ticketFormData.isVisible}
                                onCheckedChange={(checked) =>
                                  setTicketFormData((prev) => ({
                                    ...prev,
                                    isVisible: checked === true,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="isVisible">
                                Visible to buyers
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                When checked, this ticket type will be visible
                                on the public event page. Uncheck to hide it
                                temporarily.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <div className="pt-1">
                              <Checkbox
                                id="allowTransfer"
                                checked={ticketFormData.allowTransfer}
                                onCheckedChange={(checked) =>
                                  setTicketFormData((prev) => ({
                                    ...prev,
                                    allowTransfer: checked === true,
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="allowTransfer">
                                Allow ticket transfer
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                When checked, buyers can transfer their tickets
                                to other users. Useful for group purchases.
                              </p>
                            </div>
                          </div>
                        </div>


                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsTicketDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Creating..." : "Create Ticket Type"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mb-4 px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Understanding Tickets</CardTitle>
                  <CardDescription>
                    How ticket types and individual tickets work in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Ticket Types vs. Individual Tickets
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        In this system, there are two related but distinct
                        concepts:
                      </p>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                        <li>
                          <span className="font-medium">Ticket Types</span>:
                          These are the categories or classes of tickets you
                          create for your event (e.g., VIP, General Admission,
                          Early Bird). Each type has its own price, quantity,
                          and features. This is what you're managing on this
                          page.
                        </li>
                        <li>
                          <span className="font-medium">
                            Individual Tickets
                          </span>
                          : When a buyer purchases a ticket, an individual
                          ticket record is created based on the ticket type.
                          Each ticket has a unique QR code and belongs to a
                          specific user. These are generated automatically
                          during purchase.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Workflow</h3>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                        <li>
                          You create ticket types for your event (this page)
                        </li>
                        <li>Buyers purchase tickets of a specific type</li>
                        <li>
                          Individual tickets are generated for each purchase
                        </li>
                        <li>
                          Buyers receive their tickets with unique QR codes
                        </li>
                        <li>
                          The system tracks inventory by reducing available
                          quantity
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Types</CardTitle>
                  <CardDescription>
                    Manage ticket types for {event?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTicketsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    </div>
                  ) : ticketsError ? (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                      Error loading tickets: {ticketsError.message}
                    </div>
                  ) : !tickets || tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <Ticket className="text-muted-foreground mb-2 h-8 w-8" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No ticket types yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        You haven't created any ticket types for this event yet.
                        Ticket types define the categories of tickets available
                        for purchase.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsTicketDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Ticket Type
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Sold</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tickets.map((ticket: any) => (
                            <TableRow key={ticket.id}>
                              <TableCell className="font-medium">
                                {ticket.name}
                                {ticket.description && (
                                  <p className="text-muted-foreground text-xs">
                                    {ticket.description}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>{formatPrice(ticket.price)}</TableCell>
                              <TableCell>{ticket.quantity}</TableCell>
                              <TableCell>{ticket.sold || 0}</TableCell>
                              <TableCell>
                                {ticket.quantity - (ticket.sold || 0)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditTicket(ticket.id)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Ticket
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog
                                      open={
                                        isDeleteDialogOpen &&
                                        selectedTicketId === ticket.id
                                      }
                                      onOpenChange={(open: boolean) => {
                                        setIsDeleteDialogOpen(open);
                                        if (!open) setSelectedTicketId(null);
                                      }}
                                    >
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() =>
                                            setSelectedTicketId(ticket.id)
                                          }
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Delete Ticket
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Are you sure?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete the ticket
                                            type and remove it from our servers.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={handleDeleteTicket}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
