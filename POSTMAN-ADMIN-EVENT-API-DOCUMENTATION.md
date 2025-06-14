# Dokumentasi API Admin Event VBTicket untuk Postman

Dokumen ini berisi panduan untuk menguji endpoint API admin event VBTicket menggunakan Postman. Endpoint admin event mencakup operasi untuk melihat daftar event, mengelola event, dan menyetujui/menolak event yang diajukan oleh organizer.

## Daftar Endpoint Admin Event

| Endpoint | Method | Deskripsi | Akses |
|----------|--------|-----------|-------|
| `/api/admin/events` | GET | Mendapatkan daftar semua event dengan pagination dan filter | Admin |
| `/api/admin/events/pending` | GET | Mendapatkan daftar event dengan status PENDING_REVIEW | Admin |
| `/api/admin/events/[id]` | GET | Mendapatkan detail event berdasarkan ID | Admin |
| `/api/admin/events/[id]/status` | PUT | Menyetujui atau menolak event | Admin |
| `/api/admin/events/[id]/featured` | PUT | Mengatur event sebagai featured atau tidak | Admin |

## Perintah cURL untuk Import ke Postman

Berikut adalah perintah cURL untuk setiap endpoint yang dapat Anda salin dan import langsung ke Postman:

## 1. Mendapatkan Daftar Event

Endpoint ini digunakan untuk mendapatkan daftar semua event dengan pagination dan filter.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/events?page=1&limit=10&status=PUBLISHED&search=concert' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/events?page=1&limit=10&status=PUBLISHED&search=concert
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `page` | number | Nomor halaman untuk pagination | Tidak |
| `limit` | number | Jumlah item per halaman | Tidak |
| `status` | string | Filter berdasarkan status (DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, COMPLETED, CANCELLED) | Tidak |
| `organizerId` | string | Filter berdasarkan ID organizer | Tidak |
| `search` | string | Kata kunci pencarian (judul, deskripsi, venue, kota) | Tidak |
| `featured` | boolean | Filter berdasarkan status featured | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "event_id_1",
      "slug": "music-festival-2023",
      "title": "Music Festival 2023",
      "description": "A big music festival with various artists",
      "posterUrl": "https://example.com/poster.jpg",
      "bannerUrl": "https://example.com/banner.jpg",
      "category": "Music",
      "venue": "Central Park",
      "address": "Jl. Sudirman No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "country": "Indonesia",
      "tags": ["music", "festival", "concert"],
      "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "featured": true,
      "published": true,
      "seatingMap": "https://example.com/seating-map.jpg",
      "maxAttendees": 5000,
      "website": "https://example.com/event",
      "terms": "Terms and conditions apply",
      "startDate": "2023-12-01T10:00:00.000Z",
      "endDate": "2023-12-03T22:00:00.000Z",
      "status": "PUBLISHED",
      "createdAt": "2023-10-01T00:00:00.000Z",
      "updatedAt": "2023-10-15T00:00:00.000Z",
      "formattedStartDate": "Jumat, 1 Desember 2023",
      "formattedEndDate": "Minggu, 3 Desember 2023",
      "organizer": {
        "id": "organizer_id_1",
        "orgName": "Event Organizer Company",
        "verified": true,
        "user": {
          "id": "user_id_1",
          "name": "John Doe",
          "email": "john@example.com",
          "image": "https://example.com/profile.jpg"
        }
      },
      "ticketTypes": [
        {
          "id": "ticket_type_id_1",
          "name": "Regular",
          "price": "150000",
          "quantity": 1000,
          "sold": 500
        },
        {
          "id": "ticket_type_id_2",
          "name": "VIP",
          "price": "500000",
          "quantity": 200,
          "sold": 100
        }
      ],
      "ticketPrice": {
        "min": 150000,
        "max": 500000
      },
      "ticketsAvailable": 600
    },
    // ... data event lainnya
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## 2. Mendapatkan Daftar Event Pending Review

Endpoint ini digunakan untuk mendapatkan daftar event dengan status PENDING_REVIEW.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/events/pending?page=1&limit=10' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/events/pending?page=1&limit=10
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `page` | number | Nomor halaman untuk pagination | Tidak |
| `limit` | number | Jumlah item per halaman | Tidak |
| `organizerId` | string | Filter berdasarkan ID organizer | Tidak |
| `search` | string | Kata kunci pencarian (judul, deskripsi, venue, kota) | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "event_id_2",
      "slug": "rock-concert-2023",
      "title": "Rock Concert 2023",
      "description": "A rock concert with famous bands",
      "posterUrl": "https://example.com/poster2.jpg",
      "bannerUrl": "https://example.com/banner2.jpg",
      "category": "Music",
      "venue": "Stadium",
      "address": "Jl. Gatot Subroto No. 456",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "country": "Indonesia",
      "tags": ["rock", "concert", "music"],
      "images": ["https://example.com/image3.jpg", "https://example.com/image4.jpg"],
      "featured": false,
      "published": false,
      "seatingMap": "https://example.com/seating-map2.jpg",
      "maxAttendees": 3000,
      "website": "https://example.com/event2",
      "terms": "Terms and conditions apply",
      "startDate": "2023-11-15T19:00:00.000Z",
      "endDate": "2023-11-15T23:00:00.000Z",
      "status": "PENDING_REVIEW",
      "createdAt": "2023-10-05T00:00:00.000Z",
      "updatedAt": "2023-10-10T00:00:00.000Z",
      "formattedStartDate": "Rabu, 15 November 2023",
      "formattedEndDate": "Rabu, 15 November 2023",
      "organizer": {
        "id": "organizer_id_2",
        "orgName": "Rock Events Inc",
        "verified": true,
        "user": {
          "id": "user_id_2",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "image": "https://example.com/profile2.jpg"
        }
      },
      "ticketTypes": [
        {
          "id": "ticket_type_id_3",
          "name": "Regular",
          "price": "200000",
          "quantity": 2000,
          "sold": 0
        },
        {
          "id": "ticket_type_id_4",
          "name": "VIP",
          "price": "750000",
          "quantity": 500,
          "sold": 0
        }
      ],
      "ticketPrice": {
        "min": 200000,
        "max": 750000
      },
      "ticketsAvailable": 2500
    },
    // ... data event lainnya
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

## 3. Mendapatkan Detail Event

Endpoint ini digunakan untuk mendapatkan detail event berdasarkan ID.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/events/event_id_1' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/events/event_id_1
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "event_id_1",
    "slug": "music-festival-2023",
    "title": "Music Festival 2023",
    "description": "A big music festival with various artists",
    "posterUrl": "https://example.com/poster.jpg",
    "bannerUrl": "https://example.com/banner.jpg",
    "category": "Music",
    "venue": "Central Park",
    "address": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "country": "Indonesia",
    "tags": ["music", "festival", "concert"],
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "featured": true,
    "published": true,
    "seatingMap": "https://example.com/seating-map.jpg",
    "maxAttendees": 5000,
    "website": "https://example.com/event",
    "terms": "Terms and conditions apply",
    "startDate": "2023-12-01T10:00:00.000Z",
    "endDate": "2023-12-03T22:00:00.000Z",
    "status": "PUBLISHED",
    "createdAt": "2023-10-01T00:00:00.000Z",
    "updatedAt": "2023-10-15T00:00:00.000Z",
    "formattedStartDate": "Jumat, 1 Desember 2023",
    "formattedEndDate": "Minggu, 3 Desember 2023",
    "organizer": {
      "id": "organizer_id_1",
      "orgName": "Event Organizer Company",
      "verified": true,
      "user": {
        "id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://example.com/profile.jpg"
      }
    },
    "ticketTypes": [
      {
        "id": "ticket_type_id_1",
        "name": "Regular",
        "price": "150000",
        "quantity": 1000,
        "sold": 500
      },
      {
        "id": "ticket_type_id_2",
        "name": "VIP",
        "price": "500000",
        "quantity": 200,
        "sold": 100
      }
    ],
    "statistics": {
      "totalTicketsSold": 600,
      "totalCapacity": 1200,
      "totalRevenue": 125000000,
      "soldPercentage": 50,
      "totalTransactions": 450
    }
  }
}
```

### Response Error (404 Not Found)

```json
{
  "success": false,
  "error": "Event not found"
}
```

## 4. Menyetujui atau Menolak Event

Endpoint ini digunakan untuk menyetujui atau menolak event yang diajukan oleh organizer.

### cURL untuk Import

```bash
curl --location --request PUT 'http://localhost:3000/api/admin/events/event_id_2/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "status": "PUBLISHED",
    "notes": "Event approved. Good job!"
}'
```

### Request

```
PUT /api/admin/events/event_id_2/status
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "status": "PUBLISHED",
  "notes": "Event approved. Good job!"
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `status` | string | Status baru event (PUBLISHED atau REJECTED) | Ya |
| `notes` | string | Catatan untuk organizer | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "event_id_2",
    "slug": "rock-concert-2023",
    "title": "Rock Concert 2023",
    "status": "PUBLISHED",
    "published": true,
    "formattedStartDate": "Rabu, 15 November 2023",
    "formattedEndDate": "Rabu, 15 November 2023"
    // ... data event lainnya
  }
}
```

### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Event is not pending review"
}
```

## 5. Mengatur Event sebagai Featured

Endpoint ini digunakan untuk mengatur event sebagai featured atau tidak.

### cURL untuk Import

```bash
curl --location --request PUT 'http://localhost:3000/api/admin/events/event_id_1/featured' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "featured": true
}'
```

### Request

```
PUT /api/admin/events/event_id_1/featured
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "featured": true
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `featured` | boolean | Status featured event | Ya |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "event_id_1",
    "slug": "music-festival-2023",
    "title": "Music Festival 2023",
    "featured": true,
    "formattedStartDate": "Jumat, 1 Desember 2023",
    "formattedEndDate": "Minggu, 3 Desember 2023"
    // ... data event lainnya
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
curl --location 'http://localhost:3000/api/admin/events' \
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

3. **Pagination**: Endpoint untuk mendapatkan daftar event mendukung pagination. Gunakan parameter `page` dan `limit` untuk mengontrol jumlah data yang ditampilkan.

4. **Filtering**: Anda dapat memfilter daftar event berdasarkan `status`, `organizerId`, `search`, dan `featured`.

5. **Error Handling**: API akan mengembalikan pesan error yang jelas jika terjadi kesalahan. Periksa status code dan pesan error untuk debugging.

6. **Validasi**: Semua input akan divalidasi sebelum diproses. Pastikan data yang dikirim sesuai dengan format yang diharapkan.

7. **Masa Berlaku Session**: Cookie session memiliki masa berlaku tertentu. Jika session kedaluwarsa, Anda perlu login kembali untuk mendapatkan cookie session baru.

8. **Pengujian di Lingkungan Pengembangan**: Untuk pengujian di lingkungan pengembangan, gunakan `http://localhost:3000` sebagai base URL.
