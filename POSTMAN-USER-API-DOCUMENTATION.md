# Dokumentasi API User VBTicket untuk Postman

Dokumen ini berisi panduan untuk menguji endpoint API user VBTicket menggunakan Postman. Endpoint user mencakup operasi CRUD (Create, Read, Update, Delete) untuk manajemen user.

## Daftar Endpoint User

| Endpoint | Method | Deskripsi | Akses |
|----------|--------|-----------|-------|
| `/api/admin/users` | GET | Mendapatkan daftar semua user dengan pagination dan filter | Admin |
| `/api/admin/users` | POST | Membuat user baru | Admin |
| `/api/admin/users/[id]` | GET | Mendapatkan detail user berdasarkan ID | Admin |
| `/api/admin/users/[id]` | PUT | Memperbarui data user | Admin |
| `/api/admin/users/[id]` | DELETE | Menghapus user | Admin |
| `/api/admin/users/[id]/status` | PUT | Mengaktifkan atau menonaktifkan user | Admin |
| `/api/admin/users/[id]/reset-password` | POST | Me-reset password user | Admin |

## Perintah cURL untuk Import ke Postman

Berikut adalah perintah cURL untuk setiap endpoint yang dapat Anda salin dan import langsung ke Postman:

## 1. Mendapatkan Daftar User

Endpoint ini digunakan untuk mendapatkan daftar semua user dengan pagination dan filter.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/users?page=1&limit=10&role=BUYER&search=john' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/users?page=1&limit=10&role=BUYER&search=john
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Query Parameters

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `page` | number | Nomor halaman untuk pagination | Tidak |
| `limit` | number | Jumlah item per halaman | Tidak |
| `role` | string | Filter berdasarkan role (ADMIN, ORGANIZER, BUYER) | Tidak |
| `search` | string | Kata kunci pencarian (nama atau email) | Tidak |
| `isActive` | boolean | Filter berdasarkan status aktif | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id_1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "BUYER",
        "emailVerified": "2023-01-01T00:00:00.000Z",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z",
        "isActive": true,
        "formattedCreatedAt": "01 Jan 2023"
      },
      // ... data user lainnya
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```

## 2. Membuat User Baru

Endpoint ini digunakan untuk membuat user baru.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/users' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "BUYER",
    "phone": "081234567890"
}'
```

### Request

```
POST /api/admin/users
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "BUYER",
  "phone": "081234567890"
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `name` | string | Nama user | Tidak |
| `email` | string | Email user | Ya |
| `password` | string | Password user | Tidak |
| `role` | string | Role user (ADMIN, ORGANIZER, BUYER) | Tidak |
| `phone` | string | Nomor telepon user | Tidak |

### Response Sukses (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "BUYER",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Response Error (409 Conflict)

```json
{
  "success": false,
  "error": "Email is already in use"
}
```

## 3. Mendapatkan Detail User

Endpoint ini digunakan untuk mendapatkan detail user berdasarkan ID.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/users/user_id' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
GET /api/admin/users/user_id
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "BUYER",
    "emailVerified": "2023-01-01T00:00:00.000Z",
    "image": "https://example.com/profile.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "isActive": true,
    "formattedCreatedAt": "01 Jan 2023",
    "formattedUpdatedAt": "01 Jan 2023"
  }
}
```

### Response Error (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

## 4. Memperbarui Data User

Endpoint ini digunakan untuk memperbarui data user.

### cURL untuk Import

```bash
curl --location --request PUT 'http://localhost:3000/api/admin/users/user_id' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "089876543210",
    "image": "https://example.com/new-profile.jpg"
}'
```

### Request

```
PUT /api/admin/users/user_id
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "089876543210",
  "image": "https://example.com/new-profile.jpg"
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `name` | string | Nama user | Tidak |
| `email` | string | Email user | Tidak |
| `phone` | string | Nomor telepon user | Tidak |
| `image` | string | URL gambar profil user | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "089876543210",
    "role": "BUYER",
    "emailVerified": "2023-01-01T00:00:00.000Z",
    "image": "https://example.com/new-profile.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Response Error (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

## 5. Menghapus User

Endpoint ini digunakan untuk menghapus user.

### cURL untuk Import

```bash
curl --location --request DELETE 'http://localhost:3000/api/admin/users/user_id' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Request

```
DELETE /api/admin/users/user_id
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Response Error (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

## 6. Mengaktifkan atau Menonaktifkan User

Endpoint ini digunakan untuk mengaktifkan atau menonaktifkan user.

### cURL untuk Import

```bash
curl --location --request PUT 'http://localhost:3000/api/admin/users/user_id/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "isActive": true
}'
```

### Request

```
PUT /api/admin/users/user_id/status
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "isActive": true
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `isActive` | boolean | Status aktif user | Ya |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": "2023-01-01T00:00:00.000Z",
    "role": "BUYER"
  }
}
```

## 7. Me-reset Password User

Endpoint ini digunakan untuk me-reset password user.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/admin/users/user_id/reset-password' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token' \
--data-raw '{
    "sendEmail": true,
    "customPassword": "newpassword123"
}'
```

### Request

```
POST /api/admin/users/user_id/reset-password
Content-Type: application/json
Cookie: next-auth.session-token=your-session-token

{
  "sendEmail": true,
  "customPassword": "newpassword123"
}
```

### Request Body

| Parameter | Tipe | Deskripsi | Wajib |
|-----------|------|-----------|-------|
| `sendEmail` | boolean | Apakah mengirim email notifikasi | Tidak |
| `customPassword` | string | Password baru kustom | Tidak |

### Response Sukses (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "john@example.com",
    "password": "newpassword123",
    "resetAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Password has been reset successfully"
}
```

## Cara Import cURL ke Postman

1. Buka Postman
2. Klik tombol "Import" di pojok kiri atas
3. Pilih tab "Raw text"
4. Salin dan tempel perintah cURL dari dokumentasi ini
5. Klik tombol "Continue" dan kemudian "Import"
6. Request akan ditambahkan ke koleksi Anda

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
curl --location 'http://localhost:3000/api/admin/users' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=your-session-token'
```

### Contoh Request dengan Cookie Session

```bash
curl --location 'http://localhost:3000/api/admin/users' \
--header 'Content-Type: application/json' \
--header 'Cookie: next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..example-token-value'
```

## Catatan Penting

1. **Autentikasi**: Semua endpoint memerlukan autentikasi. Pastikan Anda sudah login dan menyertakan cookie session dalam request.

2. **Otorisasi**: Endpoint user hanya dapat diakses oleh pengguna dengan role `ADMIN`. Pengguna dengan role lain akan mendapatkan response error 403 Forbidden.

3. **Pagination**: Endpoint untuk mendapatkan daftar user mendukung pagination. Gunakan parameter `page` dan `limit` untuk mengontrol jumlah data yang ditampilkan.

4. **Filtering**: Anda dapat memfilter daftar user berdasarkan `role`, `search`, dan `isActive`.

5. **Error Handling**: API akan mengembalikan pesan error yang jelas jika terjadi kesalahan. Periksa status code dan pesan error untuk debugging.

6. **Validasi**: Semua input akan divalidasi sebelum diproses. Pastikan data yang dikirim sesuai dengan format yang diharapkan.

7. **Keamanan**: Jangan menyimpan password dalam bentuk plain text. Password akan di-hash sebelum disimpan di database.

8. **Pengujian di Lingkungan Pengembangan**: Untuk pengujian di lingkungan pengembangan, gunakan `http://localhost:3000` sebagai base URL.

9. **Masa Berlaku Session**: Cookie session memiliki masa berlaku tertentu. Jika session kedaluwarsa, Anda perlu login kembali untuk mendapatkan cookie session baru.
