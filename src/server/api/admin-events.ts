/**
 * Admin Event Approval Business Logic
 * Handles admin-specific event approval operations
 */

import { adminEventService } from "~/server/services/admin-event.service";
import { formatDate } from "~/lib/utils";

/**
 * Create an admin event that bypasses approval workflow
 */
export async function handleCreateAdminEvent(
  eventData: any,
  adminUserId: string
) {
  if (!adminUserId) {
    throw new Error("Admin user ID is required");
  }

  try {
    const event = await adminEventService.createAdminEvent(eventData, adminUserId);

    console.log(`Admin event created by ${adminUserId}: ${event.id}`);

    return event;
  } catch (error) {
    console.error(`Error creating admin event:`, error);
    throw error;
  }
}

/**
 * Get all events for admin approval dashboard with enhanced filtering
 */
export async function handleGetPendingEventsForApproval(params?: {
  page?: number;
  limit?: number;
  search?: string;
  organizerId?: string;
  status?: string;
}) {
  try {
    return await adminEventService.getPendingEventsForApproval(params);
  } catch (error) {
    console.error("Error getting events for approval:", error);
    throw new Error("Failed to retrieve events for approval");
  }
}

/**
 * Get detailed event information for admin review
 */
export async function handleGetEventForAdminReview(eventId: string) {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  try {
    return await adminEventService.getEventForReview(eventId);
  } catch (error) {
    console.error(`Error getting event ${eventId} for review:`, error);
    throw error;
  }
}

/**
 * Approve an event (admin approval workflow)
 */
export async function handleApproveEvent(
  eventId: string,
  adminId: string,
  notes?: string
) {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  try {
    const approvedEvent = await adminEventService.approveEvent(eventId, adminId, notes);
    
    console.log(`Event ${eventId} approved by admin ${adminId}`);
    
    return approvedEvent;
  } catch (error) {
    console.error(`Error approving event ${eventId}:`, error);
    throw error;
  }
}

/**
 * Reject an event (admin approval workflow)
 */
export async function handleRejectEvent(
  eventId: string,
  adminId: string,
  notes?: string
) {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  try {
    const rejectedEvent = await adminEventService.rejectEvent(eventId, adminId, notes);
    
    console.log(`Event ${eventId} rejected by admin ${adminId}`);
    
    return rejectedEvent;
  } catch (error) {
    console.error(`Error rejecting event ${eventId}:`, error);
    throw error;
  }
}

/**
 * Get approval statistics for admin dashboard
 */
export async function handleGetApprovalStatistics() {
  try {
    return await adminEventService.getApprovalStatistics();
  } catch (error) {
    console.error("Error getting approval statistics:", error);
    throw new Error("Failed to retrieve approval statistics");
  }
}

/**
 * Get organizer information for event review context
 */
export async function handleGetOrganizerInfoForReview(organizerId: string) {
  if (!organizerId) {
    throw new Error("Organizer ID is required");
  }

  try {
    return await adminEventService.getOrganizerInfo(organizerId);
  } catch (error) {
    console.error(`Error getting organizer info ${organizerId}:`, error);
    throw error;
  }
}

/**
 * Batch approve multiple events
 */
export async function handleBatchApproveEvents(
  eventIds: string[],
  adminId: string,
  notes?: string
) {
  if (!eventIds.length) {
    throw new Error("Event IDs are required");
  }

  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  try {
    const results = await Promise.allSettled(
      eventIds.map(eventId => 
        adminEventService.approveEvent(eventId, adminId, notes)
      )
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message);

    console.log(`Batch approved ${successful.length} events, ${failed.length} failed`);

    return {
      successful,
      failed,
      totalProcessed: eventIds.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  } catch (error) {
    console.error("Error in batch approve events:", error);
    throw new Error("Failed to batch approve events");
  }
}

/**
 * Batch reject multiple events
 */
export async function handleBatchRejectEvents(
  eventIds: string[],
  adminId: string,
  notes?: string
) {
  if (!eventIds.length) {
    throw new Error("Event IDs are required");
  }

  if (!adminId) {
    throw new Error("Admin ID is required");
  }

  try {
    const results = await Promise.allSettled(
      eventIds.map(eventId => 
        adminEventService.rejectEvent(eventId, adminId, notes)
      )
    );

    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message);

    console.log(`Batch rejected ${successful.length} events, ${failed.length} failed`);

    return {
      successful,
      failed,
      totalProcessed: eventIds.length,
      successCount: successful.length,
      failureCount: failed.length,
    };
  } catch (error) {
    console.error("Error in batch reject events:", error);
    throw new Error("Failed to batch reject events");
  }
}
