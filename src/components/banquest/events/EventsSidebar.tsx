'use client';

import { BookingForm } from '@/components/banquest/types';
import { parseBookingEventDate } from '@/components/banquest/utils/booking-display';
import { cn } from '@/lib/utils';
import { isAfter, isSameDay, startOfDay } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import EventsMiniCalendar from './EventsMiniCalendar';
import {
    EVENT_CATEGORY_META,
    getEventCategory,
    summarizeEventsByCategory,
} from './utils/event-category';

interface EventsSidebarProps {
    month: Date;
    selectedDate: Date;
    bookings: BookingForm[];
    onMonthChange: (date: Date) => void;
    onSelectDate: (date: Date) => void;
}

export default function EventsSidebar({
    month,
    selectedDate,
    bookings,
    onMonthChange,
    onSelectDate,
}: EventsSidebarProps) {
    const [upcomingOpen, setUpcomingOpen] = useState(true);
    const summary = useMemo(() => {
        const monthStart = startOfDay(
            new Date(month.getFullYear(), month.getMonth(), 1),
        );
        const monthEnd = startOfDay(
            new Date(month.getFullYear(), month.getMonth() + 1, 0),
        );
        const inMonth = bookings.filter((b) => {
            if (b.bookingStatus === 'cancelled') return false;
            const d = parseBookingEventDate(b.eventDate);
            if (!d) return false;
            const day = startOfDay(d);
            return day >= monthStart && day <= monthEnd;
        });
        return summarizeEventsByCategory(inMonth);
    }, [bookings, month]);

    const upcoming = useMemo(() => {
        const anchor = startOfDay(selectedDate);
        return bookings
            .filter((b) => {
                if (b.bookingStatus === 'cancelled') return false;
                const d = parseBookingEventDate(b.eventDate);
                return (
                    d && (isAfter(d, anchor) || d.getTime() === anchor.getTime())
                );
            })
            .sort((a, b) => {
                const da = parseBookingEventDate(a.eventDate)?.getTime() ?? 0;
                const db = parseBookingEventDate(b.eventDate)?.getTime() ?? 0;
                return da - db;
            })
            .slice(0, 5);
    }, [bookings, selectedDate]);

    return (
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
            <EventsMiniCalendar
                month={month}
                selectedDate={selectedDate}
                onMonthChange={onMonthChange}
                onSelectDate={onSelectDate}
            />

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Event Summary
                    </h3>
                    <button
                        type="button"
                        className="flex flex-row items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700"
                    >
                        This Month
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </div>
                <div className="flex flex-col gap-3 p-4">
                    <div className="flex flex-row items-center justify-between text-sm">
                        <span className="text-gray-700">Total Event</span>
                        <span className="font-bold text-gray-900">
                            {summary.total}
                        </span>
                    </div>
                    {(['social', 'corporate', 'private'] as const).map(
                        (cat) => (
                            <div
                                key={cat}
                                className="flex flex-row items-center justify-between text-sm"
                            >
                                <span className="flex flex-row items-center gap-2 text-gray-700">
                                    <span
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            EVENT_CATEGORY_META[cat].dot,
                                        )}
                                    />
                                    {EVENT_CATEGORY_META[cat].summaryLabel}
                                </span>
                                <span
                                    className={cn(
                                        'flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 text-xs font-bold',
                                        EVENT_CATEGORY_META[cat].pill,
                                        EVENT_CATEGORY_META[cat].pillText,
                                    )}
                                >
                                    {summary.counts[cat]}
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <button
                    type="button"
                    onClick={() => setUpcomingOpen((o) => !o)}
                    className="flex w-full flex-row items-center justify-between border-b border-gray-100 px-4 py-3"
                >
                    <h3 className="text-sm font-semibold text-gray-900">
                        Upcoming Event
                    </h3>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            upcomingOpen && 'rotate-180',
                        )}
                    />
                </button>
                {upcomingOpen ? (
                    <ul className="divide-y divide-gray-100">
                        {upcoming.length === 0 ? (
                            <li className="p-4 text-sm text-muted-foreground">
                                No upcoming events.
                            </li>
                        ) : (
                            upcoming.map((event) => {
                                const cat = getEventCategory(
                                    event.eventType,
                                    event.eventCategory,
                                );
                                const meta = EVENT_CATEGORY_META[cat];
                                const eventDay = parseBookingEventDate(
                                    event.eventDate,
                                );
                                const statusLabel =
                                    eventDay &&
                                    isSameDay(eventDay, selectedDate)
                                        ? 'Today'
                                        : 'Upcoming';

                                return (
                                    <li key={event.id}>
                                        <Link
                                            href={`/banquet/bookings/${event.id}`}
                                            className="flex flex-row items-start gap-3 p-4 hover:bg-gray-50"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                                    meta.dot,
                                                )}
                                            />
                                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                                <p
                                                    className={cn(
                                                        'line-clamp-1 text-sm font-semibold',
                                                        meta.titleText,
                                                    )}
                                                >
                                                    {event.eventName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.eventVenue}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.eventTime}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                                                {statusLabel}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                ) : null}
            </div>
        </div>
    );
}
