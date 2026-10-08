'use client';

import { cn } from '@/lib/utils';
import useStayViewStore from '@/store/useSV';
import { format, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import EventBlock from './EventBlock';
import { CalendarVenueRow } from './lib/types';

interface VenueSectionProps {
    venue: CalendarVenueRow;
}

const toDayKey = (value: Date | string) =>
    format(new Date(value), 'yyyy-MM-dd');

export default function VenueSection({ venue }: VenueSectionProps) {
    const router = useRouter();
    const { getCurrentViewDates } = useStayViewStore();
    const currentDates = getCurrentViewDates();
    const daysToShow = currentDates.length;

    const gridStyleCol = {
        display: 'grid',
        gridTemplateColumns: `200px repeat(${daysToShow}, minmax(100px, 1fr))`,
    };

    const eventsForDay = (day: Date) =>
        venue.events.filter((e) => toDayKey(e.eventDate) === toDayKey(day));

    const handleEmptyCell = (day: Date) => {
        const params = new URLSearchParams({
            eventDate: format(day, 'yyyy-MM-dd'),
            eventVenue: venue.name,
        });
        router.push(`/banquet/bookings/new?${params.toString()}`);
    };

    return (
        <div style={gridStyleCol} className="border-b min-h-[72px]">
            <div className="p-3 text-sm font-medium border-r sticky left-0 bg-white z-10 flex items-center">
                <span className="line-clamp-3" title={venue.name}>
                    {venue.name}
                </span>
            </div>

            {currentDates.map((day) => {
                const dayEvents = eventsForDay(day);
                const isPast = startOfDay(day) < startOfDay(new Date());

                if (dayEvents.length === 0) {
                    return (
                        <div
                            key={day.toISOString()}
                            className="border-r p-1 min-h-[72px]"
                        >
                            <button
                                type="button"
                                disabled={isPast}
                                onClick={() => handleEmptyCell(day)}
                                className={cn(
                                    'w-full h-full min-h-[64px] rounded-lg border border-dashed border-transparent',
                                    !isPast &&
                                        'hover:border-orion-blue/40 hover:bg-orion-blue/5 cursor-pointer',
                                    isPast && 'cursor-not-allowed opacity-40',
                                )}
                                aria-label={`Create booking at ${venue.name}`}
                            />
                        </div>
                    );
                }

                return (
                    <div
                        key={day.toISOString()}
                        className="border-r p-1 min-h-[72px] flex flex-col gap-1"
                    >
                        {dayEvents.map((event) => (
                            <EventBlock key={event.id} event={event} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
