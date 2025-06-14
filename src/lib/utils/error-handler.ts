/**
 * Comprehensive error handling utilities for VBTicket
 * Provides standardized error handling and user-friendly messages
 */

export interface ErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  details?: any;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
  messages?: Array<{ field: string; message: string }>;
}

/**
 * Standard error codes and their user-friendly messages
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "User is not authenticated",
    userMessage: "Please log in to continue",
    statusCode: 401,
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    message: "User does not have permission",
    userMessage: "You don't have permission to perform this action",
    statusCode: 403,
  },
  ORGANIZER_NOT_FOUND: {
    code: "ORGANIZER_NOT_FOUND",
    message: "Organizer record not found",
    userMessage: "Organizer account not found. Please contact support.",
    statusCode: 403,
  },
  ORGANIZER_MISMATCH: {
    code: "ORGANIZER_MISMATCH",
    message: "Organizer ID mismatch",
    userMessage: "You can only access your own organizer data",
    statusCode: 403,
  },

  // Validation Errors
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    message: "Input validation failed",
    userMessage: "Please check your input and try again",
    statusCode: 400,
  },
  INVALID_JSON: {
    code: "INVALID_JSON",
    message: "Invalid JSON in request body",
    userMessage: "Invalid data format. Please try again.",
    statusCode: 400,
  },

  // File Upload Errors
  NO_FILE_PROVIDED: {
    code: "NO_FILE_PROVIDED",
    message: "No file provided for upload",
    userMessage: "Please select a file to upload",
    statusCode: 400,
  },
  FILE_UPLOAD_FAILED: {
    code: "FILE_UPLOAD_FAILED",
    message: "File upload to cloud storage failed",
    userMessage: "Failed to upload file. Please try again.",
    statusCode: 500,
  },
  INVALID_FILE_TYPE: {
    code: "INVALID_FILE_TYPE",
    message: "Invalid file type",
    userMessage: "Please upload a valid image file (JPG, PNG, GIF)",
    statusCode: 400,
  },

  // Ticket Errors
  TICKET_NOT_FOUND: {
    code: "TICKET_NOT_FOUND",
    message: "Ticket not found",
    userMessage: "The requested ticket could not be found",
    statusCode: 404,
  },
  TICKET_CREATION_FAILED: {
    code: "TICKET_CREATION_FAILED",
    message: "Failed to create ticket",
    userMessage: "Failed to create ticket. Please try again.",
    statusCode: 500,
  },
  TICKET_UPDATE_FAILED: {
    code: "TICKET_UPDATE_FAILED",
    message: "Failed to update ticket",
    userMessage: "Failed to update ticket. Please try again.",
    statusCode: 500,
  },

  // Event Errors
  EVENT_NOT_FOUND: {
    code: "EVENT_NOT_FOUND",
    message: "Event not found",
    userMessage: "The requested event could not be found",
    statusCode: 404,
  },

  // Generic Errors
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    userMessage: "Something went wrong. Please try again later.",
    statusCode: 500,
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Network request failed",
    userMessage: "Network error. Please check your connection and try again.",
    statusCode: 500,
  },
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  errorCode: keyof typeof ERROR_CODES,
  details?: any
): ErrorDetails {
  const error = ERROR_CODES[errorCode];
  return {
    ...error,
    details,
  };
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: any): string {
  console.error("API Error:", error);

  // Handle network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return ERROR_CODES.NETWORK_ERROR.userMessage;
  }

  // Handle API response errors
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
        return ERROR_CODES.UNAUTHORIZED.userMessage;
      case 403:
        return ERROR_CODES.FORBIDDEN.userMessage;
      case 404:
        return "The requested resource was not found";
      case 400:
        return error.response.data?.error || ERROR_CODES.VALIDATION_ERROR.userMessage;
      case 500:
        return ERROR_CODES.INTERNAL_ERROR.userMessage;
      default:
        return error.response.data?.error || "An unexpected error occurred";
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle error objects with message
  if (error.message) {
    return error.message;
  }

  // Fallback
  return ERROR_CODES.INTERNAL_ERROR.userMessage;
}

/**
 * Handle file upload errors specifically
 */
export function handleFileUploadError(error: any): string {
  console.error("File Upload Error:", error);

  if (error.message?.includes("Forbidden")) {
    return "You don't have permission to upload files. Please check your account status.";
  }

  if (error.message?.includes("file type")) {
    return ERROR_CODES.INVALID_FILE_TYPE.userMessage;
  }

  if (error.message?.includes("size")) {
    return "File is too large. Please choose a smaller file.";
  }

  return ERROR_CODES.FILE_UPLOAD_FAILED.userMessage;
}

/**
 * Handle validation errors from Zod or similar libraries
 */
export function handleValidationError(validationError: any): string {
  if (validationError.errors && Array.isArray(validationError.errors)) {
    const firstError = validationError.errors[0];
    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (validationError.issues && Array.isArray(validationError.issues)) {
    const firstIssue = validationError.issues[0];
    if (firstIssue?.message) {
      return firstIssue.message;
    }
  }

  if (validationError.message) {
    return validationError.message;
  }

  return ERROR_CODES.VALIDATION_ERROR.userMessage;
}

/**
 * Create a user-friendly error message for ticket operations
 */
export function createTicketErrorMessage(operation: string, error: any): string {
  const baseMessage = `Failed to ${operation} ticket`;
  const userError = handleApiError(error);
  
  if (userError === ERROR_CODES.INTERNAL_ERROR.userMessage) {
    return `${baseMessage}. Please try again later.`;
  }
  
  return `${baseMessage}: ${userError}`;
}

/**
 * Log errors with context for debugging
 */
export function logError(context: string, error: any, additionalData?: any) {
  console.error(`[${context}] Error:`, {
    error: error.message || error,
    stack: error.stack,
    additionalData,
    timestamp: new Date().toISOString(),
  });
}
