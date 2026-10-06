'use client';

import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function GuestManagementSkeleton() {
    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            {/* Header skeleton */}
            <div className="w-full bg-white border-b border-gray-100 px-4 lg:px-8 pt-8 pb-5 sticky top-0 z-40 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-72 mr-2">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex items-center gap-2 border border-[#D0D5DD] rounded-full pl-1 pr-3 py-1">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>

            <div className="p-4 lg:p-8">
                {/* Tabs skeleton */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Tabs list skeleton */}
                        <div className="flex w-full md:w-auto bg-gray-100 rounded-lg p-1">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-32" />
                        </div>

                        {/* Book New Reservation button skeleton */}
                        <Skeleton className="h-10 w-40" />
                    </div>

                    {/* Table skeleton */}
                    <div className="space-y-4">
                        {/* Table header */}
                        <div className="flex gap-4 pb-2 border-b border-gray-200">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                        </div>

                        {/* Table rows */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex gap-4 py-3 border-b border-gray-100"
                            >
                                <Skeleton className="h-4 w-12" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
