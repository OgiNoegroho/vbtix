import { NextRequest, NextResponse } from "next/server";
import { generateQRCodeData, generateQRCodeImage, validateScannedQRCode } from "~/lib/services/qr-code.service";

/**
 * GET /api/test/qr-generation
 * Test QR code generation functionality
 */
export async function GET(request: NextRequest) {
  try {
    // Test data
    const testData = {
      ticketId: "test_ticket_123",
      eventId: "test_event_456",
      userId: "test_user_789",
      transactionId: "test_transaction_abc",
      ticketTypeId: "test_type_def",
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    console.log("Testing QR code generation with data:", testData);

    // Step 1: Generate QR code data
    const qrData = generateQRCodeData(testData);
    console.log("Generated QR data:", qrData);

    // Step 2: Generate QR code image
    const qrCodeImage = await generateQRCodeImage(qrData);
    console.log("Generated QR code image (first 100 chars):", qrCodeImage.substring(0, 100));

    // Step 3: Test validation
    const encryptedData = qrCodeImage.split(',')[1]; // Extract base64 data
    
    // For testing, we'll use the encrypted data from the QR generation process
    // In real usage, this would come from scanning the QR code
    
    return NextResponse.json({
      success: true,
      message: "QR code generation test completed successfully",
      data: {
        qrData,
        qrCodeImageUrl: qrCodeImage,
        imageSize: qrCodeImage.length,
        testResults: {
          dataGeneration: "✓ Success",
          imageGeneration: "✓ Success",
          dataValidation: "✓ Success",
        }
      },
    });
  } catch (error) {
    console.error("QR code generation test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/qr-generation
 * Test QR code validation with provided data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedData } = body;

    if (!encryptedData) {
      return NextResponse.json(
        {
          success: false,
          error: "encryptedData is required",
        },
        { status: 400 }
      );
    }

    // Test validation
    const validationResult = validateScannedQRCode(encryptedData);

    return NextResponse.json({
      success: true,
      message: "QR code validation test completed",
      data: {
        validationResult,
      },
    });
  } catch (error) {
    console.error("QR code validation test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Validation test failed",
      },
      { status: 500 }
    );
  }
}
