/**
 * Mock Payment Service for Testing
 * Simulates payment processing without actual money exchange
 */

import { PaymentStatus } from "@prisma/client";

// Mock payment method types
export enum MockPaymentMethod {
  TEST_BANK_TRANSFER = "TEST_BANK_TRANSFER",
  TEST_EWALLET = "TEST_EWALLET",
  TEST_CASH = "TEST_CASH",
}

// Mock payment status mapping
export const mockPaymentStatuses = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export interface MockPaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: MockPaymentMethod;
  paymentMethodDetails?: {
    bankCode?: string;
    type?: string;
  };
  customer: {
    referenceId: string;
    email: string;
    mobileNumber?: string;
    givenNames?: string;
  };
  description: string;
  metadata?: Record<string, any>;
}

export interface MockPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  checkoutUrl?: string;
  paymentInstructions?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a mock payment
 */
export async function createMockPayment(
  params: MockPaymentParams,
): Promise<MockPaymentResponse> {
  // Generate a mock payment ID
  const paymentId = `mock_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let checkoutUrl: string | undefined;
  let paymentInstructions: string | undefined;

  // Generate different responses based on payment method
  switch (params.paymentMethod) {
    case MockPaymentMethod.TEST_BANK_TRANSFER:
      paymentInstructions = `
        INSTRUKSI PEMBAYARAN TEST - BANK TRANSFER

        Bank: ${params.paymentMethodDetails?.bankCode || "TEST BANK"}
        No. Rekening: 1234567890123456
        Atas Nama: VBTicket Test Account
        Jumlah: ${params.currency} ${params.amount.toLocaleString("id-ID")}

        Kode Referensi: ${params.orderId}

        CATATAN: Ini adalah transaksi test. Tidak ada uang yang akan dipotong.
        Untuk melanjutkan, klik tombol "Simulasi Pembayaran Berhasil" di halaman pembayaran.
      `;
      break;

    case MockPaymentMethod.TEST_EWALLET:
      paymentInstructions = `
        INSTRUKSI PEMBAYARAN TEST - E-WALLET

        E-Wallet: ${params.paymentMethodDetails?.type || "TEST WALLET"}
        Jumlah: ${params.currency} ${params.amount.toLocaleString("id-ID")}

        Kode Referensi: ${params.orderId}

        CATATAN: Ini adalah transaksi test. Tidak ada uang yang akan dipotong.
        Untuk melanjutkan, klik tombol "Simulasi Pembayaran Berhasil" di halaman pembayaran.
      `;
      break;

    case MockPaymentMethod.TEST_CASH:
      paymentInstructions = `
        INSTRUKSI PEMBAYARAN TEST - CASH

        Jumlah: ${params.currency} ${params.amount.toLocaleString("id-ID")}

        Kode Referensi: ${params.orderId}

        CATATAN: Ini adalah transaksi test. Tidak ada uang yang akan dipotong.
        Untuk melanjutkan, klik tombol "Simulasi Pembayaran Berhasil" di halaman pembayaran.
      `;
      break;
  }

  return {
    id: paymentId,
    status: "PENDING",
    amount: params.amount,
    currency: params.currency,
    paymentMethod: params.paymentMethod,
    checkoutUrl,
    paymentInstructions,
    metadata: params.metadata,
  };
}

/**
 * Get mock payment status
 */
export async function getMockPaymentStatus(
  paymentId: string,
): Promise<MockPaymentResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // For testing, we'll return a pending status
  // In a real scenario, this would check the actual payment status
  return {
    id: paymentId,
    status: "PENDING",
    amount: 0,
    currency: "IDR",
    paymentMethod: "TEST",
    metadata: {},
  };
}

/**
 * Simulate payment completion (for testing purposes)
 */
export async function simulatePaymentCompletion(
  paymentId: string,
  success: boolean = true,
): Promise<MockPaymentResponse> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: paymentId,
    status: success ? "SUCCESS" : "FAILED",
    amount: 0,
    currency: "IDR",
    paymentMethod: "TEST",
    metadata: {},
  };
}

/**
 * Map mock payment status to internal PaymentStatus
 */
export function mapMockStatusToInternal(mockStatus: string): PaymentStatus {
  switch (mockStatus.toUpperCase()) {
    case "SUCCESS":
    case "COMPLETED":
    case "PAID":
      return "SUCCESS";
    case "FAILED":
    case "EXPIRED":
      return "FAILED";
    case "CANCELLED":
      return "FAILED";
    case "PENDING":
    default:
      return "PENDING";
  }
}
