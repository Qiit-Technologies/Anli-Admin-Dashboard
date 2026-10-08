'use client';

import React from 'react';

export interface ReportTableColumn<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface ReportTableProps<T> {
    columns: ReportTableColumn<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
}

export default function ReportTable<T extends object>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
}: ReportTableProps<T>) {
    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-y border-gray-200 bg-[#F9FAFB]">
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className="px-4 py-3 text-left text-xs font-semibold bg-[#f4f4f4] text-[#0A0A0A] tracking-wider"
                                    style={{ width: col.width }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3].map((i) => (
                            <tr key={i}>
                                {columns.map((col) => (
                                    <td
                                        key={String(col.key)}
                                        className="px-4 py-5"
                                    >
                                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="rounded-t-md">
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className={`px-[15px] py-[12px] text-sm font-semibold bg-[#f4f4f4] text-[#0A0A0A] tracking-wider ${
                                    col.align === 'right'
                                        ? 'text-right'
                                        : col.align === 'center'
                                          ? 'text-center'
                                          : 'text-left'
                                }`}
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col) => {
                                const value = row[col.key as keyof T];
                                return (
                                    <td
                                        key={String(col.key)}
                                        className={`px-4 py-5 font-normal text-sm text-[#7B7878] ${
                                            col.align === 'right'
                                                ? 'text-right'
                                                : col.align === 'center'
                                                  ? 'text-center'
                                                  : 'text-left'
                                        }`}
                                    >
                                        {col.render
                                            ? col.render(value, row, rowIndex)
                                            : String(value ?? '-')}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
