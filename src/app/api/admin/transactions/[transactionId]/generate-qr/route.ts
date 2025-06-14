import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  transactionId: z.string().min(1),
});

/**
 * POST /api/admin/transactions/[transactionId]/generate-qr
 * Generate QR codes for all tickets in a transaction (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const resolvedParams = await params;
    // Validate parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transaction ID",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { transactionId } = validatedParams.data;

    // Get user session and verify admin access
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Generate QR codes for the transaction
    const result = await generateTransactionQRCodes(transactionId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate QR codes",
          details: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.generatedCount} QR codes`,
      data: {
        transactionId,
        generatedCount: result.generatedCount,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error generating transaction QR codes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
