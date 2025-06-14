# Alur Data Fetching dengan SWR dalam Aplikasi VBTicket

Dokumen ini menjelaskan alur lengkap bagaimana data mengalir dalam aplikasi VBTicket menggunakan SWR, dari frontend hingga backend.

## Daftar Isi

- [Alur Dasar](#alur-dasar)
- [Struktur Folder](#struktur-folder)
- [Alur Detail](#alur-detail)
- [Alur Mutasi Data](#alur-mutasi-data)
- [Alur Optimistic Updates](#alur-optimistic-updates)
- [Alur Revalidasi Otomatis](#alur-revalidasi-otomatis)
- [Alur Conditional Fetching](#alur-conditional-fetching)
- [Alur Pagination](#alur-pagination)
- [Alur Infinite Loading](#alur-infinite-loading)
- [Kesimpulan](#kesimpulan)

## Alur Dasar

```
Frontend Component → SWR Hook → API Client → API Endpoint → Backend API → Database → Response
```

## Struktur Folder

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts         # Fungsi fetcher dan utilitas API
│   │   ├── endpoints.ts      # Definisi endpoint API
│   │   └── hooks/            # Folder untuk semua custom hooks SWR
│   │       ├── index.ts      # Export semua hooks
│   │       ├── admin.ts      # Hooks untuk admin
│   │       ├── organizer.ts  # Hooks untuk organizer
│   │       ├── buyer.ts      # Hooks untuk buyer
│   │       └── common.ts     # Hooks umum (auth, dll)
├── app/
│   ├── providers.tsx         # Provider wrapper (termasuk SWR)
│   └── layout.tsx            # Root layout yang menggunakan providers
```

## Alur Detail

### Langkah 1: Komponen Frontend Memanggil Custom Hook SWR

```tsx
// src/app/(dashboard)/admin/events/page.tsx
"use client";

import { useAdminEvents } from "~/lib/api/hooks";
import { DataTable } from "~/components/ui/data-table";

export default function AdminEventsPage() {
  // Memanggil custom hook SWR
  const { events, isLoading, isError } = useAdminEvents();
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading events</div>;
  
  return (
    <div>
      <h1>Manage Events</h1>
      <DataTable data={events} />
    </div>
  );
}
```

### Langkah 2: Custom Hook SWR Menggunakan useSWR

```typescript
// src/lib/api/hooks/admin.ts
import useSWR from 'swr';
import { fetcher } from '../client';
import { ADMIN_ENDPOINTS } from '../endpoints';

export function useAdminEvents() {
  // Memanggil useSWR dengan endpoint dan fetcher
  const { data, error, isLoading, mutate } = useSWR(
    ADMIN_ENDPOINTS.EVENTS,
    fetcher
  );
  
  return {
    events: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
}
```

### Langkah 3: SWR Menggunakan Fetcher untuk Request API

```typescript
// src/lib/api/client.ts
export async function fetcher<T>(url: string): Promise<T> {
  // Melakukan HTTP request ke API
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

### Langkah 4: Request Dikirim ke API Endpoint

```typescript
// src/lib/api/endpoints.ts
export const ADMIN_ENDPOINTS = {
  EVENTS: '/api/admin/events',
  // ...
};
```

### Langkah 5: API Route Handler Menerima Request

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
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Hanya admin yang dapat mengakses endpoint ini
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
    
    // Memanggil handler dari tier 2 (business logic)
    const events = await handleGetEvents();
    
    // Mengembalikan response
    return NextResponse.json({
      success: true,
      data: events
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

### Langkah 6: Business Logic Handler Memproses Request

```typescript
// src/server/api/events.ts
import { eventService } from "~/server/services/event.service";

export async function handleGetEvents() {
  // Memanggil service dari tier 3 (data access)
  const events = await eventService.getAllEvents();
  
  // Memproses data jika diperlukan
  const processedEvents = events.map(event => ({
    ...event,
    formattedDate: formatDate(event.date)
  }));
  
  return processedEvents;
}
```

### Langkah 7: Service Layer Mengakses Database

```typescript
// src/server/services/event.service.ts
import { db } from "~/server/db";

export const eventService = {
  async getAllEvents() {
    // Mengakses database menggunakan Prisma
    const events = await db.event.findMany({
      include: {
        organizer: true,
        ticketTypes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return events;
  },
  
  // Metode lainnya
};
```

### Langkah 8: Response Dikembalikan ke Frontend

Response mengalir kembali melalui jalur yang sama:

```
Database → Service → Business Logic → API Route → Fetcher → SWR → Component
```

SWR menyimpan data dalam cache dan memberikannya ke komponen.

## Alur Mutasi Data

### Contoh: Membuat Event Baru

#### Komponen Form

```tsx
import { useOrganizerEvents } from "~/lib/api/hooks";

export function CreateEventForm() {
  const { createEvent } = useOrganizerEvents();
  
  const handleSubmit = async (data) => {
    try {
      await createEvent(data);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Custom Hook

```typescript
export function useOrganizerEvents() {
  const { data, error, isLoading, mutate } = useSWR(
    ORGANIZER_ENDPOINTS.EVENTS,
    fetcher
  );
  
  const createEvent = async (eventData) => {
    try {
      // Memanggil API untuk membuat event
      const result = await postData(ORGANIZER_ENDPOINTS.EVENTS, eventData);
      
      // Revalidasi data setelah membuat event baru
      mutate();
      
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  return {
    events: data?.data || [],
    isLoading,
    isError: error,
    createEvent,
    mutate
  };
}
```

#### API Client

```typescript
export async function postData<T>(url: string, data: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while posting the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
}
```

## Alur Optimistic Updates

```typescript
export function useOrganizerEvent(eventId) {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? ORGANIZER_ENDPOINTS.EVENT_DETAIL(eventId) : null,
    fetcher
  );
  
  const updateEvent = async (updatedData) => {
    // Data saat ini
    const currentData = data?.data;
    
    // Optimistic update: Update UI sebelum API call selesai
    mutate(
      { success: true, data: { ...currentData, ...updatedData } },
      false // false = tidak revalidasi segera
    );
    
    try {
      // Actual API call
      await putData(ORGANIZER_ENDPOINTS.EVENT_DETAIL(eventId), updatedData);
      
      // Revalidasi setelah sukses untuk memastikan data sinkron
      mutate();
    } catch (error) {
      // Rollback pada error dengan revalidasi
      mutate();
      throw error;
    }
  };
  
  return {
    event: data?.data,
    isLoading,
    isError: error,
    updateEvent
  };
}
```

## Alur Revalidasi Otomatis

SWR secara otomatis melakukan revalidasi data dalam situasi berikut:

1. **Saat fokus kembali ke tab/window** - Ketika pengguna kembali ke aplikasi setelah berpindah tab
2. **Saat koneksi jaringan pulih** - Ketika pengguna kembali online setelah offline
3. **Pada interval tertentu** - Jika dikonfigurasi dengan `refreshInterval`

```typescript
// Contoh dengan interval revalidasi
export function useLiveStats() {
  const { data, error, isLoading } = useSWR(
    '/api/stats',
    fetcher,
    { refreshInterval: 30000 } // Revalidasi setiap 30 detik
  );
  
  return {
    stats: data?.data,
    isLoading,
    isError: error
  };
}
```

## Alur Conditional Fetching

```typescript
// Hanya fetch jika eventId tersedia
export function useEvent(eventId) {
  const { data, error, isLoading } = useSWR(
    eventId ? `/api/events/${eventId}` : null,
    fetcher
  );
  
  return {
    event: data?.data,
    isLoading,
    isError: error
  };
}
```

## Alur Pagination

```typescript
export function useEventsPaginated() {
  const [page, setPage] = useState(1);
  
  const { data, error, isLoading } = useSWR(
    `/api/events?page=${page}&limit=10`,
    fetcher
  );
  
  const goToNextPage = () => setPage(p => p + 1);
  const goToPrevPage = () => setPage(p => Math.max(1, p - 1));
  
  return {
    events: data?.data || [],
    pagination: data?.meta?.pagination,
    isLoading,
    isError: error,
    goToNextPage,
    goToPrevPage,
    page
  };
}
```

## Alur Infinite Loading

```typescript
export function useEventsInfinite() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data.length) return null;
    return `/api/events?page=${pageIndex + 1}&limit=10`;
  };
  
  const { data, size, setSize, error, isLoading } = useSWRInfinite(
    getKey,
    fetcher
  );
  
  const events = data ? data.flatMap(page => page.data) : [];
  const isReachingEnd = data && data[data.length - 1]?.data.length < 10;
  
  const loadMore = () => setSize(size + 1);
  
  return {
    events,
    isLoading,
    isError: error,
    loadMore,
    isReachingEnd
  };
}
```

## Kesimpulan

Alur data fetching dengan SWR dalam aplikasi VBTicket mengikuti pola yang konsisten:

1. **Komponen** memanggil **custom hook SWR**
2. **Custom hook** menggunakan **useSWR** dengan endpoint dan fetcher
3. **SWR** mengelola cache, loading state, dan error state
4. **Fetcher** melakukan HTTP request ke **API endpoint**
5. **API route** memproses request dengan autentikasi dan otorisasi
6. **Business logic** memproses data
7. **Service layer** mengakses database
8. **Response** dikembalikan melalui jalur yang sama
9. **SWR** menyimpan data dalam cache dan memberikannya ke komponen

Dengan alur ini, Anda mendapatkan:
- Caching otomatis
- Deduplikasi request
- Revalidasi otomatis
- Loading dan error states
- Optimistic updates
- Pagination dan infinite loading

Semua ini dengan kode yang lebih sederhana dan terstruktur dibandingkan dengan implementasi manual menggunakan useState dan useEffect.
