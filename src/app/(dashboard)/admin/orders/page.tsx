"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Loader2, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import { formatPrice } from "~/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  id: string;
  invoiceNumber: string;
  status: PaymentStatus;
  paymentMethod: string;
  amount: number;
  currency: string;
  details?: any;
  createdAt: string;
  formattedCreatedAt: string;
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
    organizer: {
      id: string;
      orgName: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    subtotal: number;
    ticketType: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string>("MANUAL_PENDING");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [currentStatus, searchTerm]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentStatus !== "all") {
        params.append("status", currentStatus);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      params.append("limit", "20");

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      setError("Gagal memuat daftar pesanan");
      toast.error("Gagal memuat daftar pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status (approve/reject manual payment)
  const updateOrderStatus = async (orderId: string, status: PaymentStatus, notes?: string) => {
    try {
      setProcessingOrderId(orderId);

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          status === "SUCCESS"
            ? "Manual payment approved! Tickets generated for customer."
            : "Manual payment rejected."
        );
        fetchOrders(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getStatusBadge = (status: PaymentStatus, paymentMethod?: string, details?: any) => {
    if (status === "PENDING" && paymentMethod === "MANUAL_PAYMENT" && details?.awaitingVerification) {
      return <Badge className="bg-orange-500">Menunggu Konfirmasi</Badge>;
    }

    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500">Menunggu Pembayaran</Badge>;
      case "SUCCESS":
        return <Badge className="bg-green-500">Lunas</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500">Gagal</Badge>;
      case "EXPIRED":
        return <Badge className="bg-gray-500">Kadaluarsa</Badge>;
      case "REFUNDED":
        return <Badge className="bg-blue-500">Dikembalikan</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manajemen Pesanan</h1>
        <Badge variant="secondary">{orders.length} pesanan</Badge>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive mb-6 rounded-md p-4">
          {error}
        </div>
      )}

      <Tabs value={currentStatus} onValueChange={setCurrentStatus} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="MANUAL_PENDING" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Menunggu Konfirmasi
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
                placeholder="Cari berdasarkan nomor pesanan, nama, email, atau event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <TabsContent value={currentStatus}>
          {isLoading ? (
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
                            {order.user.name} ({order.user.email})
                          </p>
                          <p>
                            <span className="font-medium">Event:</span>{" "}
                            {order.event.title}
                          </p>
                          <p>
                            <span className="font-medium">Organizer:</span>{" "}
                            {order.event.organizer.orgName}
                          </p>
                          <p>
                            <span className="font-medium">Tanggal Pesanan:</span>{" "}
                            {order.formattedCreatedAt}
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
                          {order.items.map((item) => (
                            <p key={item.id} className="text-sm text-muted-foreground">
                              {item.ticketType.name} x {item.quantity} = {formatPrice(item.subtotal)}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {currentStatus === "MANUAL_PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, "SUCCESS")}
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
                              onClick={() => updateOrderStatus(order.id, "FAILED", "Manual payment rejected by admin")}
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
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

    </div>
  );
}
