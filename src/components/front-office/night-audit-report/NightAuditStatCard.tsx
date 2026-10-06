'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import React from 'react';

interface NightAuditStatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    imageSrc?: string;
    backgroundImage?: string;
    growth?: string;
    growth2?: string;
    decline?: string;
    bgColor?: string;
    loading?: boolean;
}

export default function NightAuditStatCard({
    title,
    value,
    backgroundImage,
    growth,
    growth2,
    decline,
    bgColor = '#FFFFFF',
    loading = false,
}: NightAuditStatCardProps) {
    return (
        <div
            className="py-2 px-4 rounded-lg border flex flex-col relative overflow-hidden h-[98px]"
            style={{
                backgroundColor: bgColor,
            }}
        >
            {backgroundImage && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        opacity: 0.05,
                    }}
                />
            )}
            <div className="flex items-center gap-[7px] text-sm font-medium text-[#667085] z-10 pb-4">
                <span>{title}</span>
            </div>

            <div className="font-semibold text-[32px] text-[#101828] z-10">
                {loading ? (
                    <div className="h-9 w-16 animate-pulse rounded" />
                ) : (
                    value
                )}
            </div>

            {!loading && growth && (
                <p className="flex items-center gap-1 text-[#336133] text-sm font-medium z-10">
                    <TrendingUp size={16} />
                    <span>{growth}</span>
                    <span className="text-[#667085] font-medium">vs yst</span>
                </p>
            )}

            {!loading && growth2 && (
                <p className="flex items-center gap-1 text-[#336133] text-sm font-medium z-10">
                    <TrendingUp size={16} />
                    <span>{growth2}</span>
                    <span className="text-[#667085] font-medium">last mth</span>
                </p>
            )}

            {!loading && decline && (
                <p className="flex items-center gap-1 text-red-600 text-sm font-medium z-10">
                    <TrendingDown size={16} />
                    <span>{decline}</span>
                    <span className="text-[#667085] font-medium">last mth</span>
                </p>
            )}
        </div>
    );
}
