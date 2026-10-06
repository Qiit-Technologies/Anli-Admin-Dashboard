'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CalendarEventBlock } from './lib/types';

interface EventBlockProps {
    event: CalendarEventBlock;
}

function blockStyles(event: CalendarEventBlock): string {
    if (event.bookingStatus === 'cancelled') {
        return 'bg-red-50 border-l-emerald-600 border-l-4 text-red-900';
    }
    if (event.paymentStatus === 'paid') {
        return 'bg-emerald-50 border-l-emerald-600 border-l-4 text-emerald-900';
    }
    if (event.paymentStatus === 'partial') {
        return 'bg-amber-50 border-l-emerald-600 border-l-4 text-amber-900';
    }
    return 'bg-emerald-50/80 border-l-emerald-600 border-l-4 text-emerald-900';
}

export default function EventBlock({ event }: EventBlockProps) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={() => router.push(`/banquet/bookings/${event.id}`)}
            className={cn(
                'rounded-xl w-full text-left text-xs p-2 min-h-[52px] flex flex-col justify-center gap-0.5 hover:opacity-90 transition-opacity',
                blockStyles(event),
            )}
        >
            <span className="font-semibold line-clamp-2">{event.title}</span>
            <span className="text-[10px] opacity-80">{event.eventTime}</span>
        </button>
    );
}
