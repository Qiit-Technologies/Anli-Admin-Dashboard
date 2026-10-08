'use client';

import { Button } from '@/components/ui/button';
import { getNights } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Calendar, ChevronDown, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { GroupTypeLabel } from '../group-reservation/StatusPills';
import type { GroupBooking } from '../group-reservation/types';
import { folioMoney } from './folio-money';

function occupancyLabel(checkedInCount: number, totalCount: number) {
    if (totalCount <= 0) return { text: 'No guests', tone: 'muted' as const };
    if (checkedInCount === totalCount) {
        return {
            text: `All in-house · ${checkedInCount}/${totalCount}`,
            tone: 'success' as const,
        };
    }
    if (checkedInCount === 0) {
        return {
            text: `Expected · ${totalCount}`,
            tone: 'warning' as const,
        };
    }
    return {
        text: `Partially in-house · ${checkedInCount}/${totalCount}`,
        tone: 'warning' as const,
    };
}

function stayNights(booking: GroupBooking) {
    if (!booking.arrivalIso || !booking.departureIso) return 0;
    return getNights(booking.arrivalIso, booking.departureIso);
}

/**
 * A group only takes the width it needs: one room card per column, so a
 * two-room group leaves the rest of the row free for the next group or a
 * standalone stay.
 */
const sectionSpanClass: Record<number, string> = {
    1: 'sm:col-span-1 lg:col-span-1 2xl:col-span-1',
    2: 'sm:col-span-2 lg:col-span-2 2xl:col-span-2',
    3: 'sm:col-span-2 lg:col-span-3 2xl:col-span-3',
    4: 'sm:col-span-2 lg:col-span-3 2xl:col-span-4',
};

const roomGridClass: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
};

function columnsFor(roomCardCount: number) {
    return Math.min(Math.max(roomCardCount, 1), 4);
}

export function CheckInOutGroupCard({
    booking,
    checkedInCount,
    totalCount,
    roomCardCount,
    staysDue = 0,
    children,
    onOpenGroup,
    onExtendGroup,
    onBulkCheckout,
}: {
    booking: GroupBooking;
    checkedInCount: number;
    totalCount: number;
    /** Room cards rendered inside, which sets how wide the group sits. */
    roomCardCount: number;
    /** Folio due across the in-house stays, including posted extras. */
    staysDue?: number;
    children: ReactNode;
    onOpenGroup: (recordId: string) => void;
    onExtendGroup: (recordId: string) => void;
    onBulkCheckout: (recordId: string) => void;
}) {
    const [open, setOpen] = useState(true);
    const occupancy = occupancyLabel(checkedInCount, totalCount);
    const paid = Number(booking.deposit || 0);
    const total = Number(booking.amount || 0);
    // Deposits can exceed the master bill while extras stay unpaid, so take the
    // largest of the figures rather than just bill minus paid.
    const due = Math.max(
        0,
        Number(booking.outstanding || 0),
        Number(staysDue || 0),
        total - paid,
    );
    const nights = stayNights(booking);
    const columns = columnsFor(roomCardCount);

    return (
        <section
            className={cn(
                'min-w-0 w-full rounded-xl border border-slate-200/80 bg-[#F4F7F5] p-3 shadow-none',
                sectionSpanClass[columns],
            )}
        >
            <header className="flex flex-col gap-3">
                <div className="flex min-w-0 items-start gap-2">
                    <button
                        type="button"
                        className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white"
                        aria-expanded={open}
                        aria-label={open ? 'Collapse group' : 'Expand group'}
                        onClick={() => setOpen((value) => !value)}
                    >
                        <ChevronDown
                            className={cn(
                                'size-4 transition-transform',
                                open ? 'rotate-0' : '-rotate-90',
                            )}
                        />
                    </button>
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-600 text-white">
                                <Users className="size-3.5" />
                            </span>
                            <h3 className="truncate text-base font-semibold text-foreground">
                                {booking.name}
                            </h3>
                            <span
                                className={cn(
                                    'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium',
                                    occupancy.tone === 'success' &&
                                        'border-emerald-200 bg-emerald-50 text-emerald-700',
                                    occupancy.tone === 'warning' &&
                                        'border-amber-200 bg-amber-50 text-amber-800',
                                    occupancy.tone === 'muted' &&
                                        'border-slate-200 bg-white text-muted-foreground',
                                )}
                            >
                                {occupancy.text}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
                            <span className="font-mono text-[11px]">
                                {booking.id}
                            </span>
                            <span>·</span>
                            <GroupTypeLabel type={booking.groupType} />
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                                <Calendar className="size-3" />
                                {booking.startDate}
                                <span aria-hidden>→</span>
                                {booking.endDate}
                            </span>
                            {nights > 0 ? (
                                <>
                                    <span>·</span>
                                    <span>
                                        {nights} night{nights === 1 ? '' : 's'}
                                    </span>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2">
                    <div className="grid w-full grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <BillStat label="Master bill" value={folioMoney(total)} />
                        <BillStat label="Paid" value={folioMoney(paid)} />
                        <BillStat
                            label="Due"
                            value={folioMoney(due)}
                            emphasize={due > 0}
                        />
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-md border-gray-200 bg-white px-3 text-[13px] font-medium shadow-none"
                            onClick={() => onExtendGroup(booking.id)}
                        >
                            Extend group
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-md border-gray-200 bg-white px-3 text-[13px] font-medium shadow-none"
                            onClick={() => onOpenGroup(booking.id)}
                        >
                            Open group
                        </Button>
                        <Button
                            type="button"
                            className="h-8 rounded-md bg-emerald-700 px-3 text-[13px] font-medium text-white shadow-none hover:bg-emerald-800"
                            onClick={() => onBulkCheckout(booking.id)}
                        >
                            Bulk check-out
                        </Button>
                    </div>
                </div>
            </header>

            {open ? (
                <div
                    className={cn(
                        'mt-3 grid items-stretch gap-3',
                        roomGridClass[columns],
                    )}
                >
                    {children}
                </div>
            ) : null}
        </section>
    );
}

function BillStat({
    label,
    value,
    emphasize = false,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <div className="min-w-0 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <p
                className={cn(
                    'truncate text-sm font-semibold tabular-nums',
                    emphasize ? 'text-red-600' : 'text-foreground',
                )}
            >
                {value}
            </p>
        </div>
    );
}
