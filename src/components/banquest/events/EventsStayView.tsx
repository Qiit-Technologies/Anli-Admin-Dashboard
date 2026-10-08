'use client';

import { getAllBanquetBookings } from '@/app/actions/banquet-booking';
import { mapApiBookingToForm } from '@/components/banquest/utils/build-booking-payload';
import { BookingForm } from '@/components/banquest/types';
import { Button } from '@/components/ui/button';
import useStayViewStore from '@/store/useSV';
import { cn } from '@/lib/utils';
import { addDays, endOfWeek, format } from 'date-fns';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';
import useSWR from 'swr';
import EventsCalendarHeader from './EventsCalendarHeader';
import { mapBookingsToVenueRows } from './lib/map-venues';
import VenueList from './VenueList';
import MonthPicker from '@/components/front-office/stay-view/MonthPicker';

export default function EventsStayView() {
    const {
        viewMode,
        currentMonth,
        currentWeek,
        setCurrentMonth,
        setViewMode,
        customStartDate,
        customDaysToShow,
        getCurrentViewDates,
        goToPreviousMonth,
        goToNextMonth,
        goToPreviousWeek,
        goToNextWeek,
        goToToday,
        goToPreviousPage,
        goToNextPage,
    } = useStayViewStore();

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { data, error, isLoading } = useSWR(
        '/banquet/bookings',
        getAllBanquetBookings,
    );

    const bookings = useMemo((): BookingForm[] => {
        if (error || !data || typeof data !== 'object') return [];
        if ('error' in data && data.error) return [];
        return Array.isArray(data)
            ? data.map(
                  (row) =>
                      mapApiBookingToForm(
                          row as Record<string, unknown>,
                      ) as BookingForm,
              )
            : [];
    }, [data, error]);

    const dates = getCurrentViewDates();
    const dateKeys = useMemo(
        () => new Set(dates.map((d) => format(d, 'yyyy-MM-dd'))),
        [dates],
    );

    const venues = useMemo(() => {
        const inView = bookings.filter((b) => {
            const key = b.eventDate?.slice(0, 10);
            return key && dateKeys.has(key);
        });
        return mapBookingsToVenueRows(inView);
    }, [bookings, dateKeys]);

    const scrollLeft = () =>
        scrollContainerRef.current?.scrollBy({ left: -360, behavior: 'smooth' });
    const scrollRight = () =>
        scrollContainerRef.current?.scrollBy({ left: 360, behavior: 'smooth' });

    const getViewTitle = () => {
        if (viewMode === 'month') {
            return format(currentMonth, 'MMMM yyyy');
        }
        if (viewMode === 'week') {
            const weekEnd = endOfWeek(currentWeek);
            return `${format(currentWeek, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        }
        return `${format(customStartDate, 'MMM d, yyyy')} - ${format(
            addDays(customStartDate, customDaysToShow - 1),
            'MMM d, yyyy',
        )}`;
    };

    const getPreviousHandler = () => {
        if (viewMode === 'month') return goToPreviousMonth;
        if (viewMode === 'week') return goToPreviousWeek;
        return goToPreviousPage;
    };

    const getNextHandler = () => {
        if (viewMode === 'month') return goToNextMonth;
        if (viewMode === 'week') return goToNextWeek;
        return goToNextPage;
    };

    return (
        <div className="flex flex-col w-full z-30 h-full relative bg-white">
            <div className="sticky top-0 inset-x-0 z-40 bg-white shadow-md px-6 py-3 flex flex-col lg:flex-row gap-4 justify-start lg:justify-between items-start lg:items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">{getViewTitle()}</h2>
                    {viewMode === 'week' && (
                        <span className="text-xs text-gray-500">(7 days)</span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {viewMode === 'month' && (
                        <MonthPicker
                            currentMonth={currentMonth}
                            onMonthChange={setCurrentMonth}
                        />
                    )}
                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-gray-50">
                        <Button
                            variant={viewMode === 'month' ? 'default' : 'ghost'}
                            className={cn(
                                viewMode === 'month'
                                    ? 'bg-hexbrand text-white'
                                    : 'text-gray-700',
                                'hover:bg-hexbrand hover:text-white',
                            )}
                            size="sm"
                            onClick={() => setViewMode('month')}
                        >
                            Month
                        </Button>
                        <Button
                            variant={viewMode === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn(
                                viewMode === 'week'
                                    ? 'bg-hexbrand text-white'
                                    : 'text-gray-700',
                                'hover:bg-hexbrand hover:text-white',
                            )}
                            onClick={() => setViewMode('week')}
                        >
                            Week
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-hexbrand shadow-sm flex items-center gap-3 text-white rounded-lg px-4 py-[6px]">
                            <button
                                type="button"
                                className="border rounded-full"
                                onClick={getPreviousHandler()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="border border-transparent hover:border-white rounded-lg px-2"
                                onClick={goToToday}
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                className="border rounded-full"
                                onClick={getNextHandler()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <Link
                        href="/banquet/bookings/new"
                        className="text-sm font-medium text-orion-blue hover:underline"
                    >
                        New booking
                    </Link>
                </div>
            </div>

            <hr />

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error || (data && typeof data === 'object' && 'error' in data) ? (
                <p className="p-6 text-sm text-destructive">
                    Failed to load events. Please refresh.
                </p>
            ) : (
                <div className="overflow-x-auto" ref={scrollContainerRef}>
                    <div className="min-w-max">
                        <EventsCalendarHeader dates={dates} />
                        <VenueList venues={venues} />
                    </div>
                </div>
            )}

            <div className="sticky bottom-0 inset-x-0 border-t flex items-center gap-6 bg-white z-40 shadow-md p-4">
                <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">Event guide:</div>
                    <ul className="flex gap-4 text-sm flex-wrap">
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                            <span>Confirmed / Paid</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-amber-400 rounded-full" />
                            <span>Partial payment</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-emerald-200 rounded-full" />
                            <span>Pending</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-hexbrand ml-auto mr-10 shadow-sm flex items-center gap-2 text-white rounded-lg px-3 py-[6px]">
                    <button
                        type="button"
                        className="border rounded-full"
                        onClick={scrollLeft}
                        title="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        type="button"
                        className="border rounded-full"
                        onClick={scrollRight}
                        title="Scroll right"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
