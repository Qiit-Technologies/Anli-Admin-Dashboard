'use client';

import { getNights } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/types/reservation';
import type { ReactNode } from 'react';
import { folioMoney } from './folio-money';

export type GroupStayContext = {
    isMaster: boolean;
    groupCode: string;
    billingMode: 'group' | 'individual';
    otherInHouseCount: number;
};

function formatStayDate(value?: string | null) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GroupInHouseStay({
    reservation,
    groupStay,
    actions,
}: {
    reservation: Reservation;
    groupStay: GroupStayContext;
    actions: ReactNode;
}) {
    const nights = Math.max(
        0,
        getNights(reservation.startDate, reservation.endDate),
    );
    const extrasTotal = Number(reservation.extrasTotal || 0);
    const extrasPaid = Number(reservation.extrasPaid || 0);
    const extrasDue = Number(reservation.extrasDue || 0);
    // Room charges, overstay nights and void stays land on the stay folio
    // rather than extras, and that is what check-out asks to settle.
    const stayDue = Number(reservation.totalDue || 0);
    const labels = (reservation.extrasLabels || []).filter(Boolean);
    const guestCount = Number(reservation.numberOfGuests || 1);
    const roomNumber =
        reservation.room?.roomNumber ?? reservation.roomNumber ?? '—';
    const roomType = reservation.roomType?.name || 'Room';
    const chargesGoToMaster = groupStay.billingMode !== 'individual';

    return (
        <article
            className={cn(
                'flex h-full w-full min-w-0 flex-col rounded-lg border bg-white p-3 text-sm shadow-none',
                groupStay.isMaster ? 'border-orange-300' : 'border-slate-200',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-sm font-semibold leading-tight">
                            {reservation.fullName}
                        </h3>
                        {groupStay.isMaster ? (
                            <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-orange-700">
                                MASTER
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                        {reservation.phoneNumber || '—'} · {guestCount}{' '}
                        {guestCount === 1 ? 'adult' : 'guests'}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {groupStay.groupCode}
                    </p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[11px] text-muted-foreground">Room</p>
                    <p className="text-xl font-semibold leading-none tabular-nums">
                        {roomNumber}
                    </p>
                    <p className="mt-1 max-w-[9rem] truncate text-[12px] text-muted-foreground">
                        {roomType}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex overflow-hidden rounded-md border bg-slate-50">
                <div className="flex flex-1 flex-col items-center justify-center py-2">
                    <span className="text-[11px] text-muted-foreground">
                        Check-in
                    </span>
                    <span className="text-sm font-medium">
                        {formatStayDate(reservation.startDate)}
                    </span>
                    {reservation.startTime ? (
                        <span className="text-[11px] text-muted-foreground">
                            {reservation.startTime}
                        </span>
                    ) : null}
                </div>
                <div className="flex flex-col items-center justify-center bg-slate-100 px-3">
                    <span className="text-lg font-semibold leading-none">
                        {nights}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        nights
                    </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center py-2">
                    <span className="text-[11px] text-muted-foreground">
                        Check-out
                    </span>
                    <span className="text-sm font-medium">
                        {formatStayDate(reservation.endDate)}
                    </span>
                    {reservation.endTime ? (
                        <span className="text-[11px] text-muted-foreground">
                            {reservation.endTime}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 text-[13px]">
                <span className="text-foreground">Room charges</span>
                <span className="font-medium text-emerald-700">
                    → {chargesGoToMaster ? 'Group master bill' : 'Own bill'}
                </span>
            </div>

            <div className="mt-3 flex-1 border-t border-slate-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Own bill · extras
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                    <Amount label="Total" value={extrasTotal} />
                    <Amount label="Paid" value={extrasPaid} />
                    <Amount label="Due" value={extrasDue} emphasize={extrasDue > 0} />
                </div>
                {labels.length > 0 ? (
                    <p className="mt-2 text-[12px] text-muted-foreground">
                        {labels.join(' · ')}
                    </p>
                ) : null}
                {stayDue > extrasDue ? (
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[12px]">
                        <span className="text-muted-foreground">
                            Stay folio due
                        </span>
                        <span className="font-semibold tabular-nums text-red-600">
                            {folioMoney(stayDue)}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                {actions}
            </div>
        </article>
    );
}

function Amount({
    label,
    value,
    emphasize = false,
}: {
    label: string;
    value: number;
    emphasize?: boolean;
}) {
    return (
        <div>
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p
                className={cn(
                    'text-sm font-semibold tabular-nums',
                    emphasize ? 'text-red-600' : 'text-foreground',
                )}
            >
                {folioMoney(value)}
            </p>
        </div>
    );
}
