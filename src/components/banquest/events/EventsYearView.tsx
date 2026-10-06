'use client';

import { BookingForm } from '@/components/banquest/types';
import { ChevronDown } from 'lucide-react';
import EventsMonthGrid from './EventsMonthGrid';

interface EventsYearViewProps {
    month: Date;
    bookings: BookingForm[];
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

export default function EventsYearView({
    month,
    bookings,
    selectedDate,
    onSelectDate,
    onMonthChange,
}: EventsYearViewProps) {
    const months = [
        month,
        new Date(month.getFullYear(), month.getMonth() + 1, 1),
    ];

    return (
        <div className="flex flex-col gap-8">
            {months.map((m) => (
                <div key={m.toISOString()} className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => onMonthChange(m)}
                        className="flex flex-row items-center gap-1 text-sm font-semibold text-gray-900 w-fit"
                    >
                        {m.toLocaleString('default', {
                            month: 'long',
                            year: 'numeric',
                        })}
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <EventsMonthGrid
                        month={m}
                        bookings={bookings}
                        selectedDate={selectedDate}
                        onSelectDate={onSelectDate}
                        showHeader={false}
                    />
                </div>
            ))}
        </div>
    );
}
