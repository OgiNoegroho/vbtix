import { NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { auth } from "~/server/auth";
import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
    database: {
      connected: false,
      error: null,
      userCount: 0,
      organizerCount: 0,
      eventCount: 0,
    },
    authentication: {
      sessionExists: false,
      userId: null,
      userRole: null,
      error: null,
    },
    organizerService: {
      working: false,
      error: null,
    },
    eventService: {
      working: false,
      error: null,
    },
  };

  // Test database connection
  try {
    await prisma.$connect();
    diagnostics.database.connected = true;
    
    // Test basic queries
    diagnostics.database.userCount = await prisma.user.count();
    diagnostics.database.organizerCount = await prisma.organizer.count();
    diagnostics.database.eventCount = await prisma.event.count();
    
  } catch (error: any) {
    diagnostics.database.error = {
      message: error.message,
      code: error.code,
      name: error.name,
    };
  }

  // Test authentication
  try {
    const session = await auth();
    if (session?.user) {
      diagnostics.authentication.sessionExists = true;
      diagnostics.authentication.userId = session.user.id;
      diagnostics.authentication.userRole = session.user.role;
    }
  } catch (error: any) {
    diagnostics.authentication.error = {
      message: error.message,
      name: error.name,
    };
  }

  // Test organizer service (only if we have a user session)
  if (diagnostics.authentication.userId) {
    try {
      const organizer = await organizerService.findByUserId(diagnostics.authentication.userId);
      diagnostics.organizerService.working = true;
    } catch (error: any) {
      diagnostics.organizerService.error = {
        message: error.message,
        code: error.code,
        name: error.name,
      };
    }
  }

  // Test event service
  try {
    const events = await eventService.findAll({ page: 1, limit: 1 });
    diagnostics.eventService.working = true;
  } catch (error: any) {
    diagnostics.eventService.error = {
      message: error.message,
      code: error.code,
      name: error.name,
    };
  }

  // Disconnect from database
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }

  // Determine overall health
  const isHealthy = 
    diagnostics.database.connected &&
    diagnostics.organizerService.working &&
    diagnostics.eventService.working;

  return NextResponse.json({
    healthy: isHealthy,
    diagnostics,
    recommendations: generateRecommendations(diagnostics),
  }, { 
    status: isHealthy ? 200 : 503 
  });
}

function generateRecommendations(diagnostics: any): string[] {
  const recommendations: string[] = [];

  if (!diagnostics.database.connected) {
    recommendations.push("Check DATABASE_URL environment variable");
    recommendations.push("Verify Supabase database is running and accessible");
    recommendations.push("Check network connectivity to Supabase");
  }

  if (!diagnostics.authentication.sessionExists) {
    recommendations.push("User needs to log in to test organizer functionality");
  }

  if (diagnostics.authentication.error) {
    recommendations.push("Check NEXTAUTH_SECRET environment variable");
    recommendations.push("Clear browser cookies and re-authenticate");
  }

  if (!diagnostics.organizerService.working && diagnostics.organizerService.error) {
    if (diagnostics.organizerService.error.code === 'P1001' || diagnostics.organizerService.error.code === 'P1017') {
      recommendations.push("Database connection issue in organizer service");
    } else {
      recommendations.push("Check organizer service implementation");
    }
  }

  if (!diagnostics.eventService.working && diagnostics.eventService.error) {
    if (diagnostics.eventService.error.code === 'P1001' || diagnostics.eventService.error.code === 'P1017') {
      recommendations.push("Database connection issue in event service");
    } else {
      recommendations.push("Check event service implementation");
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("All systems are working correctly!");
  }

  return recommendations;
}
