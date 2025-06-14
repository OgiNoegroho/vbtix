import { z } from "zod";

/**
 * Enum for reservation status matching the Prisma schema
 */
export const ReservationStatus = z.enum([
  "ACTIVE",
  "EXPIRED",
  "CONVERTED",
  "CANCELLED",
]);

/**
 * Validation schema for TicketReservation
 */
export const ticketReservationSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  ticketTypeId: z.string(),
  quantity: z.number().int().positive(),
  reservedAt: z.date(),
  expiresAt: z.date(),
  status: ReservationStatus,
  metadata: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Export TypeScript type from the schema
 */
export type TicketReservationSchema = z.infer<typeof ticketReservationSchema>;

/**
 * Schema for creating a new ticket reservation
 */
export const createReservationSchema = z.object({
  ticketTypeId: z.string().min(1, { message: "Ticket type ID is required" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive integer" })
    .max(10, { message: "Maximum 10 tickets can be reserved at once" }),
  sessionId: z.string().min(1, { message: "Session ID is required" }),
  expirationMinutes: z
    .number()
    .int()
    .positive()
    .max(30, { message: "Maximum expiration time is 30 minutes" })
    .optional()
    .default(10),
});

/**
 * Schema for cancelling a reservation
 */
export const cancelReservationSchema = z.object({
  reservationId: z.string().min(1, { message: "Reservation ID is required" }),
  sessionId: z.string().min(1, { message: "Session ID is required" }),
});

/**
 * Schema for converting reservation to purchase
 */
export const convertReservationSchema = z.object({
  reservationId: z.string().min(1, { message: "Reservation ID is required" }),
  transactionId: z.string().min(1, { message: "Transaction ID is required" }),
});

/**
 * Schema for getting reservations
 */
export const getReservationsSchema = z.object({
  sessionId: z.string().min(1, { message: "Session ID is required" }),
  status: ReservationStatus.optional(),
  page: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be a positive integer" }),
  limit: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

/**
 * Schema for checking ticket availability
 */
export const checkAvailabilitySchema = z.object({
  ticketTypeId: z.string().min(1, { message: "Ticket type ID is required" }),
});

/**
 * Response schema for reservation creation
 */
export const reservationResponseSchema = z.object({
  id: z.string(),
  ticketTypeId: z.string(),
  quantity: z.number(),
  expiresAt: z.date(),
  status: ReservationStatus,
  ticketType: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    event: z.object({
      id: z.string(),
      title: z.string(),
      venue: z.string(),
      startDate: z.date(),
    }),
  }),
});

/**
 * Response schema for ticket availability
 */
export const availabilityResponseSchema = z.object({
  total: z.number(),
  sold: z.number(),
  reserved: z.number(),
  available: z.number(),
});

/**
 * Schema for reservation timer info
 */
export const reservationTimerSchema = z.object({
  reservationId: z.string(),
  expiresAt: z.date(),
  remainingSeconds: z.number(),
  isExpired: z.boolean(),
});

/**
 * Schema for bulk reservation operations
 */
export const bulkReservationSchema = z.object({
  reservations: z
    .array(
      z.object({
        ticketTypeId: z.string(),
        quantity: z.number().int().positive().max(10),
      }),
    )
    .min(1, { message: "At least one reservation is required" })
    .max(5, {
      message: "Maximum 5 different ticket types can be reserved at once",
    }),
  sessionId: z.string().min(1, { message: "Session ID is required" }),
  expirationMinutes: z.number().int().positive().max(30).optional().default(10),
});

/**
 * Schema for reservation cleanup response
 */
export const cleanupResponseSchema = z.object({
  cleaned: z.number(),
  message: z.string(),
});

/**
 * Schema for extending reservation time
 */
export const extendReservationSchema = z.object({
  reservationId: z.string().min(1, { message: "Reservation ID is required" }),
  additionalMinutes: z
    .number()
    .int()
    .positive()
    .max(15, { message: "Maximum 15 additional minutes allowed" }),
  sessionId: z.string().min(1, { message: "Session ID is required" }),
});
