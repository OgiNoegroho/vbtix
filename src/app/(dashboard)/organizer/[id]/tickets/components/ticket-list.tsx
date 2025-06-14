"use client";

import { useState, useMemo } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useOrganizerSoldTickets } from "~/lib/api/hooks/organizer-tickets";
import { QRCodeDisplayCompact } from "~/components/ui/qr-code-display";
import { TicketQRModal } from "~/components/ui/ticket-qr-modal";
import { formatPrice } from "~/lib/utils";
import {
  MoreHorizontalIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  TicketIcon,
  AlertCircleIcon,
  QrCode,
} from "lucide-react";

interface TicketListProps {
  organizerId: string;
  filters: any;
}

export function TicketList({ organizerId, filters }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Combine filters with search term directly
  const currentFilters = useMemo(() => ({
    ...filters,
    search: searchTerm
  }), [filters, searchTerm]);

  const { data, isLoading, error, refetch } = useOrganizerSoldTickets(
    organizerId,
    currentFilters
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleViewQRCode = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "used":
        return <Badge className="bg-blue-100 text-blue-800">Used</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "refunded":
        return <Badge className="bg-yellow-100 text-yellow-800">Refunded</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Sold Tickets</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </MagicCard>
    );
  }

  if (error) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <AlertCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Tickets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </MagicCard>
    );
  }

  const tickets = data?.data || [];
  const meta = data?.meta;

  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Sold Tickets</h3>
            {meta && (
              <Badge variant="secondary">
                {meta.totalCount} total
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || Object.keys(filters).length > 0
                ? "No tickets match your current filters."
                : "No tickets have been sold yet."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: any) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.event?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.event?.startDate && formatDate(ticket.event.startDate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.attendee?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.attendee?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ticket.ticketType?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(ticket.ticketType?.price || 0)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      <QRCodeDisplayCompact
                        ticketId={ticket.id}
                        qrCodeImageUrl={ticket.qrCodeImageUrl}
                        status={ticket.qrCodeStatus || "PENDING"}
                        onClick={() => handleViewQRCode(ticket)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell>
                      {ticket.checkedIn ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {ticket.checkInTime && formatDate(ticket.checkInTime)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircleIcon className="h-4 w-4" />
                          <span className="text-sm">Not checked in</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewQRCode(ticket)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </DropdownMenuItem>
                          {!ticket.checkedIn && ticket.status === "ACTIVE" && (
                            <DropdownMenuItem>
                              <CheckCircleIcon className="mr-2 h-4 w-4" />
                              Check In
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download E-ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {((meta.page - 1) * meta.limit) + 1} to{" "}
              {Math.min(meta.page * meta.limit, meta.totalCount)} of{" "}
              {meta.totalCount} tickets
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <TicketQRModal
        isOpen={isQRModalOpen}
        onClose={handleCloseQRModal}
        ticket={selectedTicket}
        organizerId={organizerId}
      />
    </MagicCard>
  );
}
