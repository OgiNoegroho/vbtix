# Dokumentasi Alur Fetching Data

Dokumen ini menjelaskan alur fetching data dari frontend ke backend dalam aplikasi VBTicket, termasuk implementasi SWR, struktur API, dan best practices.

## Struktur Direktori

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

## Komponen Utama

### 1. SWR Provider

SWR Provider dikonfigurasi di `src/app/providers.tsx` dan digunakan di root layout untuk menyediakan konfigurasi global SWR:

```tsx
// src/app/providers.tsx
"use client";

import { SWRConfig } from 'swr';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '~/components/ui/sonner';
import { fetcher } from '~/lib/api/client';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
          }}
        >
          {children}
          <Toaster />
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
```

### 2. API Client

Fungsi fetcher dan utilitas API untuk SWR didefinisikan di `src/lib/api/client.ts`:

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
  // Implementasi serupa dengan postData
}

// Fungsi untuk DELETE request
export async function deleteData<T>(url: string): Promise<T> {
  // Implementasi serupa
}
```

### 3. API Endpoints

Endpoint API didefinisikan di `src/lib/api/endpoints.ts` dan dikelompokkan berdasarkan peran pengguna:

```typescript
// src/lib/api/endpoints.ts
const API_BASE = "/api";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  // ...
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: `${API_BASE}/admin/dashboard`,
  EVENTS: `${API_BASE}/admin/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/admin/events/${id}`,
  // ...
};

// Organizer endpoints
export const ORGANIZER_ENDPOINTS = {
  DASHBOARD: `${API_BASE}/organizer/dashboard`,
  EVENTS: `${API_BASE}/organizer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/organizer/events/${id}`,
  // ...
};

// Buyer endpoints
export const BUYER_ENDPOINTS = {
  EVENTS: `${API_BASE}/buyer/events`,
  EVENT_DETAIL: (id: string) => `${API_BASE}/buyer/events/${id}`,
  // ...
};

// Common endpoints
export const COMMON_ENDPOINTS = {
  PAYMENTS: `${API_BASE}/payments`,
  NOTIFICATIONS: `${API_BASE}/notifications`,
};
```

### 4. Custom SWR Hooks

Custom hooks SWR didefinisikan di folder `src/lib/api/hooks/` dan dikelompokkan berdasarkan peran pengguna:

```typescript
// src/lib/api/hooks/admin.ts
import useSWR from 'swr';
import { ADMIN_ENDPOINTS } from '../endpoints';
import { fetcher } from '../client';

// Hook untuk mengambil data dashboard admin
export const useAdminDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(ADMIN_ENDPOINTS.DASHBOARD, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook untuk mengambil semua event admin
export const useAdminEvents = () => {
  const { data, error, isLoading, mutate } = useSWR(ADMIN_ENDPOINTS.EVENTS, fetcher);
  return { data, error, isLoading, mutate };
};

// Hook untuk mengambil detail event admin berdasarkan ID
export const useAdminEventDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ADMIN_ENDPOINTS.EVENT_DETAIL(id) : null, 
    fetcher
  );
  return { data, error, isLoading, mutate };
};

// ... hooks lainnya
```

## Alur Fetching Data

### 1. Komponen Frontend Memanggil Custom Hook SWR

```tsx
// src/components/dashboard/admin/section-card.tsx
import { useAdminDashboard } from "~/lib/api/hooks"

export function SectionCards() {
    const { data, isLoading, error } = useAdminDashboard();

    // Default values if data is not loaded yet
    const totalUsers = data?.totalUsers ?? 0;
    const totalEvents = data?.totalEvents ?? 0;
    const totalOrders = data?.totalOrders ?? 0;
    const pendingApprovals = data?.pendingApprovals ?? 0;
    
    // Render komponen dengan data
    // ...
}
```

### 2. Custom Hook SWR Menggunakan useSWR

```typescript
// src/lib/api/hooks/admin.ts
export const useAdminDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR(ADMIN_ENDPOINTS.DASHBOARD, fetcher);
  return { data, error, isLoading, mutate };
};
```

### 3. SWR Menggunakan Fetcher untuk Request API

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

### 4. Request Dikirim ke API Endpoint

```typescript
// src/lib/api/endpoints.ts
export const ADMIN_ENDPOINTS = {
  DASHBOARD: `${API_BASE}/admin/dashboard`,
  // ...
};
```

### 5. API Route Handler Memproses Request

```typescript
// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleGetDashboardData } from "~/server/api/dashboard";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
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

    // Call business logic
    const dashboardData = await handleGetDashboardData();

    // Return response
    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get dashboard data" },
      { status: 500 }
    );
  }
}
```

### 6. Business Logic Memproses Data

```typescript
// src/server/api/dashboard.ts
import { prisma } from "~/server/db/client";

export async function handleGetDashboardData() {
  // Mengambil data dari database menggunakan Prisma
  const [
    totalUsers,
    totalEvents,
    totalOrders,
    pendingApprovals
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.order.count(),
    prisma.approval.count({
      where: { status: "PENDING" }
    })
  ]);

  // Mengembalikan data dashboard
  return {
    totalUsers,
    totalEvents,
    totalOrders,
    pendingApprovals
  };
}
```

### 7. Response Dikembalikan ke Frontend

Response dari API dikembalikan ke frontend dan diproses oleh SWR, yang kemudian memperbarui state komponen dengan data baru.

## Validasi Data

Validasi data dilakukan di API route handler menggunakan Zod schema sebelum data diteruskan ke business logic:

```typescript
// src/app/api/admin/events/route.ts
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

    // Parse and validate request body
    const body = await request.json();
    
    try {
      // Validate input using Zod schema
      const validatedData = createEventSchema.parse(body);
      
      // Call business logic
      const event = await handleCreateEvent(validatedData, session.user.id);
      
      // Return response
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

## Mutasi Data

Untuk operasi mutasi data (create, update, delete), kita menggunakan fungsi mutate dari SWR:

```typescript
// src/app/(dashboard)/admin/events/[eventid]/page.tsx
export default function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const { data: event, isLoading: isEventLoading, error: eventError } = useAdminEventDetail(params.id);
  const reviewEventMutation = useReviewEvent();
  const [feedback, setFeedback] = useState("");

  const handleApproveEvent = async () => {
    try {
      await reviewEventMutation.mutateAsync({
        id: params.id,
        status: "approved",
        feedback,
      });
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  // ... rest of the component
}
```

### Optimistic Updates

Untuk pengalaman pengguna yang lebih baik, kita dapat menggunakan optimistic updates:

```typescript
export function useUpdateEvent(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ORGANIZER_ENDPOINTS.EVENT_DETAIL(id) : null,
    fetcher
  );
  
  const updateEvent = async (updatedData: any) => {
    // Optimistic update
    mutate(
      { success: true, data: { ...data?.data, ...updatedData } },
      false // false = tidak revalidasi segera
    );
    
    try {
      // Actual API call
      const response = await fetch(ORGANIZER_ENDPOINTS.EVENT_DETAIL(id), {
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

## Loading States

Untuk menangani loading states, kita menggunakan komponen skeleton:

```tsx
// src/components/dashboard/admin/loading-state.tsx
export function SectionCardsSkeleton() {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

Untuk menangani error, kita menggunakan error states:

```tsx
// src/app/(dashboard)/admin/events/[eventid]/page.tsx
if (eventError || !event) {
  return (
    <AdminRoute>
      <EventDetailErrorState message="Failed to load event details. Please try again later." />
    </AdminRoute>
  );
}
```

## Best Practices

1. **Gunakan SWR untuk Caching dan Revalidasi**
   - SWR menyediakan caching otomatis dan revalidasi untuk meningkatkan performa.

2. **Gunakan Custom Hooks untuk Reusability**
   - Buat custom hooks untuk setiap fitur aplikasi untuk meningkatkan reusability.

3. **Gunakan Optimistic Updates untuk UX yang Lebih Baik**
   - Update UI sebelum API call selesai untuk UX yang lebih responsif.

4. **Gunakan Loading States dan Error Handling**
   - Selalu sediakan loading states dan error handling untuk pengalaman pengguna yang lebih baik.

5. **Validasi Data di API Route Handler**
   - Validasi data menggunakan Zod schema di API route handler sebelum diteruskan ke business logic.

6. **Gunakan Format Response yang Konsisten**
   - Gunakan format response yang konsisten untuk memudahkan integrasi dengan frontend.

7. **Gunakan TypeScript untuk Type Safety**
   - Gunakan TypeScript untuk type safety dan autocomplete.
