import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'card' | 'table' | 'list' | 'text';
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  isLoading,
  children,
  variant = 'default',
  count = 1,
  className = ''
}: SkeletonLoaderProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  // Default skeleton with configurable count
  const DefaultSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );

  // Card skeleton
  const CardSkeleton = () => (
    <div className={`space-y-5 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table skeleton
  const TableSkeleton = () => (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <div className="bg-neutral-50 p-4">
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="divide-y">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="p-4 flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );

  // List skeleton
  const ListSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Text skeleton
  const TextSkeleton = () => (
    <div className={`space-y-2 ${className}`}>
      <Skeleton className="h-6 w-3/4" />
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
      <Skeleton className="h-4 w-2/3" />
    </div>
  );

  // Return appropriate skeleton based on variant
  switch (variant) {
    case 'card':
      return <CardSkeleton />;
    case 'table':
      return <TableSkeleton />;
    case 'list':
      return <ListSkeleton />;
    case 'text':
      return <TextSkeleton />;
    default:
      return <DefaultSkeleton />;
  }
}