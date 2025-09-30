/**
 * Loading Skeleton Components
 * Production-grade loading states for better UX
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-700/50',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-600 bg-gray-800 p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-600 bg-gray-800 p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/5" />
        </div>
      ))}
    </div>
  );
}