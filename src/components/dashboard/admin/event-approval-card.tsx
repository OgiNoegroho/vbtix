"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { MagicTextarea, MagicButton, MagicCard } from "~/components/ui/magic-card";
import {
  CalendarDays,
  MapPin,
  User,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { formatDate } from "~/lib/utils";
import Link from "next/link";

interface EventApprovalCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    venue: string;
    city: string;
    province: string;
    startDate: string;
    status: string;
    organizer: {
      orgName: string;
      user: {
        name: string;
        email: string;
      };
    };
  };
  onApprove: (eventId: string, feedback?: string) => Promise<void>;
  onReject: (eventId: string, feedback?: string) => Promise<void>;
}

export function EventApprovalCard({ 
  event, 
  onApprove, 
  onReject 
}: EventApprovalCardProps) {
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await onApprove(event.id, feedback);
      setFeedback("");
      setShowActions(false);
    } catch (error) {
      console.error("Error approving event:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await onReject(event.id, feedback);
      setFeedback("");
      setShowActions(false);
    } catch (error) {
      console.error("Error rejecting event:", error);
    } finally {
      setIsProcessing(false);
    }
  };

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
      default:
        return status;
    }
  };

  return (
    <MagicCard className="transition-all bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{event.organizer.orgName}</span>
            </div>
          </div>
          <Badge variant={getStatusColor(event.status) as any}>
            {getStatusText(event.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.venue}, {event.city}, {event.province}</span>
          </div>
        </div>

        {/* Status Indicators */}
        {event.status === "PENDING_REVIEW" && (
          <div className="mt-4 space-y-3 rounded-md bg-amber-50 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Membutuhkan Review
              </span>
            </div>
            
            {!showActions ? (
              <MagicButton
                variant="outline"
                size="sm"
                onClick={() => setShowActions(true)}
                className="w-full"
              >
                Review Event
              </MagicButton>
            ) : (
              <div className="space-y-3">
                <MagicTextarea
                  placeholder="Feedback untuk organizer (opsional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <MagicButton
                    size="sm"
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Setujui
                  </MagicButton>
                  <MagicButton
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Tolak
                  </MagicButton>
                </div>
                <MagicButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowActions(false);
                    setFeedback("");
                  }}
                  className="w-full"
                >
                  Batal
                </MagicButton>
              </div>
            )}
          </div>
        )}

        {/* Approved Status */}
        {event.status === "PUBLISHED" && (
          <div className="mt-4 space-y-2 rounded-md bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Event Disetujui
              </span>
            </div>
            <p className="text-xs text-green-700">
              Event telah dipublikasikan dan dapat dilihat oleh publik
            </p>
          </div>
        )}

        {/* Rejected Status */}
        {event.status === "REJECTED" && (
          <div className="mt-4 space-y-2 rounded-md bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Event Ditolak
              </span>
            </div>
            <p className="text-xs text-red-700">
              Event tidak memenuhi kriteria dan telah ditolak
            </p>
          </div>
        )}
      </CardContent>

      <div className="p-6 pt-0">
        <MagicButton variant="outline" className="w-full" asChild>
          <Link href={`/admin/events/${event.id}`}>
            Lihat Detail
          </Link>
        </MagicButton>
      </div>
    </MagicCard>
  );
}
