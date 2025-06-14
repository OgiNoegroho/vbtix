"use client";

import React from "react";
import { cn } from "~/lib/utils";
import { MagicCard } from "./magic-card";

interface EnhancedSkeletonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "card" | "chart" | "table";
}

export function EnhancedSkeleton({ 
  className, 
  children, 
  variant = "default" 
}: EnhancedSkeletonProps) {
  if (variant === "card") {
    return (
      <MagicCard className={cn("p-6 border-0 bg-background/50 backdrop-blur-sm", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded-lg" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-12 w-12 bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-40 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </MagicCard>
    );
  }

  if (variant === "chart") {
    return (
      <MagicCard className={cn("p-6 border-0 bg-background/50 backdrop-blur-sm", className)}>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-60 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
        </div>
      </MagicCard>
    );
  }

  if (variant === "table") {
    return (
      <MagicCard className={cn("p-6 border-0 bg-background/50 backdrop-blur-sm", className)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-72 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </MagicCard>
    );
  }

  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)}>
      {children}
    </div>
  );
}

interface LoadingGridProps {
  cols?: number;
  variant?: "card" | "chart" | "table";
  className?: string;
}

export function LoadingGrid({ 
  cols = 3, 
  variant = "card",
  className 
}: LoadingGridProps) {
  return (
    <div className={cn(
      "grid gap-6",
      cols === 1 && "grid-cols-1",
      cols === 2 && "grid-cols-1 md:grid-cols-2",
      cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {Array.from({ length: cols }).map((_, i) => (
        <EnhancedSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
