"use client";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Calendar,
  MapPin,
  Tag,
  User,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Shield,
  UserCheck,
} from "lucide-react";
import { formatDate } from "~/lib/utils";
import Link from "next/link";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    venue: string;
    city?: string;
    province: string;
    startDate: string;
    status: string;
    category?: string;
    posterUrl?: string;
    createdAt?: string;
    organizer?: {
      orgName: string;
      verified: boolean;
      user?: {
        name: string;
        id: string;
      };
    };
    _count?: {
      ticketTypes: number;
      transactions: number;
    };
  };
  onStatusUpdate?: () => void;
  currentUserId?: string; // To determine if event was created by current admin
}

export function AdminEventCard({ event, currentUserId }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "warning";
      case "PUBLISHED":
        return "success";
      case "REJECTED":
        return "destructive";
      case "DRAFT":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Menunggu Review";
      case "PUBLISHED":
        return "Disetujui";
      case "REJECTED":
        return "Ditolak";
      case "DRAFT":
        return "Draft";
      case "COMPLETED":
        return "Selesai";
      case "CANCELLED":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return <Clock className="h-3 w-3" />;
      case "PUBLISHED":
        return <CheckCircle className="h-3 w-3" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3" />;
      case "DRAFT":
        return <Eye className="h-3 w-3" />;
      case "COMPLETED":
        return <CheckCircle className="h-3 w-3" />;
      case "CANCELLED":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Determine if this event was created by an admin or submitted by organizer
  const isOrganizerSubmitted = event.organizer?.user?.id !== currentUserId;
  const isPendingApproval = event.status === "PENDING_REVIEW";

  // Determine what actions are available
  const canEdit = !isOrganizerSubmitted || !isPendingApproval;
  const needsApproval = isOrganizerSubmitted && isPendingApproval;
  return (
    <MagicCard 
      className="p-6 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border-gray-200/50 transition-all hover:shadow-md"
      gradientColor="rgba(59, 130, 246, 0.05)"
    >
      <div className="space-y-4">
        {/* Header with status and origin badges */}
        <div className="relative">
          <div className="absolute top-0 right-0 flex flex-col gap-1">
            <Badge variant={getStatusColor(event.status) as any} className="flex items-center gap-1">
              {getStatusIcon(event.status)}
              {getStatusText(event.status)}
            </Badge>
            {/* Event origin indicator */}
            {isOrganizerSubmitted ? (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <UserCheck className="h-2 w-2" />
                Organizer
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Shield className="h-2 w-2" />
                Admin
              </Badge>
            )}
          </div>

          {event.posterUrl && (
            <div className="mb-4 aspect-video w-full overflow-hidden rounded-md bg-muted">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h3 className="text-lg font-semibold line-clamp-2 pr-20">{event.title}</h3>

          {event.organizer && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <User className="h-4 w-4" />
              <span>{event.organizer.orgName}</span>
              {event.organizer.verified && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">
                {event.venue}
                {event.city && `, ${event.city}`}
                {event.province && `, ${event.province}`}
              </span>
            </div>

            {event.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>{event.category}</span>
              </div>
            )}
          </div>

          {/* Statistics */}
          {event._count && (
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-3">
              <span>{event._count.ticketTypes} tipe tiket</span>
              <span>{event._count.transactions} transaksi</span>
            </div>
          )}

          {/* Special indicators for pending events */}
          {needsApproval && (
            <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">Membutuhkan review admin</span>
              </div>
            </div>
          )}

          {/* Admin-created event indicator */}
          {!isOrganizerSubmitted && (
            <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="font-medium">Event dibuat oleh admin</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 pt-2">
          {needsApproval ? (
            <Button variant="outline" className="flex-1 hover:bg-green-50 hover:border-green-200 transition-colors" asChild>
              <Link href={`/admin/approval`}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Review Event
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1 hover:bg-blue-50 hover:border-blue-200 transition-colors" asChild>
                <Link href={`/admin/events/${event.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </Button>
              {canEdit && (
                <Button variant="outline" size="sm" className="hover:bg-gray-50 hover:border-gray-200 transition-colors" asChild>
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </MagicCard>
  );
}
