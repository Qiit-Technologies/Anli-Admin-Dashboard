'use client';

import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function AccountStatusSkeleton() {
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

            <div className="rounded-xl p-6 -mx-4 lg:-mx-8">
                {/* Tabs skeleton */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar tabs skeleton */}
                    <div className="lg:flex lg:flex-col gap-2 w-full lg:w-[220px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="w-full h-10 rounded-md"
                            />
                        ))}
                    </div>

                    {/* Main content skeleton */}
                    <div className="flex-1">
                        <div className="bg-[#F3F9FF] border border-gray-200 p-6 rounded-xl w-full max-w-[600px] shadow-sm">
                            <div className="flex flex-col gap-4">
                                {/* Search input skeleton */}
                                <div className="flex flex-col">
                                    <Skeleton className="h-10 w-full" />
                                </div>

                                {/* Select field skeleton */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>

                                {/* Guest stays skeleton */}
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="bg-white border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Room icon skeleton */}
                                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Skeleton className="w-5 h-5" />
                                                </div>

                                                {/* Main content skeleton */}
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Skeleton className="h-5 w-32" />
                                                        <Skeleton className="h-6 w-20 rounded-full" />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-16" />
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-4 w-20" />
                                                    </div>

                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Button skeleton */}
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
