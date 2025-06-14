import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { handleCreateTicketType, handleGetTicketTypes } from "~/server/api/tickets";

export async function POST() {
  try {
    console.log("🎫 Demo: Creating sample ticket types...");
    
    // Get the first available event
    const event = await prisma.event.findFirst({
      include: {
        organizer: {
          include: { user: true },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json({
        success: false,
        message: "No events found for demo",
      });
    }
    
    const organizerUserId = event.organizer.userId;
    
    // Sample ticket types to create
    const sampleTickets = [
      {
        name: "Early Bird",
        description: "Limited time early bird pricing with great savings",
        price: 75000,
        quantity: 200,
        maxPerPurchase: 5,
        isVisible: true,
        allowTransfer: true,
        ticketFeatures: "Standard seating, Event merchandise discount",
        perks: "10% discount on food and beverages",
      },
      {
        name: "Regular",
        description: "Standard admission ticket with full event access",
        price: 100000,
        quantity: 500,
        maxPerPurchase: 8,
        isVisible: true,
        allowTransfer: true,
        ticketFeatures: "Standard seating, Full event access",
        perks: "Access to all event areas",
      },
      {
        name: "VIP Premium",
        description: "Premium VIP experience with exclusive benefits",
        price: 250000,
        quantity: 50,
        maxPerPurchase: 3,
        isVisible: true,
        allowTransfer: false,
        ticketFeatures: "Front row seating, Meet & greet, Exclusive merchandise",
        perks: "Premium drinks, VIP parking, Backstage access",
      },
    ];
    
    const createdTickets = [];
    
    // Create each ticket type
    for (const ticketData of sampleTickets) {
      try {
        const ticket = await handleCreateTicketType({
          userId: organizerUserId,
          eventId: event.id,
          ticketTypeData: ticketData,
        });
        
        createdTickets.push(ticket);
        console.log(`✅ Created ticket: ${ticket.name}`);
      } catch (error: any) {
        console.log(`❌ Failed to create ticket ${ticketData.name}:`, error.message);
      }
    }
    
    // Get all tickets for the event
    const allTickets = await handleGetTicketTypes({
      eventId: event.id,
      page: 1,
      limit: 10,
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdTickets.length} ticket types!`,
      data: {
        event: {
          id: event.id,
          title: event.title,
          organizer: event.organizer.user.name,
        },
        createdTickets: createdTickets.length,
        totalTickets: allTickets.meta.total,
        tickets: allTickets.ticketTypes,
      },
      endpoints: {
        frontend: `/organizer/${organizerUserId}/events/${event.id}/tickets`,
        api: `/api/organizer/${organizerUserId}/events/${event.id}/tickets`,
      },
    });
    
  } catch (error: any) {
    console.error("❌ Demo ticket creation error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
      },
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log("🧹 Demo: Cleaning up demo tickets...");
    
    // Delete demo tickets (those with specific names)
    const demoTicketNames = ["Early Bird", "Regular", "VIP Premium"];
    
    const deletedCount = await prisma.ticketType.deleteMany({
      where: {
        name: {
          in: demoTicketNames,
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount.count} demo tickets`,
      deletedCount: deletedCount.count,
    });
    
  } catch (error: any) {
    console.error("❌ Demo cleanup error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
