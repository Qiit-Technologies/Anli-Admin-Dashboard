'use client';

import { WEEK_DAYS_FULL, Reservation, BlockedDate } from './types';
import { getWeekDays, isSameDay } from './utils';
import TimeColumn from './TimeColumn';
import DayColumn from './DayColumn';

interface WeeklyScheduleGridProps {
    selectedDate: Date;
    reservations: Reservation[];
    blockedDates?: BlockedDate[];
    onReservationClick?: (reservation: Reservation) => void;
    hours?: number[];
    hourHeight?: number;
    startHour?: number;
}

export default function WeeklyScheduleGrid({
    selectedDate,
    reservations,
    blockedDates = [],
    onReservationClick,
    hours = Array.from({ length: 22 }, (_, i) => 9 + i * 0.5),
    hourHeight = 60,
    startHour = 9,
}: WeeklyScheduleGridProps) {
    const weekDays = getWeekDays(selectedDate);

    return (
        <div
            className="overflow-auto bg-white pb-7 scrollbar-hide rounded-md"
            style={{
                height: '600px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            <div className="min-w-max">
                <div className="flex border-b border-gray-200 sticky top-0 bg-[#F9FAFB] z-20">
                    <div className="w-20 border-r border-gray-200 flex-shrink-0 flex items-center justify-center bg-[#F9FAFB] sticky left-0 z-30">
                        <span className="text-xs text-gray-500">GMT+ 8</span>
                    </div>
                    {weekDays.map((date, idx) => {
                        const isToday = isSameDay(date, new Date());
                        const isLast = idx === weekDays.length - 1;
                        return (
                            <div
                                key={idx}
                                className={`py-3 px-4 text-center min-w-[150px] flex-1 ${!isLast ? 'border-r border-gray-200' : ''}`}
                            >
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    {WEEK_DAYS_FULL[idx]}
                                </div>
                                <div
                                    className={`text-2xl font-normal ${isToday ? 'text-blue-600' : 'text-gray-900'}`}
                                >
                                    {date.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex">
                    <TimeColumn hours={hours} hourHeight={hourHeight} />

                    {weekDays.map((date, dayIdx) => (
                        <DayColumn
                            key={dayIdx}
                            date={date}
                            hours={hours}
                            reservations={reservations}
                            blockedDates={blockedDates}
                            onReservationClick={onReservationClick}
                            hourHeight={hourHeight}
                            startHour={startHour}
                            isLast={dayIdx === weekDays.length - 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
