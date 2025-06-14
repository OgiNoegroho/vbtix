"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Textarea } from "~/components/ui/textarea";
import { MagicTextarea, MagicButton, MagicCard } from "~/components/ui/magic-card";
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
  Check,
  X,
  Calendar,
  MapPin,
  Users,
  Tag,
  DollarSign,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  formattedStartDate: string;
  formattedEndDate: string;
  formattedCreatedAt: string;
  venue: string;
  city: string;
  province: string;
  category: string;
  tags: string[];
  posterUrl?: string;
  maxAttendees?: number;
  status: string; // Add status field to track approval status
  ticketPrice: {
    min: number;
    max: number;
  };
  ticketsAvailable: number;
  totalOrders: number;
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
  ticketTypes: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    sold: number;
  }>;
}

interface AdminEventApprovalListProps {
  events: PendingEvent[];
  onApprove: (eventId: string, notes?: string) => Promise<void>;
  onReject: (eventId: string, notes?: string) => Promise<void>;
  onViewDetails: (eventId: string) => void;
  isLoading?: boolean;
}

export function AdminEventApprovalList({
  events,
  onApprove,
  onReject,
  onViewDetails,
  isLoading = false,
}: AdminEventApprovalListProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);

  // Status helper functions
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "secondary" as const;
      case "PUBLISHED":
        return "default" as const; // Green for approved
      case "REJECTED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Pending Review";
      case "PUBLISHED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleApprove = async (eventId: string) => {
    try {
      setProcessingEventId(eventId);
      await onApprove(eventId, approvalNotes);
      setApprovalNotes("");
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error approving event:", error);
    } finally {
      setProcessingEventId(null);
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      setProcessingEventId(eventId);
      await onReject(eventId, rejectionNotes);
      setRejectionNotes("");
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error rejecting event:", error);
    } finally {
      setProcessingEventId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceRange = (event: PendingEvent) => {
    if (event.ticketPrice.min === event.ticketPrice.max) {
      return formatCurrency(event.ticketPrice.min);
    }
    return `${formatCurrency(event.ticketPrice.min)} - ${formatCurrency(event.ticketPrice.max)}`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Tidak Ada Event Pending</h3>
          <p className="text-muted-foreground text-center">
            Semua event telah diproses atau belum ada pengajuan baru dari organizer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <MagicCard key={event.id} className="overflow-hidden bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50 p-0">
          {/* Event Poster */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10">
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <Badge
              className="absolute top-2 right-2"
              variant={getStatusVariant(event.status)}
            >
              {getStatusText(event.status)}
            </Badge>
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {event.description}
                </CardDescription>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={event.organizer.user.image} />
                <AvatarFallback>
                  {event.organizer.orgName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {event.organizer.orgName}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {event.organizer.user.name}
                  </p>
                  {event.organizer.verified && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Event Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{event.formattedStartDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">
                  {event.venue}, {event.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{getPriceRange(event)}</span>
              </div>
              {event.maxAttendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.maxAttendees.toLocaleString()} peserta</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Diajukan{" "}
                  {formatDistanceToNow(new Date(event.formattedCreatedAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </span>
              </div>
            </div>

            {/* Ticket Types */}
            {event.ticketTypes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Tipe Tiket:
                </p>
                <div className="space-y-1">
                  {event.ticketTypes.slice(0, 2).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex justify-between text-xs bg-muted/50 p-2 rounded"
                    >
                      <span>{ticket.name}</span>
                      <span>{formatCurrency(Number(ticket.price))}</span>
                    </div>
                  ))}
                  {event.ticketTypes.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{event.ticketTypes.length - 2} tipe lainnya
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <div className="flex flex-col gap-2 pt-0 p-6">
            {/* View Details Button */}
            <MagicButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewDetails(event.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Lihat Detail
            </MagicButton>

            {/* Action Buttons - Only show for pending events */}
            {event.status === "PENDING_REVIEW" && (
              <div className="flex gap-2 w-full">
                {/* Approve Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <MagicButton
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={processingEventId === event.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Setujui
                    </MagicButton>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Setujui Event</DialogTitle>
                    <DialogDescription>
                      Apakah Anda yakin ingin menyetujui event "{event.title}"?
                      Event akan dipublikasikan dan dapat dilihat oleh publik.
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <label className="text-sm font-medium">
                      Catatan untuk organizer (opsional)
                    </label>
                    <MagicTextarea
                      placeholder="Tambahkan catatan atau feedback untuk organizer..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <MagicButton variant="outline">Batal</MagicButton>
                    </DialogTrigger>
                    <MagicButton
                      onClick={() => handleApprove(event.id)}
                      disabled={processingEventId === event.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingEventId === event.id ? "Memproses..." : "Setujui Event"}
                    </MagicButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Reject Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <MagicButton
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={processingEventId === event.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Tolak
                  </MagicButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tolak Event</DialogTitle>
                    <DialogDescription>
                      Apakah Anda yakin ingin menolak event "{event.title}"?
                      Organizer akan mendapat notifikasi tentang penolakan ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div>
                    <label className="text-sm font-medium">
                      Alasan penolakan <span className="text-red-500">*</span>
                    </label>
                    <MagicTextarea
                      placeholder="Jelaskan alasan penolakan untuk membantu organizer..."
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <MagicButton variant="outline">Batal</MagicButton>
                    </DialogTrigger>
                    <MagicButton
                      variant="destructive"
                      onClick={() => handleReject(event.id)}
                      disabled={!rejectionNotes.trim() || processingEventId === event.id}
                    >
                      {processingEventId === event.id ? "Memproses..." : "Tolak Event"}
                    </MagicButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            )}
          </div>
        </MagicCard>
      ))}
    </div>
  );
}
