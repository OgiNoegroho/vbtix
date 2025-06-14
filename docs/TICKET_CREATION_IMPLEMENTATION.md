# Ticket Creation Implementation for Approved Organizer Events

## Overview

This implementation ensures that organizers can only create tickets for events that have been approved by administrators. The system follows clean code architecture with proper separation of concerns across three tiers.

## Architecture

### 1. API Layer (`src/app/api/organizer/[id]/events/[eventId]/tickets/route.ts`)
- Handles HTTP requests and responses
- Validates authentication and authorization
- Parses and validates request data using Zod schemas
- Calls business logic handlers
- Returns appropriate HTTP status codes and error messages

### 2. Business Logic Layer (`src/server/api/tickets.ts`)
- Contains business rules and validation logic
- Orchestrates calls to service layer
- Handles complex business logic like event approval validation
- Transforms data between API and service layers

### 3. Service Layer (`src/server/services/ticket.service.ts`)
- Direct database interactions
- Reusable business logic components
- Event approval validation methods
- Data access patterns

## Key Features

### Event Approval Validation
Only events with `EventStatus.PUBLISHED` can have tickets created:

```typescript
// Events must be approved before ticket creation
if (event.status !== EventStatus.PUBLISHED) {
  throw new Error("Event must be approved before tickets can be created");
}
```

### Comprehensive Error Handling
Different error types return appropriate HTTP status codes:
- `404`: Event not found
- `403`: Unauthorized access or ownership issues
- `422`: Event not approved (business logic error)
- `400`: Validation errors
- `500`: Server errors

### Enhanced Validation Schema
The `createTicketTypeSchema` includes:
- String length limits
- Price range validation
- Quantity limits
- Date logic validation
- Cross-field validation (maxPerPurchase vs quantity)

## API Endpoints

### Create Ticket Type
```
POST /api/organizer/[id]/events/[eventId]/tickets
```

**Requirements:**
- User must be authenticated as ORGANIZER or ADMIN
- Event must exist and belong to the organizer
- Event status must be PUBLISHED
- Request body must pass validation schema

**Request Body:**
```json
{
  "name": "VIP Ticket",
  "description": "Premium access with special perks",
  "price": 150000,
  "currency": "IDR",
  "quantity": 100,
  "maxPerPurchase": 5,
  "isVisible": true,
  "allowTransfer": false,
  "ticketFeatures": "Front row seating, Meet & greet",
  "perks": "Free merchandise, Priority entry",
  "saleStartDate": "2024-01-01T00:00:00Z",
  "saleEndDate": "2024-12-31T23:59:59Z"
}
```

### Get Approved Events
```
GET /api/organizer/[id]/events/approved
```

Returns list of organizer's events that are approved for ticket creation.

## Error Messages

The system provides clear, actionable error messages:

- **Draft Events**: "Event is still in draft status. Please submit for review first."
- **Pending Review**: "Event is pending admin approval. Tickets can only be created after approval."
- **Rejected Events**: "Event has been rejected. Please contact admin for more information."
- **Completed Events**: "Event has already been completed. Cannot create new tickets."
- **Cancelled Events**: "Event has been cancelled. Cannot create new tickets."

## Validation Rules

### Ticket Type Validation
- Name: 1-100 characters, required
- Description: 0-500 characters, optional
- Price: 0-100,000,000, required
- Quantity: 1-100,000, required
- Max per purchase: 1-100, cannot exceed quantity
- Sale dates: Start date must be before end date
- Early bird deadline: Must be before or equal to sale end date

### Business Rules
1. Only PUBLISHED events can have tickets
2. Organizer must own the event
3. User must have ORGANIZER or ADMIN role
4. All validation must pass before creation

## Security Considerations

1. **Authentication**: All endpoints require valid session
2. **Authorization**: Role-based access control (ORGANIZER/ADMIN)
3. **Ownership Validation**: Organizers can only access their own events
4. **Input Validation**: Comprehensive Zod schema validation
5. **SQL Injection Prevention**: Using Prisma ORM with parameterized queries

## Testing Recommendations

1. **Unit Tests**: Test each service method independently
2. **Integration Tests**: Test API endpoints with different scenarios
3. **Authorization Tests**: Verify access control works correctly
4. **Validation Tests**: Test all validation rules and edge cases
5. **Error Handling Tests**: Verify appropriate error responses

## Usage Example

```typescript
// Create a ticket type for an approved event
const response = await fetch('/api/organizer/123/events/456/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Early Bird',
    price: 75000,
    quantity: 50,
    maxPerPurchase: 2,
  }),
});

if (response.ok) {
  const { data } = await response.json();
  console.log('Ticket type created:', data);
} else {
  const { error } = await response.json();
  console.error('Error:', error);
}
```

## Future Enhancements

1. **Bulk Ticket Creation**: Allow creating multiple ticket types at once
2. **Template System**: Save and reuse ticket type templates
3. **Dynamic Pricing**: Time-based or demand-based pricing
4. **Inventory Management**: Real-time stock updates
5. **Analytics**: Ticket sales performance metrics
