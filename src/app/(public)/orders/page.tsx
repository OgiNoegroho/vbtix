"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Receipt,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { PaymentStatus } from "@prisma/client";
import { formatPrice } from "~/lib/utils";

// Order type definition
interface Order {
  id: string;
  orderNumber: string;
  status: PaymentStatus;
  paymentMethod?: string;
  details?: any;
  totalAmount: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    image: string;
  };
  items: {
    id: string;
    ticketType: {
      name: string;
      price: number;
    };
    quantity: number;
    subtotal: number;
  }[];
  paymentUrl?: string;
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for orders and loading
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Get current status filter from URL or default to "PENDING"
  const currentStatus =
    (searchParams.get("status") as PaymentStatus) || PaymentStatus.PENDING;

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("status", currentStatus);

      const page = searchParams.get("page") || "1";
      params.append("page", page);
      params.append("limit", "10");

      // Fetch orders from API
      const response = await fetch(`/api/public/orders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setMeta(data.meta);
      } else {
        console.error("Failed to fetch orders:", data.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    params.delete("page"); // Reset to page 1 when changing status
    router.push(`/orders?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/orders?${params.toString()}`);
  };

  // Fetch orders on mount and when search params change
  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get expiration info for pending orders
  const getExpirationInfo = (createdAt: string, status: PaymentStatus, paymentMethod?: string, details?: any) => {
    if (status !== "PENDING") {
      return null;
    }

    // Manual payments awaiting verification don't expire
    if (paymentMethod === "MANUAL_PAYMENT" && details?.awaitingVerification) {
      return { expired: false, message: "Menunggu konfirmasi admin", urgent: false };
    }

    const now = new Date();
    const orderDate = new Date(createdAt);
    const expiresAt = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after creation
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return { expired: true, message: "Expired" };
    }

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft > 0) {
      return {
        expired: false,
        message: `${hoursLeft}h ${minutesLeft}m remaining`,
        urgent: hoursLeft < 2, // Mark as urgent if less than 2 hours left
      };
    } else {
      return {
        expired: false,
        message: `${minutesLeft}m remaining`,
        urgent: true,
      };
    }
  };

  // Get status badge color
  const getStatusBadge = (status: PaymentStatus, paymentMethod?: string, details?: any) => {
    if (status === PaymentStatus.PENDING && paymentMethod === "MANUAL_PAYMENT" && details?.awaitingVerification) {
      return <Badge className="bg-orange-500">Menunggu Konfirmasi</Badge>;
    }

    switch (status) {
      case PaymentStatus.PENDING:
        return <Badge className="bg-yellow-500">Menunggu Pembayaran</Badge>;
      case PaymentStatus.SUCCESS:
        return <Badge className="bg-green-500">Lunas</Badge>;
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-500">Gagal</Badge>;
      case PaymentStatus.EXPIRED:
        return <Badge className="bg-gray-500">Kadaluarsa</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge className="bg-blue-500">Dikembalikan</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Order card component
  const OrderCard = ({ order }: { order: Order }) => {
    const expirationInfo = getExpirationInfo(order.createdAt, order.status, order.paymentMethod, order.details);

    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-32 w-full overflow-hidden bg-blue-600">
          <img
            src={
              order.event.image || "https://placehold.co/400x200?text=No+Image"
            }
            alt={order.event.title}
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-4 text-white">
            <h3 className="mb-1 line-clamp-1 text-lg font-semibold">
              {order.event.title}
            </h3>
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-1.5" />
              <span>{order.event.date}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin size={14} className="mr-1.5" />
              <span className="line-clamp-1">{order.event.location}</span>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {getStatusBadge(order.status, order.paymentMethod, order.details)}
            {expirationInfo && (
              <Badge
                variant="secondary"
                className={`text-xs ${
                  expirationInfo.expired
                    ? "bg-red-100 text-red-800"
                    : expirationInfo.urgent
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {expirationInfo.message}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Nomor Pesanan</div>
              <div className="font-mono font-medium">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Tanggal Pemesanan</div>
              <div className="text-sm">{formatDate(order.createdAt)}</div>
            </div>
          </div>
          <div className="mb-3">
            <div className="mb-1 text-sm text-gray-500">Tiket</div>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.ticketType.name} x {item.quantity}
                </span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span className="text-blue-600">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/orders/${order.id}`}>
              <Receipt size={16} className="mr-2" />
              Detail
            </Link>
          </Button>
          {order.status === PaymentStatus.PENDING && order.paymentUrl && (
            <Button size="sm" className="flex-1" asChild>
              <a
                href={order.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CreditCard size={16} className="mr-2" />
                Bayar
              </a>
            </Button>
          )}
          {order.status === PaymentStatus.SUCCESS && (
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/tickets?orderId=${order.id}`}>
                <ExternalLink size={16} className="mr-2" />
                Lihat Tiket
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Loading skeleton
  const OrderCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="mb-3 h-12 w-full" />
        <Skeleton className="h-6 w-full" />
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t p-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
        <p className="text-gray-500">Kelola semua pesanan tiket Anda</p>
      </div>

      <Tabs defaultValue={currentStatus} onValueChange={handleStatusChange}>
        <TabsList className="mb-6">
          <TabsTrigger value={PaymentStatus.PENDING}>
            Menunggu Pembayaran
          </TabsTrigger>
          <TabsTrigger value="MANUAL_PENDING">
            Menunggu Konfirmasi
          </TabsTrigger>
          <TabsTrigger value={PaymentStatus.SUCCESS}>Lunas</TabsTrigger>
          <TabsTrigger value={PaymentStatus.EXPIRED}>Kadaluarsa</TabsTrigger>
          <TabsTrigger value={PaymentStatus.FAILED}>Gagal</TabsTrigger>
        </TabsList>

        <TabsContent value={currentStatus} className="mt-0">
          {isLoading ? (
            // Show skeletons while loading
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <OrderCardSkeleton key={index} />
              ))}
            </div>
          ) : orders.length > 0 ? (
            // Show orders
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        size="default"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(Math.max(1, meta.currentPage - 1));
                        }}
                        className={
                          meta.currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: meta.totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          href="#"
                          size="default"
                          isActive={meta.currentPage === index + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(index + 1);
                          }}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        size="default"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(
                            Math.min(meta.totalPages, meta.currentPage + 1),
                          );
                        }}
                        className={
                          meta.currentPage === meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            // Show empty state
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Receipt className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mb-1 text-lg font-medium">Tidak ada pesanan</h3>
              <p className="mb-4 text-gray-500">
                Anda belum memiliki pesanan dengan status{" "}
                {currentStatus.toLowerCase()}
              </p>
              <Button asChild>
                <Link href="/events">Jelajahi Event</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
