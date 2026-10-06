'use client';
import { Button } from '@/components/ui/button';
import useGuest from '@/hooks/useGuest';
import useHotelRooms from '@/hooks/useHotelRooms';
import { cn } from '@/lib/utils';
import useStayViewStore from '@/store/useSV';
import { DatePicker } from '@heroui/react';
import { addDays, endOfWeek, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import CalendarHeader from './CalendarHeader';
import { EmptyRoomState } from './EmptyState';
import MonthPicker from './MonthPicker';
import { RoomTypeList } from './RoomTypeList';
import { StayViewSkeleton } from './SVSkeleton';

export function StayViewLatest() {
    const {
        viewMode,
        currentMonth,
        currentWeek,
        setCurrentMonth,
        setViewMode,
        customStartDate,
        customDaysToShow,
        showDatePicker,
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

    const scrollLeft = () =>
        scrollContainerRef.current?.scrollBy({
            left: -360,
            behavior: 'smooth',
        });
    const scrollRight = () =>
        scrollContainerRef.current?.scrollBy({ left: 360, behavior: 'smooth' });

    const dates = getCurrentViewDates();
    const { rooms, isLoading: loadingRooms } = useHotelRooms();
    const { guestList: reservations, loading: loadingReservations } =
        useGuest();

    if (loadingRooms || loadingReservations) {
        return <StayViewSkeleton />;
    }

    if (!rooms || rooms.length === 0 || !reservations) {
        return <EmptyRoomState />;
    }

    const getViewTitle = () => {
        if (viewMode === 'month') {
            return format(currentMonth, 'MMMM yyyy');
        } else if (viewMode === 'week') {
            const weekStart = currentWeek;
            const weekEnd = endOfWeek(weekStart);
            return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        } else {
            return `${format(customStartDate, 'MMM d, yyyy')} - ${format(
                addDays(customStartDate, customDaysToShow - 1),
                'MMM d, yyyy',
            )}`;
        }
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
        <div className="flex flex-col w-full z-30 h-full relative bg-orion- bg-white">
            <div className="sticky top-0 inset-x-0 z-40 bg-white shadow-md px-6 py-3 flex flex-col lg:flex-row gap-4 justify-start lg:justify-between items-start lg:items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">
                        {getViewTitle()}
                    </h2>
                    {viewMode === 'custom' && (
                        <span className="text-xs text-gray-500">
                            ({customDaysToShow} days)
                        </span>
                    )}
                    {viewMode === 'week' && (
                        <span className="text-xs text-gray-500">(7 days)</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
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
                                className="border rounded-full"
                                onClick={getPreviousHandler()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                className="border border-transparent hover:border-white rounded-lg px-2"
                                onClick={goToToday}
                            >
                                Today
                            </button>
                            <button
                                className="border rounded-full"
                                onClick={getNextHandler()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showDatePicker && (
                <div className="px-6 mb-4">
                    <DatePicker />
                </div>
            )}

            <hr />

            <div className="overflow-x-auto" ref={scrollContainerRef}>
                <div className="min-w-max">
                    <CalendarHeader dates={dates} />

                    <RoomTypeList rooms={rooms} reservations={reservations} />
                </div>
            </div>

            {/* bottom guide */}
            <div className="sticky bottom-0 inset-x-0 border-t flex items-center gap-6 bg-white z-40 shadow-md p-4">
                <div className="flex items-center gap-2">
                    <div className="font-semibold">Room Guide:</div>
                    <ul className="flex gap-4 text-sm flex-wrap">
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                            <span>Reserved</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                            <span>In-House</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-[#6e0d1e] rounded-full inline-block"></span>
                            <span>Due Out</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-700 rounded-full inline-block"></span>
                            <span>Void</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                            <span>Complimentary</span>
                        </li>
                        <li className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-orion-blue rounded-full inline-block"></span>
                            <span>Discount</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-hexbrand ml-auto mr-10 shadow-sm flex items-center gap-2 text-white rounded-lg px-3 py-[6px]">
                    <button
                        className="border rounded-full"
                        onClick={scrollLeft}
                        title="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
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
