'use client';

import { formatCurrency } from '@/lib/utils';
import { GROUP_PAYMENT_METHODS, GROUP_TYPE_OPTIONS } from '../../constants';
import type {
    AllocatedRoom,
    GroupBillingMode,
    GroupBookingDraft,
    GroupGuestDraft,
    GroupPaymentMethod,
} from '../../types';

export function ConfirmationStep({
    groupId,
    draft,
    guests,
    rooms,
    nights,
    totalAmount,
    deposit,
    discountAmount = 0,
    paymentMethod,
    receivingAccount = '',
    billingMode,
}: {
    groupId: string;
    draft: GroupBookingDraft;
    guests: GroupGuestDraft[];
    rooms: AllocatedRoom[];
    nights: number;
    totalAmount: number;
    deposit: number;
    discountAmount?: number;
    paymentMethod: GroupPaymentMethod | '';
    receivingAccount?: string;
    billingMode: GroupBillingMode;
}) {
    const outstanding = Math.max(0, totalAmount - deposit);
    const assigned = (rooms ?? []).filter(
        (room) => room.guestIds.length > 0,
    ).length;
    const methodLabel =
        GROUP_PAYMENT_METHODS.find((item) => item.value === paymentMethod)
            ?.label || '—';
    const typeLabel =
        GROUP_TYPE_OPTIONS.find((item) => item.value === draft.groupType)
            ?.label || draft.groupType;

    const rows = [
        { label: 'Group ID', value: groupId },
        { label: 'Group Name', value: draft.groupName || draft.contactName || '—' },
        { label: 'Group Type', value: typeLabel },
        { label: 'Contact', value: draft.contactName || '—' },
        {
            label: 'Stay',
            value: draft.arrivalDate && draft.departureDate
                ? `${draft.arrivalDate.toDateString()} > ${draft.departureDate.toDateString()} (${nights} night${nights === 1 ? '' : 's'})`
                : '—',
        },
        { label: 'Total Guests', value: String(guests.length) },
        {
            label: 'Total Rooms',
            value: `${rooms.length} (${assigned} assigned)`,
        },
        { label: 'Total Amount', value: formatCurrency(totalAmount) },
        { label: 'Total Deposits', value: formatCurrency(deposit) },
        { label: 'Outstanding Balance', value: formatCurrency(outstanding) },
        { label: 'Total Discounts', value: formatCurrency(discountAmount) },
        { label: 'Payment Method', value: methodLabel },
        { label: 'Paid Into', value: receivingAccount.trim() || '—' },
        {
            label: 'Billing',
            value: billingMode === 'group' ? 'Group Billing' : 'Individual Billing',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-gray-100 bg-gray-100 sm:grid-cols-2">
            {rows.map((row) => (
                <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 bg-white px-3 py-2 text-[13px]"
                >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-right font-medium tabular-nums">
                        {row.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
