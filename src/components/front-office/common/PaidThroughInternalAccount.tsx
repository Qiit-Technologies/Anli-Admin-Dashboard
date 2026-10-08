'use client';

import { useInternalAccountOptions } from '@/hooks/useInternalAccountOptions';
import { getGuestInternalAccountBillStatus } from '@/app/actions/internal-accounts-ledger';
import {
    getInternalAccountSettlementCode,
    hasInternalAccountSettlement,
    isInternalAccountSettlementPending,
    isInternalAccountSettlementApproved,
    isInternalAccountSettlementRejected,
    isInternalAccountSettlementReversed,
} from '@/lib/internal-accounts/settlement';
import useSWR from 'swr';

type SettlementLike = {
    id?: number;
    paymentMethod?: string | null;
    receivingAccount?: string | null;
    settlementPaymentMethod?: string | null;
    settlementReceivingAccount?: string | null;
};

type PaidThroughInternalAccountProps = {
    reservation: SettlementLike;
    className?: string;
};

/**
 * IA-026 / IA-027: Shows Paid Through when approved, or Awaiting Approval while pending.
 */
export function PaidThroughInternalAccount({
    reservation,
    className = '',
}: PaidThroughInternalAccountProps) {
    const { formatPaidThrough } = useInternalAccountOptions();
    const hasIa = hasInternalAccountSettlement(reservation);
    const guestId = Number(reservation.id);

    const { data: iaStatus } = useSWR(
        hasIa && Number.isFinite(guestId) && guestId > 0
            ? `ia-guest-bill-status-${guestId}`
            : null,
        () => getGuestInternalAccountBillStatus(guestId),
        { refreshInterval: 15000 },
    );

    if (!hasIa) {
        return null;
    }

    const code = getInternalAccountSettlementCode(reservation);
    const label = formatPaidThrough(code) ?? code;
    const pending =
        isInternalAccountSettlementPending(iaStatus?.status) ||
        (!iaStatus?.status && hasIa);
    const approved = isInternalAccountSettlementApproved(iaStatus?.status);
    const reversed = isInternalAccountSettlementReversed(iaStatus?.status);
    const rejected = isInternalAccountSettlementRejected(iaStatus?.status);

    if (!label && !pending) {
        return null;
    }

    if (pending && !approved) {
        return (
            <div
                className={`mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs ${className}`}
            >
                <span className="text-amber-800">Awaiting Approval: </span>
                <span className="font-medium text-amber-900">
                    {label || 'Internal Account'}
                </span>
            </div>
        );
    }

    if (!approved && (rejected || reversed)) {
        return null;
    }

    if (!label) {
        return null;
    }

    return (
        <div
            className={`mt-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs ${className}`}
        >
            <span className="text-muted-foreground">Paid Through: </span>
            <span className="font-medium text-slate-800">{label}</span>
        </div>
    );
}
