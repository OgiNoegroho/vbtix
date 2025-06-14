/**
 * Test file to verify datetime conversion functionality
 * This can be run to ensure the datetime fixes work correctly
 */

import { createTicketTypeSchema } from "~/lib/validations/ticket.schema";

export function testDateTimeConversion() {
  console.log("Testing DateTime Conversion...");

  // Test cases for datetime-local format
  const testCases = [
    {
      name: "Valid datetime-local format",
      input: {
        name: "Test Ticket",
        price: 100000,
        quantity: 50,
        earlyBirdDeadline: "2025-06-13T21:05",
        saleStartDate: "2025-01-01T09:00",
        saleEndDate: "2025-06-13T23:59",
      },
      shouldPass: true,
    },
    {
      name: "Empty datetime fields",
      input: {
        name: "Test Ticket",
        price: 100000,
        quantity: 50,
        earlyBirdDeadline: "",
        saleStartDate: "",
        saleEndDate: "",
      },
      shouldPass: true,
    },
    {
      name: "Missing datetime fields",
      input: {
        name: "Test Ticket",
        price: 100000,
        quantity: 50,
      },
      shouldPass: true,
    },
    {
      name: "Invalid datetime format",
      input: {
        name: "Test Ticket",
        price: 100000,
        quantity: 50,
        earlyBirdDeadline: "invalid-date",
      },
      shouldPass: false,
    },
  ];

  testCases.forEach((testCase) => {
    try {
      console.log(`\nTesting: ${testCase.name}`);
      console.log("Input:", JSON.stringify(testCase.input, null, 2));

      const result = createTicketTypeSchema.parse(testCase.input);
      
      console.log("✅ Validation passed");
      console.log("Parsed result:", JSON.stringify(result, null, 2));

      // Check if datetime fields are properly converted
      if (result.earlyBirdDeadline) {
        console.log("Early Bird Deadline type:", typeof result.earlyBirdDeadline);
        console.log("Early Bird Deadline value:", result.earlyBirdDeadline);
      }

      if (!testCase.shouldPass) {
        console.log("❌ Expected validation to fail but it passed");
      }
    } catch (error) {
      if (testCase.shouldPass) {
        console.log("❌ Validation failed unexpectedly:", error);
      } else {
        console.log("✅ Validation failed as expected:", error);
      }
    }
  });

  console.log("\nDateTime conversion test completed!");
}

// Export for use in development
if (typeof window !== "undefined") {
  (window as any).testDateTimeConversion = testDateTimeConversion;
}
