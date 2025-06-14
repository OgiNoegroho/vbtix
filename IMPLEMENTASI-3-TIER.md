# Implementasi Arsitektur API 3-Tier dengan Validasi Schema

Dokumen ini menjelaskan implementasi arsitektur API 3-tier dalam proyek VBTicket, dengan fokus khusus pada penggunaan validasi schema.

## Daftar Isi

1. [Pengenalan Arsitektur 3-Tier](#1-pengenalan-arsitektur-3-tier)
2. [Validasi Schema dengan Zod](#2-validasi-schema-dengan-zod)
3. [Implementasi Tier 1: HTTP Routing](#3-implementasi-tier-1-http-routing)
4. [Implementasi Tier 2: Business Logic](#4-implementasi-tier-2-business-logic)
5. [Implementasi Tier 3: Services](#5-implementasi-tier-3-services)
6. [Alur Data Lengkap](#6-alur-data-lengkap)
7. [Praktik Terbaik dan Tips](#7-praktik-terbaik-dan-tips)
8. [Contoh Implementasi Lengkap](#8-contoh-implementasi-lengkap)

## 1. Pengenalan Arsitektur 3-Tier

Arsitektur 3-tier adalah pendekatan pengembangan aplikasi yang membagi aplikasi menjadi tiga lapisan terpisah:

### Tier 1: HTTP Routing (Route Handlers)
- **Lokasi**: `src/app/api/`
- **Tanggung Jawab**:
  - Menerima HTTP request
  - Validasi input dasar
  - Autentikasi dan otorisasi
  - Memanggil business logic yang sesuai
  - Mengembalikan HTTP response

### Tier 2: Business Logic
- **Lokasi**: `src/server/api/`
- **Tanggung Jawab**:
  - Implementasi logika bisnis
  - Validasi data yang lebih kompleks
  - Orkestrasi panggilan ke services
  - Transformasi data

### Tier 3: Services
- **Lokasi**: `src/server/services/`
- **Tanggung Jawab**:
  - Interaksi dengan database
  - Panggilan ke API eksternal
  - Operasi CRUD dasar
  - Caching (jika diperlukan)

## 2. Validasi Schema dengan Zod

### Pengenalan Zod

Zod adalah library validasi schema TypeScript yang memungkinkan kita untuk mendefinisikan schema data dan memvalidasi data terhadap schema tersebut. Dalam proyek VBTicket, Zod digunakan untuk:

1. Validasi input dari HTTP request
2. Memastikan data yang dikirim ke database sesuai dengan model
3. Menghasilkan tipe TypeScript dari schema

### Struktur Schema Validasi

Schema validasi disimpan di direktori `src/lib/validations/` dan diorganisir berdasarkan entitas:

```
src/lib/validations/
├── event.schema.ts
├── order.schema.ts
├── payment.schema.ts
├── ticket.schema.ts
├── eticket.schema.ts
└── ...
```

### Contoh Schema Validasi

```typescript
// src/lib/validations/event.schema.ts
import { z } from 'zod';

// Validation schema for Event
export const eventSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  name: z.string().min(1, { message: 'Event name cannot be empty' }),
  description: z.string().optional(),
  date: z.string().datetime({ message: 'Invalid datetime format for date' }),
  location: z.string().min(1, { message: 'Location cannot be empty' }),
  organizerId: z.string().uuid({ message: 'Invalid UUID format for organizerId' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type EventSchema = z.infer<typeof eventSchema>;
```

### Schema untuk Operasi Spesifik

Selain schema dasar, kita juga dapat membuat schema khusus untuk operasi tertentu:

```typescript
// Schema untuk membuat event baru
export const createEventSchema = eventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Schema untuk memperbarui event
export const updateEventSchema = eventSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
```

## 3. Implementasi Tier 1: HTTP Routing

### Struktur Route Handler

Route handler bertanggung jawab untuk menerima HTTP request, memvalidasi input, dan memanggil business logic.

```typescript
// src/app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents, handleCreateEvent } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { createEventSchema } from "~/lib/validations/event.schema";

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins and organizers can create events
    if (![UserRole.ADMIN, UserRole.ORGANIZER].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parsing dan validasi body request
    const body = await request.json();
    
    try {
      // Validasi input menggunakan schema Zod
      const validatedData = createEventSchema.parse(body);
      
      // Memanggil business logic
      const event = await handleCreateEvent(validatedData, session.user.id);
      
      // Mengembalikan response
      return NextResponse.json({
        success: true,
        data: event
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
```

### Validasi Input di Route Handler

Route handler menggunakan schema validasi untuk memvalidasi input dari request:

1. Menerima body request dengan `await request.json()`
2. Memvalidasi data dengan `createEventSchema.parse(body)`
3. Jika validasi gagal, mengembalikan error 400 dengan detail validasi
4. Jika validasi berhasil, meneruskan data yang sudah divalidasi ke business logic

## 4. Implementasi Tier 2: Business Logic

### Struktur Business Logic

Business logic bertanggung jawab untuk mengimplementasikan logika bisnis dan mengorkestrasi panggilan ke services.

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";
import { organizerService } from "~/server/services/organizer.service";
import { EventStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";

/**
 * Membuat event baru
 */
export async function handleCreateEvent(data, userId) {
  // Validasi tambahan jika diperlukan
  
  // Cek apakah user adalah organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }
  
  // Menyiapkan data event
  const eventData = {
    ...data,
    organizerId: organizer.id,
    status: EventStatus.DRAFT
  };
  
  // Memanggil service untuk membuat event
  const event = await eventService.createEvent(eventData);
  
  return event;
}
```

### Validasi dan Transformasi Data di Business Logic

Business logic dapat melakukan validasi tambahan dan transformasi data:

1. Menerima data yang sudah divalidasi dari route handler
2. Melakukan validasi bisnis tambahan (misalnya, cek apakah user adalah organizer)
3. Menyiapkan data untuk dikirim ke service
4. Memanggil service untuk melakukan operasi database
5. Mentransformasi data hasil dari service jika diperlukan
6. Mengembalikan hasil ke route handler

## 5. Implementasi Tier 3: Services

### Struktur Service

Service bertanggung jawab untuk berinteraksi dengan database dan API eksternal.

```typescript
// src/server/services/event.service.ts
import { db } from "~/server/db";
import { EventStatus, Prisma } from "@prisma/client";

export const eventService = {
  /**
   * Membuat event baru
   */
  async createEvent(data) {
    try {
      // Membuat event di database
      const event = await db.event.create({
        data,
        include: {
          organizer: true
        }
      });
      
      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },
  
  /**
   * Mencari event berdasarkan filter
   */
  async findEvents({ status, page = 1, limit = 10 }) {
    const where = status ? { status } : {};
    
    try {
      const total = await db.event.count({ where });
      
      const events = await db.event.findMany({
        where,
        include: { organizer: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });
      
      return { events, total };
    } catch (error) {
      console.error("Error finding events:", error);
      throw error;
    }
  }
};
```

### Interaksi dengan Database di Service

Service menggunakan Prisma Client untuk berinteraksi dengan database:

1. Mengimpor Prisma Client dari `src/server/db`
2. Menggunakan metode Prisma untuk melakukan operasi CRUD
3. Menangani error database dan melemparkan error ke business logic
4. Mengembalikan hasil query ke business logic

## 6. Alur Data Lengkap

Berikut adalah alur data lengkap dalam arsitektur 3-tier:

1. **Client mengirim HTTP request** ke endpoint API

2. **Route handler (Tier 1)** menerima request:
   - Melakukan autentikasi dan otorisasi
   - Memvalidasi input menggunakan schema Zod
   - Memanggil business logic dengan data yang sudah divalidasi

3. **Business logic (Tier 2)** memproses request:
   - Melakukan validasi bisnis tambahan
   - Mengorkestrasi panggilan ke services
   - Mentransformasi data jika diperlukan

4. **Service (Tier 3)** berinteraksi dengan database:
   - Melakukan operasi CRUD menggunakan Prisma
   - Mengembalikan hasil query ke business logic

5. **Business logic** menerima data dari service:
   - Melakukan transformasi data jika diperlukan
   - Mengembalikan hasil ke route handler

6. **Route handler** menerima hasil dari business logic:
   - Memformat response sesuai standar API
   - Mengembalikan HTTP response ke client

7. **Client menerima HTTP response**

## 7. Praktik Terbaik dan Tips

### Validasi Schema

1. **Buat schema terpisah untuk operasi berbeda**:
   - `createSchema` untuk operasi pembuatan (tanpa id, createdAt, updatedAt)
   - `updateSchema` untuk operasi pembaruan (partial, tanpa id, createdAt, updatedAt)
   - `responseSchema` untuk memvalidasi response

2. **Gunakan pesan error yang jelas**:
   ```typescript
   z.string().min(1, { message: 'Event name cannot be empty' })
   ```

3. **Gunakan transformasi Zod**:
   ```typescript
   z.string().datetime().transform(str => new Date(str))
   ```

### Route Handler

1. **Selalu validasi input**:
   ```typescript
   const validatedData = createEventSchema.parse(body);
   ```

2. **Tangani error validasi dengan baik**:
   ```typescript
   try {
     const validatedData = createEventSchema.parse(body);
     // ...
   } catch (validationError) {
     return NextResponse.json(
       { success: false, error: "Validation error", details: validationError },
       { status: 400 }
     );
   }
   ```

3. **Gunakan format response yang konsisten**:
   ```typescript
   return NextResponse.json({
     success: true,
     data: result,
     message: "Event created successfully"
   });
   ```

### Business Logic

1. **Fokus pada logika bisnis**:
   - Validasi bisnis
   - Orkestrasi services
   - Transformasi data

2. **Jangan akses database langsung**:
   - Selalu gunakan services untuk akses database

3. **Tangani error dengan baik**:
   ```typescript
   try {
     // Business logic
   } catch (error) {
     console.error("Business logic error:", error);
     throw error;
   }
   ```

### Services

1. **Fokus pada operasi CRUD**:
   - Interaksi dengan database
   - Panggilan ke API eksternal

2. **Gunakan transaksi untuk operasi kompleks**:
   ```typescript
   await db.$transaction(async (tx) => {
     // Multiple database operations
   });
   ```

3. **Tangani error database**:
   ```typescript
   try {
     // Database operations
   } catch (error) {
     console.error("Database error:", error);
     throw error;
   }
   ```

## 8. Contoh Implementasi Lengkap

Berikut adalah contoh implementasi lengkap untuk fitur mendapatkan detail event:

### Schema Validasi

```typescript
// src/lib/validations/event.schema.ts
import { z } from 'zod';

// Validation schema for Event
export const eventSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  name: z.string().min(1, { message: 'Event name cannot be empty' }),
  description: z.string().optional(),
  date: z.string().datetime({ message: 'Invalid datetime format for date' }),
  location: z.string().min(1, { message: 'Location cannot be empty' }),
  organizerId: z.string().uuid({ message: 'Invalid UUID format for organizerId' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type EventSchema = z.infer<typeof eventSchema>;
```

### Route Handler (Tier 1)

```typescript
// src/app/api/admin/events/[eventid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetEventById } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/events/[eventid]
 * Get a single event by ID (admin view with detailed statistics)
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Handle the request
    const event = await handleGetEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: event,
      message: "Event retrieved successfully" 
    });
  } catch (error) {
    console.error(`Error in GET /api/admin/events/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Business Logic (Tier 2)

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";
import { ticketService } from "~/server/services/ticket.service";
import { formatDate } from "~/lib/utils";

/**
 * Mendapatkan detail event berdasarkan ID
 */
export async function handleGetEventById(id: string) {
  try {
    // Mendapatkan event dari service
    const event = await eventService.findById(id);
    
    if (!event) {
      return null;
    }
    
    // Mendapatkan data tambahan
    const ticketsSold = await ticketService.countSoldTicketsByEventId(id);
    const revenue = await ticketService.calculateRevenueByEventId(id);
    
    // Menggabungkan data dan melakukan transformasi
    return {
      ...event,
      formattedDate: formatDate(event.date),
      stats: {
        ticketsSold,
        revenue
      }
    };
  } catch (error) {
    console.error(`Error getting event by ID ${id}:`, error);
    throw error;
  }
}
```

### Services (Tier 3)

```typescript
// src/server/services/event.service.ts
import { db } from "~/server/db";

export const eventService = {
  /**
   * Mencari event berdasarkan ID
   */
  async findById(id: string) {
    try {
      const event = await db.event.findUnique({
        where: { id },
        include: {
          organizer: true,
          ticketTypes: true
        }
      });
      
      return event;
    } catch (error) {
      console.error(`Error finding event by ID ${id}:`, error);
      throw error;
    }
  }
};

// src/server/services/ticket.service.ts
import { db } from "~/server/db";
import { TicketStatus } from "@prisma/client";

export const ticketService = {
  /**
   * Menghitung jumlah tiket terjual untuk event tertentu
   */
  async countSoldTicketsByEventId(eventId: string) {
    try {
      return db.ticket.count({
        where: {
          ticketType: {
            eventId
          },
          status: TicketStatus.SOLD
        }
      });
    } catch (error) {
      console.error(`Error counting sold tickets for event ${eventId}:`, error);
      throw error;
    }
  },
  
  /**
   * Menghitung total pendapatan untuk event tertentu
   */
  async calculateRevenueByEventId(eventId: string) {
    try {
      const result = await db.ticket.aggregate({
        where: {
          ticketType: {
            eventId
          },
          status: TicketStatus.SOLD
        },
        _sum: {
          price: true
        }
      });
      
      return result._sum.price || 0;
    } catch (error) {
      console.error(`Error calculating revenue for event ${eventId}:`, error);
      throw error;
    }
  }
};
```

Dengan implementasi di atas, kita telah menerapkan arsitektur 3-tier dengan validasi schema yang kuat. Setiap tier memiliki tanggung jawab yang jelas dan terpisah, memudahkan pengembangan dan pemeliharaan aplikasi.
