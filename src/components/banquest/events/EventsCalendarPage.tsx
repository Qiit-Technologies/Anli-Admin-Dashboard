'use client';

import { getAllBanquetBookings } from '@/app/actions/banquet-booking';
import { BookingForm } from '@/components/banquest/types';
import { mapApiBookingToForm } from '@/components/banquest/utils/build-booking-payload';
import { format } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import EventsMonthGrid from './EventsMonthGrid';
import EventsMultiMonthView from './EventsMultiMonthView';
import EventsSidebar from './EventsSidebar';
import EventsToolbar, { CalendarView } from './EventsToolbar';
import EventsWeekScheduleView from './EventsWeekScheduleView';
import { resolveEventBookings } from './seed-events';

export default function EventsCalendarPage() {
    const today = new Date();
    const [month, setMonth] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const [selectedDate, setSelectedDate] = useState(() => today);
    const [view, setView] = useState<CalendarView>('weeks');

    const { data, error, isLoading } = useSWR(
        '/banquet/bookings',
        getAllBanquetBookings,
    );

    const rawBookings = useMemo((): BookingForm[] => {
        if (!data || typeof data !== 'object') return [];
        if ('error' in data && data.error) return [];
        return Array.isArray(data)
            ? data.map(
                  (row) =>
                      mapApiBookingToForm(
                          row as Record<string, unknown>,
                      ) as BookingForm,
              )
            : [];
    }, [data]);

    const bookings = useMemo(
        () => resolveEventBookings(rawBookings),
        [rawBookings],
    );

    const monthLabel = format(month, 'MMMM yyyy');

    const shiftMonth = (delta: number) => {
        setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
    };

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const mainView = () => {
        if (view === 'days') {
            return (
                <EventsWeekScheduleView
                    bookings={bookings}
                    anchorDate={selectedDate}
                />
            );
        }

        if (view === 'weeks') {
            return (
                <EventsMonthGrid
                    month={month}
                    bookings={bookings}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onMonthChange={setMonth}
                    showHeader
                />
            );
        }

        return (
            <EventsMultiMonthView
                month={month}
                bookings={bookings}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onMonthChange={setMonth}
                monthCount={view === 'years' ? 3 : 2}
            />
        );
    };

    const loadError =
        error || (data && typeof data === 'object' && 'error' in data && data.error);

    return (
        <div className="flex flex-col bg-gray-50/50 pb-8 gap-8">
            <EventsToolbar
                monthLabel={monthLabel}
                view={view}
                onViewChange={setView}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
            />

            {loadError ? (
                <p className="px-8 text-sm text-destructive">
                    Failed to load events. Please refresh.
                </p>
            ) : isLoading && rawBookings.length === 0 ? (
                <div className="flex justify-center py-16">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex flex-col gap-6 px-4 lg:flex-row lg:items-start lg:px-8">
                    <div className="min-w-0 flex-1">{mainView()}</div>
                    <EventsSidebar
                        month={month}
                        selectedDate={selectedDate}
                        bookings={bookings}
                        onMonthChange={setMonth}
                        onSelectDate={handleSelectDate}
                    />
                </div>
            )}
        </div>
    );
}
