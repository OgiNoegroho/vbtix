# Implementasi SWR untuk Data Fetching

Dokumentasi ini menjelaskan cara mengimplementasikan SWR (Stale-While-Revalidate) untuk data fetching dalam aplikasi penjualan tiket konser VBTicket.

## Daftar Isi

- [Pengenalan](#pengenalan)
- [Setup SWR](#setup-swr)
- [Struktur Fetching Data](#struktur-fetching-data)
- [Penggunaan SWR dalam Komponen](#penggunaan-swr-dalam-komponen)
- [Penggunaan dengan Server Components](#penggunaan-dengan-server-components)
- [Fitur Lanjutan](#fitur-lanjutan)
- [Best Practices](#best-practices)

## Pengenalan

SWR adalah library React Hooks untuk data fetching yang mengimplementasikan strategi stale-while-revalidate. Strategi ini menampilkan data dari cache (stale) terlebih dahulu, kemudian melakukan fetch data baru di background (revalidate), dan akhirnya menampilkan data terbaru.

Keuntungan menggunakan SWR:
- Caching otomatis
- Deduplikasi request
- Revalidasi otomatis saat fokus kembali, koneksi jaringan pulih, atau pada interval tertentu
- Optimistic UI updates
- Pagination dan infinite loading

## Setup SWR

### Instalasi

```bash
npm install swr
# atau
yarn add swr
```

### Konfigurasi SWR Provider

Buat SWR Provider untuk mengonfigurasi SWR secara global di `/src/app/providers.tsx`:

```tsx
"use client";

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig 
      value={{
        fetcher: async (url: string) => {
          const res = await fetch(url);
          
          // Jika response tidak OK, lempar error
          if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.');
            const info = await res.json();
            (error as any).info = info;
            (error as any).status = res.status;
            throw error;
          }
          
          return res.json();
        },
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

Gunakan provider ini di root layout:

```tsx
// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## Struktur Fetching Data

### API Client (`/src/lib/api/client.ts`)

```typescript
// Fungsi fetcher dasar untuk SWR
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

// Fungsi untuk POST request
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

// Fungsi untuk PUT request
export async function putData<T>(url: string, data: any): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while updating the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
}

// Fungsi untuk DELETE request
export async function deleteData<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while deleting the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
}
```

### API Hooks (`/src/lib/api/hooks.ts`)

Buat hooks SWR untuk berbagai fitur aplikasi:

```typescript
import useSWR, { KeyedMutator, SWRConfiguration } from 'swr';
import { fetcher, postData, putData, deleteData } from './client';
import { ADMIN_ENDPOINTS, ORGANIZER_ENDPOINTS, BUYER_ENDPOINTS } from './endpoints';

// Tipe untuk response API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ===== HOOKS ADMIN =====

export function useAdminDashboard(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<any>>(
    ADMIN_ENDPOINTS.DASHBOARD,
    fetcher,
    options
  );

  return {
    dashboardData: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAdminEvents(options?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<any[]>>(
    ADMIN_ENDPOINTS.EVENTS,
    fetcher,
    options
  );

  return {
    events: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// ... hooks lainnya
```

## Penggunaan SWR dalam Komponen

### Contoh Penggunaan di Halaman Admin

```tsx
"use client";

import { useAdminEvents } from "~/lib/api/hooks";
import { DataTable } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";

export default function AdminEventsPage() {
  const { events, isLoading, isError, mutate } = useAdminEvents();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error loading events. Please try again.</div>;
  }

  return (
    <div>
      <h1>Manage Events</h1>
      <Button onClick={() => mutate()}>Refresh</Button>
      <DataTable 
        data={events} 
        columns={[
          { header: "Title", accessorKey: "title" },
          { header: "Date", accessorKey: "date" },
          { header: "Status", accessorKey: "status" },
          // ... more columns
        ]} 
      />
    </div>
  );
}
```

### Contoh Penggunaan di Halaman Organizer

```tsx
"use client";

import { useState } from "react";
import { useOrganizerEvents } from "~/lib/api/hooks";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { EventForm } from "~/components/events/event-form";

export default function OrganizerEventsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { events, isLoading, isError, createEvent } = useOrganizerEvents();

  const handleCreateEvent = async (eventData) => {
    try {
      await createEvent(eventData);
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error loading events. Please try again.</div>;
  }

  return (
    <div>
      <h1>My Events</h1>
      <Button onClick={() => setIsCreating(true)}>Create New Event</Button>
      
      {isCreating && (
        <EventForm onSubmit={handleCreateEvent} onCancel={() => setIsCreating(false)} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

## Penggunaan dengan Server Components

Untuk Next.js App Router, gunakan SWR dengan Client Components. Untuk Server Components, gunakan fetch langsung:

### Server Component

```tsx
// src/app/(dashboard)/admin/events/page.tsx
import { DataTable } from "~/components/ui/data-table";
import { ADMIN_ENDPOINTS } from "~/lib/api/endpoints";
import { ClientEventActions } from "./client-actions";

// Server Component
export default async function AdminEventsPage() {
  // Fetch data pada server
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${ADMIN_ENDPOINTS.EVENTS}`);
  const { data: events } = await response.json();

  return (
    <div>
      <h1>Manage Events</h1>
      <ClientEventActions />
      <DataTable 
        data={events} 
        columns={[
          { header: "Title", accessorKey: "title" },
          { header: "Date", accessorKey: "date" },
          { header: "Status", accessorKey: "status" },
          // ... more columns
        ]} 
      />
    </div>
  );
}
```

### Client Component untuk Interaksi

```tsx
"use client";
// src/app/(dashboard)/admin/events/client-actions.tsx
import { useAdminEvents } from "~/lib/api/hooks";
import { Button } from "~/components/ui/button";

export function ClientEventActions() {
  const { mutate } = useAdminEvents();

  return (
    <Button onClick={() => mutate()}>Refresh</Button>
  );
}
```

## Fitur Lanjutan

### Pagination

```tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { BUYER_ENDPOINTS } from "~/lib/api/endpoints";
import { fetcher } from "~/lib/api/client";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { EventCard } from "~/components/events/event-card";

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `${BUYER_ENDPOINTS.EVENTS}?page=${page}&limit=9`,
    fetcher
  );

  const events = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error loading events. Please try again.</div>;
  }

  return (
    <div>
      <h1>Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      <div className="flex justify-center mt-6 gap-2">
        <Button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="py-2 px-4">
          Page {page} of {totalPages}
        </span>
        <Button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Infinite Loading

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useSWRInfinite } from "swr";
import { BUYER_ENDPOINTS } from "~/lib/api/endpoints";
import { fetcher } from "~/lib/api/client";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { EventCard } from "~/components/events/event-card";

const PAGE_SIZE = 9;

export default function EventsPage() {
  const getKey = (pageIndex, previousPageData) => {
    // Reached the end
    if (previousPageData && !previousPageData.data.length) return null;
    
    // First page, no previousPageData
    if (pageIndex === 0) return `${BUYER_ENDPOINTS.EVENTS}?page=1&limit=${PAGE_SIZE}`;
    
    // Add the cursor to the API endpoint
    return `${BUYER_ENDPOINTS.EVENTS}?page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetcher
  );

  const events = data ? data.flatMap(page => page.data) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.data.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < PAGE_SIZE);
  
  // Intersection Observer for infinite scroll
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && !isReachingEnd) {
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, isLoadingMore, isReachingEnd, setSize, size]);

  if (isLoading && !events.length) {
    return <Loader />;
  }

  if (error) {
    return <div>Error loading events. Please try again.</div>;
  }

  return (
    <div>
      <h1>Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {!isReachingEnd && (
        <div ref={observerTarget} className="flex justify-center p-4 mt-4">
          {isLoadingMore ? <Loader /> : <Button onClick={() => setSize(size + 1)}>Load More</Button>}
        </div>
      )}
    </div>
  );
}
```

### Optimistic Updates

```tsx
"use client";

import { useOrganizerEvent } from "~/lib/api/hooks";
import { Button } from "~/components/ui/button";
import { Loader } from "~/components/ui/loader";
import { EventForm } from "~/components/events/event-form";

export default function EditEventPage({ params }) {
  const { eventId } = params;
  const { event, isLoading, isError, updateEvent } = useOrganizerEvent(eventId);

  const handleUpdateEvent = async (updatedData) => {
    try {
      await updateEvent(updatedData);
      // Show success message
    } catch (error) {
      // Show error message
      console.error("Failed to update event:", error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error loading event. Please try again.</div>;
  }

  return (
    <div>
      <h1>Edit Event</h1>
      <EventForm initialData={event} onSubmit={handleUpdateEvent} />
    </div>
  );
}
```

## Best Practices

### 1. Gunakan TypeScript untuk Type Safety

```typescript
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  status: string;
}

export function useEvents() {
  const { data, error, isLoading } = useSWR<ApiResponse<Event[]>>(
    BUYER_ENDPOINTS.EVENTS,
    fetcher
  );

  return {
    events: data?.data || [],
    isLoading,
    isError: error,
  };
}
```

### 2. Gunakan Conditional Fetching

```typescript
// Hanya fetch jika eventId ada
const { data } = useSWR(eventId ? `/api/events/${eventId}` : null, fetcher);
```

### 3. Gunakan Error Handling yang Baik

```tsx
if (isError) {
  return (
    <div className="error-container">
      <h2>Error</h2>
      <p>{isError.message || "Failed to load data"}</p>
      <Button onClick={() => mutate()}>Try Again</Button>
    </div>
  );
}
```

### 4. Gunakan Loading States yang Informatif

```tsx
if (isLoading) {
  return (
    <div className="loading-container">
      <Loader />
      <p>Loading events...</p>
    </div>
  );
}
```

### 5. Gunakan Revalidation dengan Bijak

```typescript
// Revalidasi setiap 30 detik untuk data yang sering berubah
const { data } = useSWR('/api/live-stats', fetcher, { refreshInterval: 30000 });

// Tidak perlu revalidasi untuk data statis
const { data } = useSWR('/api/static-content', fetcher, { revalidateOnFocus: false });
```

### 6. Gunakan Prefetching untuk Meningkatkan UX

```typescript
import { preload } from 'swr';

// Prefetch data
preload('/api/events', fetcher);
```

### 7. Gunakan Suspense Mode untuk Integrasi dengan React Suspense

```tsx
import { Suspense } from 'react';
import { SWRConfig } from 'swr';

<SWRConfig value={{ suspense: true }}>
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
</SWRConfig>
```

---

Dengan mengikuti panduan ini, Anda dapat mengimplementasikan data fetching yang efisien dan robust menggunakan SWR dalam aplikasi penjualan tiket konser VBTicket.
