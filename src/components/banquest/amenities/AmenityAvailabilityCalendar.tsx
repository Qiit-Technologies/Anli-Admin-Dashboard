'use client';

import { getBanquetInventoryAvailability } from '@/app/actions/banquet-inventory';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

type DayStatus = 'available' | 'booked' | 'fully-booked' | null;

const DOT_COLORS: Record<Exclude<DayStatus, null>, string> = {
    available: 'bg-emerald-500',
    booked: 'bg-orange-500',
    'fully-booked': 'bg-orion-blue',
};

const LEGEND = [
    {
        key: 'available' as const,
        label: 'Availability',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-600',
    },
    {
        key: 'fully-booked' as const,
        label: 'Fully Booked',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        dot: 'bg-orion-blue',
    },
    {
        key: 'booked' as const,
        label: 'Booked',
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        dot: 'bg-orange-500',
    },
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'];

function getMonthGrid(year: number, month: number) {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number; inMonth: boolean }> = [];

    for (let i = 0; i < startOffset; i++) {
        cells.push({ day: 0, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
        cells.push({ day: cells.length, inMonth: false });
    }
    return cells;
}

export default function AmenityAvailabilityCalendar({
    inventoryItemId,
}: {
    inventoryItemId: number;
}) {
    const [cursor, setCursor] = useState(() => new Date());
    const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const { data, isLoading } = useSWR(
        Number.isFinite(inventoryItemId)
            ? `/banquet/inventory/${inventoryItemId}/availability?${year}-${month}`
            : null,
        () => getBanquetInventoryAvailability(inventoryItemId, year, month),
    );

    const statusByDay = useMemo(() => {
        const map: Record<number, DayStatus> = {};
        const raw = data?.data && !('error' in data) ? data.data : null;
        if (!raw) return map;
        for (const [key, status] of Object.entries(raw)) {
            map[Number(key)] = status;
        }
        return map;
    }, [data]);

    const monthLabel = cursor.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const cells = useMemo(
        () => getMonthGrid(year, month),
        [year, month],
    );

    const shiftMonth = (delta: number) => {
        setCursor(
            (prev) =>
                new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
        );
        setSelectedDay(1);
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                    Availability Calendar
                </h3>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <button
                        type="button"
                        onClick={() => shiftMonth(-1)}
                        className="rounded p-1 hover:bg-gray-100"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span>{monthLabel}</span>
                    <button
                        type="button"
                        onClick={() => shiftMonth(1)}
                        className="rounded p-1 hover:bg-gray-100"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-7 gap-y-2 text-center text-xs font-medium text-muted-foreground">
                        {WEEKDAYS.map((d) => (
                            <span key={d}>{d}</span>
                        ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-y-3">
                        {cells.map((cell, idx) => {
                            if (!cell.inMonth) {
                                return (
                                    <div
                                        key={`empty-${idx}`}
                                        className="flex flex-col items-center py-1 text-sm text-gray-300"
                                    >
                                        {(idx % 7) + 1}
                                    </div>
                                );
                            }

                            const status = statusByDay[cell.day] ?? null;
                            const isSelected = cell.day === selectedDay;

                            return (
                                <button
                                    key={cell.day}
                                    type="button"
                                    onClick={() => setSelectedDay(cell.day)}
                                    className="flex flex-col items-center gap-1 py-1"
                                >
                                    <span
                                        className={cn(
                                            'flex h-8 min-w-[2rem] items-center justify-center rounded-full text-sm font-medium',
                                            isSelected
                                                ? 'bg-hexbrand text-white'
                                                : 'text-gray-800',
                                        )}
                                    >
                                        {cell.day}
                                    </span>
                                    {status ? (
                                        <span
                                            className={cn(
                                                'h-1.5 w-1.5 rounded-full',
                                                isSelected
                                                    ? 'bg-white'
                                                    : DOT_COLORS[status],
                                            )}
                                        />
                                    ) : (
                                        <span className="h-1.5 w-1.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
                {LEGEND.map(({ key, label, bg, text, dot }) => (
                    <span
                        key={key}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
                            bg,
                            text,
                        )}
                    >
                        <span className={cn('h-2 w-2 rounded-full', dot)} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}
