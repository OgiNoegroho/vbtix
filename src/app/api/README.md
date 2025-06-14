# API Structure

This directory contains the API routes for the VBTicket application. The API is organized into three main groups:

## 1. Admin API (`/api/admin/`)

API endpoints for administrative operations, such as:

- Managing users
- Approving organizers
- Viewing system-wide reports
- Managing system settings

## 2. Buyer API (`/api/buyer/`)

API endpoints for ticket buyers, including:

- Browsing events (`/api/buyer/events/`)
- Viewing event details (`/api/buyer/events/[eventId]`)
- Purchasing tickets (`/api/buyer/tickets/`)
- Managing orders (`/api/buyer/orders/`)
- Accessing e-tickets (`/api/buyer/etickets/`)
- Downloading e-tickets (`/api/buyer/etickets/[id]/download`)

## 3. Organizer API (`/api/organizer/`)

API endpoints for event organizers, including:

- Creating and managing events (`/api/organizer/events/`)
- Creating and managing ticket types (`/api/organizer/tickets/`)
- Managing ticket inventory (`/api/organizer/inventory/`)
- Viewing orders for their events (`/api/organizer/orders/`)
- Accessing sales reports (`/api/organizer/sales/`)

## Common API Endpoints

Some API endpoints are not grouped and remain at the top level:

- Authentication (`/api/auth/`)
- Payment processing (`/api/payments/`)
- Webhooks for external services (`/api/webhooks/`)
- Cache revalidation (`/api/revalidate/`)

## API Response Format

All API endpoints follow a consistent response format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { ... } // Optional data payload
}
```

## Error Handling

All API endpoints handle errors consistently, returning appropriate HTTP status codes and error messages.
