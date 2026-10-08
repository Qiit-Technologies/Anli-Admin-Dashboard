'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    dateKey,
    getMonthGridCells,
    isSameCalendarDay,
    WEEKDAYS,
} from './utils/calendar-month';

interface EventsMiniCalendarProps {
    month: Date;
    selectedDate: Date;
    onMonthChange: (date: Date) => void;
    onSelectDate: (date: Date) => void;
}

export default function EventsMiniCalendar({
    month,
    selectedDate,
    onMonthChange,
    onSelectDate,
}: EventsMiniCalendarProps) {
    const cells = getMonthGridCells(month);
    const today = new Date();

    const goPrev = () =>
        onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1));
    const goNext = () =>
        onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1));

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={goPrev}
                    className="p-1 rounded-md hover:bg-gray-100"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-semibold text-gray-900"
                >
                    {month.toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                    })}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                    type="button"
                    onClick={goNext}
                    className="p-1 rounded-md hover:bg-gray-100"
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-[10px] font-medium text-muted-foreground"
                    >
                        {d.slice(0, 1)}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {cells.map((cell) => {
                    const isToday = isSameCalendarDay(cell.date, today);
                    const isSelected = isSameCalendarDay(
                        cell.date,
                        selectedDate,
                    );
                    return (
                        <button
                            key={dateKey(cell.date)}
                            type="button"
                            onClick={() => {
                                onSelectDate(cell.date);
                                if (!cell.isCurrentMonth) {
                                    onMonthChange(
                                        new Date(
                                            cell.date.getFullYear(),
                                            cell.date.getMonth(),
                                            1,
                                        ),
                                    );
                                }
                            }}
                            className={cn(
                                'h-8 w-full rounded-full text-xs font-medium',
                                !cell.isCurrentMonth && 'text-gray-300',
                                cell.isCurrentMonth && 'text-gray-800',
                                (isToday || isSelected) &&
                                    'bg-hexbrand text-white',
                                !isToday &&
                                    !isSelected &&
                                    cell.isCurrentMonth &&
                                    'hover:bg-gray-100',
                                isSelected && !isToday && 'ring-2 ring-hexbrand/30',
                            )}
                        >
                            {cell.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
