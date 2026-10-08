'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardProps {
    title: string;
    children: React.ReactNode;
    badge?: {
        label: string;
        value: number;
        color?: 'green' | 'red';
    };
}

export function SummaryCard({ title, children, badge }: SummaryCardProps) {
    return (
        <div className="border border-[#D1D5DC] rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#0A0A0A] uppercase">
                    {title}
                </h3>
                {badge && (
                    <span className="text-sm font-normal px-2 py-1 rounded bg-[#EAFFF5] text-[#057D44]">
                        {badge.label}: {formatCurrency(badge.value)}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

interface MetricRowProps {
    label: string;
    value: string | number;
    isTotal?: boolean;
}

export function MetricRow({ label, value, isTotal = false }: MetricRowProps) {
    return (
        <div
            className={`flex justify-between py-2 ${isTotal ? 'font-semibold text-[#0A0A0A] border-gray-200 mt-2 pt-3' : ''}`}
        >
            <span className="text-sm text-[#0A0A0A] font-normal">{label}</span>
            <span className="text-sm text-[#0A0A0A] font-normal">{value}</span>
        </div>
    );
}

interface ThreeColumnRowProps {
    col1: string;
    col2: string | number;
    col3: string | number;
    isHeader?: boolean;
    isTotal?: boolean;
}

export function ThreeColumnRow({
    col1,
    col2,
    col3,
    isHeader = false,
    isTotal = false,
}: ThreeColumnRowProps) {
    const baseClass = isHeader
        ? 'text-sm font-semibold text-[#0A0A0A]'
        : isTotal
          ? 'text-sm font-semibold text-[#0A0A0A] mt-2 pt-3'
          : 'text-sm font-normal text-[#0A0A0A]';

    return (
        <div className={`grid grid-cols-3 py-2 ${baseClass}`}>
            <span>{col1}</span>
            <span className="text-center">{col2}</span>
            <span className="text-right">
                {typeof col3 === 'number' ? formatCurrency(col3) : col3}
            </span>
        </div>
    );
}
