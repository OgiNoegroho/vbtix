"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Lock, Building, Phone, FileText, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/lib/hooks/use-auth";

// Schema validasi form register organizer
const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
    orgName: z.string().min(2, "Nama organisasi minimal 2 karakter"),
    legalName: z.string().optional(),
    phone: z.string().optional(),
    npwp: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      orgName: "",
      legalName: "",
      phone: "",
      npwp: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          orgName: data.orgName,
          legalName: data.legalName,
          phone: data.phone,
          npwp: data.npwp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Terjadi kesalahan saat mendaftar");
      } else {
        setSuccess(
          "Pendaftaran organizer berhasil! Silakan cek email Anda untuk verifikasi.",
        );
        // Redirect ke halaman login setelah 3 detik
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Redirect to Google OAuth with a special parameter to indicate organizer registration
      await loginWithGoogle("/register/complete");
    } catch (err) {
      setError("Terjadi kesalahan saat mendaftar dengan Google");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-sm", className)} {...props}>
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Bergabung sebagai Organizer
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Mulai perjalanan Anda di VBTicket
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
            <div className="flex items-center gap-2">
              <svg
                className="h-3 w-3 flex-shrink-0 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-md bg-green-50 border border-green-200 p-2 text-xs text-green-700">
            <div className="flex items-center gap-2">
              <svg
                className="h-3 w-3 flex-shrink-0 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-3">
            {/* Personal Information */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground/80 border-b border-border/20 pb-1">
                Informasi Personal
              </h3>
              
              {/* Name Field */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium text-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-primary" />
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  autoComplete="name"
                  disabled={isLoading}
                  className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-[10px] text-destructive flex items-center gap-1">
                    <svg className="h-2 w-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-[10px] text-destructive flex items-center gap-1">
                    <svg className="h-2 w-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3 text-primary" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <svg className="h-2 w-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3 text-primary" />
                    Konfirmasi
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <svg className="h-2 w-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground/80 border-b border-border/20 pb-1">
                Informasi Organisasi
              </h3>
              
              {/* Organization Name */}
              <div className="space-y-1">
                <Label htmlFor="orgName" className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Building className="h-3 w-3 text-primary" />
                  Nama Organisasi
                </Label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Nama Organisasi"
                  autoComplete="organization"
                  disabled={isLoading}
                  className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                  {...register("orgName")}
                />
                {errors.orgName && (
                  <p className="text-[10px] text-destructive flex items-center gap-1">
                    <svg className="h-2 w-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.orgName.message}
                  </p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3 text-primary" />
                    Telepon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxx"
                    autoComplete="tel"
                    disabled={isLoading}
                    className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                    {...register("phone")}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="npwp" className="text-xs font-medium text-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3 text-primary" />
                    NPWP
                  </Label>
                  <Input
                    id="npwp"
                    type="text"
                    placeholder="NPWP (Opsional)"
                    disabled={isLoading}
                    className="h-8 w-full border border-border bg-background px-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors rounded-md"
                    {...register("npwp")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-3 pt-1">
            <Button
              type="submit"
              size="sm"
              className="h-8 w-full text-xs font-medium bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="mr-1 h-3 w-3" />
              )}
              {isLoading ? "Mendaftar..." : "Daftar Organizer"}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <span className="relative bg-background px-2 text-[10px] text-muted-foreground">
                Atau
              </span>
            </div>

            {/* Google Register */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs font-medium hover:bg-primary/5 hover:border-primary/30 transition-colors rounded-md"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleRegister}
            >
              {isLoading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <svg
                  className="mr-1 h-3 w-3"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
              )}
              Google
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
