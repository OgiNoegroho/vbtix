"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "dark" | "minimal";
  href?: string;
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  xs: {
    container: "h-6 w-6",
    image: { width: 24, height: 24 },
    text: "text-sm font-semibold",
    spacing: "space-x-1",
  },
  sm: {
    container: "h-8 w-8",
    image: { width: 32, height: 32 },
    text: "text-base font-semibold",
    spacing: "space-x-2",
  },
  md: {
    container: "h-10 w-10",
    image: { width: 40, height: 40 },
    text: "text-lg font-bold",
    spacing: "space-x-2",
  },
  lg: {
    container: "h-12 w-12",
    image: { width: 48, height: 48 },
    text: "text-xl font-bold",
    spacing: "space-x-3",
  },
  xl: {
    container: "h-16 w-16",
    image: { width: 64, height: 64 },
    text: "text-2xl font-bold",
    spacing: "space-x-3",
  },
};

const variantConfig = {
  default: {
    text: "text-foreground",
    fallback: "bg-primary text-primary-foreground",
  },
  white: {
    text: "text-white",
    fallback: "bg-white text-primary",
  },
  dark: {
    text: "text-foreground",
    fallback: "bg-foreground text-background",
  },
  minimal: {
    text: "text-muted-foreground",
    fallback: "bg-muted text-muted-foreground",
  },
};

export function Logo({
  size = "md",
  variant = "default",
  href,
  showText = true,
  className,
}: LogoProps) {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  const LogoContent = () => (
    <div className={cn("flex items-center", sizeStyles.spacing, className)}>
      {/* Logo Image */}
      <div className={cn("relative flex-shrink-0", sizeStyles.container)}>
        <Image
          src="/desain_logo.png"
          alt="VBTicket Logo"
          width={sizeStyles.image.width}
          height={sizeStyles.image.height}
          className="object-contain"
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={cn(sizeStyles.text, variantStyles.text)}>
          VBTicket
        </span>
      )}
    </div>
  );

  // Fallback logo when image is not available
  const FallbackLogo = () => (
    <div className={cn("flex items-center", sizeStyles.spacing, className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg",
          sizeStyles.container,
          variantStyles.fallback,
        )}
      >
        <span className={cn("font-bold", size === "xs" ? "text-xs" : "text-sm")}>
          VB
        </span>
      </div>
      {showText && (
        <span className={cn(sizeStyles.text, variantStyles.text)}>
          VBTicket
        </span>
      )}
    </div>
  );

  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const content = imageError ? <FallbackLogo /> : <LogoContent />;

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center transition-opacity hover:opacity-80"
        onError={handleImageError}
      >
        {content}
      </Link>
    );
  }

  return content;
}

// Specialized logo variants for common use cases
export function BrandLogo({ className, ...props }: Omit<LogoProps, "variant">) {
  return <Logo variant="default" className={className} {...props} />;
}

export function WhiteLogo({ className, ...props }: Omit<LogoProps, "variant">) {
  return <Logo variant="white" className={className} {...props} />;
}

export function MinimalLogo({ className, ...props }: Omit<LogoProps, "variant">) {
  return <Logo variant="minimal" className={className} {...props} />;
}
