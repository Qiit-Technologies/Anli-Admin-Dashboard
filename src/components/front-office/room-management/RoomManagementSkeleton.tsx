'use client';

import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function RoomManagementSkeleton() {
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

            <div className="container mx-auto p-6 px-0 space-y-8">
                {/* Stats section skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-gray-200 rounded-lg p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-12" />
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <Skeleton className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main content section skeleton */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                        {/* Rooms section skeleton */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Skeleton className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="w-12 h-12 rounded-lg" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-32" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Skeleton className="w-full h-10 mt-4" />
                        </div>

                        {/* Room Types section skeleton */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <div className="bg-gradient-to-br from-blue-500 to-blue-200 p-2 rounded-lg">
                                    <Skeleton className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-200 rounded-lg flex items-center justify-center">
                                                    <Skeleton className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-32" />
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Skeleton className="w-full h-10 mt-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
