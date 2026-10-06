'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronDown, MoreHorizontal, Search } from 'lucide-react';
import { GROUP_ACTION_ITEMS } from './constants';
import { checkInBlockReason } from './form/group-party';
import type { GroupGuest, GroupModal, GroupStayStatus } from './types';

export function GuestList({
    guests,
    search,
    contactName,
    contactPhone,
    onSearch,
    onCheckout,
    onRemove,
    onTransfer,
    onGuestAction,
    onAction,
}: {
    guests: GroupGuest[];
    search: string;
    contactName?: string;
    contactPhone?: string;
    onSearch: (q: string) => void;
    onCheckout: (guestId: string) => void;
    onRemove: (guestId: string) => void;
    onTransfer: (guestId: string) => void;
    onGuestAction: (guestId: string, modal: GroupModal) => void;
    onAction: (modal: GroupModal) => void;
}) {
    return (
        <div className="rounded-[10px] bg-[#F7F8FA] p-3">
            <div className="flex items-center gap-3">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search guest name....."
                        className="h-10 rounded-lg border-gray-200 bg-white pl-10 text-sm shadow-none placeholder:text-gray-400"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 shrink-0 gap-2 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium shadow-none"
                        >
                            Action
                            <ChevronDown className="size-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {GROUP_ACTION_ITEMS.filter(
                            (item) =>
                                item.id !== 'bulkCheckOut' ||
                                guests.some(
                                    (guest) => guest.stayStatus === 'checked-in',
                                ),
                        ).map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onClick={() => onAction(item.id)}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-3 overflow-hidden rounded-lg bg-white">
                {contactName ? (
                    <div className="flex items-center gap-2 bg-[#FDF3EC] px-4 py-2.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-semibold text-hexbrand">
                            {contactName.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                            {contactName}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                            {contactPhone}
                        </span>
                        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                ) : null}
                <div className="divide-y divide-gray-100">
                    {guests.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                            No guests match this search.
                        </p>
                    ) : (
                        guests.map((guest) => (
                            <GuestRow
                                key={guest.id}
                                guest={guest}
                                onCheckout={onCheckout}
                                onRemove={onRemove}
                                onTransfer={onTransfer}
                                onGuestAction={onGuestAction}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function GuestRow({
    guest,
    onCheckout,
    onRemove,
    onTransfer,
    onGuestAction,
}: {
    guest: GroupGuest;
    onCheckout: (guestId: string) => void;
    onRemove: (guestId: string) => void;
    onTransfer: (guestId: string) => void;
    onGuestAction: (guestId: string, modal: GroupModal) => void;
}) {
    return (
        <div className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                    {guest.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {guest.phoneNumber} · {guest.nationality} ·{' '}
                    {guest.guestType === 'adult' ? 'Adult' : 'Child'}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>
                        {guest.roomName}, room{guest.roomNumber} ·
                    </span>
                    <StayStatus status={guest.stayStatus} />
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <span className="font-mono text-[11px] text-muted-foreground">
                    {guest.reservationId}
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 shadow-none"
                            aria-label={`${guest.name} actions`}
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {guest.stayStatus === 'expected' && (
                            <DropdownMenuItem
                                disabled={Boolean(
                                    checkInBlockReason(guest.startDate),
                                )}
                                title={
                                    checkInBlockReason(guest.startDate) ||
                                    undefined
                                }
                                onClick={() =>
                                    onGuestAction(guest.id, 'checkIn')
                                }
                            >
                                Check In
                            </DropdownMenuItem>
                        )}
                        {guest.stayStatus === 'checked-in' && (
                            <DropdownMenuItem
                                onClick={() => onCheckout(guest.id)}
                            >
                                Check Out
                            </DropdownMenuItem>
                        )}
                        {guest.stayStatus === 'checked-in' && (
                            <DropdownMenuItem
                                onClick={() =>
                                    onGuestAction(guest.id, 'extendStay')
                                }
                            >
                                Extend Stay
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={() =>
                                onGuestAction(guest.id, 'upgradeRoom')
                            }
                        >
                            Upgrade Room
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onGuestAction(guest.id, 'downgradeRoom')
                            }
                        >
                            Downgrade Room
                        </DropdownMenuItem>
                        {guest.stayStatus === 'checked-in' && (
                            <DropdownMenuItem
                                onClick={() =>
                                    onGuestAction(guest.id, 'transferRoom')
                                }
                            >
                                Transfer Room
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onTransfer(guest.id)}>
                            Group Transfer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onGuestAction(guest.id, 'pullOut')}
                        >
                            Pull Out
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRemove(guest.id)}>
                            Remove Guest
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function StayStatus({ status }: { status: GroupStayStatus }) {
    const label =
        status === 'expected'
            ? 'Expected'
            : status === 'checked-in'
              ? 'Check-In'
              : 'Check-Out';
    return (
        <span
            className={cn(
                'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
                status === 'expected' && 'bg-amber-50 text-amber-700',
                status === 'checked-in' && 'bg-emerald-50 text-emerald-600',
                status === 'checked-out' && 'bg-red-50 text-red-600',
            )}
        >
            {label}
        </span>
    );
}
