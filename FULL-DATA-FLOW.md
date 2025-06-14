# Alur Data Lengkap: Dari Database hingga UI dengan SWR

Dokumen ini menjelaskan alur data lengkap dalam aplikasi VBTicket, mulai dari database hingga tampilan UI, dengan fokus pada integrasi antara backend API 3-tier dan frontend data fetching menggunakan SWR.

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Arsitektur End-to-End](#arsitektur-end-to-end)
- [Backend: Arsitektur API 3-Tier](#backend-arsitektur-api-3-tier)
- [Frontend: Data Fetching dengan SWR](#frontend-data-fetching-dengan-swr)
- [Integrasi Backend-Frontend](#integrasi-backend-frontend)
- [Contoh Implementasi Lengkap](#contoh-implementasi-lengkap)
- [Optimisasi dan Best Practices](#optimisasi-dan-best-practices)
- [Error Handling End-to-End](#error-handling-end-to-end)
- [Kesimpulan](#kesimpulan)

## Gambaran Umum

Alur data lengkap dalam aplikasi VBTicket:

```
Database → Service → Business Logic → API Route → SWR Hook → React Component → UI
```

Arsitektur ini menggabungkan:
- **Backend API 3-Tier**: Database, Service, Business Logic, dan API Route
- **Frontend Data Fetching**: SWR Hooks dan React Components

## Arsitektur End-to-End

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Database   │────▶│  Services   │────▶│  Business   │────▶│  API Route  │
│             │     │  (Tier 3)   │     │   Logic     │     │  (Tier 1)   │
│             │     │             │     │  (Tier 2)   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│    React    │◀────│  SWR Hook   │◀────│ API Client  │◀────│ SWR Fetcher │
│  Component  │     │             │     │             │     │             │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Backend: Arsitektur API 3-Tier

### Tier 3: Services (Database Access)

Services bertanggung jawab untuk berinteraksi dengan database.

```typescript
// src/server/services/event.service.ts
import { db } from "~/server/db";

export const eventService = {
  async findEvents({ status, page = 1, limit = 10 }) {
    const where = status ? { status } : {};
    
    const total = await db.event.count({ where });
    
    const events = await db.event.findMany({
      where,
      include: { organizer: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return { events, total };
  }
};
```

### Tier 2: Business Logic

Business logic bertanggung jawab untuk memproses data dan menerapkan aturan bisnis.

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";

export async function handleGetEvents({ status, page = 1, limit = 10 }) {
  const { events, total } = await eventService.findEvents({
    status,
    page,
    limit
  });
  
  const processedEvents = events.map(event => ({
    ...event,
    formattedDate: formatDate(event.date)
  }));
  
  return {
    events: processedEvents,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

### Tier 1: API Route

API route bertanggung jawab untuk menangani HTTP request dan response.

```typescript
// src/app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Autentikasi dan otorisasi
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parsing query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Memanggil business logic
    const result = await handleGetEvents({ status, page, limit });
    
    // Mengembalikan response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
```

## Frontend: Data Fetching dengan SWR

### API Endpoints

Definisi endpoint API yang digunakan oleh frontend.

```typescript
// src/lib/api/endpoints.ts
const API_BASE = "/api";

export const ADMIN_ENDPOINTS = {
  EVENTS: `${API_BASE}/admin/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/admin/events/${id}`,
  // ...
};
```

### API Client

Fungsi fetcher dan utilitas API untuk SWR.

```typescript
// src/lib/api/client.ts
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
}
```

### SWR Provider

Konfigurasi global untuk SWR.

```tsx
// src/app/providers.tsx
"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { fetcher } from '~/lib/api/client';

export function Providers({ children }: ReactNode) {
  return (
    <SWRConfig 
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

### Custom SWR Hooks

Custom hooks yang menggunakan SWR untuk fetching data.

```typescript
// src/lib/api/hooks/admin.ts
import useSWR from 'swr';
import { ADMIN_ENDPOINTS } from '../endpoints';

export function useAdminEvents(options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ADMIN_ENDPOINTS.EVENTS,
    {
      ...options
    }
  );
  
  return {
    events: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate
  };
}

export function useAdminEvent(id, options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ADMIN_ENDPOINTS.EVENT_DETAIL(id) : null,
    {
      ...options
    }
  );
  
  return {
    event: data?.data,
    isLoading,
    isError: error,
    mutate
  };
}
```

### React Components

Komponen React yang menggunakan custom hooks untuk menampilkan data.

```tsx
// src/app/(dashboard)/admin/events/page.tsx
"use client";

import { useAdminEvents } from "~/lib/api/hooks/admin";
import { DataTable } from "~/components/ui/data-table";
import { Loader } from "~/components/ui/loader";

export default function AdminEventsPage() {
  const { events, meta, isLoading, isError } = useAdminEvents();
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (isError) {
    return <div>Error loading events. Please try again.</div>;
  }
  
  return (
    <div>
      <h1>Manage Events</h1>
      <DataTable 
        data={events} 
        columns={[
          { header: "Title", accessorKey: "title" },
          { header: "Date", accessorKey: "formattedDate" },
          { header: "Status", accessorKey: "status" },
          // ...
        ]} 
      />
      <Pagination 
        currentPage={meta.page} 
        totalPages={meta.totalPages} 
      />
    </div>
  );
}
```

## Integrasi Backend-Frontend

### Format Response API

Format response API yang konsisten memudahkan integrasi dengan frontend.

```typescript
// Format response sukses
return NextResponse.json({
  success: true,
  data: result.events,
  meta: result.meta
});

// Format response error
return NextResponse.json(
  { success: false, error: "Failed to fetch events" },
  { status: 500 }
);
```

### Parsing Response di SWR Hook

Custom hooks SWR mengekstrak data dari response API.

```typescript
export function useAdminEvents() {
  const { data, error, isLoading } = useSWR(ADMIN_ENDPOINTS.EVENTS);
  
  return {
    // Ekstrak data dari response
    events: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error
  };
}
```

### Mutasi Data

Mutasi data (create, update, delete) menggunakan SWR.

```typescript
export function useCreateEvent() {
  const { mutate: mutateEventList } = useSWR(ADMIN_ENDPOINTS.EVENTS);
  
  const createEvent = async (eventData) => {
    try {
      const response = await fetch(ADMIN_ENDPOINTS.EVENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      const result = await response.json();
      
      // Revalidasi daftar event setelah membuat event baru
      mutateEventList();
      
      return result.data;
    } catch (error) {
      throw error;
    }
  };
  
  return { createEvent };
}
```

## Contoh Implementasi Lengkap

Berikut adalah contoh implementasi lengkap untuk fitur detail event:

### Backend

#### Service (Tier 3)

```typescript
// src/server/services/event.service.ts
export const eventService = {
  async findById(id: string) {
    return db.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        ticketTypes: true
      }
    });
  }
};

// src/server/services/ticket.service.ts
export const ticketService = {
  async getEventStats(eventId: string) {
    const soldCount = await db.ticket.count({
      where: {
        ticketType: { eventId },
        status: 'SOLD'
      }
    });
    
    const revenue = await db.ticket.aggregate({
      where: {
        ticketType: { eventId },
        status: 'SOLD'
      },
      _sum: { price: true }
    });
    
    return {
      soldCount,
      revenue: revenue._sum.price || 0
    };
  }
};
```

#### Business Logic (Tier 2)

```typescript
// src/server/api/events.ts
export async function handleGetEventById(id: string) {
  // Mendapatkan event
  const event = await eventService.findById(id);
  
  if (!event) {
    return null;
  }
  
  // Mendapatkan statistik
  const stats = await ticketService.getEventStats(id);
  
  // Menggabungkan data
  return {
    ...event,
    formattedDate: formatDate(event.date),
    stats
  };
}
```

#### API Route (Tier 1)

```typescript
// src/app/api/admin/events/[eventid]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Autentikasi dan otorisasi
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Memanggil business logic
    const event = await handleGetEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    
    // Mengembalikan response
    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error(`Error fetching event ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
```

### Frontend

#### API Endpoint

```typescript
// src/lib/api/endpoints.ts
export const ADMIN_ENDPOINTS = {
  // ...
  EVENT_DETAIL: (id: string) => `/api/admin/events/${id}`,
};
```

#### Custom Hook

```typescript
// src/lib/api/hooks/admin.ts
export function useAdminEvent(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ADMIN_ENDPOINTS.EVENT_DETAIL(id) : null
  );
  
  const updateEvent = async (updatedData) => {
    // Optimistic update
    mutate(
      { success: true, data: { ...data?.data, ...updatedData } },
      false
    );
    
    try {
      const response = await fetch(ADMIN_ENDPOINTS.EVENT_DETAIL(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      // Revalidasi setelah sukses
      mutate();
    } catch (error) {
      // Rollback pada error
      mutate();
      throw error;
    }
  };
  
  return {
    event: data?.data,
    isLoading,
    isError: error,
    updateEvent,
    mutate
  };
}
```

#### React Component

```tsx
// src/app/(dashboard)/admin/events/[eventid]/page.tsx
"use client";

import { useAdminEvent } from "~/lib/api/hooks/admin";
import { Loader } from "~/components/ui/loader";
import { Button } from "~/components/ui/button";
import { EventForm } from "~/components/events/event-form";

export default function AdminEventDetailPage({ params }) {
  const { id } = params;
  const { event, isLoading, isError, updateEvent } = useAdminEvent(id);
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (isError) {
    return <div>Error loading event. Please try again.</div>;
  }
  
  if (!event) {
    return <div>Event not found.</div>;
  }
  
  const handleUpdateEvent = async (data) => {
    try {
      await updateEvent(data);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };
  
  return (
    <div>
      <h1>{event.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2>Event Details</h2>
          <p><strong>Date:</strong> {event.formattedDate}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Status:</strong> {event.status}</p>
          <p><strong>Organizer:</strong> {event.organizer.name}</p>
        </div>
        
        <div className="card">
          <h2>Event Statistics</h2>
          <p><strong>Tickets Sold:</strong> {event.stats.soldCount}</p>
          <p><strong>Revenue:</strong> ${event.stats.revenue}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h2>Edit Event</h2>
        <EventForm 
          initialData={event} 
          onSubmit={handleUpdateEvent} 
        />
      </div>
    </div>
  );
}
```

## Optimisasi dan Best Practices

### 1. Caching dengan SWR

SWR menyediakan caching otomatis untuk meningkatkan performa:

```typescript
// Konfigurasi cache
<SWRConfig 
  value={{
    dedupingInterval: 5000, // Deduplikasi request dalam 5 detik
    focusThrottleInterval: 5000, // Throttle revalidasi saat fokus
    revalidateOnFocus: true, // Revalidasi saat fokus kembali
    revalidateOnReconnect: true, // Revalidasi saat koneksi pulih
  }}
>
  {children}
</SWRConfig>
```

### 2. Optimistic Updates

Update UI sebelum API call selesai untuk UX yang lebih baik:

```typescript
const updateEvent = async (updatedData) => {
  // Optimistic update
  mutate(
    { success: true, data: { ...data?.data, ...updatedData } },
    false
  );
  
  try {
    // Actual API call
    await fetch(ADMIN_ENDPOINTS.EVENT_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(updatedData),
      // ...
    });
    
    // Revalidasi setelah sukses
    mutate();
  } catch (error) {
    // Rollback pada error
    mutate();
    throw error;
  }
};
```

### 3. Pagination

Implementasi pagination untuk data yang besar:

```typescript
export function useAdminEventsPaginated() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data, error, isLoading } = useSWR(
    `${ADMIN_ENDPOINTS.EVENTS}?page=${page}&limit=${limit}`
  );
  
  return {
    events: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: error,
    setPage,
    setLimit
  };
}
```

### 4. Conditional Fetching

Fetch data hanya jika diperlukan:

```typescript
// Hanya fetch jika id tersedia
const { data } = useSWR(id ? ADMIN_ENDPOINTS.EVENT_DETAIL(id) : null);
```

### 5. Prefetching

Prefetch data untuk meningkatkan UX:

```typescript
import { preload } from 'swr';

// Prefetch data
preload(ADMIN_ENDPOINTS.EVENTS, fetcher);
```

## Error Handling End-to-End

### Backend Error Handling

```typescript
// API Route
try {
  // ...
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { success: false, error: "Operation failed" },
    { status: 500 }
  );
}
```

### Frontend Error Handling

```tsx
// Component
const { data, error } = useSWR(ADMIN_ENDPOINTS.EVENTS);

if (error) {
  if (error.status === 401) {
    return <div>You are not authorized to view this page.</div>;
  }
  
  return (
    <div className="error-container">
      <h2>Error</h2>
      <p>{error.info?.error || "Failed to load data"}</p>
      <Button onClick={() => mutate()}>Try Again</Button>
    </div>
  );
}
```

### Global Error Handling

```tsx
// src/app/providers.tsx
<SWRConfig
  value={{
    onError: (error, key) => {
      // Log error ke service monitoring
      console.error(`SWR Error for ${key}:`, error);
      
      // Tampilkan toast notification
      toast.error("An error occurred while fetching data");
    }
  }}
>
  {children}
</SWRConfig>
```

## Kesimpulan

Alur data lengkap dalam aplikasi VBTicket menggabungkan:

1. **Backend API 3-Tier**:
   - Tier 3 (Services): Akses database
   - Tier 2 (Business Logic): Pemrosesan data
   - Tier 1 (API Route): HTTP request/response

2. **Frontend Data Fetching dengan SWR**:
   - API Endpoints: Definisi endpoint
   - API Client: Fungsi fetcher
   - SWR Provider: Konfigurasi global
   - Custom Hooks: Abstraksi fetching data
   - React Components: UI

Integrasi yang baik antara backend dan frontend memastikan:
- Data flow yang konsisten dan terstruktur
- Error handling yang robust
- Performa yang optimal dengan caching dan optimistic updates
- UX yang baik dengan loading states dan error handling

Dengan arsitektur ini, aplikasi VBTicket dapat mengelola data secara efisien dari database hingga UI, memberikan pengalaman yang baik bagi pengguna dan maintainability yang baik bagi developer.
