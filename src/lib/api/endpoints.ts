// Base API URL
const API_BASE = "/api";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  VERIFY: `${API_BASE}/auth/verify`,
  RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  LOGOUT: `${API_BASE}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh-token`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: `${API_BASE}/admin/dashboard`,
  DASHBOARD_ORGANIZERS: `${API_BASE}/admin/dashboard/organizers`,
  DASHBOARD_EVENTS: `${API_BASE}/admin/dashboard/events`,
  // Events
  EVENTS: `${API_BASE}/admin/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/admin/events/${id}`,
  PENDING_EVENTS: `${API_BASE}/admin/events/pending`,
  EVENT_STATUS: (id: string) => `${API_BASE}/admin/events/${id}/status`,
  EVENT_FEATURED: (id: string) => `${API_BASE}/admin/events/${id}/featured`,

  // Organizers
  ORGANIZERS: `${API_BASE}/admin/organizers`,
  ORGANIZER_DETAIL: (id: string) => `${API_BASE}/admin/organizers/${id}`,
  ORGANIZER_VERIFY: (id: string) => `${API_BASE}/admin/organizers/${id}/verify`,
  ORGANIZER_CREATE: `${API_BASE}/admin/organizers/create`,
  ORGANIZER_STATS: `${API_BASE}/admin/organizers/stats`,

  // Users
  USERS: `${API_BASE}/admin/users`,
  USER_DETAIL: (id: string) => `${API_BASE}/admin/users/${id}`,

  // QR Code Management
  GENERATE_TRANSACTION_QR: (transactionId: string) => `${API_BASE}/admin/transactions/${transactionId}/generate-qr`,
};

// Organizer endpoints
export const ORGANIZER_ENDPOINTS = {
  // Dashboard
  DASHBOARD: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/dashboard`,

  // Events
  EVENTS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/events`,
  EVENT_DETAIL: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/events/${id}`,
  CREATE_EVENT: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/events`,
  UPDATE_EVENT: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/events/${id}`,
  DELETE_EVENT: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/events/${id}`,
  SUBMIT_EVENT_FOR_REVIEW: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/events/${id}/submit`,

  // Event Tickets
  EVENT_TICKETS: (organizerId: string, eventId: string) =>
    `${API_BASE}/organizer/${organizerId}/events/${eventId}/tickets`,
  EVENT_TICKET_DETAIL: (
    organizerId: string,
    eventId: string,
    ticketId: string,
  ) =>
    `${API_BASE}/organizer/${organizerId}/events/${eventId}/tickets/${ticketId}`,

  // Tickets
  TICKETS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/tickets`,
  TICKET_DETAIL: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/tickets/${id}`,
  TICKET_IMAGE: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/tickets/${id}/image`,
  CREATE_TICKET: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/tickets/create`,
  UPDATE_TICKET: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/tickets/${id}/update`,
  DELETE_TICKET: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/tickets/${id}/delete`,

  // Inventory
  INVENTORY: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/inventory`,

  // Orders
  ORDERS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/orders`,
  ORDER_DETAIL: (organizerId: string, id: string) =>
    `${API_BASE}/organizer/${organizerId}/orders/${id}`,

  // Sales
  SALES: (organizerId: string) => `${API_BASE}/organizer/${organizerId}/sales`,
  SALES_BY_EVENT: (organizerId: string, eventId: string) =>
    `${API_BASE}/organizer/${organizerId}/sales/events/${eventId}`,

  // Settings
  SETTINGS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/settings`,
  UPDATE_SETTINGS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/settings/update`,

  // Verification
  VERIFICATION: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/verification`,

  // Sold Tickets Management
  SOLD_TICKETS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/sold-tickets`,
  SOLD_TICKETS_STATS: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/sold-tickets/stats`,
  SOLD_TICKET_DETAIL: (organizerId: string, ticketId: string) =>
    `${API_BASE}/organizer/${organizerId}/sold-tickets/${ticketId}`,
  SOLD_TICKET_CHECK_IN: (organizerId: string, ticketId: string) =>
    `${API_BASE}/organizer/${organizerId}/sold-tickets/${ticketId}/check-in`,
  SOLD_TICKETS_EXPORT: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/sold-tickets/export`,

  // QR Code Management
  QR_CODE_VALIDATE: (organizerId: string) =>
    `${API_BASE}/organizer/${organizerId}/qr-code/validate`,
};

// Public endpoints (formerly buyer endpoints)
export const PUBLIC_ENDPOINTS = {
  EVENTS: `${API_BASE}/public/events`,
  EVENT_DETAIL: (eventId: string) => `${API_BASE}/public/events/${eventId}`,
  PURCHASE_TICKET: `${API_BASE}/public/tickets/purchase`,
  CANCEL_TICKET: (id: string) => `${API_BASE}/public/tickets/${id}/cancel`,
  TICKET_QR_CODE: (ticketId: string) => `${API_BASE}/public/tickets/${ticketId}/qr-code`,
};

// Buyer endpoints (deprecated - use PUBLIC_ENDPOINTS instead)
export const BUYER_ENDPOINTS = PUBLIC_ENDPOINTS;

// Common endpoints
export const COMMON_ENDPOINTS = {
  PAYMENTS: `${API_BASE}/payments`,
  NOTIFICATIONS: `${API_BASE}/notifications`,
};
