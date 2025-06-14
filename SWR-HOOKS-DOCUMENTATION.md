# Dokumentasi SWR Hooks VBTicket

Dokumen ini berisi panduan penggunaan SWR hooks untuk mengakses API VBTicket dari frontend. SWR hooks memudahkan pengambilan data dengan fitur caching, revalidasi otomatis, dan penanganan error.

## Daftar Isi

1. [Pengenalan SWR](#pengenalan-swr)
2. [Hooks Dashboard Admin](#hooks-dashboard-admin)
3. [Hooks Manajemen Event](#hooks-manajemen-event)
4. [Hooks Manajemen Organizer](#hooks-manajemen-organizer)
5. [Hooks Manajemen User](#hooks-manajemen-user)
6. [Contoh Penggunaan](#contoh-penggunaan)

## Pengenalan SWR

SWR (Stale-While-Revalidate) adalah strategi untuk memvalidasi data yang memungkinkan aplikasi menampilkan data dari cache terlebih dahulu (stale), kemudian mengirim permintaan untuk memperbarui data (revalidate).

Keuntungan menggunakan SWR:
- Data selalu up-to-date
- Automatic revalidation
- Penanganan loading state
- Penanganan error
- Pagination
- Optimistic UI

## Hooks Dashboard Admin

### useAdminDashboard

Hook untuk mengambil data dashboard admin utama.

```typescript
import { useAdminDashboard } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { dashboardData, error, isLoading, mutate } = useAdminDashboard(5);
```

**Parameter:**
- `limit` (opsional): Jumlah item untuk data terbaru (default: 5)

**Return Value:**
- `dashboardData`: Data dashboard admin
  - `stats`: Statistik dashboard (totalEvents, totalOrganizers, totalUsers, dll)
  - `recentEvents`: Daftar event terbaru
  - `recentOrganizers`: Daftar organizer terbaru
  - `recentUsers`: Daftar user terbaru
  - `salesOverview`: Overview penjualan
  - `pendingEvents`: Daftar event yang menunggu persetujuan
  - `pendingOrganizers`: Daftar organizer yang belum diverifikasi
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useAdminOrganizerDashboard

Hook untuk mengambil data dashboard organizer admin.

```typescript
import { useAdminOrganizerDashboard } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { organizerData, error, isLoading, mutate } = useAdminOrganizerDashboard(5);
```

**Parameter:**
- `limit` (opsional): Jumlah item untuk data terbaru (default: 5)

**Return Value:**
- `organizerData`: Data dashboard organizer
  - `stats`: Statistik organizer (totalOrganizers, verifiedOrganizers, pendingOrganizers, dll)
  - `recentOrganizers`: Daftar organizer terbaru
  - `pendingOrganizers`: Daftar organizer yang belum diverifikasi
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useAdminEventDashboard

Hook untuk mengambil data dashboard event admin.

```typescript
import { useAdminEventDashboard } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { eventData, error, isLoading, mutate } = useAdminEventDashboard(5);
```

**Parameter:**
- `limit` (opsional): Jumlah item untuk data terbaru (default: 5)

**Return Value:**
- `eventData`: Data dashboard event
  - `stats`: Statistik event (totalEvents, pendingEvents, publishedEvents, dll)
  - `recentEvents`: Daftar event terbaru
  - `pendingEvents`: Daftar event yang menunggu persetujuan
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

## Hooks Manajemen Event

### useAdminEvents

Hook untuk mengambil daftar event dengan filter dan pagination.

```typescript
import { useAdminEvents } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { events, meta, error, isLoading, mutate } = useAdminEvents({
  page: 1,
  limit: 10,
  status: "PUBLISHED",
  search: "concert",
  featured: true
});
```

**Parameter:**
- `params` (opsional): Parameter query
  - `page`: Nomor halaman
  - `limit`: Jumlah item per halaman
  - `status`: Filter berdasarkan status event
  - `search`: Kata kunci pencarian
  - `featured`: Filter berdasarkan status featured

**Return Value:**
- `events`: Daftar event
- `meta`: Metadata pagination (page, limit, total, totalPages)
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useAdminPendingEvents

Hook untuk mengambil daftar event yang menunggu persetujuan.

```typescript
import { useAdminPendingEvents } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { pendingEvents, meta, error, isLoading, mutate } = useAdminPendingEvents({
  page: 1,
  limit: 10,
  search: "concert"
});
```

**Parameter:**
- `params` (opsional): Parameter query
  - `page`: Nomor halaman
  - `limit`: Jumlah item per halaman
  - `search`: Kata kunci pencarian

**Return Value:**
- `pendingEvents`: Daftar event yang menunggu persetujuan
- `meta`: Metadata pagination (page, limit, total, totalPages)
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useAdminEventDetail

Hook untuk mengambil detail event berdasarkan ID.

```typescript
import { useAdminEventDetail } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { event, error, isLoading, mutate } = useAdminEventDetail("event_id_1");
```

**Parameter:**
- `id`: ID event

**Return Value:**
- `event`: Detail event
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useUpdateEventStatus

Hook untuk memperbarui status event (approve/reject).

```typescript
import { useUpdateEventStatus } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { updateStatus } = useUpdateEventStatus();

// Dalam event handler
const handleApprove = async () => {
  try {
    const result = await updateStatus("event_id_1", "PUBLISHED", "Event disetujui");
    console.log("Event approved:", result);
  } catch (error) {
    console.error("Error approving event:", error);
  }
};
```

**Return Value:**
- `updateStatus`: Fungsi untuk memperbarui status event
  - Parameter:
    - `id`: ID event
    - `status`: Status baru (PUBLISHED, REJECTED)
    - `notes` (opsional): Catatan untuk organizer

### useSetEventFeatured

Hook untuk mengatur event sebagai featured.

```typescript
import { useSetEventFeatured } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { setFeatured } = useSetEventFeatured();

// Dalam event handler
const handleSetFeatured = async () => {
  try {
    const result = await setFeatured("event_id_1", true);
    console.log("Event set as featured:", result);
  } catch (error) {
    console.error("Error setting event as featured:", error);
  }
};
```

**Return Value:**
- `setFeatured`: Fungsi untuk mengatur event sebagai featured
  - Parameter:
    - `id`: ID event
    - `featured`: Boolean (true = featured, false = unfeatured)

## Hooks Manajemen Organizer

### useAdminOrganizers

Hook untuk mengambil daftar organizer dengan filter dan pagination.

```typescript
import { useAdminOrganizers } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { organizers, meta, error, isLoading, mutate } = useAdminOrganizers({
  page: 1,
  limit: 10,
  verified: true,
  search: "event"
});
```

**Parameter:**
- `params` (opsional): Parameter query
  - `page`: Nomor halaman
  - `limit`: Jumlah item per halaman
  - `verified`: Filter berdasarkan status verifikasi
  - `search`: Kata kunci pencarian

**Return Value:**
- `organizers`: Daftar organizer
- `meta`: Metadata pagination (page, limit, total, totalPages)
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useAdminOrganizerDetail

Hook untuk mengambil detail organizer berdasarkan ID.

```typescript
import { useAdminOrganizerDetail } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { organizer, error, isLoading, mutate } = useAdminOrganizerDetail("organizer_id_1");
```

**Parameter:**
- `id`: ID organizer

**Return Value:**
- `organizer`: Detail organizer
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useVerifyOrganizer

Hook untuk memverifikasi organizer.

```typescript
import { useVerifyOrganizer } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { verifyOrganizer } = useVerifyOrganizer();

// Dalam event handler
const handleVerify = async () => {
  try {
    const result = await verifyOrganizer("organizer_id_1", true, "Dokumen lengkap dan valid");
    console.log("Organizer verified:", result);
  } catch (error) {
    console.error("Error verifying organizer:", error);
  }
};
```

**Return Value:**
- `verifyOrganizer`: Fungsi untuk memverifikasi organizer
  - Parameter:
    - `id`: ID organizer
    - `verified`: Boolean (true = verified, false = rejected)
    - `notes` (opsional): Catatan untuk organizer

### useOrganizerStats

Hook untuk mengambil statistik organizer.

```typescript
import { useOrganizerStats } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { stats, error, isLoading, mutate } = useOrganizerStats();
```

**Return Value:**
- `stats`: Statistik organizer
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

## Hooks Manajemen User

### useAdminUsers

Hook untuk mengambil daftar user dengan filter dan pagination.

```typescript
import { useAdminUsers } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { users, meta, error, isLoading, mutate } = useAdminUsers({
  page: 1,
  limit: 10,
  role: "ADMIN",
  search: "john"
});
```

**Parameter:**
- `params` (opsional): Parameter query
  - `page`: Nomor halaman
  - `limit`: Jumlah item per halaman
  - `role`: Filter berdasarkan role user
  - `search`: Kata kunci pencarian

**Return Value:**
- `users`: Daftar user
- `meta`: Metadata pagination (page, limit, total, totalPages)
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

### useAdminUserDetail

Hook untuk mengambil detail user berdasarkan ID.

```typescript
import { useAdminUserDetail } from "~/lib/api/hooks/admin";

// Dalam komponen React
const { user, error, isLoading, mutate } = useAdminUserDetail("user_id_1");
```

**Parameter:**
- `id`: ID user

**Return Value:**
- `user`: Detail user
- `error`: Error jika terjadi kesalahan
- `isLoading`: Boolean yang menunjukkan status loading
- `mutate`: Fungsi untuk memperbarui data secara manual

## Contoh Penggunaan

### Contoh 1: Menampilkan Dashboard Admin

```tsx
"use client";

import { useAdminDashboard } from "~/lib/api/hooks/admin";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { dashboardData, error, isLoading } = useAdminDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div>Error loading dashboard: {error.message}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.stats.totalEvents}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Organizers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.stats.totalOrganizers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData?.stats.totalUsers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(dashboardData?.stats.totalSales || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Contoh 2: Menampilkan Daftar Organizer dengan Pagination

```tsx
"use client";

import { useState } from "react";
import { useAdminOrganizers, useVerifyOrganizer } from "~/lib/api/hooks/admin";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Pagination } from "~/components/ui/pagination";

export default function AdminOrganizersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState<boolean | undefined>(undefined);
  
  const { organizers, meta, error, isLoading, mutate } = useAdminOrganizers({
    page,
    limit,
    search,
    verified
  });
  
  const { verifyOrganizer } = useVerifyOrganizer();
  
  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await verifyOrganizer(id, verified);
      mutate(); // Refresh data setelah verifikasi
    } catch (error) {
      console.error("Error verifying organizer:", error);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error loading organizers: {error.message}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Organizers</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={verified === undefined ? "" : verified.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setVerified(value === "" ? undefined : value === "true");
            }}
            className="px-3 py-2 border rounded"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizers?.map((organizer) => (
            <TableRow key={organizer.id}>
              <TableCell>{organizer.user.name}</TableCell>
              <TableCell>{organizer.orgName}</TableCell>
              <TableCell>{organizer.user.email}</TableCell>
              <TableCell>
                {organizer.verified ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(organizer.id, !organizer.verified)}
                  >
                    {organizer.verified ? "Unverify" : "Verify"}
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {meta && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
```

### Contoh 3: Menampilkan dan Menyetujui Event yang Menunggu Persetujuan

```tsx
"use client";

import { useAdminPendingEvents, useUpdateEventStatus } from "~/lib/api/hooks/admin";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

export default function PendingEventsPage() {
  const { pendingEvents, error, isLoading, mutate } = useAdminPendingEvents();
  const { updateStatus } = useUpdateEventStatus();
  
  const handleApprove = async (id: string) => {
    try {
      await updateStatus(id, "PUBLISHED", "Event disetujui");
      mutate(); // Refresh data setelah persetujuan
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      await updateStatus(id, "REJECTED", "Event tidak memenuhi kriteria");
      mutate(); // Refresh data setelah penolakan
    } catch (error) {
      console.error("Error rejecting event:", error);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error loading pending events: {error.message}</div>;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Events</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingEvents?.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <div className="text-sm text-gray-500">
                By {event.organizer.orgName}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Date:</span> {event.formattedStartDate}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {event.venue}
                </div>
                <div>
                  <span className="font-semibold">Category:</span> {event.category}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleReject(event.id)}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(event.id)}
              >
                Approve
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {pendingEvents?.length === 0 && (
          <div className="col-span-full text-center py-8">
            No pending events found.
          </div>
        )}
      </div>
    </div>
  );
}
```

## Kesimpulan

SWR hooks menyediakan cara yang mudah dan efisien untuk mengakses API VBTicket dari frontend. Dengan menggunakan hooks ini, Anda dapat dengan mudah mengambil data, menangani loading state, dan menangani error.

Untuk informasi lebih lanjut tentang SWR, kunjungi [dokumentasi resmi SWR](https://swr.vercel.app/).
