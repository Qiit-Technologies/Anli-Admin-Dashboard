'use client';

import React from 'react';

interface ComplimentaryOrderStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    backgroundImage?: string;
    bgColor?: string;
    loading?: boolean;
    compact?: boolean;
}

export default function ComplimentaryOrderStatCard({
    title,
    value,
    subtitle,
    backgroundImage,
    bgColor = '#FFFFFF',
    loading = false,
    compact = false,
}: ComplimentaryOrderStatCardProps) {
    const isNumericValue = typeof value === 'number';
    const displayValue =
        typeof value === 'number' ? value.toLocaleString('en-NG') : value;

    return (
        <div
            className={`rounded-lg border flex flex-col justify-between relative overflow-hidden ${
                compact ? 'py-2 px-3 min-h-[84px]' : 'py-3 px-4 min-h-[96px]'
            }`}
            style={{
                backgroundColor: bgColor,
            }}
        >
            {backgroundImage && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        opacity: 0.04,
                    }}
                />
            )}
            <div className="text-xs font-medium text-[#667085] z-10 leading-snug">
                {title}
            </div>

            <div
                className={`font-semibold text-[#101828] z-10 tabular-nums leading-tight ${
                    compact
                        ? isNumericValue
                            ? 'text-lg'
                            : 'text-sm truncate'
                        : isNumericValue
                          ? 'text-xl'
                          : 'text-base truncate'
                }`}
                title={typeof displayValue === 'string' ? displayValue : undefined}
            >
                {loading ? (
                    <div className="h-6 w-14 animate-pulse rounded bg-black/5" />
                ) : (
                    displayValue
                )}
            </div>
            {subtitle && !loading ? (
                <p className="text-[11px] text-[#667085] z-10 leading-tight">
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
