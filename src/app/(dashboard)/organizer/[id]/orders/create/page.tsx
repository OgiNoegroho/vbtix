"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, 
  ShoppingCart, 
  CreditCard, 
  FileText, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { OrganizerPageWrapper } from "~/components/dashboard/organizer/organizer-page-wrapper";
import { MagicCard, MagicInput, MagicTextarea, MagicButton } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  organizerOrderCreateSchema,
  type OrganizerOrderCreateSchema,
} from "~/lib/validations/organizer-order.schema";

interface Event {
  id: string;
  title: string;
  ticketTypes: TicketType[];
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number | null;
  sold: number;
}

export default function OrganizerOrderCreatePage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const form = useForm<OrganizerOrderCreateSchema>({
    resolver: zodResolver(organizerOrderCreateSchema),
    defaultValues: {
      customerInfo: {
        fullName: "",
        identityType: "KTP",
        identityNumber: "",
        email: "",
        whatsapp: "",
        notes: "",
      },
      orderItems: [
        {
          eventId: "",
          ticketTypeId: "",
          quantity: 1,
          price: 0,
          notes: "",
        },
      ],
      paymentMethod: "MANUAL",
      paymentStatus: "PENDING",
      organizerNotes: "",
      discountAmount: 0,
      discountReason: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderItems",
  });

  // Load organizer's events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch(`/api/organizer/${organizerId}/events?status=PUBLISHED`);
        if (response.ok) {
          const result = await response.json();
          setEvents(result.data || []);
        } else {
          toast.error("Failed to load events");
        }
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    };

    if (organizerId) {
      loadEvents();
    }
  }, [organizerId]);

  // Handle event selection and auto-populate ticket types
  const handleEventChange = (eventId: string, index: number) => {
    const selectedEvent = events.find(e => e.id === eventId);
    if (selectedEvent && selectedEvent.ticketTypes.length > 0) {
      // Reset ticket type and price when event changes
      form.setValue(`orderItems.${index}.ticketTypeId`, "");
      form.setValue(`orderItems.${index}.price`, 0);
    }
  };

  // Handle ticket type selection and auto-populate price
  const handleTicketTypeChange = (ticketTypeId: string, index: number) => {
    const eventId = form.getValues(`orderItems.${index}.eventId`);
    const selectedEvent = events.find(e => e.id === eventId);
    if (selectedEvent) {
      const selectedTicketType = selectedEvent.ticketTypes.find(tt => tt.id === ticketTypeId);
      if (selectedTicketType) {
        form.setValue(`orderItems.${index}.price`, selectedTicketType.price);
      }
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    const items = form.getValues("orderItems");
    const discountAmount = form.getValues("discountAmount") || 0;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return Math.max(0, subtotal - discountAmount);
  };

  const onSubmit = async (data: OrganizerOrderCreateSchema) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizer/${organizerId}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Pesanan berhasil dibuat!", {
          description: `Invoice: ${result.data.invoiceNumber}`,
        });
        router.push(`/organizer/${organizerId}/orders`);
      } else {
        toast.error("Gagal membuat pesanan", {
          description: result.error || "Terjadi kesalahan",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Gagal membuat pesanan", {
        description: "Terjadi kesalahan sistem",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizerRoute>
      <OrganizerPageWrapper organizerId={organizerId}>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <MagicButton
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </MagicButton>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-green-800 bg-clip-text text-transparent">
                Buat Pesanan Baru
              </h1>
              <p className="text-muted-foreground">
                Buat pesanan untuk pelanggan sebagai organizer
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Information */}
                  <MagicCard className="p-6 bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informasi Pelanggan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerInfo.fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Lengkap *</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Masukkan nama lengkap"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerInfo.email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <MagicInput
                                  type="email"
                                  placeholder="Masukkan email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerInfo.identityType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jenis Identitas *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis identitas" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="KTP">KTP</SelectItem>
                                  <SelectItem value="SIM">SIM</SelectItem>
                                  <SelectItem value="PASSPORT">Passport</SelectItem>
                                  <SelectItem value="STUDENT_ID">Kartu Pelajar</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerInfo.identityNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Identitas *</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Masukkan nomor identitas"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerInfo.whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp *</FormLabel>
                              <FormControl>
                                <MagicInput
                                  placeholder="Masukkan nomor WhatsApp"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerInfo.notes"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Catatan Pelanggan</FormLabel>
                              <FormControl>
                                <MagicTextarea
                                  placeholder="Catatan tambahan tentang pelanggan"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </MagicCard>

                  {/* Order Items */}
                  <MagicCard className="p-6 bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Item Pesanan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Item {index + 1}</h4>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`orderItems.${index}.eventId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Event *</FormLabel>
                                    <Select
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        handleEventChange(value, index);
                                      }}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih event" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {events.map((event) => (
                                          <SelectItem key={event.id} value={event.id}>
                                            {event.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`orderItems.${index}.ticketTypeId`}
                                render={({ field }) => {
                                  const eventId = form.watch(`orderItems.${index}.eventId`);
                                  const selectedEvent = events.find(e => e.id === eventId);

                                  return (
                                    <FormItem>
                                      <FormLabel>Jenis Tiket *</FormLabel>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          handleTicketTypeChange(value, index);
                                        }}
                                        defaultValue={field.value}
                                        disabled={!eventId}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis tiket" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {selectedEvent?.ticketTypes.map((ticketType) => (
                                            <SelectItem key={ticketType.id} value={ticketType.id}>
                                              <div className="flex items-center justify-between w-full">
                                                <span>{ticketType.name}</span>
                                                <Badge variant="secondary" className="ml-2">
                                                  {ticketType.quantity === null
                                                    ? "Unlimited"
                                                    : `${ticketType.quantity - ticketType.sold} tersisa`
                                                  }
                                                </Badge>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  );
                                }}
                              />

                              <FormField
                                control={form.control}
                                name={`orderItems.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Jumlah *</FormLabel>
                                    <FormControl>
                                      <MagicInput
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`orderItems.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Harga (Rp) *</FormLabel>
                                    <FormControl>
                                      <MagicInput
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`orderItems.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Catatan Item</FormLabel>
                                  <FormControl>
                                    <MagicTextarea
                                      placeholder="Catatan untuk item ini"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => append({
                            eventId: "",
                            ticketTypeId: "",
                            quantity: 1,
                            price: 0,
                            notes: "",
                          })}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Item
                        </Button>
                      </div>
                    </CardContent>
                  </MagicCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <MagicCard className="p-6 bg-gradient-to-br from-card/90 to-muted/20 backdrop-blur-sm border-border/50">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Ringkasan Pesanan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <div className="space-y-4">
                        <div className="text-2xl font-bold">
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="discountAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Diskon (Rp)</FormLabel>
                                <FormControl>
                                  <MagicInput
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="discountReason"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Alasan Diskon</FormLabel>
                                <FormControl>
                                  <MagicInput
                                    placeholder="Alasan pemberian diskon"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Metode Pembayaran *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih metode pembayaran" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MANUAL">Manual</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                                    <SelectItem value="EWALLET">E-Wallet</SelectItem>
                                    <SelectItem value="QRIS">QRIS</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="paymentStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status Pembayaran *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih status pembayaran" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Lunas</SelectItem>
                                    <SelectItem value="FAILED">Gagal</SelectItem>
                                    <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <FormField
                          control={form.control}
                          name="organizerNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catatan Organizer</FormLabel>
                              <FormControl>
                                <MagicTextarea
                                  placeholder="Catatan internal untuk pesanan ini"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <MagicButton
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                              Membuat Pesanan...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Buat Pesanan
                            </>
                          )}
                        </MagicButton>
                      </div>
                    </CardContent>
                  </MagicCard>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </OrganizerPageWrapper>
    </OrganizerRoute>
  );
}
