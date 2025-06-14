"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { OrganizerPageWrapper } from "~/components/dashboard/organizer/organizer-page-wrapper";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "~/lib/utils";
import { useOrganizerQRGeneration } from "~/lib/api/hooks/qr-code";

interface Order {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  details?: any;
  createdAt: string;
  formattedCreatedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  event: {
    id: string;
    title: string;
    startDate?: string;
    formattedStartDate?: string;
    venue?: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price?: number;
    subtotal?: number;
    ticketType: {
      id: string;
      name: string;
      price?: number;
    };
  }>;
  buyerInfo?: {
    fullName: string;
    email: string;
    whatsapp: string;
  };
}

export default function OrganizerOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const organizerId = params.id as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus | "ALL" | "MANUAL_PENDING">("MANUAL_PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [generatingQROrderId, setGeneratingQROrderId] = useState<string | null>(null);

  const { generateOrderQRCodes } = useOrganizerQRGeneration();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(currentStatus !== "ALL" && { status: currentStatus }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/organizer/${organizerId}/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setTotalPages(result.meta?.totalPages || 1);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };





  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, currentStatus, searchTerm]);

  // Verify manual payment (approve/reject)
  const verifyManualPayment = async (orderId: string, status: PaymentStatus, notes?: string) => {
    try {
      setProcessingOrderId(orderId);

      const response = await fetch(`/api/organizer/${organizerId}/orders/${orderId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchOrders(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to verify payment");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Failed to verify payment");
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Generate QR codes for an order
  const generateQRCodes = async (orderId: string) => {
    try {
      setGeneratingQROrderId(orderId);

      const result = await generateOrderQRCodes(organizerId, orderId);

      if (result.success) {
        toast.success(`Successfully generated ${result.data.generatedCount} QR codes`);
        fetchOrders(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to generate QR codes");
      }
    } catch (error) {
      console.error("Error generating QR codes:", error);
      toast.error("Failed to generate QR codes");
    } finally {
      setGeneratingQROrderId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: PaymentStatus, paymentMethod?: string, details?: any) => {
    if (status === PaymentStatus.PENDING && paymentMethod === "MANUAL_PAYMENT" && details?.awaitingVerification) {
      return <Badge className="bg-orange-500">Menunggu Konfirmasi</Badge>;
    }

    switch (status) {
      case PaymentStatus.PENDING:
        return <Badge variant="outline">Menunggu Pembayaran</Badge>;
      case PaymentStatus.SUCCESS:
        return <Badge className="bg-green-600">Lunas</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="destructive">Gagal</Badge>;
      case PaymentStatus.EXPIRED:
        return <Badge variant="secondary">Kadaluarsa</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge className="bg-blue-500">Dikembalikan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <OrganizerRoute>
      <OrganizerPageWrapper>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Kelola Pesanan</h1>
              <p className="text-muted-foreground">
                Kelola pesanan tiket dan konfirmasi pembayaran manual
              </p>
            </div>
            <Button
              onClick={() => router.push(`/organizer/${organizerId}/orders/create`)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Pesanan
            </Button>
          </div>

          <Tabs value={currentStatus} onValueChange={(value) => setCurrentStatus(value as PaymentStatus | "ALL" | "MANUAL_PENDING")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="MANUAL_PENDING" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Konfirmasi Manual
              </TabsTrigger>
              <TabsTrigger value="PENDING">Menunggu Pembayaran</TabsTrigger>
              <TabsTrigger value="SUCCESS">Lunas</TabsTrigger>
              <TabsTrigger value="FAILED">Gagal</TabsTrigger>
              <TabsTrigger value="EXPIRED">Kadaluarsa</TabsTrigger>
            </TabsList>

            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                  <Input
                    placeholder="Cari berdasarkan invoice, nama, atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <TabsContent value={currentStatus}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="mb-2 text-lg font-semibold">Tidak ada pesanan</h3>
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "Tidak ada pesanan yang sesuai dengan pencarian."
                          : "Belum ada pesanan dengan status ini."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">
                                #{order.invoiceNumber}
                              </h3>
                              {getStatusBadge(order.status, order.paymentMethod, order.details)}
                            </div>
                            <div className="grid gap-2 text-sm md:grid-cols-2">
                              <p>
                                <span className="font-medium">Pelanggan:</span>{" "}
                                {order.buyerInfo?.fullName || order.user.name} ({order.buyerInfo?.email || order.user.email})
                              </p>
                              <p>
                                <span className="font-medium">Event:</span>{" "}
                                {order.event.title}
                              </p>
                              <p>
                                <span className="font-medium">Tanggal Pesanan:</span>{" "}
                                {order.formattedCreatedAt || formatDate(order.createdAt)}
                              </p>
                              <p>
                                <span className="font-medium">Metode Pembayaran:</span>{" "}
                                {order.paymentMethod === "MANUAL_PAYMENT" ? "Pembayaran Manual" : order.paymentMethod}
                              </p>
                              <p>
                                <span className="font-medium">Total:</span>{" "}
                                <span className="font-semibold text-blue-600">
                                  {formatPrice(order.amount)}
                                </span>
                              </p>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-1">
                              <p className="font-medium text-sm">Tiket:</p>
                              {order.orderItems.map((item) => (
                                <p key={item.id} className="text-sm text-muted-foreground">
                                  {item.ticketType.name} x {item.quantity} = {formatPrice(item.subtotal || (item.ticketType.price || 0) * item.quantity)}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {currentStatus === "MANUAL_PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => verifyManualPayment(order.id, "SUCCESS")}
                                  disabled={processingOrderId === order.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {processingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  <span className="ml-2">Setujui</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => verifyManualPayment(order.id, "FAILED", "Manual payment rejected by organizer")}
                                  disabled={processingOrderId === order.id}
                                >
                                  {processingOrderId === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  <span className="ml-2">Tolak</span>
                                </Button>
                              </>
                            )}
                            {order.status === "SUCCESS" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateQRCodes(order.id)}
                                disabled={generatingQROrderId === order.id}
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                {generatingQROrderId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <QrCode className="h-4 w-4" />
                                )}
                                <span className="ml-2">Generate QR</span>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/organizer/${organizerId}/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Detail
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </OrganizerPageWrapper>
    </OrganizerRoute>
  );
}
