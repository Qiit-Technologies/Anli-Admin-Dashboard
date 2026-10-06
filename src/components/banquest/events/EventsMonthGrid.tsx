'use client';

import { BookingForm } from '@/components/banquest/types';
import { parseBookingEventDate } from '@/components/banquest/utils/booking-display';
import { cn } from '@/lib/utils';
import { startOfDay } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import EventCard from './EventCard';
import {
    dateKey,
    getMonthGridCells,
    isSameCalendarDay,
    WEEKDAYS,
} from './utils/calendar-month';

const MAX_VISIBLE_EVENTS = 2;

interface EventsMonthGridProps {
    month: Date;
    bookings: BookingForm[];
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    showHeader?: boolean;
    onMonthChange?: (date: Date) => void;
}

export default function EventsMonthGrid({
    month,
    bookings,
    selectedDate,
    onSelectDate,
    showHeader = true,
    onMonthChange,
}: EventsMonthGridProps) {
    const today = startOfDay(new Date());
    const cells = useMemo(() => getMonthGridCells(month), [month]);
    const monthLabel = month.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });

    const byDate = useMemo(() => {
        const map = new Map<string, BookingForm[]>();
        for (const b of bookings) {
            if (b.bookingStatus === 'cancelled') continue;
            const parsed = parseBookingEventDate(b.eventDate);
            if (!parsed) continue;
            const key = dateKey(parsed);
            const list = map.get(key) ?? [];
            list.push(b);
            map.set(key, list);
        }
        return map;
    }, [bookings]);

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {showHeader ? (
                <button
                    type="button"
                    onClick={() => onMonthChange?.(month)}
                    className="flex w-fit flex-row items-center gap-1 border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900"
                >
                    {monthLabel}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
            ) : null}

            <div className="grid grid-cols-7 border-b border-gray-200 bg-[#F4F4F4]">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-gray-600"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {cells.map((cell) => {
                    const key = dateKey(cell.date);
                    const dayEvents = byDate.get(key) ?? [];
                    const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
                    const overflow = dayEvents.length - visible.length;
                    const isToday = isSameCalendarDay(cell.date, today);
                    const isSelected = isSameCalendarDay(
                        cell.date,
                        selectedDate,
                    );

                    return (
                        <div
                            key={key + String(cell.isCurrentMonth)}
                            className={cn(
                                'flex min-h-[148px] flex-col border-b border-r border-gray-200 p-2',
                                !cell.isCurrentMonth && 'bg-gray-50/80',
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => onSelectDate(cell.date)}
                                className={cn(
                                    'mb-1.5 flex h-7 w-7 items-center justify-center self-start rounded-full text-xs font-semibold',
                                    (isToday || isSelected) &&
                                        'bg-hexbrand text-white',
                                    !isToday &&
                                        !isSelected &&
                                        cell.isCurrentMonth &&
                                        'text-gray-800 hover:bg-gray-100',
                                    !cell.isCurrentMonth && 'text-gray-400',
                                )}
                            >
                                {cell.day}
                            </button>

                            <div className="flex flex-1 flex-col gap-1.5 px-0.5">
                                {visible.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        variant="calendar"
                                    />
                                ))}
                                {overflow > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => onSelectDate(cell.date)}
                                        className="mt-auto pl-0.5 text-left text-[10px] font-medium text-gray-500 hover:text-orion-blue hover:underline"
                                    >
                                        +{overflow} More Event
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
