# Dokumentasi API Autentikasi VBTicket untuk Postman

Dokumen ini berisi panduan untuk menguji endpoint API autentikasi VBTicket menggunakan Postman. Endpoint autentikasi mencakup pendaftaran, login, verifikasi email, dan reset password.

## Daftar Endpoint Autentikasi

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/register` | POST | Mendaftarkan pengguna baru |
| `/api/auth/verify` | POST | Memverifikasi email pengguna |
| `/api/auth/callback/credentials` | POST | Login dengan email dan password (NextAuth.js) |
| `/api/auth/session` | GET | Mendapatkan informasi sesi pengguna saat ini |
| `/api/auth/csrf` | GET | Mendapatkan token CSRF untuk autentikasi |
| `/api/auth/signout` | POST | Logout dari aplikasi |
| `/api/auth/reset-password` | POST | Meminta reset password atau melakukan reset password |

## Perintah cURL untuk Import ke Postman

Berikut adalah perintah cURL untuk setiap endpoint yang dapat Anda salin dan import langsung ke Postman:

## 1. Register - Pendaftaran Pengguna Baru

Endpoint ini digunakan untuk mendaftarkan pengguna baru ke sistem.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Nama Pengguna",
    "email": "user@example.com",
    "password": "password123"
}'
```

### Request

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nama Pengguna",
  "email": "user@example.com",
  "password": "password123"
}
```

### Response Sukses (201 Created)

```json
{
  "success": true,
  "message": "Pendaftaran berhasil. Silakan cek email Anda untuk verifikasi."
}
```

### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Email sudah terdaftar"
}
```

atau

```json
{
  "success": false,
  "error": "Nama minimal 2 karakter"
}
```

## 2. Verify - Verifikasi Email

Endpoint ini digunakan untuk memverifikasi email pengguna setelah pendaftaran.

### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/verify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "token": "token_verifikasi_yang_dikirim_ke_email"
}'
```

### Request

```
POST /api/auth/verify
Content-Type: application/json

{
  "token": "token_verifikasi_yang_dikirim_ke_email"
}
```

### Response Sukses (200 OK)

```json
{
  "success": true,
  "message": "Email berhasil diverifikasi. Silakan login."
}
```

### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Token verifikasi tidak valid"
}
```

atau

```json
{
  "success": false,
  "error": "Token verifikasi sudah kadaluarsa"
}
```

## 3. Login - Masuk ke Aplikasi

Untuk login, VBTicket menggunakan NextAuth.js. Ada dua cara untuk login:

### 3.1 Login dengan NextAuth.js

NextAuth.js menggunakan pendekatan berbeda untuk autentikasi. Berikut adalah langkah-langkah untuk login dengan NextAuth.js di Postman:

#### Langkah 1: Dapatkan CSRF Token

##### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/csrf' \
--header 'Content-Type: application/json'
```

##### Request

```
GET /api/auth/csrf
Content-Type: application/json
```

##### Response

```json
{
  "csrfToken": "your-csrf-token-here"
}
```

#### Langkah 2: Login dengan Credentials

##### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/callback/credentials' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'csrfToken=your-csrf-token-here' \
--data-urlencode 'email=user@example.com' \
--data-urlencode 'password=password123' \
--data-urlencode 'redirect=false' \
--data-urlencode 'callbackUrl=http://localhost:3000' \
--data-urlencode 'json=true'
```

##### Request

```
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

csrfToken=your-csrf-token-here
email=user@example.com
password=password123
redirect=false
callbackUrl=http://localhost:3000
json=true
```

##### Response Sukses

NextAuth.js akan mengembalikan cookie untuk sesi. Anda perlu menyimpan cookie ini untuk request berikutnya.

#### Langkah 3: Dapatkan Informasi Sesi

##### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/session' \
--header 'Content-Type: application/json'
```

##### Request

```
GET /api/auth/session
Content-Type: application/json
```

##### Response Sukses

```json
{
  "user": {
    "id": "user_id",
    "name": "Nama Pengguna",
    "email": "user@example.com",
    "role": "BUYER",
    "image": null
  },
  "expires": "2023-12-31T23:59:59.999Z"
}
```

##### Response Jika Tidak Login

```json
{}
```

### 3.2 Login dengan Google OAuth

Untuk login dengan Google, pengguna akan diarahkan ke halaman login Google. Ini biasanya dilakukan melalui browser dan bukan melalui API langsung.

#### Request

```
GET /api/auth/signin/google
```

Ini akan mengarahkan pengguna ke halaman login Google. Setelah login berhasil, pengguna akan diarahkan kembali ke aplikasi dengan cookie sesi yang valid.

### 3.3 Logout

#### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/signout' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'csrfToken=your-csrf-token-here' \
--data-urlencode 'callbackUrl=http://localhost:3000'
```

#### Request

```
POST /api/auth/signout
Content-Type: application/x-www-form-urlencoded

csrfToken=your-csrf-token-here
callbackUrl=http://localhost:3000
```

#### Response

NextAuth.js akan menghapus cookie sesi dan mengarahkan pengguna ke `callbackUrl`.

## 4. Reset Password

Endpoint ini memiliki dua fungsi: meminta reset password dan melakukan reset password.

### 4.1 Meminta Reset Password

#### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/reset-password' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "user@example.com"
}'
```

#### Request

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Response Sukses (200 OK)

```json
{
  "success": true,
  "message": "Instruksi reset password telah dikirim ke email Anda."
}
```

#### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Email tidak terdaftar"
}
```

### 4.2 Melakukan Reset Password

#### cURL untuk Import

```bash
curl --location 'http://localhost:3000/api/auth/reset-password' \
--header 'Content-Type: application/json' \
--data-raw '{
    "token": "token_reset_password_yang_dikirim_ke_email",
    "password": "password_baru"
}'
```

#### Request

```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "token_reset_password_yang_dikirim_ke_email",
  "password": "password_baru"
}
```

#### Response Sukses (200 OK)

```json
{
  "success": true,
  "message": "Password berhasil diubah. Silakan login dengan password baru."
}
```

#### Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Token reset password tidak valid"
}
```

atau

```json
{
  "success": false,
  "error": "Token reset password sudah kadaluarsa"
}
```

## Cara Import cURL ke Postman

1. Buka Postman
2. Klik tombol "Import" di pojok kiri atas
3. Pilih tab "Raw text"
4. Salin dan tempel perintah cURL dari dokumentasi ini
5. Klik tombol "Continue" dan kemudian "Import"
6. Request akan ditambahkan ke koleksi Anda

## Contoh Pengujian di Postman

### Langkah-langkah Pengujian Register

1. Buka Postman dan buat request baru (atau import cURL)
2. Pilih metode POST
3. Masukkan URL: `http://localhost:3000/api/auth/register`
4. Pilih tab "Body", pilih "raw" dan pilih format "JSON"
5. Masukkan body request:
   ```json
   {
     "name": "Nama Pengguna",
     "email": "user@example.com",
     "password": "password123"
   }
   ```
6. Klik tombol "Send"
7. Periksa response yang diterima

### Langkah-langkah Pengujian Login dengan NextAuth.js

1. **Dapatkan CSRF Token**:
   - Buat request GET ke `http://localhost:3000/api/auth/csrf`
   - Simpan nilai `csrfToken` dari response

2. **Login dengan Credentials**:
   - Buat request POST ke `http://localhost:3000/api/auth/callback/credentials`
   - Pilih tab "Body", pilih "x-www-form-urlencoded"
   - Masukkan key-value pairs berikut:
     - `csrfToken`: [token dari langkah 1]
     - `email`: "user@example.com"
     - `password`: "password123"
     - `redirect`: "false"
     - `callbackUrl`: "http://localhost:3000"
     - `json`: "true"
   - Klik tombol "Send"
   - Pastikan untuk menyimpan cookie yang diterima

3. **Verifikasi Sesi**:
   - Buat request GET ke `http://localhost:3000/api/auth/session`
   - Pastikan cookie dari langkah sebelumnya disertakan
   - Periksa response untuk memastikan Anda sudah login

## Catatan Penting

1. **NextAuth.js vs API Tradisional**: NextAuth.js tidak mengikuti pola API REST tradisional. Jika Anda melihat error "This action with HTTP POST is not supported by NextAuth.js", itu berarti Anda mencoba mengakses endpoint yang tidak didukung oleh NextAuth.js.

2. **Cookie dan Sesi**: NextAuth.js menggunakan cookie untuk menyimpan informasi sesi. Pastikan Postman dikonfigurasi untuk menyimpan dan mengirim cookie antar request.

3. **CSRF Protection**: NextAuth.js menggunakan token CSRF untuk melindungi dari serangan CSRF. Anda harus mendapatkan token CSRF sebelum melakukan operasi POST.

4. **Pengujian di Browser**: Cara terbaik untuk menguji autentikasi NextAuth.js adalah melalui browser, karena NextAuth.js dirancang untuk bekerja dengan aplikasi web berbasis browser.

5. **Endpoint Kustom**: Endpoint `/api/auth/register`, `/api/auth/verify`, dan `/api/auth/reset-password` adalah endpoint kustom yang dibuat khusus untuk aplikasi VBTicket, bukan bagian dari NextAuth.js.

6. **Environment Variables**: Gunakan Environment Variables di Postman untuk menyimpan nilai seperti CSRF token, URL base, dan informasi lain yang digunakan di beberapa request.

7. **Debugging**: Jika Anda mendapatkan respons HTML alih-alih JSON, itu mungkin karena NextAuth.js mengarahkan ke halaman login atau halaman error. Periksa header respons untuk melihat apakah ada redirect.

8. **Token Verifikasi**: Token verifikasi dan reset password biasanya dikirim melalui email. Untuk pengujian, Anda mungkin perlu mengakses database secara langsung untuk mendapatkan token tersebut.
