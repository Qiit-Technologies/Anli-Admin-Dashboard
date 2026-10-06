'use client';

import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import type { ReactNode } from 'react';
import {
    ArrowLeftFromLine,
    ArrowRightToLine,
    BedDouble,
    Calendar,
    Clock,
    Users,
} from 'lucide-react';
import { bookingStats } from './booking-stats';
import { GroupTypeLabel, StatusPill } from './StatusPills';
import type { GroupBooking } from './types';

const AVATAR_TONES = [
    {
        row: 'border-orange-100 bg-orange-50/80',
        mark: 'bg-orange-100 text-orange-800',
    },
    {
        row: 'border-sky-100 bg-sky-50/80',
        mark: 'bg-sky-100 text-sky-800',
    },
    {
        row: 'border-violet-100 bg-violet-50/80',
        mark: 'bg-violet-100 text-violet-800',
    },
    {
        row: 'border-emerald-100 bg-emerald-50/80',
        mark: 'bg-emerald-100 text-emerald-800',
    },
] as const;

function avatarTone(name: string) {
    let code = 0;
    for (const char of name) {
        code += char.codePointAt(0) || 0;
    }
    return AVATAR_TONES[code % AVATAR_TONES.length];
}

const STATS: {
    key: keyof ReturnType<typeof bookingStats>;
    label: string;
    icon: ReactNode;
}[] = [
    { key: 'guests', label: 'Guests', icon: <Users className="size-3.5" /> },
    {
        key: 'rooms',
        label: 'Rooms',
        icon: <BedDouble className="size-3.5" />,
    },
    {
        key: 'checkedIn',
        label: 'Checked In',
        icon: <ArrowRightToLine className="size-3.5 text-emerald-600" />,
    },
    {
        key: 'checkedOut',
        label: 'Checked Out',
        icon: <ArrowLeftFromLine className="size-3.5 text-sky-600" />,
    },
    {
        key: 'expected',
        label: 'Expected',
        icon: <Clock className="size-3.5 text-amber-500" />,
    },
];

export function GroupReservationCard({
    booking,
    onManage,
}: {
    booking: GroupBooking;
    onManage: (id: string) => void;
}) {
    const stats = bookingStats(booking);
    const initial = (booking.contactName || booking.name || 'G')
        .charAt(0)
        .toUpperCase();
    const tone = avatarTone(booking.contactName || booking.name);

    return (
        <article className="flex h-full flex-col rounded-md border bg-white p-1 text-sm shadow-none">
            <div className="flex items-start justify-between gap-3 px-2 pt-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-teal-600 text-white">
                        <Users className="size-4" />
                    </span>
                    <h3 className="min-w-0 truncate text-sm font-semibold leading-none text-teal-600">
                        {booking.name}
                    </h3>
                </div>
                <p className="shrink-0 pt-1.5 text-sm font-semibold tabular-nums text-emerald-500">
                    {formatCurrency(booking.amount)}
                </p>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-2">
                <span className="font-mono text-[12px] text-muted-foreground">
                    {booking.id}
                </span>
                <span className="text-muted-foreground">·</span>
                <GroupTypeLabel type={booking.groupType} />
                <StatusPill status={booking.status} />
            </div>

            <p className="mt-2 flex items-center gap-1.5 px-2 text-[12px] text-muted-foreground">
                <Calendar className="size-3.5" />
                {booking.startDate} &gt; {booking.endDate}
            </p>

            <div
                className={cn(
                    'mx-2 mt-2 flex items-center gap-2 rounded-md border px-2 py-1.5',
                    tone.row,
                )}
            >
                <span
                    className={cn(
                        'flex size-7 items-center justify-center rounded-full text-[11px] font-semibold',
                        tone.mark,
                    )}
                >
                    {initial}
                </span>
                <span className="min-w-0 truncate text-sm font-medium">
                    {booking.contactName || booking.name}
                </span>
                <span className="ml-auto font-mono text-[12px] text-muted-foreground">
                    {booking.contactPhone}
                </span>
            </div>

            <div className="mx-2 mt-2 grid grid-cols-6 gap-2">
                {STATS.map((item, index) => (
                    <div
                        key={item.key}
                        className={cn(
                            'min-w-0 rounded-xl bg-[#F7F8FA] px-2.5 py-2',
                            index < 3 ? 'col-span-2' : 'col-span-3',
                        )}
                    >
                        <div className="flex items-center gap-1 text-muted-foreground">
                            {item.icon}
                            <p className="truncate text-[11px] leading-none">
                                {item.label}
                            </p>
                        </div>
                        <p className="mt-1 text-lg font-semibold tabular-nums leading-none">
                            {stats[item.key]}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-auto p-2">
                <Button
                    className="h-7 w-full rounded-md bg-[#E8EAED] text-sm font-medium text-foreground shadow-none hover:bg-[#dfe2e6]"
                    onClick={() => onManage(booking.id)}
                >
                    Manage Reservation
                </Button>
            </div>
        </article>
    );
}
