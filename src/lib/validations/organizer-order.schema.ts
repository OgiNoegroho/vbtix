import { z } from "zod";
import { buyerInfoSchema } from "./ticket-purchase.schema";

/**
 * Schema for organizer-created order customer information
 * Uses the existing buyer info schema without admin-specific fields
 */
export const organizerOrderCustomerSchema = buyerInfoSchema.extend({
  // Optional notes field for organizer use
  notes: z
    .string()
    .max(500, { message: "Catatan maksimal 500 karakter" })
    .optional(),
});

/**
 * Schema for order items in organizer order creation
 */
export const organizerOrderItemSchema = z.object({
  eventId: z.string().min(1, { message: "Event harus dipilih" }),
  ticketTypeId: z.string().min(1, { message: "Jenis tiket harus dipilih" }),
  quantity: z
    .number()
    .min(1, { message: "Jumlah tiket minimal 1" })
    .max(100, { message: "Jumlah tiket maksimal 100" }),
  price: z
    .number()
    .min(0, { message: "Harga tidak boleh negatif" }),
  notes: z
    .string()
    .max(200, { message: "Catatan maksimal 200 karakter" })
    .optional(),
});

/**
 * Complete schema for organizer order creation
 */
export const organizerOrderCreateSchema = z.object({
  // Customer information
  customerInfo: organizerOrderCustomerSchema,

  // Order items
  orderItems: z
    .array(organizerOrderItemSchema)
    .min(1, { message: "Minimal satu item pesanan harus ada" }),

  // Payment information
  paymentMethod: z.enum(["MANUAL", "BANK_TRANSFER", "EWALLET", "QRIS"], {
    required_error: "Metode pembayaran harus dipilih",
  }),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED"], {
    required_error: "Status pembayaran harus dipilih",
  }),

  // Organizer notes
  organizerNotes: z
    .string()
    .max(1000, { message: "Catatan organizer maksimal 1000 karakter" })
    .optional(),

  // Discount (optional)
  discountAmount: z
    .number()
    .min(0, { message: "Diskon tidak boleh negatif" })
    .optional()
    .default(0),
  discountReason: z
    .string()
    .max(200, { message: "Alasan diskon maksimal 200 karakter" })
    .optional(),
});

export type OrganizerOrderCreateSchema = z.infer<typeof organizerOrderCreateSchema>;
export type OrganizerOrderCustomerSchema = z.infer<typeof organizerOrderCustomerSchema>;
export type OrganizerOrderItemSchema = z.infer<typeof organizerOrderItemSchema>;
