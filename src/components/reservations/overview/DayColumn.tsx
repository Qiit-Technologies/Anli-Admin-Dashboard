'use client';

import { Reservation, BlockedDate } from './types';
import { getReservationsForDay, getBlockedInfoForDay } from './utils';
import ReservationCard from './ReservationCard';

interface DayColumnProps {
    date: Date;
    hours: number[];
    reservations: Reservation[];
    blockedDates?: BlockedDate[];
    onReservationClick?: (reservation: Reservation) => void;
    hourHeight?: number;
    startHour?: number;
    isLast?: boolean;
}

export default function DayColumn({
    date,
    hours,
    reservations,
    blockedDates = [],
    onReservationClick,
    hourHeight = 80,
    startHour = 9,
    isLast = false,
}: DayColumnProps) {
    const dayReservations = getReservationsForDay(date, reservations);
    const blockedInfo = getBlockedInfoForDay(date, blockedDates);

    return (
        <div
            className={`relative min-w-[150px] flex-1 ${!isLast ? 'border-r border-gray-200' : ''}`}
        >
            {hours.map((hour, hourIdx) => (
                <div
                    key={hourIdx}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                    style={{ height: `${hourHeight}px` }}
                />
            ))}

            {blockedInfo && (
                <div className="absolute inset-0 bg-gray-100/50 flex flex-col items-center justify-start pt-20 z-10 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Blocked
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                            {blockedInfo.reason || 'Restricted'}
                        </span>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 px-1 py-1 pointer-events-none">
                {dayReservations.map((reservation) => (
                    <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onReservationClick={onReservationClick}
                        hourHeight={hourHeight}
                        startHour={startHour}
                    />
                ))}
            </div>
        </div>
    );
}
