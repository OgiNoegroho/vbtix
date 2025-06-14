import { NextRequest, NextResponse } from "next/server";
import {
  handleGetUserTickets,
  handlePurchaseTickets,
} from "~/server/api/buyer-tickets";
import { auth } from "~/server/auth";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";
import { ticketPurchaseSchema } from "~/lib/validations/ticket-purchase.schema";

// Validation schema for query parameters
const ticketsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
});

/**
 * GET /api/buyer/tickets
 * Get tickets for the authenticated user
 * This endpoint requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view tickets",
          message: "Please log in to view your tickets",
        },
        { status: 401 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const parsedParams = ticketsQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit, status } = parsedParams.data;

    // Get tickets for the user
    const result = await handleGetUserTickets({
      userId: session.user.id,
      page,
      limit,
      status,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.tickets,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting user tickets:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get tickets" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/buyer/tickets
 * Purchase tickets
 * This endpoint requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to purchase tickets",
          message: "Please log in to purchase tickets",
        },
        { status: 401 },
      );
    }

    // Parse request body with enhanced error handling
    let body;
    try {
      body = await request.json();
      console.log("Ticket purchase API received:", body);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 },
      );
    }

    // Validate request body with detailed error reporting
    const validatedData = ticketPurchaseSchema.safeParse(body);

    if (!validatedData.success) {
      console.error(
        "Ticket purchase validation error:",
        validatedData.error.format(),
      );

      // Extract specific error messages for better user feedback
      const errorMessages = validatedData.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
          messages: errorMessages,
        },
        { status: 400 },
      );
    }

    // Purchase tickets
    const result = await handlePurchaseTickets({
      userId: session.user.id,
      ticketPurchase: validatedData.data.ticketPurchase,
      buyerInfo: validatedData.data.buyerInfo,
      ticketHolders: validatedData.data.ticketHolders,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          id: result.transaction.id,
          invoiceNumber: result.transaction.invoiceNumber,
          amount: Number(result.transaction.amount),
          status: result.transaction.status,
        },
        ticketCount: result.tickets.length,
      },
      message:
        "Tickets purchased successfully. Proceed to checkout to complete your payment.",
    });
  } catch (error: any) {
    console.error("Error purchasing tickets:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to purchase tickets",
      },
      {
        status:
          error.message.includes("Not enough tickets") ||
          error.message.includes("Maximum")
            ? 400
            : 500,
      },
    );
  }
}
