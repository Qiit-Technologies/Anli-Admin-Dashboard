'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import { cn, formatCurrency } from '@/lib/utils';
import { Calendar, ChevronLeft, CreditCard } from 'lucide-react';
import { canDeleteGroupReservation } from './booking-stats';
import { GroupActionDialog } from './actions/GroupActionDialog';
import type { GroupActionHandlers } from './actions/GroupActionHost';
import { GROUP_PAYMENT_METHODS } from './constants';
import { GuestList } from './GuestList';
import { GroupTypeLabel, StatusPill } from './StatusPills';
import type { GroupBooking, GroupModal } from './types';

const HEADER_ACTIONS: {
    id: GroupModal;
    label: string;
    accent?: boolean;
}[] = [
    { id: 'addGuest', label: 'Add Guests', accent: true },
    { id: 'edit', label: 'Edit Group Reservation' },
    { id: 'changeMaster', label: 'Change Master' },
    { id: 'splitBills', label: 'Split Bills' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'statement', label: 'Generate Statement' },
    { id: 'transfer', label: 'Group Transfer' },
    { id: 'bulkCheckIn', label: 'Bulk Check-in' },
];

function isPortaledOverlay(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
        target.closest(
            '[data-radix-popper-content-wrapper], [data-radix-select-content], [role="listbox"], [role="dialog"]',
        ),
    );
}

export function GroupReservationDetail({
    open,
    booking,
    bookings,
    guestSearch,
    modal,
    guestId,
    onBack,
    onCloseAction,
    onGuestSearch,
    onOpenModal,
    onEditFull,
    onCheckout,
    onRemove,
    onTransfer,
    onGuestAction,
    actionHandlers,
}: {
    open: boolean;
    booking: GroupBooking | null;
    bookings: GroupBooking[];
    guestSearch: string;
    modal: GroupModal | null;
    guestId: string | null;
    onBack: () => void;
    onCloseAction: () => void;
    onGuestSearch: (q: string) => void;
    onOpenModal: (modal: GroupModal) => void;
    onEditFull: () => void;
    onCheckout: (guestId: string) => void;
    onRemove: (guestId: string) => void;
    onTransfer: (guestId: string) => void;
    onGuestAction: (guestId: string, modal: GroupModal) => void;
    actionHandlers: GroupActionHandlers;
}) {
    useIdleLogoutExemption(open || Boolean(modal));

    const filteredGuests = (booking?.guests || []).filter((guest) =>
        guest.name.toLowerCase().includes(guestSearch.toLowerCase()),
    );
    const selectedGuest =
        booking?.guests.find((guest) => guest.id === guestId) || null;
    const paymentLabel =
        GROUP_PAYMENT_METHODS.find(
            (method) => method.value === booking?.paymentMethod,
        )?.label || null;

    return (
        <>
            <Sheet
                open={open}
                onOpenChange={(next) => {
                    if (!next && !modal) onBack();
                }}
            >
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl md:max-w-2xl"
                    onEscapeKeyDown={(event) => {
                        if (modal) {
                            event.preventDefault();
                            onCloseAction();
                        }
                    }}
                    onInteractOutside={(event) => {
                        if (modal || isPortaledOverlay(event.target)) {
                            event.preventDefault();
                        }
                    }}
                >
                    {booking ? (
                        <>
                            <SheetHeader className="shrink-0 space-y-0 p-5 text-left">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground"
                                >
                                    <ChevronLeft className="size-4" />
                                    Back
                                </button>

                                <div className="rounded-lg bg-[#F2FAF5] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <SheetTitle className="min-w-0 truncate text-xl font-semibold tracking-tight">
                                            {booking.name}
                                        </SheetTitle>
                                        <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600">
                                            {formatCurrency(booking.amount)}
                                        </p>
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                        <span className="font-mono text-[11px] text-muted-foreground">
                                            {booking.id}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            ·
                                        </span>
                                        <GroupTypeLabel
                                            type={booking.groupType}
                                        />
                                        <StatusPill status={booking.status} />
                                    </div>
                                    {paymentLabel ? (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <CreditCard className="size-3.5" />
                                            Payment Method /{' '}
                                            <span className="text-foreground">
                                                {paymentLabel}
                                            </span>
                                            {booking.contactName ? (
                                                <span>
                                                    · {booking.contactName}
                                                </span>
                                            ) : null}
                                        </p>
                                    ) : null}
                                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                        <Calendar className="size-3.5" />
                                        {booking.startDate} &gt;{' '}
                                        {booking.endDate}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {HEADER_ACTIONS.filter(
                                        (action) =>
                                            action.id !== 'bulkCheckIn' ||
                                            booking.guests.some(
                                                (guest) =>
                                                    guest.stayStatus ===
                                                    'expected',
                                            ),
                                    ).map((action) => (
                                        <Button
                                            key={action.id}
                                            variant="outline"
                                            onClick={() =>
                                                action.id === 'edit'
                                                    ? onEditFull()
                                                    : onOpenModal(action.id)
                                            }
                                            className={cn(
                                                'h-8 rounded-md px-3 text-[13px] font-medium shadow-none',
                                                action.accent
                                                    ? 'border-hexbrand text-hexbrand hover:bg-orange-50 hover:text-hexbrand'
                                                    : 'border-gray-200 text-foreground',
                                            )}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.VOID_RESERVATION,
                                        ]}
                                        blockType="hide"
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                onOpenModal('voidGroup')
                                            }
                                            className="h-8 rounded-md border-red-200 px-3 text-[13px] font-medium text-red-700 shadow-none hover:bg-red-50"
                                        >
                                            Void Group
                                        </Button>
                                    </PermissionGate>
                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.DELETE_RESERVATION,
                                        ]}
                                        blockType="hide"
                                    >
                                        <Button
                                            variant="outline"
                                            disabled={
                                                !canDeleteGroupReservation(
                                                    booking,
                                                )
                                            }
                                            title={
                                                canDeleteGroupReservation(
                                                    booking,
                                                )
                                                    ? 'Delete this group reservation'
                                                    : 'Check the in-house guests out before deleting this group'
                                            }
                                            onClick={() =>
                                                onOpenModal('deleteGroup')
                                            }
                                            className="h-8 rounded-md border-red-200 px-3 text-[13px] font-medium text-red-700 shadow-none hover:bg-red-50 disabled:opacity-50"
                                        >
                                            Delete Group
                                        </Button>
                                    </PermissionGate>
                                </div>
                            </SheetHeader>

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                                <GuestList
                                    guests={filteredGuests}
                                    search={guestSearch}
                                    contactName={booking.contactName}
                                    contactPhone={booking.contactPhone}
                                    onSearch={onGuestSearch}
                                    onCheckout={onCheckout}
                                    onRemove={onRemove}
                                    onTransfer={onTransfer}
                                    onGuestAction={onGuestAction}
                                    onAction={onOpenModal}
                                />
                            </div>
                        </>
                    ) : null}
                </SheetContent>
            </Sheet>

            {booking && modal ? (
                <GroupActionDialog
                    modal={modal}
                    booking={booking}
                    bookings={bookings}
                    guestId={guestId}
                    guestName={selectedGuest?.name}
                    onClose={onCloseAction}
                    handlers={actionHandlers}
                />
            ) : null}
        </>
    );
}
