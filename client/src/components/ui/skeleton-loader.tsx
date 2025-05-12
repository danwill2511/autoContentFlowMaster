import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface SkeletonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  animation?: 'pulse' | 'wave' | 'none';
}

export function SkeletonLoader({
  isLoading,
  children,
  className = "",
  width,
  height,
  variant = "default",
  animation = "pulse"
}: SkeletonProps) {
  // Shape styles
  const getShapeStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'text':
        return 'rounded h-4 w-full max-w-[16rem]';
      default:
        return 'rounded';
    }
  };

  // Animation styles
  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'skeleton-wave';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Skeleton
            className={`${getShapeStyles()} ${getAnimationClass()} ${className}`}
            style={{ width, height }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="loaded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Predefined skeleton patterns
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="pt-2">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="flex w-full space-x-4">
      {Array(columns).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-10 flex-1" />
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export function WorkflowCardSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-neutral-200">
      <div className="px-4 py-5 sm:px-6 border-b border-neutral-200 bg-neutral-50">
        <Skeleton className="h-6 w-36 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2].map((j) => (
            <Skeleton key={j} className="h-10 w-10 rounded-lg" />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 bg-neutral-50 border-t border-neutral-200 flex justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}