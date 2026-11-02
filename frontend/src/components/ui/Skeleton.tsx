import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white/[0.08] animate-pulse rounded-xl ${className}`} />
  );
};

export const TransactionListSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between gap-3 p-2">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

