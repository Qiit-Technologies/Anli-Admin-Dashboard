'use client';

import { MoreVertical } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    percentageChange?: number;
    showMenu?: boolean;
    loading?: boolean;
}

export default function StatCard({
    title,
    value,
    percentageChange,
    showMenu = false,
    loading = false,
}: StatCardProps) {
    const isPositive = percentageChange && percentageChange > 0;
    const isNegative = percentageChange && percentageChange < 0;

    return (
        <div className="bg-white border rounded-lg shadow-sm p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#667085]">
                    {title}
                </span>
                {showMenu && (
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={18} />
                    </button>
                )}
            </div>

            <div className="flex items-end justify-between">
                {loading ? (
                    <div className="h-9 w-24 bg-gray-100 animate-pulse rounded" />
                ) : (
                    <span className="text-3xl font-semibold">{value}</span>
                )}

                {percentageChange !== undefined && !loading && (
                    <span
                        className={`text-sm font-medium ${
                            isPositive
                                ? 'text-green-500'
                                : isNegative
                                  ? 'text-red-500'
                                  : 'text-gray-500'
                        }`}
                    >
                        {isPositive ? '↑' : isNegative ? '↓' : ''}
                        {Math.abs(percentageChange)}%
                    </span>
                )}
            </div>
        </div>
    );
}
