'use client';

import { BookingForm } from '@/components/banquest/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EVENT_CATEGORY_META, getEventCategory } from './utils/event-category';

export type EventCardVariant = 'calendar' | 'schedule';

interface EventCardProps {
    event: BookingForm;
    className?: string;
    variant?: EventCardVariant;
}

export default function EventCard({
    event,
    className,
    variant = 'calendar',
}: EventCardProps) {
    const cat = getEventCategory(event.eventType, event.eventCategory);
    const meta = EVENT_CATEGORY_META[cat];

    return (
        <Link
            href={`/banquet/bookings/${event.id}`}
            className={cn(
                'flex w-full flex-col rounded-2xl border-t-[5px]',
                meta.topAccent,
                meta.cardBg,
                'transition-opacity hover:opacity-90',
                variant === 'schedule' && 'shadow-sm',
                className,
            )}
        >
            <div className="flex flex-col gap-0.5 px-3 py-2.5">
                <p
                    className={cn(
                        'text-xs font-bold leading-snug line-clamp-2',
                        meta.titleText,
                    )}
                >
                    {event.eventName}
                </p>
                <p className="text-[11px] font-normal leading-snug text-gray-600">
                    {event.eventTime}
                </p>
                <p className="text-[11px] font-normal leading-snug text-gray-600 line-clamp-1">
                    {event.eventVenue}
                </p>
            </div>
        </Link>
    );
}
