"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  CheckCircle,
  Download,
  ArrowLeft,
  Ticket,
  Calendar,
  MapPin,
  Mail,
  MessageCircle,
  Copy,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

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

        // Transform the API response to match the expected format
        const transformedData = {
          id: result.data.id,
          invoiceNumber: result.data.invoiceNumber,
          status: result.data.status,
          amount: result.data.amount,
          currency: result.data.currency || "IDR",
          event: {
            title: result.data.event.title,
            date: result.data.event.formattedStartDate || "TBA",
            location:
              [
                result.data.event.venue,
                result.data.event.city,
                result.data.event.province,
              ]
                .filter(Boolean)
                .join(", ") || "TBA",
          },
          tickets: result.data.items.map((item: any) => ({
            id: item.id,
            type: item.ticketType.name,
            quantity: item.quantity,
          })),
          isTestMode: process.env.NEXT_PUBLIC_XENDIT_ENABLED !== "true",
        };

        setOrderData(transformedData);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadTickets = () => {
    // TODO: Implement ticket download functionality
    toast.info("Ticket download feature coming soon!");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
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

  if (error || !orderData) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Failed to load order details"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const isPaymentSuccessful =
    orderData.status === "SUCCESS" || orderData.status === "PAID";

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Payment Status</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Payment Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              {isPaymentSuccessful ? (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-green-600">
                    {orderData.isTestMode
                      ? "Test Payment Successful!"
                      : "Payment Successful!"}
                  </h2>
                  <p className="text-gray-600">
                    {orderData.isTestMode
                      ? "Your test transaction has been completed successfully."
                      : "Your payment has been processed successfully. Your tickets are ready!"}
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-yellow-600">
                    Payment Pending
                  </h2>
                  <p className="text-gray-600">
                    Your payment is being processed. You will receive
                    confirmation shortly.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Mode Alert */}
        {orderData.isTestMode && (
          <Alert className="mb-6">
            <AlertDescription>
              <strong>Test Mode:</strong> This was a test transaction. No actual
              payment was processed.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {orderData.invoiceNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(orderData.invoiceNumber, "Order number")
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <Badge
                    variant={isPaymentSuccessful ? "default" : "secondary"}
                  >
                    {orderData.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-lg text-green-600">
                    {formatPrice(orderData.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    {orderData.event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{orderData.event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{orderData.event.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Items */}
            <Card>
              <CardHeader>
                <CardTitle>Your Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.tickets.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-medium">{ticket.type}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {ticket.quantity}
                        </p>
                      </div>
                      <Badge variant="outline">{ticket.quantity}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Info Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {isPaymentSuccessful && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={downloadTickets} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Tickets
                  </Button>
                  <p className="text-xs text-gray-600">
                    Your tickets have been sent to your email. You can also
                    download them here.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    If you have any questions about your order or tickets, feel
                    free to contact us:
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>support@vbticket.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span>WhatsApp: +62 812-3456-7890</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Important Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    • Please bring a valid ID that matches your ticket
                    information
                  </p>
                  <p>• Arrive at least 30 minutes before the event starts</p>
                  <p>• Your ticket QR code will be scanned at the entrance</p>
                  <p>• Screenshots of tickets are not accepted</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/events")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Browse Events
            </Button>
          </div>

          {isPaymentSuccessful && (
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-600">
                Check your email for ticket details and event updates
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
