# Dokumentasi API Admin Organizer VBTicket untuk Postman

Dokumen ini berisi panduan untuk menguji endpoint API admin organizer VBTicket menggunakan Postman. Endpoint admin organizer mencakup operasi untuk melihat daftar organizer, mengelola organizer, dan memverifikasi organizer.

## Daftar Endpoint Admin Organizer

| Endpoint | Method | Deskripsi | Akses |
|----------|--------|-----------|-------|
| `/api/admin/organizers` | GET | Mendapatkan daftar semua organizer dengan pagination dan filter | Admin |
| `/api/admin/organizers/[id]` | GET | Mendapatkan detail organizer berdasarkan ID | Admin |
| `/api/admin/organizers/[id]` | DELETE | Menghapus organizer berdasarkan ID | Admin |
| `/api/admin/organizers/[id]/verify` | PUT | Memverifikasi atau menolak verifikasi organizer | Admin |
| `/api/admin/organizers/stats` | GET | Mendapatkan statistik organizer | Admin |

## Perintah cURL untuk Import ke Postman

Berikut adalah perintah cURL untuk setiap endpoint yang dapat Anda salin dan import langsung ke Postman:

## 1. Mendapatkan Daftar Organizer

Endpoint ini digunakan untuk mendapatkan daftar semua organizer dengan pagination dan filter.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/organizers?page=1&limit=10&verified=true&search=event' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/organizers?page=1&limit=10&verified=true&search=event
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `page` | number | Nomor halaman untuk pagination | Tidak |
| `limit` | number | Jumlah item per halaman | Tidak |
| `verified` | boolean | Filter berdasarkan status verifikasi | Tidak |
| `search` | string | Kata kunci pencarian (nama organizer, nama legal, nama user, email) | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "organizer_id_1",
      "userId": "user_id_1",
      "orgName": "Event Organizer Company",
      "legalName": "PT Event Organizer Indonesia",
      "npwp": "12.345.678.9-012.345",
      "socialMedia": {
        "instagram": "eventorganizer",
        "twitter": "eventorganizer",
        "facebook": "eventorganizer"
      },
      "verificationDocs": "https://example.com/docs.pdf",
      "verified": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-15T00:00:00.000Z",
      "formattedCreatedAt": "Minggu, 1 Januari 2023",
      "eventsCount": 5,
      "user": {
        "id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://example.com/profile.jpg"
      }
    },
    // ... data organizer lainnya
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## 2. Mendapatkan Detail Organizer

Endpoint ini digunakan untuk mendapatkan detail organizer berdasarkan ID.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/organizers/organizer_id_1' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/organizers/organizer_id_1
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "organizer_id_1",
    "userId": "user_id_1",
    "orgName": "Event Organizer Company",
    "legalName": "PT Event Organizer Indonesia",
    "npwp": "12.345.678.9-012.345",
    "socialMedia": {
      "instagram": "eventorganizer",
      "twitter": "eventorganizer",
      "facebook": "eventorganizer"
    },
    "verificationDocs": "https://example.com/docs.pdf",
    "verified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-15T00:00:00.000Z",
    "formattedCreatedAt": "Minggu, 1 Januari 2023",
    "formattedUpdatedAt": "Minggu, 15 Januari 2023",
    "user": {
      "id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://example.com/profile.jpg"
    },
    "bankAccount": {
      "id": "bank_account_id_1",
      "bankName": "Bank Central Asia",
      "accountName": "John Doe",
      "accountNumber": "1234567890",
      "branch": "Jakarta Pusat"
    },
    "events": [
      {
        "id": "event_id_1",
        "title": "Music Festival 2023",
        "startDate": "2023-12-01T10:00:00.000Z",
        "endDate": "2023-12-03T22:00:00.000Z",
        "formattedStartDate": "Jumat, 1 Desember 2023",
        "formattedEndDate": "Minggu, 3 Desember 2023"
      },
      // ... data event lainnya
    ],
    "eventsCount": 5
  }
}
```

### Response Error (404 Not Found)

```json
{
  "success": false,
  "error": "Organizer not found"
}
```

## 3. Memverifikasi atau Menolak Verifikasi Organizer

Endpoint ini digunakan untuk memverifikasi atau menolak verifikasi organizer.

### cURL untuk Import

```bash
curl --location --request PUT 'http://localhost:3000/api/admin/organizers/organizer_id_1/verify' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "verified": true,
    "notes": "Dokumen lengkap dan valid. Organizer disetujui."
}'
```

### Request

```
PUT /api/admin/organizers/organizer_id_1/verify
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "verified": true,
  "notes": "Dokumen lengkap dan valid. Organizer disetujui."
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `verified` | boolean | Status verifikasi organizer (true = disetujui, false = ditolak) | Ya |
| `notes` | string | Catatan untuk organizer | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "organizer_id_1",
    "userId": "user_id_1",
    "orgName": "Event Organizer Company",
    "verified": true,
    "formattedCreatedAt": "Minggu, 1 Januari 2023",
    "formattedUpdatedAt": "Minggu, 15 Januari 2023",
    "user": {
      "id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://example.com/profile.jpg"
    }
    // ... data organizer lainnya
  }
}
```

## 4. Menghapus Organizer

Endpoint ini digunakan untuk menghapus organizer berdasarkan ID.

### cURL untuk Import

```bash
curl --location --request DELETE 'http://localhost:3000/api/admin/organizers/organizer_id_1' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
DELETE /api/admin/organizers/organizer_id_1
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "message": "Organizer deleted successfully"
}
```

### Response Error (404 Not Found)

```json
{
  "success": false,
  "error": "Organizer not found"
}
```

## 5. Mendapatkan Statistik Organizer

Endpoint ini digunakan untuk mendapatkan statistik organizer.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/organizers/stats' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/organizers/stats
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "totalOrganizers": 25,
    "verifiedOrganizers": 18,
    "pendingOrganizers": 7,
    "verificationRate": 72,
    "recentOrganizers": [
      {
        "id": "organizer_id_5",
        "userId": "user_id_5",
        "orgName": "New Event Company",
        "verified": false,
        "createdAt": "2023-05-10T00:00:00.000Z",
        "formattedCreatedAt": "Rabu, 10 Mei 2023",
        "user": {
          "id": "user_id_5",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "image": "https://example.com/profile2.jpg"
        }
      },
      // ... data organizer terbaru lainnya
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
curl --location 'http://localhost:3000/api/admin/organizers' \
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

3. **Pagination**: Endpoint untuk mendapatkan daftar organizer mendukung pagination. Gunakan parameter `page` dan `limit` untuk mengontrol jumlah data yang ditampilkan.

4. **Filtering**: Anda dapat memfilter daftar organizer berdasarkan `verified` dan `search`.

5. **Error Handling**: API akan mengembalikan pesan error yang jelas jika terjadi kesalahan. Periksa status code dan pesan error untuk debugging.

6. **Validasi**: Semua input akan divalidasi sebelum diproses. Pastikan data yang dikirim sesuai dengan format yang diharapkan.

7. **Masa Berlaku Session**: Cookie session memiliki masa berlaku tertentu. Jika session kedaluwarsa, Anda perlu login kembali untuk mendapatkan cookie session baru.

8. **Pengujian di Lingkungan Pengembangan**: Untuk pengujian di lingkungan pengembangan, gunakan `http://localhost:3000` sebagai base URL.
