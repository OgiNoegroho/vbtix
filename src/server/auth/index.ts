import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { UserRole } from "@prisma/client";

/**
 * Wrapper untuk `getServerSession` agar tidak perlu mengimpor authOptions di setiap file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const auth = () => getServerSession(authOptions);

/**
 * Mendapatkan rute dashboard berdasarkan peran pengguna
 */
export const getDashboardRoute = (role?: UserRole | string | null) => {
  if (!role) return "/";

  switch (role) {
    case UserRole.ADMIN:
      return "/admin/dashboard";
    case UserRole.ORGANIZER:
      // For organizers, redirect to the base organizer route
      // The organizer page will handle fetching the correct organizer ID and redirecting
      return "/organizer";
    case UserRole.BUYER:
    default:
      return "/";
  }
};

/**
 * Daftar rute publik yang tidak memerlukan autentikasi
 */
export const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/unauthorized",
];

/**
 * Memeriksa apakah rute adalah rute publik
 */
export const isPublicRoute = (path: string) => {
  // Cek apakah path cocok dengan salah satu rute publik
  if (publicRoutes.includes(path)) return true;

  // Cek apakah path dimulai dengan salah satu prefiks publik
  if (
    path.startsWith("/api/auth/") ||
    path.startsWith("/api/webhooks/") ||
    path.startsWith("/api/revalidate/") ||
    path.startsWith("/reset-password/") ||
    path.startsWith("/verify/")
  ) {
    return true;
  }

  return false;
};

/**
 * Memeriksa apakah pengguna memiliki peran yang diizinkan
 */
export const hasAllowedRole = (
  userRole: UserRole | string | null | undefined,
  allowedRoles: UserRole[] | string[],
) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
};

/**
 * Mendapatkan pesan error autentikasi berdasarkan kode error
 */
export const getAuthErrorMessage = (error?: string | null) => {
  if (!error) return "Terjadi kesalahan saat autentikasi";

  switch (error) {
    case "CredentialsSignin":
      return "Email atau password salah";
    case "EmailNotVerified":
      return "Email belum diverifikasi. Silakan periksa email Anda.";
    case "AccessDenied":
      return "Akses ditolak. Hubungi administrator.";
    case "OAuthAccountNotLinked":
      return "Email sudah terdaftar dengan metode login lain.";
    case "OAuthSignInError":
      return "Terjadi kesalahan saat login dengan provider eksternal.";
    case "SessionRequired":
      return "Anda perlu login untuk mengakses halaman ini.";
    default:
      return `Terjadi kesalahan: ${error}`;
  }
};
