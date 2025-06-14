"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { formatPrice } from "~/lib/utils";

interface OrderData {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  event: {
    id: string;
    title: string;
    posterUrl?: string;
    formattedStartDate?: string;
    venue?: string;
    address?: string;
    city?: string;
    province?: string;
    organizer?: {
      id: string;
      orgName: string;
    };
  };
  items: Array<{
    id: string;
    ticketType: {
      id: string;
      name: string;
      description?: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export default function PendingPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string>("");

  // Unwrap params
  React.useEffect(() => {
    params.then((p) => setOrderId(p.orderId));
  }, [params]);

  // Fetch order data
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderData = async () => {
      try {
        // Get session ID from localStorage for guest access
        const sessionId = localStorage.getItem("vbticket_session_id");

        // Build URL with session ID for guest access
        const url = sessionId
          ? `/api/public/orders/${orderId}?sessionId=${sessionId}`
          : `/api/public/orders/${orderId}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to load order");
        }

        setOrderData(result.data);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Calculate totals from order data
  const calculateTotals = () => {
    if (!orderData) return { subtotal: 0, serviceFee: 0, total: 0 };

    const subtotal = orderData.items.reduce(
      (sum: number, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    const total = subtotal + serviceFee;

    return { subtotal, serviceFee, total };
  };

  const { subtotal, serviceFee, total } = calculateTotals();

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Status Pesanan</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground mt-2">
              Loading order details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !orderData) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Status Pesanan</h1>
        </div>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error || "Failed to load order details"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Status Pesanan</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Status */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-yellow-100 p-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-xl">
                  Menunggu Konfirmasi Pembayaran
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Pesanan Anda sedang menunggu konfirmasi pembayaran dari admin
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pesanan berhasil dibuat!</strong>
                  <br />
                  Anda akan menerima email konfirmasi dan tiket setelah
                  pembayaran disetujui oleh admin.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Pesanan:</span>
                  <span className="font-medium">{orderData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                    Menunggu Konfirmasi
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Pembayaran:
                  </span>
                  <span className="font-medium text-blue-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={
                    orderData.event.posterUrl ||
                    "https://placehold.co/80x80?text=Event"
                  }
                  alt={orderData.event.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{orderData.event.title}</h4>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{orderData.event.formattedStartDate || "TBA"}</span>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[
                        orderData.event.venue,
                        orderData.event.city,
                        orderData.event.province,
                      ]
                        .filter(Boolean)
                        .join(", ") || "TBA"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Ticket Details */}
              <div>
                <h3 className="mb-3 font-semibold">Detail Tiket</h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.ticketType.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {formatPrice(Number(item.price))} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              Kembali ke Beranda
            </Button>
            <Button onClick={() => router.push("/orders")} className="w-full">
              Lihat Semua Pesanan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
