// User type
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: string;
  image?: string;
  password?: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Enum for user roles
export type UserRole = "ADMIN" | "ORGANIZER" | "BUYER";

// Organizer type
export interface Organizer {
  id: string;
  userId: string;
  orgName: string;
  legalName?: string;
  npwp?: string;
  socialMedia?: Record<string, any>;
  verificationDocs?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event type
export interface Event {
  id: string;
  slug: string;
  organizerId: string;
  title: string;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  category?: string;
  venue: string;
  address?: string;
  city?: string;
  province: string;
  country: string;
  tags: string[];
  images: string[];
  featured: boolean;
  seatingMap?: string;
  maxAttendees?: number;
  website?: string;
  terms?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

// Enum for event status
export type EventStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

// Ticket type
export interface Ticket {
  id: string;
  ticketTypeId: string;
  transactionId: string;
  userId: string;
  qrCode: string;
  qrCodeImageUrl?: string | null;
  qrCodeData?: string | null;
  qrCodeGeneratedAt?: string | null;
  qrCodeStatus: QRCodeStatus;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  status: TicketStatus;
  checkedIn: boolean;
  checkInTime?: string;
  createdAt: string;
  updatedAt: string;
}

// Enum for ticket status
export type TicketStatus =
  | "ACTIVE"
  | "USED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

// Enum for QR code status
export type QRCodeStatus =
  | "PENDING"
  | "GENERATED"
  | "ACTIVE"
  | "USED"
  | "EXPIRED";

// Transaction type
export interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference?: string;
  invoiceNumber: string;
  status: PaymentStatus;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Enum for payment status
export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED";

// TicketType type
export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  maxPerPurchase: number;
  isVisible: boolean;
  allowTransfer: boolean;
  ticketFeatures?: string;
  perks?: string;
  earlyBirdDeadline?: string;
  saleStartDate?: string;
  saleEndDate?: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Approval type
export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  reviewerId?: string;
  status: ApprovalStatus;
  notes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Enum for approval status
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

// Log type
export interface Log {
  id: string;
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Validator type
export interface Validator {
  id: string;
  userId: string;
  eventIds: string[];
  createdAt: string;
  updatedAt: string;
}

// BankAccount type
export interface BankAccount {
  id: string;
  organizerId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
}

// Withdrawal type
export interface Withdrawal {
  id: string;
  organizerId: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  reference?: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Enum for withdrawal status
export type WithdrawalStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

// Crew type
export interface Crew {
  id: string;
  organizerId: string;
  eventId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  idCardNumber: string;
  barcode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Voucher type
export interface Voucher {
  id: string;
  organizerId: string;
  eventId?: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsage: number;
  usedCount: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enum for discount type
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

// ApiResponse type for generic API responses
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: "success" | "error";
}

// PaginatedResponse type for paginated API responses
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// JWT type definitions moved to src/types/next-auth.d.ts
