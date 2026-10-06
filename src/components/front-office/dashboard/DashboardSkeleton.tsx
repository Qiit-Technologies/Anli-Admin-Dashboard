'use client';

import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function DashboardSkeleton() {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            {/* Header skeleton */}
            <div className="w-full bg-white border-b border-gray-100 px-4 lg:px-8 pt-8 pb-5 sticky top-0 z-40 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>

            <div className="p-4 lg:p-8 space-y-6">
                {/* Quick Links section skeleton */}
                <div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-gray-200 rounded-lg p-4 flex items-center gap-3"
                            >
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats section skeleton */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-md p-4 border gap-2 flex flex-col"
                        >
                            <Skeleton className="h-4 w-32" />
                            <div className="flex flex-col items-start justify-between">
                                <Skeleton className="h-8 w-16" />
                                <div className="flex items-center gap-1 h-5">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-3 w-8" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Two-column layout skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-4">
                    {/* Activity Stream skeleton */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                                    >
                                        <Skeleton className="w-8 h-8 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Room Status skeleton */}
                    <div className="bg-gray-200 p-4 rounded-lg">
                        <Skeleton className="h-6 w-32 mb-4" />

                        <div className="w-full">
                            {/* Table header skeleton */}
                            <div className="p-4 bg-white rounded-xl grid grid-cols-3 gap-4 font-medium">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                            </div>

                            {/* Table rows skeleton */}
                            <div className="space-y-2 mt-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-4 grid grid-cols-3 gap-4 items-center border-b border-gray-300 bg-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-8 h-8 rounded-lg" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="w-2 h-2 rounded-full" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                        <Skeleton className="h-8 w-20 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
