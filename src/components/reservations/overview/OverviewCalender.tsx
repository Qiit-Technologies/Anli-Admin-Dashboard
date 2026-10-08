'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { useReservationSearch } from '@/context/ReservationSearchContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Reservation } from './types';
import CalendarSidebar from './CalendarSidebar';
import WeeklyScheduleHeader from './WeeklyScheduleHeader';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';
import { getTableReservations, getBlockedDates } from '@/app/actions/reservation';

interface OverviewCalendarProps {
    reservations?: Reservation[];
    onReservationClick?: (reservation: any) => void;
}

const fetcher = (
    start: string,
    end: string,
    search?: string,
    status?: string,
) => {
    return getTableReservations(start, end, search, status).then(
        (res) => res.data,
    );
}

export default function OverviewCalendar({
    reservations: manualReservations,
    onReservationClick,
}: OverviewCalendarProps) {
    const { searchTerm, statusFilter } = useReservationSearch();
    const debouncedSearch = useDebounce(searchTerm, 500);
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const [selectedDate, setSelectedDate] = useState(today);

    const startStr = format(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        'yyyy-MM-dd',
    );
    const endStr = format(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
        'yyyy-MM-dd',
    );

    const { data: fetchedData } = useSWR(
        [
            '/table-reservations/overview',
            startStr,
            endStr,
            debouncedSearch,
            statusFilter,
        ],
        () => fetcher(startStr, endStr, debouncedSearch, statusFilter),
    );

    const { data: blockedDatesData } = useSWR(
        '/table-reservations/blocked-dates',
        () => getBlockedDates().then((res) => res.data),
    );

    const reservations: Reservation[] =
        manualReservations ||
        (fetchedData
            ? fetchedData.map((item: any) => ({
                  id: String(item.id),
                  name: `${item.firstName} ${item.lastName}`,
                  tableNum: parseInt(item.tableNumber) || 101,
                  partySize: `${item.guestNumber} guests`,
                  status:
                      item.status.toLowerCase() === 'paid' ? 'paid' : 'pending',
                  startTime: item.time,
                  endTime: calculateEndTime(item.time),
                  date: item.date,
              }))
            : []);

    // Helper calculateEndTime should be defined before use if not in useEffect
    function calculateEndTime(startTime: string) {
        if (!startTime) return '11:00';
        const [h, m] = startTime.split(':').map(Number);
        const endHour = h + 1;
        return `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    const goToPreviousMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        );
    };

    const goToNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        );
    };

    const goToPreviousWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 7);
        setSelectedDate(newDate);
        if (newDate.getMonth() !== currentDate.getMonth()) {
            setCurrentDate(
                new Date(newDate.getFullYear(), newDate.getMonth(), 1),
            );
        }
    };

    const goToNextWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 7);
        setSelectedDate(newDate);
        if (newDate.getMonth() !== currentDate.getMonth()) {
            setCurrentDate(
                new Date(newDate.getFullYear(), newDate.getMonth(), 1),
            );
        }
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        if (date.getMonth() !== currentDate.getMonth()) {
            setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
        }
    };

    return (
        <div className="flex gap-6 pt-5 bg-white">
            <CalendarSidebar
                currentDate={currentDate}
                selectedDate={selectedDate}
                reservations={reservations}
                onPreviousMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
                onDateSelect={handleDateSelect}
                onMonthYearChange={setCurrentDate}
            />

            {/* Main Weekly Schedule */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header - Stays within page padding (has pr-6) */}
                <div className="pr-6">
                    <WeeklyScheduleHeader
                        selectedDate={selectedDate}
                        onPreviousWeek={goToPreviousWeek}
                        onNextWeek={goToNextWeek}
                        onToday={goToToday}
                    />
                </div>

                <WeeklyScheduleGrid
                    selectedDate={selectedDate}
                    reservations={reservations}
                    blockedDates={blockedDatesData}
                    onReservationClick={onReservationClick}
                />
            </div>
        </div>
    );
}

import { useReservationActions } from '@/components/reservations/common/useReservationActions';

export function OverviewCalendarWithModals() {
    const { handleView, reservationModals } = useReservationActions({});

    return (
        <>
            <OverviewCalendar
                onReservationClick={(r) =>
                    handleView({
                        ...r,
                        customerName: r.name,
                        tableNumber: String(r.tableNum),
                        rsvTime: r.startTime,
                        reservationDate: r.date,
                    } as any)
                }
            />
            {reservationModals}
        </>
    );
}
