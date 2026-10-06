'use client';

import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function ReservationsSkeleton() {
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

            <div className="p-4 lg:p-8 space-y-4">
                {/* Search bar skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Tabs skeleton */}
                <div className="w-full">
                    <div className="w-full overflow-x-auto px-0 justify-start gap-4 bg-transparent flex">
                        <Skeleton className="h-10 w-16" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    {/* Content skeleton */}
                    <div className="mt-4">
                        {/* Cards view skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-8 h-8 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table view skeleton */}
                        <div className="mt-6 space-y-4">
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

                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 py-3 border-b border-gray-100"
                                >
                                    <Skeleton className="h-4 w-12" />
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
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
        </div>
    );
}
