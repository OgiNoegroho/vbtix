import { z } from "zod";

/**
 * Enum for ticket status matching the Prisma schema
 */
export const TicketStatus = z.enum([
  "ACTIVE",
  "USED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
]);

/**
 * Enum for QR code status matching the Prisma schema
 */
export const QRCodeStatus = z.enum([
  "PENDING",
  "GENERATED",
  "ACTIVE",
  "USED",
  "EXPIRED",
]);

/**
 * Validation schema for Ticket
 */
export const ticketSchema = z.object({
  id: z.string(),
  ticketTypeId: z.string(),
  transactionId: z.string(),
  userId: z.string(),
  qrCode: z.string().min(1, { message: "QR Code cannot be empty" }),
  qrCodeImageUrl: z.string().nullable().optional(),
  qrCodeData: z.string().nullable().optional(),
  qrCodeGeneratedAt: z.date().nullable().optional(),
  qrCodeStatus: QRCodeStatus,
  imageUrl: z.string().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
  status: TicketStatus,
  checkedIn: z.boolean(),
  checkInTime: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Export TypeScript type from the schema
 */
export type TicketSchema = z.infer<typeof ticketSchema>;

/**
 * Schema for creating a new ticket
 */
export const createTicketSchema = z.object({
  ticketTypeId: z.string(),
  transactionId: z.string(),
  userId: z.string(),
  qrCode: z.string().min(1, { message: "QR Code cannot be empty" }),
  qrCodeImageUrl: z.string().nullable().optional(),
  qrCodeData: z.string().nullable().optional(),
  qrCodeGeneratedAt: z.date().nullable().optional(),
  qrCodeStatus: QRCodeStatus.optional().default("PENDING"),
  imageUrl: z.string().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
  status: TicketStatus.optional().default("ACTIVE"),
  checkedIn: z.boolean().optional().default(false),
});

/**
 * Schema for updating an existing ticket
 */
export const updateTicketSchema = z.object({
  status: TicketStatus.optional(),
  qrCodeImageUrl: z.string().nullable().optional(),
  qrCodeData: z.string().nullable().optional(),
  qrCodeGeneratedAt: z.date().nullable().optional(),
  qrCodeStatus: QRCodeStatus.optional(),
  checkedIn: z.boolean().optional(),
  checkInTime: z.date().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
});

/**
 * Schema for validating ticket check-in
 */
export const checkInTicketSchema = z.object({
  ticketId: z.string(),
  checkedIn: z.boolean().default(true),
  checkInTime: z
    .date()
    .optional()
    .default(() => new Date()),
});

/**
 * Schema for validating ticket status update
 */
export const updateTicketStatusSchema = z.object({
  ticketId: z.string(),
  status: TicketStatus,
});

/**
 * Schema for validating ticket deletion
 */
export const deleteTicketSchema = z.object({
  id: z.string(),
});

/**
 * Validation schema for TicketType
 */
export const ticketTypeSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1, { message: "Name cannot be empty" }),
  description: z.string().nullable().optional(),
  price: z
    .number()
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val >= 0, {
      message: "Price must be a positive number",
    }),
  currency: z.string().default("IDR"),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive integer" }),
  sold: z.number().int().default(0),
  maxPerPurchase: z.number().int().positive().default(10),
  isVisible: z.boolean().default(true),
  allowTransfer: z.boolean().default(false),
  ticketFeatures: z.string().nullable().optional(),
  perks: z.string().nullable().optional(),
  earlyBirdDeadline: z.date().nullable().optional(),
  saleStartDate: z.date().nullable().optional(),
  saleEndDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Export TypeScript type from the schema
 */
export type TicketTypeSchema = z.infer<typeof ticketTypeSchema>;

/**
 * Schema for creating a new ticket type
 * Enhanced with comprehensive validation for approved events
 */
export const createTicketTypeSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Ticket name cannot be empty" })
    .max(100, { message: "Ticket name cannot exceed 100 characters" })
    .trim(),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
  price: z
    .number()
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val >= 0, {
      message: "Price must be a positive number",
    })
    .refine((val) => val <= 100000000, {
      message: "Price cannot exceed 100,000,000",
    }),
  currency: z.string().optional().default("IDR"),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive integer" })
    .max(100000, { message: "Quantity cannot exceed 100,000 tickets" }),
  maxPerPurchase: z
    .number()
    .int()
    .positive({ message: "Max per purchase must be a positive integer" })
    .max(100, { message: "Max per purchase cannot exceed 100" })
    .optional()
    .default(10),
  isVisible: z.boolean().optional().default(true),
  allowTransfer: z.boolean().optional().default(false),
  ticketFeatures: z
    .string()
    .max(1000, { message: "Ticket features cannot exceed 1000 characters" })
    .optional(),
  perks: z
    .string()
    .max(1000, { message: "Perks cannot exceed 1000 characters" })
    .optional(),
  earlyBirdDeadline: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) by converting to ISO string
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString();
      }
      // Handle full ISO datetime strings
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(val).toISOString();
      }
      return val;
    })
    .pipe(z.string().datetime().optional()),
  saleStartDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) by converting to ISO string
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString();
      }
      // Handle full ISO datetime strings
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(val).toISOString();
      }
      return val;
    })
    .pipe(z.string().datetime().optional()),
  saleEndDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) by converting to ISO string
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString();
      }
      // Handle full ISO datetime strings
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(val).toISOString();
      }
      return val;
    })
    .pipe(z.string().datetime().optional()),
})
.refine((data) => {
  // Validate that maxPerPurchase doesn't exceed quantity
  if (data.maxPerPurchase && data.maxPerPurchase > data.quantity) {
    return false;
  }
  return true;
}, {
  message: "Max per purchase cannot exceed total quantity",
  path: ["maxPerPurchase"],
})
.refine((data) => {
  // Validate date logic if both dates are provided
  if (data.saleStartDate && data.saleEndDate) {
    const startDate = new Date(data.saleStartDate);
    const endDate = new Date(data.saleEndDate);
    return startDate < endDate;
  }
  return true;
}, {
  message: "Sale start date must be before sale end date",
  path: ["saleEndDate"],
})
.refine((data) => {
  // Validate early bird deadline is before sale end date
  if (data.earlyBirdDeadline && data.saleEndDate) {
    const earlyBirdDate = new Date(data.earlyBirdDeadline);
    const endDate = new Date(data.saleEndDate);
    return earlyBirdDate <= endDate;
  }
  return true;
}, {
  message: "Early bird deadline must be before or equal to sale end date",
  path: ["earlyBirdDeadline"],
});

/**
 * Schema for updating an existing ticket type
 */
export const updateTicketTypeSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }).optional(),
  description: z.string().optional(),
  price: z
    .number()
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val >= 0, {
      message: "Price must be a positive number",
    })
    .optional(),
  currency: z.string().optional(),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive integer" })
    .optional(),
  maxPerPurchase: z.number().int().positive().optional(),
  isVisible: z.boolean().optional(),
  allowTransfer: z.boolean().optional(),
  ticketFeatures: z.string().optional(),
  perks: z.string().optional(),
  earlyBirdDeadline: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) by converting to ISO string
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString();
      }
      // Handle full ISO datetime strings
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(val).toISOString();
      }
      return val;
    })
    .pipe(z.string().datetime().optional()),
  saleStartDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) by converting to ISO string
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString();
      }
      // Handle full ISO datetime strings
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(val).toISOString();
      }
      return val;
    })
    .pipe(z.string().datetime().optional()),
  saleEndDate: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) by converting to ISO string
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return new Date(val).toISOString();
      }
      // Handle full ISO datetime strings
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return new Date(val).toISOString();
      }
      return val;
    })
    .pipe(z.string().datetime().optional()),
});

/**
 * Schema for deleting a ticket type
 */
export const deleteTicketTypeSchema = z.object({
  id: z.string(),
});
