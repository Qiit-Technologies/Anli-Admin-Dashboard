'use client';

import { Reservation } from './types';
import { getReservationPosition } from './utils';

interface ReservationCardProps {
    reservation: Reservation;
    onReservationClick?: (reservation: Reservation) => void;
    hourHeight?: number;
    startHour?: number;
}

export default function ReservationCard({
    reservation,
    onReservationClick,
    hourHeight = 80,
    startHour = 9,
}: ReservationCardProps) {
    const position = getReservationPosition(
        reservation.startTime,
        reservation.endTime,
        hourHeight,
        startHour,
    );

    const isPaid = reservation.status === 'paid';

    return (
        <div
            onClick={() => onReservationClick?.(reservation)}
            className={`absolute left-1 right-1 rounded-lg p-2.5 text-xs pointer-events-auto cursor-pointer transition-all hover:shadow-md border-l-4 ${
                isPaid
                    ? 'bg-green-50 border-green-500 hover:bg-green-100'
                    : 'bg-orange-50 border-orange-500 hover:bg-orange-100'
            }`}
            style={position}
        >
            <div className="space-y-1">
                <div className="text-gray-900">Name: {reservation.name}</div>
                <div className="text-gray-700 leading-tight">
                    Table Num: {reservation.tableNum} ( {reservation.partySize})
                </div>
                <div
                    className={`font-semibold mt-1.5 ${
                        isPaid ? 'text-green-700' : 'text-orange-600'
                    }`}
                >
                    {isPaid ? 'Paid' : 'Pending Payment'}
                </div>
            </div>
        </div>
    );
}
