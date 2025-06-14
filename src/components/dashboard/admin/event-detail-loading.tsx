"use client";

import { Skeleton } from "~/components/ui/skeleton";
import { MagicCard } from "~/components/ui/magic-card";

export function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <MagicCard 
            className="p-6 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border-gray-200/50"
            gradientColor="rgba(59, 130, 246, 0.05)"
          >
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </MagicCard>

          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <MagicCard 
              className="p-6 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border-gray-200/50"
              gradientColor="rgba(59, 130, 246, 0.05)"
            >
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <MagicCard 
            className="p-6 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border-gray-200/50"
            gradientColor="rgba(59, 130, 246, 0.05)"
          >
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </MagicCard>

          <MagicCard 
            className="p-6 bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border-gray-200/50"
            gradientColor="rgba(59, 130, 246, 0.05)"
          >
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </MagicCard>
        </div>
      </div>
    </div>
  );
}

export function EventDetailErrorState({ message }: { message: string }) {
  return (
    <MagicCard 
      className="p-6 m-4 bg-gradient-to-br from-red-50/90 to-rose-50/90 backdrop-blur-sm border-red-200/50"
      gradientColor="rgba(239, 68, 68, 0.1)"
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{message}</p>
      </div>
    </MagicCard>
  );
}
