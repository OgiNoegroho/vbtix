import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { organizerService } from "~/server/services/organizer.service";

/**
 * GET /api/organizer/profile
 * Get the current user's organizer profile
 * This endpoint returns the organizer record for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only organizers can access this endpoint
    if (session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only organizers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get organizer data using the user ID from session
    const organizer = await organizerService.findOrCreateByUserId(session.user.id);

    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "Organizer profile not found" },
        { status: 404 }
      );
    }

    // Return organizer profile data
    return NextResponse.json({
      success: true,
      data: {
        id: organizer.id,
        orgName: organizer.orgName,
        description: organizer.description,
        website: organizer.website,
        verified: organizer.verified,
        user: organizer.user,
        verification: organizer.verification,
        bankAccount: organizer.bankAccount,
      },
    });
  } catch (error: any) {
    console.error("Error getting organizer profile:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get organizer profile" 
      },
      { status: 500 }
    );
  }
}
