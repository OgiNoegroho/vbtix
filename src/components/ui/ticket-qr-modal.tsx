"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { QRCodeDisplay } from "~/components/ui/qr-code-display";
import { useTicketQRCode } from "~/lib/api/hooks/qr-code";
import {
  User,
  Calendar,
  MapPin,
  Ticket,
  Mail,
  Phone,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatPrice } from "~/lib/utils";
import { cn } from "~/lib/utils";

export interface TicketQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  organizerId: string;
}

export function TicketQRModal({
  isOpen,
  onClose,
  ticket,
  organizerId,
}: TicketQRModalProps) {
  const { qrCode, isLoading, error, refresh } = useTicketQRCode(ticket?.id);
  const [activeTab, setActiveTab] = useState<"qr" | "details">("qr");

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("qr");
    }
  }, [isOpen]);

  if (!ticket) return null;

  const statusConfig = {
    ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    USED: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
    CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
    EXPIRED: { color: "bg-red-100 text-red-800", icon: XCircle },
    REFUNDED: { color: "bg-yellow-100 text-yellow-800", icon: RefreshCw },
  };

  const status = statusConfig[ticket.status as keyof typeof statusConfig];

  const handleDownloadQR = () => {
    if (qrCode?.qrCodeImageUrl) {
      const link = document.createElement("a");
      link.href = qrCode.qrCodeImageUrl;
      link.download = `ticket-${ticket.id.slice(-8)}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Ticket Details & QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("qr")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                activeTab === "qr"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              QR Code
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                activeTab === "details"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Ticket Details
            </button>
          </div>

          {/* QR Code Tab */}
          {activeTab === "qr" && (
            <div className="space-y-4">
              {/* Ticket Header Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{ticket.event?.title}</h3>
                  <Badge variant="secondary" className={status.color}>
                    <status.icon className="w-3 h-3 mr-1" />
                    {ticket.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{ticket.attendee?.name || ticket.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    <span>{ticket.ticketType?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{ticket.event?.startDate && formatDate(ticket.event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>{formatPrice(ticket.ticketType?.price || 0)}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="flex justify-center">
                <QRCodeDisplay
                  ticketId={ticket.id}
                  qrCodeImageUrl={qrCode?.qrCodeImageUrl}
                  status={qrCode?.qrCodeStatus || ticket.qrCodeStatus || "PENDING"}
                  isLoading={isLoading}
                  error={error}
                  onRefresh={refresh}
                  onDownload={handleDownloadQR}
                  size="lg"
                />
              </div>

              {/* Check-in Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ticket.checkedIn ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Checked In</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Not Checked In</span>
                      </>
                    )}
                  </div>
                  {ticket.checkedIn && ticket.checkInTime && (
                    <span className="text-sm text-gray-600">
                      {formatDate(ticket.checkInTime)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  disabled={!qrCode?.qrCodeImageUrl}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  onClick={refresh}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Event Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Event Title</label>
                    <p className="text-sm">{ticket.event?.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Start Date</label>
                      <p className="text-sm">{ticket.event?.startDate && formatDate(ticket.event.startDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">End Date</label>
                      <p className="text-sm">{ticket.event?.endDate && formatDate(ticket.event.endDate)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ticket.event?.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Ticket Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ticket ID</label>
                      <p className="text-sm font-mono">{ticket.id.slice(-8)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ticket Type</label>
                      <p className="text-sm">{ticket.ticketType?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Price</label>
                      <p className="text-sm font-semibold">{formatPrice(ticket.ticketType?.price || 0)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge variant="secondary" className={status.color}>
                        <status.icon className="w-3 h-3 mr-1" />
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                      <p className="text-sm">{formatDate(ticket.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">QR Status</label>
                      <p className="text-sm">{ticket.qrCodeStatus || "PENDING"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendee Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Attendee Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm">{ticket.attendee?.name || ticket.user?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {ticket.attendee?.email || ticket.user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {ticket.attendee?.phone || ticket.user?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
