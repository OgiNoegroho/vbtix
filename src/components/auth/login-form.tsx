"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/lib/hooks/use-auth";

// Schema validasi form login
const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const { login, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log("[LoginForm] Starting login process...", {
      email: data.email,
      callbackUrl,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("[LoginForm] Calling login function...");
      const result = await login(data.email, data.password, callbackUrl);

      console.log("[LoginForm] Login result:", result);

      if (!result.success) {
        console.log("[LoginForm] Login failed:", result.error);
        setErrorMessage(result.error || "Login gagal. Silakan coba lagi.");
        setIsLoading(false);
      } else {
        console.log(
          "[LoginForm] Login successful, NextAuth should handle redirect...",
        );
        // Keep loading state as NextAuth should redirect automatically
        // If no redirect happens, the user will see the loading state
      }
    } catch (err) {
      console.error("[LoginForm] Login error:", err);
      setErrorMessage("Terjadi kesalahan saat login. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("[LoginForm] Starting Google login...", {
      callbackUrl,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("[LoginForm] Calling loginWithGoogle...");
      await loginWithGoogle(callbackUrl);
      console.log("[LoginForm] Google login initiated, redirecting...");
      // We don't set isLoading to false here because we're redirecting to Google
    } catch (err) {
      console.error("[LoginForm] Google login error:", err);
      setErrorMessage(
        "Terjadi kesalahan saat login dengan Google. Silakan coba lagi.",
      );
      setIsLoading(false);
    }
  };  return (
    <div className={cn("w-full max-w-xs", className)} {...props}>
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Selamat Datang
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Masuk ke akun VBTicket Anda
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
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
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-3">
            {/* Email Field */}
            <div className="space-y-1">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-foreground flex items-center gap-1"
              >
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

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground flex items-center gap-1"
                >
                  <Lock className="h-3 w-3 text-primary" />
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-primary hover:text-primary/80 transition-colors hover:underline"
                >
                  Lupa?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
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
                </p>              )}
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
              {isLoading ? "Sedang Masuk..." : "Masuk ke VBTicket"}
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

            {/* Google Login */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full text-xs font-medium hover:bg-primary/5 hover:border-primary/30 transition-colors rounded-md"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
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

          {/* Register Link */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Daftar
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
