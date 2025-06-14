"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "rgba(255, 255, 255, 0.1)",
  gradientOpacity = 0.8,
  ...props
}: MagicCardProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background: isHovering
            ? `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 40%)`
            : undefined,
          opacity: isHovering ? gradientOpacity : 0,
          zIndex: 1, /* Ensure overlay stays below content */
        }}
      />

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  borderWidth = 1.5,
  colorFrom = "hsl(var(--primary))",
  colorTo = "hsl(var(--secondary))",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={{
        background: `linear-gradient(90deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
        backgroundSize: `${size}% 100%`,
        animation: `border-beam ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        maskImage: `linear-gradient(to right, transparent, white 20%, white 80%, transparent)`,
        WebkitMaskImage: `linear-gradient(to right, transparent, white 20%, white 80%, transparent)`,
      }}
    />
  );
}

interface ShimmerProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  duration?: number;
}

export function Shimmer({
  children,
  className,
  shimmerColor = "rgba(255, 255, 255, 0.2)",
  duration = 2,
}: ShimmerProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmer ${duration}s infinite`,
          zIndex: 1, /* Keep shimmer below content */
        }}
      />
    </div>
  );
}

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export function GradientText({
  children,
  className,
  colors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"],
}: GradientTextProps) {
  const gradientStyle = {
    background: `linear-gradient(135deg, ${colors.join(", ")})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <span className={cn("inline-block", className)} style={gradientStyle}>
      {children}
    </span>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  distance?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 3,
  delay = 0,
  distance = 10,
}: FloatingElementProps) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        "--float-distance": `${distance}px`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Magic UI Form Components
interface MagicInputProps extends React.ComponentProps<"input"> {
  className?: string;
}

export const MagicInput = React.forwardRef<HTMLInputElement, MagicInputProps>(
  ({ className, type, disabled, readOnly, style, ...props }, ref) => {
    return (
      <div className="magic-input-wrapper relative">
        <input
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          ref={ref}
          data-slot="input"
          style={{
            pointerEvents: disabled ? 'none' : 'auto',
            userSelect: disabled ? 'none' : 'auto',
            WebkitUserSelect: disabled ? 'none' : 'auto',
            cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
            position: 'relative',
            zIndex: 30,
            ...style
          }}
          className={cn(
            // Base styles with Magic UI enhancements
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",

            // Enhanced focus styles
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "focus:border-primary/50 focus:shadow-lg focus:ring-2 focus:ring-primary/20",

            // Magic UI styling
            "magic-input relative transition-all duration-300 border-2 border-border/50 rounded-xl",
            "bg-gradient-to-br from-background/90 to-muted/20",

            // Disabled styles
            disabled && "cursor-not-allowed opacity-50",

            // Readonly styles
            readOnly && "cursor-default bg-muted",

            className
          )}
          {...props}
        />
      </div>
    );
  }
);
MagicInput.displayName = "MagicInput";

interface MagicTextareaProps extends React.ComponentProps<"textarea"> {
  className?: string;
}

export const MagicTextarea = React.forwardRef<HTMLTextAreaElement, MagicTextareaProps>(
  ({ className, disabled, readOnly, style, ...props }, ref) => {
    return (
      <div className="magic-textarea-wrapper relative">
        <textarea
          disabled={disabled}
          readOnly={readOnly}
          ref={ref}
          data-slot="textarea"
          style={{
            pointerEvents: disabled ? 'none' : 'auto',
            userSelect: disabled ? 'none' : 'auto',
            WebkitUserSelect: disabled ? 'none' : 'auto',
            cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
            position: 'relative',
            zIndex: 30,
            ...style
          }}
          className={cn(
            // Base styles with Magic UI enhancements
            "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground",

            // Enhanced focus styles
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "focus:border-primary/50 focus:shadow-lg focus:ring-2 focus:ring-primary/20",

            // Magic UI styling
            "magic-input relative transition-all duration-300 border-2 border-border/50 rounded-xl",
            "bg-gradient-to-br from-background/90 to-muted/20",

            // Disabled styles
            disabled && "cursor-not-allowed opacity-50",

            // Readonly styles
            readOnly && "cursor-default bg-muted",

            className
          )}
          {...props}
        />
      </div>
    );
  }
);
MagicTextarea.displayName = "MagicTextarea";

// Magic UI Button Component
interface MagicButtonProps extends React.ComponentProps<"button"> {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "magic";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(
  ({
    className,
    variant = "default",
    size = "default",
    disabled,
    style,
    children,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      magic: "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] border border-primary/20 magic-button",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          cursor: disabled ? 'not-allowed' : 'pointer',
          position: 'relative',
          zIndex: 30,
          ...style
        }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          // Magic UI enhancements
          "magic-button relative overflow-hidden transition-all duration-300",
          "hover:scale-105 hover:shadow-lg",
          // Disabled styles
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
MagicButton.displayName = "MagicButton";
