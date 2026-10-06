'use client';

import { BookingForm } from '@/components/banquest/types';
import {
    parseBookingEventDate,
    parseEventHour,
} from '@/components/banquest/utils/booking-display';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import EventCard from './EventCard';
import { dateKey } from './utils/calendar-month';

type DayPeriod = 'morning' | 'midday' | 'night';

const PERIODS: { id: DayPeriod; label: string }[] = [
    { id: 'morning', label: 'Morning' },
    { id: 'midday', label: 'Mid Day' },
    { id: 'night', label: 'Night' },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);

function periodForHour(hour: number): DayPeriod {
    if (hour < 12) return 'morning';
    if (hour < 17) return 'midday';
    return 'night';
}

function formatHourLabel(hour: number): string {
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${meridiem}`;
}

interface EventsWeekScheduleViewProps {
    bookings: BookingForm[];
    anchorDate: Date;
}

export default function EventsWeekScheduleView({
    bookings,
    anchorDate,
}: EventsWeekScheduleViewProps) {
    const [periodFilter, setPeriodFilter] = useState<
        Record<DayPeriod, boolean>
    >({
        morning: true,
        midday: true,
        night: true,
    });

    const weekKey = dateKey(anchorDate);

    const eventsByPeriodHour = useMemo(() => {
        const map = new Map<string, BookingForm[]>();
        for (const booking of bookings) {
            const parsed = parseBookingEventDate(booking.eventDate);
            if (!parsed || dateKey(parsed) !== weekKey) continue;
            const hour = parseEventHour(booking.eventTime);
            if (hour === null) continue;
            const period = periodForHour(hour);
            const key = `${period}-${hour}`;
            const list = map.get(key) ?? [];
            list.push(booking);
            map.set(key, list);
        }
        return map;
    }, [bookings, weekKey]);

    const overflowByPeriod = useMemo(() => {
        const counts: Record<DayPeriod, number> = {
            morning: 0,
            midday: 0,
            night: 0,
        };
        for (const booking of bookings) {
            const parsed = parseBookingEventDate(booking.eventDate);
            if (!parsed || dateKey(parsed) !== weekKey) continue;
            const hour = parseEventHour(booking.eventTime);
            if (hour === null) continue;
            counts[periodForHour(hour)] += 1;
        }
        return counts;
    }, [bookings, weekKey]);

    return (
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="flex flex-row">
                {PERIODS.map((period, index) => {
                    const enabled = periodFilter[period.id];
                    return (
                        <div
                            key={period.id}
                            className={cn(
                                'flex flex-1 flex-col min-w-0',
                                index < PERIODS.length - 1 &&
                                    'border-r border-gray-200',
                                !enabled && 'opacity-50',
                            )}
                        >
                            <div className="flex flex-row items-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-3">
                                <Checkbox
                                    checked={enabled}
                                    onCheckedChange={(checked) =>
                                        setPeriodFilter((prev) => ({
                                            ...prev,
                                            [period.id]: !!checked,
                                        }))
                                    }
                                />
                                <span className="text-sm font-semibold text-gray-800">
                                    {period.label}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                {HOURS.map((hour) => {
                                    const key = `${period.id}-${hour}`;
                                    const slotEvents =
                                        eventsByPeriodHour.get(key) ?? [];
                                    if (
                                        periodForHour(hour) !== period.id ||
                                        !enabled
                                    ) {
                                        return (
                                            <div
                                                key={key}
                                                className="min-h-[56px] border-b border-gray-100"
                                            />
                                        );
                                    }

                                    const visible = slotEvents.slice(0, 1);
                                    const overflow = slotEvents.length - 1;

                                    return (
                                        <div
                                            key={key}
                                            className="flex flex-col gap-1 min-h-[56px] border-b border-gray-100 p-1.5"
                                        >
                                            {visible.map((event) => (
                                                <EventCard
                                                    key={event.id}
                                                    event={event}
                                                    variant="schedule"
                                                />
                                            ))}
                                            {overflow > 0 ? (
                                                <span className="text-[10px] font-medium text-orion-blue pl-1">
                                                    +{overflow} More Event
                                                </span>
                                            ) : null}
                                            {visible.length === 0 ? (
                                                <span className="text-[10px] text-transparent select-none">
                                                    {formatHourLabel(hour)}
                                                </span>
                                            ) : null}
                                        </div>
                                    );
                                })}
                                {overflowByPeriod[period.id] > 4 ? (
                                    <div className="p-2 text-[10px] font-medium text-orion-blue">
                                        +1 More Event
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
