'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonLoaderProps {
    type?: 'table' | 'cards' | 'list' | 'custom';
    rows?: number;
    className?: string;
    children?: React.ReactNode;
}

const TableSkeleton = ({ rows = 5 }: { rows: number }) => (
    <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
        </div>

        {/* Table skeleton */}
        <div className="mt-12 space-y-3">
            {/* Table header */}
            <div className="flex gap-4 pb-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Table rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex gap-4 py-3 border-b border-gray-100"
                >
                    <Skeleton className="h-4 w-8" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    </div>
);

const CardsSkeleton = ({ rows = 6 }: { rows: number }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
            ))}
        </div>
    </div>
);

const ListSkeleton = ({ rows = 8 }: { rows: number }) => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                </div>
            ))}
        </div>
    </div>
);

export default function SkeletonLoader({
    type = 'table',
    rows = 5,
    className,
    children,
}: SkeletonLoaderProps) {
    if (children) {
        return <div className={cn('animate-pulse', className)}>{children}</div>;
    }

    const skeletonComponents = {
        table: <TableSkeleton rows={rows} />,
        cards: <CardsSkeleton rows={rows} />,
        list: <ListSkeleton rows={rows} />,
        custom: (
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
            </div>
        ),
    };

    return (
        <div className={cn('py-6 px-4 lg:px-8', className)}>
            {skeletonComponents[type]}
        </div>
    );
}
