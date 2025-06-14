import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";

export async function GET() {
  try {
    console.log("🔍 Testing organizer-specific database operations...");
    
    // Test 1: Get all organizers
    const organizers = await prisma.organizer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    console.log(`✅ Found ${organizers.length} organizers`);
    
    if (organizers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No organizers found in database",
        organizers: [],
      });
    }
    
    // Test 2: Test the specific failing function - findByUserId
    const firstOrganizer = organizers[0];
    console.log(`🔍 Testing findByUserId for user: ${firstOrganizer.userId}`);
    
    const organizerByUserId = await organizerService.findByUserId(firstOrganizer.userId);
    console.log(`✅ findByUserId successful: ${organizerByUserId ? 'Found' : 'Not found'}`);
    
    // Test 3: Test event queries for this organizer
    console.log(`🔍 Testing event queries for organizer: ${firstOrganizer.id}`);
    
    const events = await eventService.findAll({
      organizerId: firstOrganizer.id,
      page: 1,
      limit: 10,
    });
    console.log(`✅ Found ${events.total} events for organizer`);
    
    // Test 4: Test the specific endpoint logic
    console.log(`🔍 Testing handleGetOrganizerEvents logic...`);
    
    // Simulate the exact same logic as in handleGetOrganizerEvents
    const testOrganizer = await organizerService.findByUserId(firstOrganizer.userId);
    if (!testOrganizer) {
      throw new Error("User is not an organizer");
    }
    
    const testEvents = await eventService.findAll({
      page: 1,
      limit: 10,
      organizerId: testOrganizer.id,
    });
    
    console.log(`✅ handleGetOrganizerEvents logic test successful`);
    
    // Test 5: Test specific event by ID if any exist
    let eventTest = null;
    if (events.events.length > 0) {
      const firstEvent = events.events[0];
      console.log(`🔍 Testing findById for event: ${firstEvent.id}`);
      
      eventTest = await eventService.findById(firstEvent.id);
      console.log(`✅ Event findById successful: ${eventTest ? 'Found' : 'Not found'}`);
    }
    
    return NextResponse.json({
      success: true,
      message: "All organizer database operations successful",
      data: {
        organizerCount: organizers.length,
        firstOrganizerUserId: firstOrganizer.userId,
        findByUserIdWorking: !!organizerByUserId,
        eventsCount: events.total,
        eventTestWorking: eventTest !== null,
        organizers: organizers.map(org => ({
          id: org.id,
          userId: org.userId,
          orgName: org.orgName,
          userEmail: org.user.email,
          userRole: org.user.role,
        })),
      },
    });
    
  } catch (error: any) {
    console.error("❌ Organizer database test error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        meta: error.meta,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
