'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ACTION_TITLES } from '../constants';
import type { GroupBooking, GroupModal } from '../types';
import { GroupActionHost, type GroupActionHandlers } from './GroupActionHost';

const CONFIRM_MODALS: GroupModal[] = [
    'checkout',
    'checkIn',
    'removeGuest',
    'deleteGroup',
    'voidGroup',
];

const WIDE_MODALS: GroupModal[] = [
    'addGuest',
    'addExisting',
    'edit',
    'invoices',
    'roomingList',
    'statement',
];

const COMPACT_MODALS: GroupModal[] = [
    'bulkCheckIn',
    'bulkCheckOut',
    'releaseRooms',
];

function dialogWidth(modal: GroupModal) {
    if (modal === 'splitBills') return 'max-w-2xl';
    if (CONFIRM_MODALS.includes(modal)) return 'max-w-[21.5rem]';
    if (WIDE_MODALS.includes(modal)) return 'max-w-[27.875rem]';
    if (COMPACT_MODALS.includes(modal)) return 'max-w-[23.125rem]';
    return 'max-w-[24.5rem]';
}

export function actionSubtitle(
    modal: GroupModal,
    booking: GroupBooking,
    guestName?: string,
) {
    switch (modal) {
        case 'checkout':
            return `Are you sure you want to Check Out ${guestName || 'this guest'} from ${booking.name}`;
        case 'checkIn':
            return `Are you sure you want to Check In ${guestName || 'this guest'} to ${booking.name}`;
        case 'removeGuest':
            return 'Are you sure you want to remove this guest from the group reservation';
        case 'addGuest':
            return `Adding to ${booking.name} · ${booking.id}`;
        case 'transfer':
            return `Move a guest out of ${booking.name} into another group or as a standalone reservation.`;
        case 'pullOut':
            return `${guestName || 'This guest'} becomes a standalone reservation. History is kept.`;
        case 'releaseRooms':
            return `Release unused rooms from ${booking.name}`;
        case 'merge':
            return `Merge another group into ${booking.name}`;
        case 'addExisting':
            return `Attach an existing reservation to ${booking.name}`;
        case 'transferCharges':
            return 'Move charges from a child folio to the master folio or another guest.';
        case 'deleteGroup':
            return `Remove ${booking.name} and its guest bookings from the system.`;
        case 'voidGroup':
            return `Void all reservations under ${booking.name}.`;
        default:
            return `${booking.name} · ${booking.id}`;
    }
}

export function GroupActionDialog({
    modal,
    booking,
    bookings,
    guestId,
    guestName,
    onClose,
    handlers,
}: {
    modal: GroupModal;
    booking: GroupBooking;
    bookings: GroupBooking[];
    guestId: string | null;
    guestName?: string;
    onClose: () => void;
    handlers: GroupActionHandlers;
}) {
    const isConfirm = CONFIRM_MODALS.includes(modal);
    const title = ACTION_TITLES[modal];
    const description = actionSubtitle(modal, booking, guestName);

    return (
        <Dialog
            open
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
        >
            <DialogContent
                className={cn(
                    'gap-0 overflow-hidden rounded-xl border-gray-100 p-0 shadow-lg',
                    dialogWidth(modal),
                    isConfirm && '[&>button:last-of-type]:hidden',
                )}
            >
                {isConfirm ? (
                    <>
                        <div className="flex flex-col items-center bg-[#FDF6F4] px-6 pb-4 pt-6">
                            <span className="flex size-11 items-center justify-center rounded-full bg-destructive text-white">
                                <XMark />
                            </span>
                            <DialogTitle className="mt-3 text-lg font-bold tracking-tight text-foreground">
                                {title}
                            </DialogTitle>
                        </div>
                        <div className="px-6 pb-6 pt-4">
                            <DialogDescription className="text-center text-[13px] leading-relaxed text-muted-foreground">
                                {description}
                            </DialogDescription>
                            <div className="mt-5">
                                <GroupActionHost
                                    modal={modal}
                                    booking={booking}
                                    bookings={bookings}
                                    guestId={guestId}
                                    onClose={onClose}
                                    handlers={handlers}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="border-b border-gray-100 px-5 pb-3 pt-5">
                            <DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-xs leading-snug text-muted-foreground">
                                {description}
                            </DialogDescription>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto px-5 pb-5 pt-4">
                            <GroupActionHost
                                modal={modal}
                                booking={booking}
                                bookings={bookings}
                                guestId={guestId}
                                onClose={onClose}
                                handlers={handlers}
                            />
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function XMark() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            className="size-5"
            aria-hidden
        >
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}
