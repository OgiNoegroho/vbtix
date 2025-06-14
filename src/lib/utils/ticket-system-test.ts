/**
 * Comprehensive test suite for ticket system fixes
 * Tests all the critical error scenarios that were fixed
 */

import { createTicketTypeSchema } from "~/lib/validations/ticket.schema";
import { ticketPurchaseSchema } from "~/lib/validations/ticket-purchase.schema";
import { handleApiError, handleFileUploadError, handleValidationError } from "./error-handler";

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

/**
 * Test datetime validation fixes
 */
export function testDateTimeValidation(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Valid datetime-local format
  try {
    const validData = {
      name: "Test Ticket",
      price: 100000,
      quantity: 50,
      earlyBirdDeadline: "2025-06-13T21:05",
      saleStartDate: "2025-01-01T09:00",
      saleEndDate: "2025-06-13T23:59",
    };

    const result = createTicketTypeSchema.parse(validData);
    
    results.push({
      testName: "DateTime Local Format Validation",
      passed: true,
      details: {
        input: validData.earlyBirdDeadline,
        output: result.earlyBirdDeadline,
        type: typeof result.earlyBirdDeadline,
      },
    });
  } catch (error: any) {
    results.push({
      testName: "DateTime Local Format Validation",
      passed: false,
      error: error.message,
    });
  }

  // Test 2: Empty datetime fields
  try {
    const emptyDateData = {
      name: "Test Ticket",
      price: 100000,
      quantity: 50,
      earlyBirdDeadline: "",
      saleStartDate: "",
      saleEndDate: "",
    };

    const result = createTicketTypeSchema.parse(emptyDateData);
    
    results.push({
      testName: "Empty DateTime Fields",
      passed: result.earlyBirdDeadline === null,
      details: {
        earlyBirdDeadline: result.earlyBirdDeadline,
        saleStartDate: result.saleStartDate,
        saleEndDate: result.saleEndDate,
      },
    });
  } catch (error: any) {
    results.push({
      testName: "Empty DateTime Fields",
      passed: false,
      error: error.message,
    });
  }

  // Test 3: Invalid datetime format
  try {
    const invalidData = {
      name: "Test Ticket",
      price: 100000,
      quantity: 50,
      earlyBirdDeadline: "invalid-date",
    };

    createTicketTypeSchema.parse(invalidData);
    
    results.push({
      testName: "Invalid DateTime Format",
      passed: false,
      error: "Should have failed validation",
    });
  } catch (error: any) {
    results.push({
      testName: "Invalid DateTime Format",
      passed: true,
      details: "Correctly rejected invalid datetime",
    });
  }

  return results;
}

/**
 * Test ticket purchase validation fixes
 */
export function testTicketPurchaseValidation(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Valid ticket purchase data
  try {
    const validPurchaseData = {
      buyerInfo: {
        fullName: "John Doe",
        identityType: "KTP",
        identityNumber: "1234567890123456",
        email: "john@example.com",
        whatsapp: "+6281234567890",
      },
      ticketPurchase: {
        ticketTypeId: "ticket-type-123",
        quantity: 2,
      },
      ticketHolders: [
        {
          fullName: "John Doe",
          identityType: "KTP",
          identityNumber: "1234567890123456",
          email: "john@example.com",
          whatsapp: "+6281234567890",
        },
        {
          fullName: "Jane Doe",
          identityType: "KTP",
          identityNumber: "1234567890123457",
          email: "jane@example.com",
          whatsapp: "+6281234567891",
        },
      ],
    };

    const result = ticketPurchaseSchema.parse(validPurchaseData);
    
    results.push({
      testName: "Valid Ticket Purchase",
      passed: true,
      details: {
        quantity: result.ticketPurchase.quantity,
        holdersCount: result.ticketHolders.length,
      },
    });
  } catch (error: any) {
    results.push({
      testName: "Valid Ticket Purchase",
      passed: false,
      error: error.message,
    });
  }

  // Test 2: Mismatched ticket holders count
  try {
    const mismatchedData = {
      buyerInfo: {
        fullName: "John Doe",
        identityType: "KTP",
        identityNumber: "1234567890123456",
        email: "john@example.com",
        whatsapp: "+6281234567890",
      },
      ticketPurchase: {
        ticketTypeId: "ticket-type-123",
        quantity: 3, // Quantity is 3
      },
      ticketHolders: [
        {
          fullName: "John Doe",
          identityType: "KTP",
          identityNumber: "1234567890123456",
          email: "john@example.com",
          whatsapp: "+6281234567890",
        },
        // Only 1 holder, but quantity is 3
      ],
    };

    ticketPurchaseSchema.parse(mismatchedData);
    
    results.push({
      testName: "Mismatched Ticket Holders Count",
      passed: false,
      error: "Should have failed validation",
    });
  } catch (error: any) {
    results.push({
      testName: "Mismatched Ticket Holders Count",
      passed: true,
      details: "Correctly rejected mismatched count",
    });
  }

  return results;
}

/**
 * Test error handling improvements
 */
export function testErrorHandling(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: API Error Handling
  try {
    const networkError = new Error("fetch failed");
    networkError.name = "TypeError";
    
    const message = handleApiError(networkError);
    
    results.push({
      testName: "Network Error Handling",
      passed: message.includes("Network error"),
      details: { message },
    });
  } catch (error: any) {
    results.push({
      testName: "Network Error Handling",
      passed: false,
      error: error.message,
    });
  }

  // Test 2: File Upload Error Handling
  try {
    const forbiddenError = new Error("Forbidden");
    const message = handleFileUploadError(forbiddenError);
    
    results.push({
      testName: "File Upload Error Handling",
      passed: message.includes("permission"),
      details: { message },
    });
  } catch (error: any) {
    results.push({
      testName: "File Upload Error Handling",
      passed: false,
      error: error.message,
    });
  }

  // Test 3: Validation Error Handling
  try {
    const validationError = {
      errors: [{ message: "Name is required" }],
    };
    
    const message = handleValidationError(validationError);
    
    results.push({
      testName: "Validation Error Handling",
      passed: message === "Name is required",
      details: { message },
    });
  } catch (error: any) {
    results.push({
      testName: "Validation Error Handling",
      passed: false,
      error: error.message,
    });
  }

  return results;
}

/**
 * Run all tests and return comprehensive results
 */
export function runAllTests(): {
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
  results: TestResult[];
} {
  const allResults: TestResult[] = [
    ...testDateTimeValidation(),
    ...testTicketPurchaseValidation(),
    ...testErrorHandling(),
  ];

  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const total = allResults.length;
  const passRate = Math.round((passed / total) * 100);

  return {
    summary: {
      total,
      passed,
      failed,
      passRate,
    },
    results: allResults,
  };
}

/**
 * Export for browser console testing
 */
if (typeof window !== "undefined") {
  (window as any).testTicketSystem = runAllTests;
  (window as any).testDateTimeValidation = testDateTimeValidation;
  (window as any).testTicketPurchaseValidation = testTicketPurchaseValidation;
  (window as any).testErrorHandling = testErrorHandling;
}
