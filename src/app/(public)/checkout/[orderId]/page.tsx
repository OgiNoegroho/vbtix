"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, AlertTriangle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  PaymentMethodSelector,
  type PaymentMethodDetails,
} from "~/components/ui/payment-method-selector";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { formatPrice } from "~/lib/utils";
import { toast } from "sonner";

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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Unwrap params with React.use()
  const { orderId } = React.use(params);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Get session ID from localStorage for guest access
        const sessionId = localStorage.getItem("vbticket_session_id");

        // Build URL with session ID for guest access
        const url = sessionId
          ? `/api/public/orders/${orderId}?sessionId=${sessionId}`
          : `/api/public/orders/${orderId}`;

        console.log("Fetching order data from:", url);

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

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!orderData) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/public/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel order");
      }

      toast.success("Order cancelled successfully", {
        description:
          "Your order has been cancelled and you can create a new one.",
      });

      // Redirect back to events or home page
      router.push("/");
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel order", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePaymentMethodSelect = async (
    method: string,
    details: PaymentMethodDetails,
  ) => {
    setIsProcessing(true);
    setError("");

    try {
      // Get session ID from localStorage for guest access
      const sessionId = localStorage.getItem("vbticket_session_id");

      const requestData = {
        orderId,
        paymentMethod: method,
        paymentMethodDetails: details,
        sessionId, // Include session ID for guest access
      };

      console.log("Sending checkout request:", requestData);

      // Call checkout API
      const response = await fetch("/api/public/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log("Checkout response:", result);

      if (!response.ok) {
        console.error("Checkout error:", result);
        throw new Error(result.error || "Failed to initiate payment");
      }

      // Handle different payment responses
      if (result.data.gateway === "MANUAL") {
        // For manual payment, show success message and redirect to pending page
        toast.success("Pesanan berhasil dibuat!", {
          description:
            "Pesanan Anda sedang menunggu konfirmasi pembayaran dari admin.",
        });
        router.push(`/orders/${orderId}/pending-payment`);
      } else if (result.data.checkoutUrl) {
        // Redirect to external payment gateway (Xendit)
        toast.info("Redirecting to payment gateway...", {
          description: "You will be redirected to complete your payment.",
        });
        window.location.href = result.data.checkoutUrl;
      } else if (result.data.isTestMode) {
        // For test mode, redirect to test payment page
        toast.info("Redirecting to test payment...", {
          description:
            "You will be redirected to simulate the payment process.",
        });
        router.push(
          `/checkout/${orderId}/test-payment?token=${result.data.paymentToken}`,
        );
      } else {
        // For payment methods like VA, show payment instructions
        toast.info("Redirecting to payment instructions...", {
          description: "You will see detailed payment instructions.",
        });
        router.push(
          `/checkout/${orderId}/payment?token=${result.data.paymentToken}`,
        );
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
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
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
        </div>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
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
        <h1 className="text-2xl font-bold">Detail Pesanan</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{orderData.invoiceNumber}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    ID Pesanan: {orderData.id}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
                  {orderData.status === "PENDING" &&
                   orderData.paymentMethod === "MANUAL_PAYMENT" &&
                   orderData.details?.awaitingVerification
                    ? "Menunggu Konfirmasi Admin"
                    : orderData.status === "PENDING"
                      ? "Menunggu Pembayaran"
                      : orderData.status === "SUCCESS"
                        ? "Lunas"
                        : orderData.status === "FAILED"
                          ? "Gagal"
                          : orderData.status === "EXPIRED"
                            ? "Kadaluarsa"
                            : orderData.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Details */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Detail Event</h3>
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
              </div>

              <Separator />

              {/* Ticket Details */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Detail Tiket</h3>
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

        {/* Payment Section */}
        <div className="space-y-6">
          {/* Order Summary */}
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

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            onPaymentMethodSelect={handlePaymentMethodSelect}
            isLoading={isProcessing}
          />

          {/* Cancel Order */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelOrder}
              disabled={isCancelling || isProcessing}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {isCancelling ? "Membatalkan..." : "Batalkan Pesanan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
