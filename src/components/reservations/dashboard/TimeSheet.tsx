'use client';

import React, { useState } from 'react';
import { DatePicker } from '@/components/common/DatePicker';

export interface TimeSlotBooking {
    id: string;
    time: string;
    title: string;
    bgColor: string;
    badgeColor: string;
    row?: number;
}

interface TimeSheetProps {
    date?: Date;
    bookings?: TimeSlotBooking[];
    onDateChange?: (date: Date) => void;
    onBookingClick?: (booking: TimeSlotBooking) => void;
    loading?: boolean;
}

const defaultBookings: TimeSlotBooking[] = [
    {
        id: '1',
        time: '09:00',
        title: 'Mr Mark Olu',
        bgColor: '#FBF2EC',
        badgeColor: '#FF6F00',
        row: 0,
    },
    {
        id: '2',
        time: '09:30',
        title: 'Kitchen & Restaurant',
        bgColor: '#e4eef9',
        badgeColor: '#021A35',
        row: 1,
    },
    {
        id: '3',
        time: '10:30',
        title: 'Conference booking',
        bgColor: '#e4f9ee',
        badgeColor: '#033502',
        row: 0,
    },
];

const TIME_SLOTS = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
];

export default function TimeSheet({
    date: initialDate,
    bookings = defaultBookings,
    onDateChange,
    onBookingClick,
    loading = false,
}: TimeSheetProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(
        initialDate || new Date(),
    );

    React.useEffect(() => {
        if (initialDate) {
            setSelectedDate(initialDate);
        }
    }, [initialDate]);

    const getSlotIndex = (time: string) => {
        // Find the closest or exact slot match
        const index = TIME_SLOTS.indexOf(time);
        if (index !== -1) return index;

        // Fallback: round down to nearest 30 mins
        const [h, m] = time.split(':');
        const hour = h.padStart(2, '0');
        const minutes = parseInt(m) >= 30 ? '30' : '00';
        return TIME_SLOTS.indexOf(`${hour}:${minutes}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-5 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="font-medium text-[#101828] text-lg">
                        Reservation time sheet
                    </h3>
                    <p className="text-sm text-[#667085]">
                        Shows all current reservation date& time
                    </p>
                </div>

                <div>
                    <DatePicker
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(dateStr) => {
                            const newDate = new Date(dateStr);
                            setSelectedDate(newDate);
                            onDateChange?.(newDate);
                        }}
                        className="w-[180px]"
                    />
                </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="min-w-[1400px]">
                    <div className="flex border-b border-gray-100 pb-3 mb-4">
                        {TIME_SLOTS.map((slot) => (
                                <div
                                    key={slot}
                                    className="flex-1 text-left text-xs font-medium text-[#667085]"
                                >
                                    {slot}
                                </div>
                        ))}
                    </div>

                    <div className="relative min-h-[240px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
                                No reservations for this date
                            </div>
                        ) : (
                            bookings.map((booking) => {
                                const slotIndex = getSlotIndex(booking.time);
                                const leftPercent =
                                    (slotIndex / TIME_SLOTS.length) * 100;
                                const row = booking.row ?? 0;

                                return (
                                    <div
                                        key={booking.id}
                                        onClick={() =>
                                            onBookingClick?.(booking)
                                        }
                                        className="absolute flex items-center gap-[10px] px-2 py-2 rounded-md text-sm cursor-pointer transition-opacity z-10"
                                        style={{
                                            backgroundColor: booking.bgColor,
                                            left: `${leftPercent}%`,
                                            top: `${row * 50 + 10}px`,
                                        }}
                                    >
                                        <span
                                            className="p-[5px] rounded text-xs font-medium text-white whitespace-nowrap"
                                            style={{
                                                backgroundColor:
                                                    booking.badgeColor,
                                            }}
                                        >
                                            {booking.time}
                                        </span>
                                        <span className=" whitespace-nowrap">
                                            {booking.title}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * HOW TO USE WITH REAL DATA:
 *
 * 1. Fetch bookings when date changes:
 *
 * const [bookings, setBookings] = useState<TimeSlotBooking[]>([]);
 * const [loading, setLoading] = useState(false);
 *
 * const fetchBookings = async (date: Date) => {
 *     setLoading(true);
 *     try {
 *         const response = await fetch(`/api/reservations?date=${date.toISOString()}`);
 *         const data = await response.json();
 *         setBookings(data.map(transformToTimeSlotBooking));
 *     } finally {
 *         setLoading(false);
 *     }
 * };
 *
 * 2. Transform API data to TimeSlotBooking:
 *
 * const transformToTimeSlotBooking = (reservation: ApiReservation): TimeSlotBooking => ({
 *     id: reservation.id,
 *     time: reservation.time, // e.g., "09:00"
 *     title: reservation.customerName,
 *     bgColor: getColorByType(reservation.type).bg,
 *     badgeColor: getColorByType(reservation.type).badge,
 *     row: calculateRow(reservation), // Prevent overlapping
 * });
 *
 * 3. Use in component:
 *
 * <TimeSheet
 *     bookings={bookings}
 *     loading={loading}
 *     onDateChange={fetchBookings}
 *     onBookingClick={(booking) => router.push(`/reservations/${booking.id}`)}
 * />
 */
