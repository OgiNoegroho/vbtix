import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { handleCreateTicketType } from "~/server/api/tickets";
import { createTicketTypeSchema } from "~/lib/validations/ticket.schema";

export async function GET() {
  try {
    console.log("🎫 Testing ticket creation functionality...");
    
    // Test 1: Get available events and organizers
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          include: {
            user: true,
          },
        },
      },
      take: 1,
    });
    
    if (events.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No events found to test ticket creation",
      });
    }
    
    const event = events[0];
    const organizerUserId = event.organizer.userId;
    
    console.log(`✅ Found event: ${event.title} (ID: ${event.id})`);
    console.log(`✅ Organizer User ID: ${organizerUserId}`);
    
    // Test 2: Validate ticket creation schema with datetime-local format
    const testTicketData = {
      name: "VIP Ticket",
      description: "Premium access with exclusive benefits",
      price: 150000,
      currency: "IDR",
      quantity: 100,
      maxPerPurchase: 5,
      isVisible: true,
      allowTransfer: false,
      ticketFeatures: "Front row seating, Meet & greet, Exclusive merchandise",
      perks: "Complimentary drinks, Priority entry, VIP parking",
      // Test the datetime-local format that was causing validation errors
      earlyBirdDeadline: "2025-06-13T21:05",
      saleStartDate: "2025-01-01T09:00",
      saleEndDate: "2025-06-13T23:59",
    };
    
    console.log("🔍 Testing validation schema...");
    const validationResult = createTicketTypeSchema.safeParse(testTicketData);
    
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.errors,
      });
    }
    
    console.log("✅ Validation passed");
    
    // Test 3: Check existing ticket types for this event
    const existingTickets = await prisma.ticketType.findMany({
      where: { eventId: event.id },
    });
    
    console.log(`✅ Found ${existingTickets.length} existing ticket types for this event`);
    
    // Test 4: Test the business logic (without actually creating)
    console.log("🔍 Testing business logic validation...");
    
    try {
      // This will test all the validation logic without creating
      const testResult = await handleCreateTicketType({
        userId: organizerUserId,
        eventId: event.id,
        ticketTypeData: {
          ...validationResult.data,
          name: `Test Ticket ${Date.now()}`, // Unique name to avoid conflicts
        },
      });
      
      console.log("✅ Ticket creation logic test successful");
      
      // Clean up the test ticket
      if (testResult?.id) {
        await prisma.ticketType.delete({
          where: { id: testResult.id },
        });
        console.log("✅ Test ticket cleaned up");
      }
      
    } catch (error: any) {
      console.log("❌ Business logic test failed:", error.message);
      return NextResponse.json({
        success: false,
        message: "Business logic test failed",
        error: error.message,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: "All ticket creation functionality tests passed!",
      data: {
        eventId: event.id,
        eventTitle: event.title,
        organizerUserId,
        organizerName: event.organizer.user.name,
        existingTicketCount: existingTickets.length,
        validationPassed: true,
        businessLogicPassed: true,
      },
      endpoints: {
        createTicket: `/api/organizer/${organizerUserId}/events/${event.id}/tickets`,
        getTickets: `/api/organizer/${organizerUserId}/events/${event.id}/tickets`,
        frontend: `/organizer/${organizerUserId}/events/${event.id}/tickets`,
      },
    });
    
  } catch (error: any) {
    console.error("❌ Ticket creation test error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    }, { status: 500 });
  }
}
