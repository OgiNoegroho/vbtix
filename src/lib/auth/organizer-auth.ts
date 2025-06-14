import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { organizerService } from "~/server/services/organizer.service";

/**
 * Enhanced organizer authorization utility
 * Provides comprehensive validation for organizer access
 */

export interface OrganizerAuthResult {
  success: boolean;
  organizer?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Validate organizer access for API endpoints
 * @param requestedOrganizerId - The organizer ID from the URL
 * @returns Authorization result with organizer data or error
 */
export async function validateOrganizerAccess(
  requestedOrganizerId: string
): Promise<OrganizerAuthResult> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
        statusCode: 401,
      };
    }

    // Only organizers and admins can access organizer endpoints
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return {
        success: false,
        error: "Forbidden: Insufficient permissions",
        statusCode: 403,
      };
    }

    // For admin users, allow access to any organizer
    if (session.user.role === UserRole.ADMIN) {
      // Verify the requested organizer exists
      const organizer = await organizerService.findById(requestedOrganizerId);
      if (!organizer) {
        return {
          success: false,
          error: "Organizer not found",
          statusCode: 404,
        };
      }

      return {
        success: true,
        organizer,
      };
    }

    // For organizer users, verify they own the requested organizer record
    const organizer = await organizerService.findByUserId(session.user.id);
    if (!organizer) {
      console.error("No organizer record found for user:", session.user.id);
      return {
        success: false,
        error: "Organizer record not found for current user",
        statusCode: 403,
      };
    }

    console.log("Authorization check:", {
      sessionUserId: session.user.id,
      organizerIdFromSession: organizer.id,
      requestedOrganizerId: requestedOrganizerId,
    });

    // Check if the organizer ID matches the requested one
    if (organizer.id !== requestedOrganizerId) {
      console.error("Organizer ID mismatch:", {
        userOrganizerId: organizer.id,
        requestedOrganizerId: requestedOrganizerId,
        sessionUserId: session.user.id,
      });
      return {
        success: false,
        error: `Access denied: Organizer ID mismatch. Your organizer ID is ${organizer.id}, but you're trying to access ${requestedOrganizerId}`,
        statusCode: 403,
      };
    }

    console.log("Authorization successful for organizer:", organizer.orgName);
    return {
      success: true,
      organizer,
    };
  } catch (error: any) {
    console.error("Error in validateOrganizerAccess:", error);
    return {
      success: false,
      error: "Internal server error during authorization",
      statusCode: 500,
    };
  }
}

/**
 * Validate organizer access for ticket operations
 * @param requestedOrganizerId - The organizer ID from the URL
 * @param ticketId - The ticket ID to validate ownership
 * @returns Authorization result with organizer and ticket data
 */
export async function validateOrganizerTicketAccess(
  requestedOrganizerId: string,
  ticketId: string
): Promise<OrganizerAuthResult & { ticket?: any }> {
  try {
    // First validate basic organizer access
    const authResult = await validateOrganizerAccess(requestedOrganizerId);
    if (!authResult.success) {
      return authResult;
    }

    // Import ticket service here to avoid circular dependencies
    const { ticketService } = await import("~/server/services/ticket.service");

    // Get the ticket with full relations
    const ticket = await ticketService.findById(ticketId);
    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
        statusCode: 404,
      };
    }

    // For admin users, allow access to any ticket
    const session = await auth();
    if (session?.user.role === UserRole.ADMIN) {
      return {
        success: true,
        organizer: authResult.organizer,
        ticket,
      };
    }

    // Verify that the ticket belongs to an event organized by this organizer
    const ticketOrganizerId = ticket.ticketType?.event?.organizer?.id;
    if (!ticketOrganizerId) {
      return {
        success: false,
        error: "Ticket organizer information not found",
        statusCode: 500,
      };
    }

    if (ticketOrganizerId !== authResult.organizer.id) {
      return {
        success: false,
        error: "Ticket does not belong to this organizer",
        statusCode: 403,
      };
    }

    return {
      success: true,
      organizer: authResult.organizer,
      ticket,
    };
  } catch (error: any) {
    console.error("Error in validateOrganizerTicketAccess:", error);
    return {
      success: false,
      error: "Internal server error during ticket authorization",
      statusCode: 500,
    };
  }
}

/**
 * Create a standardized error response for authorization failures
 */
export function createAuthErrorResponse(authResult: OrganizerAuthResult) {
  return {
    success: false,
    error: authResult.error,
    statusCode: authResult.statusCode || 500,
  };
}
