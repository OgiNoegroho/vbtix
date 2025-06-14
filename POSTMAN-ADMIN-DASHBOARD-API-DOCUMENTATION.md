# Dokumentasi API Dashboard Admin VBTicket untuk Postman

Dokumen ini berisi panduan untuk menguji endpoint API dashboard admin VBTicket menggunakan Postman. Endpoint dashboard admin mencakup operasi untuk mendapatkan statistik dan data untuk dashboard admin.

## Daftar Endpoint Dashboard Admin

| Endpoint | Method | Deskripsi | Akses |
|----------|--------|-----------|-------|
| `/api/admin/dashboard` | GET | Mendapatkan semua data dashboard admin | Admin |
| `/api/admin/dashboard/organizers` | GET | Mendapatkan data organizer untuk dashboard admin | Admin |
| `/api/admin/dashboard/events` | GET | Mendapatkan data event untuk dashboard admin | Admin |

## Perintah cURL untuk Import ke Postman

Berikut adalah perintah cURL untuk setiap endpoint yang dapat Anda salin dan import langsung ke Postman:

## 1. Mendapatkan Semua Data Dashboard Admin

Endpoint ini digunakan untuk mendapatkan semua data dashboard admin, termasuk statistik, event terbaru, organizer terbaru, user terbaru, dan overview penjualan.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/dashboard?limit=5' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/dashboard?limit=5
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `limit` | number | Jumlah item untuk data terbaru | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEvents": 10,
      "totalOrganizers": 6,
      "totalUsers": 15,
      "totalSales": 25000000,
      "pendingEvents": 3,
      "verifiedOrganizers": 5,
      "pendingOrganizers": 1,
      "organizerVerificationRate": 83.33
    },
    "recentEvents": [
      {
        "id": "event_id_1",
        "title": "Music Festival 2023",
        "status": "PUBLISHED",
        "formattedStartDate": "Jumat, 1 Desember 2023",
        "formattedEndDate": "Minggu, 3 Desember 2023",
        "formattedCreatedAt": "Minggu, 1 Oktober 2023",
        "organizer": {
          "id": "organizer_id_1",
          "orgName": "Event Organizer Company",
          "verified": true,
          "user": {
            "id": "user_id_1",
            "name": "John Doe",
            "email": "john@example.com"
          }
        }
      },
      // ... data event terbaru lainnya
    ],
    "recentOrganizers": [
      {
        "id": "organizer_id_1",
        "userId": "user_id_1",
        "orgName": "Event Organizer Company",
        "verified": true,
        "formattedCreatedAt": "Minggu, 1 Januari 2023",
        "eventsCount": 5,
        "user": {
          "id": "user_id_1",
          "name": "John Doe",
          "email": "john@example.com",
          "image": "https://example.com/profile.jpg"
        }
      },
      // ... data organizer terbaru lainnya
    ],
    "recentUsers": [
      {
        "id": "user_id_5",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "BUYER",
        "image": "https://example.com/profile2.jpg",
        "createdAt": "2023-05-10T00:00:00.000Z"
      },
      // ... data user terbaru lainnya
    ],
    "salesOverview": [
      {
        "month": "2023-05-01T00:00:00.000Z",
        "totalSales": 15000000,
        "formattedMonth": "Mei 2023",
        "totalSalesFormatted": "Rp15.000.000,00"
      },
      // ... data penjualan lainnya
    ],
    "pendingEvents": [
      {
        "id": "event_id_2",
        "title": "Rock Concert 2023",
        "status": "PENDING_REVIEW",
        "formattedStartDate": "Rabu, 15 November 2023",
        "formattedEndDate": "Rabu, 15 November 2023",
        "formattedCreatedAt": "Kamis, 5 Oktober 2023",
        "organizer": {
          "id": "organizer_id_2",
          "orgName": "Rock Events Inc",
          "verified": true,
          "user": {
            "id": "user_id_2",
            "name": "Jane Smith",
            "email": "jane@example.com"
          }
        }
      },
      // ... data event pending lainnya
    ],
    "pendingOrganizers": [
      {
        "id": "organizer_id_4",
        "userId": "user_id_10",
        "orgName": "Event Nusantara",
        "verified": false,
        "formattedCreatedAt": "Rabu, 10 Mei 2023",
        "user": {
          "id": "user_id_10",
          "name": "Jihan Alya",
          "email": "jihan@example.com",
          "image": null
        }
      },
      // ... data organizer pending lainnya
    ]
  }
}
```

## 2. Mendapatkan Data Organizer untuk Dashboard Admin

Endpoint ini digunakan untuk mendapatkan data organizer untuk dashboard admin, termasuk statistik organizer, organizer terbaru, dan organizer yang belum diverifikasi.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/dashboard/organizers?limit=5' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/dashboard/organizers?limit=5
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `limit` | number | Jumlah item untuk data terbaru | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrganizers": 6,
      "verifiedOrganizers": 5,
      "pendingOrganizers": 1,
      "verificationRate": 83.33,
      "avgEventsPerOrganizer": 1.67,
      "topOrganizer": {
        "id": "organizer_id_1",
        "name": "John Doe",
        "eventCount": 5
      }
    },
    "recentOrganizers": [
      {
        "id": "organizer_id_1",
        "userId": "user_id_1",
        "orgName": "Event Organizer Company",
        "verified": true,
        "formattedCreatedAt": "Minggu, 1 Januari 2023",
        "eventsCount": 5,
        "user": {
          "id": "user_id_1",
          "name": "John Doe",
          "email": "john@example.com",
          "image": "https://example.com/profile.jpg"
        }
      },
      // ... data organizer terbaru lainnya
    ],
    "pendingOrganizers": [
      {
        "id": "organizer_id_4",
        "userId": "user_id_10",
        "orgName": "Event Nusantara",
        "verified": false,
        "formattedCreatedAt": "Rabu, 10 Mei 2023",
        "user": {
          "id": "user_id_10",
          "name": "Jihan Alya",
          "email": "jihan@example.com",
          "image": null
        }
      },
      // ... data organizer pending lainnya
    ]
  }
}
```

## 3. Mendapatkan Data Event untuk Dashboard Admin

Endpoint ini digunakan untuk mendapatkan data event untuk dashboard admin, termasuk statistik event, event terbaru, dan event yang menunggu persetujuan.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/dashboard/events?limit=5' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/dashboard/events?limit=5
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `limit` | number | Jumlah item untuk data terbaru | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEvents": 10,
      "pendingEvents": 3,
      "publishedEvents": 6,
      "rejectedEvents": 1,
      "approvalRate": 60
    },
    "recentEvents": [
      {
        "id": "event_id_1",
        "title": "Music Festival 2023",
        "status": "PUBLISHED",
        "formattedStartDate": "Jumat, 1 Desember 2023",
        "formattedEndDate": "Minggu, 3 Desember 2023",
        "formattedCreatedAt": "Minggu, 1 Oktober 2023",
        "organizer": {
          "id": "organizer_id_1",
          "orgName": "Event Organizer Company",
          "verified": true,
          "user": {
            "id": "user_id_1",
            "name": "John Doe",
            "email": "john@example.com"
          }
        }
      },
      // ... data event terbaru lainnya
    ],
    "pendingEvents": [
      {
        "id": "event_id_2",
        "title": "Rock Concert 2023",
        "status": "PENDING_REVIEW",
        "formattedStartDate": "Rabu, 15 November 2023",
        "formattedEndDate": "Rabu, 15 November 2023",
        "formattedCreatedAt": "Kamis, 5 Oktober 2023",
        "organizer": {
          "id": "organizer_id_2",
          "orgName": "Rock Events Inc",
          "verified": true,
          "user": {
            "id": "user_id_2",
            "name": "Jane Smith",
            "email": "jane@example.com"
          }
        }
      },
      // ... data event pending lainnya
    ]
  }
}
```

## Cara Mendapatkan Token Autentikasi

Untuk mengakses endpoint API yang memerlukan autentikasi, Anda perlu mendapatkan token autentikasi terlebih dahulu. Berikut adalah langkah-langkah untuk mendapatkan token autentikasi:

### Langkah 1: Login ke Aplikasi

Untuk login dengan NextAuth.js, ikuti langkah-langkah berikut:

1. **Dapatkan CSRF Token**:

```bash
curl --location 'http://localhost:3000/api/auth/csrf' \
--header 'Content-Type: application/json'
```

Response:
```json
{
  "csrfToken": "your-csrf-token-here"
}
```

2. **Login dengan Credentials**:

```bash
curl --location 'http://localhost:3000/api/auth/callback/credentials' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'csrfToken=your-csrf-token-here' \
--data-urlencode 'email=admin@example.com' \
--data-urlencode 'password=adminpassword' \
--data-urlencode 'redirect=false' \
--data-urlencode 'callbackUrl=http://localhost:3000' \
--data-urlencode 'json=true'
```

### Langkah 2: Mendapatkan Cookie Session

Setelah login berhasil, NextAuth.js akan mengembalikan cookie session. Di Postman, cookie ini akan otomatis disimpan jika Anda mengaktifkan "Automatically follow redirects" dan "Save cookies" di pengaturan.

Cookie yang perlu Anda perhatikan adalah `next-auth.session-token`.

### Langkah 3: Menggunakan Cookie Session dalam Request

Ada dua cara untuk menggunakan cookie session dalam request API:

1. **Menggunakan Cookie Manager di Postman**:
   - Postman akan otomatis menyertakan cookie yang tersimpan dalam request berikutnya
   - Pastikan domain cookie cocok dengan domain request

2. **Menyertakan Cookie Secara Manual**:
   - Tambahkan header `Cookie` dengan nilai `next-auth.session-token=your-session-token`

```bash
curl --location 'http://localhost:3000/api/admin/dashboard' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

## Cara Import cURL ke Postman

1. Buka Postman
2. Klik tombol "Import" di pojok kiri atas
3. Pilih tab "Raw text"
4. Salin dan tempel perintah cURL dari dokumentasi ini
5. Klik tombol "Continue" dan kemudian "Import"
6. Request akan ditambahkan ke koleksi Anda

## Catatan Penting

1. **Autentikasi**: Semua endpoint memerlukan autentikasi. Pastikan Anda sudah login dan menyertakan cookie session dalam request.

2. **Otorisasi**: Endpoint admin hanya dapat diakses oleh pengguna dengan role `ADMIN`. Pengguna dengan role lain akan mendapatkan response error 403 Forbidden.

3. **Pagination**: Endpoint untuk mendapatkan data terbaru mendukung parameter `limit` untuk mengontrol jumlah data yang ditampilkan.

4. **Error Handling**: API akan mengembalikan pesan error yang jelas jika terjadi kesalahan. Periksa status code dan pesan error untuk debugging.

5. **Validasi**: Semua input akan divalidasi sebelum diproses. Pastikan data yang dikirim sesuai dengan format yang diharapkan.

6. **Masa Berlaku Session**: Cookie session memiliki masa berlaku tertentu. Jika session kedaluwarsa, Anda perlu login kembali untuk mendapatkan cookie session baru.

7. **Pengujian di Lingkungan Pengembangan**: Untuk pengujian di lingkungan pengembangan, gunakan `http://localhost:3000` sebagai base URL.
