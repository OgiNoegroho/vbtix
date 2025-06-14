"use client";

import { useState } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { QRCodeDisplayCompact } from "~/components/ui/qr-code-display";
import { TicketQRModal } from "~/components/ui/ticket-qr-modal";
import { useOrganizerSoldTickets } from "~/lib/api/hooks/organizer-tickets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  QrCode,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { formatDate, formatPrice } from "~/lib/utils";
import { cn } from "~/lib/utils";

interface RecentTicketsQRProps {
  organizerId: string;
}

export function RecentTicketsQR({ organizerId }: RecentTicketsQRProps) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Get recent tickets (limit to 5)
  const { data, isLoading, error } = useOrganizerSoldTickets(organizerId, {
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleViewQRCode = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      USED: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
      EXPIRED: { color: "bg-red-100 text-red-800", icon: XCircle },
      REFUNDED: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    };
    return configs[status as keyof typeof configs] || configs.ACTIVE;
  };

  if (isLoading) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Recent Tickets & QR Codes
          </CardTitle>
          <CardDescription>
            Latest ticket sales with QR code status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </MagicCard>
    );
  }

  if (error || !data?.data?.length) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Recent Tickets & QR Codes
          </CardTitle>
          <CardDescription>
            Latest ticket sales with QR code status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <QrCode className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-500">No recent tickets found</p>
          </div>
        </CardContent>
      </MagicCard>
    );
  }

  const tickets = data.data;

  return (
    <>
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Recent Tickets & QR Codes
          </CardTitle>
          <CardDescription>
            Latest ticket sales with QR code status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.map((ticket: any) => {
              const statusConfig = getStatusConfig(ticket.status);
              return (
                <div
                  key={ticket.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* QR Code Display */}
                  <QRCodeDisplayCompact
                    ticketId={ticket.id}
                    qrCodeImageUrl={ticket.qrCodeImageUrl}
                    status={ticket.qrCodeStatus || "PENDING"}
                    onClick={() => handleViewQRCode(ticket)}
                  />

                  {/* Ticket Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {ticket.event?.title}
                      </p>
                      <Badge variant="secondary" className={cn("text-xs", statusConfig.color)}>
                        <statusConfig.icon className="w-3 h-3 mr-1" />
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.attendee?.name || ticket.user?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPrice(ticket.ticketType?.price || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.ticketType?.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewQRCode(ticket)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              View All Tickets
            </Button>
          </div>
        </CardContent>
      </MagicCard>

      {/* QR Code Modal */}
      <TicketQRModal
        isOpen={isQRModalOpen}
        onClose={handleCloseQRModal}
        ticket={selectedTicket}
        organizerId={organizerId}
      />
    </>
  );
}
