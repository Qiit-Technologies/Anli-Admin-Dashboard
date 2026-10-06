'use client';

import { useInternalAccountOptions } from '@/hooks/useInternalAccountOptions';
import {
    getOrderInternalAccountCode,
    hasOrderInternalAccountSettlement,
} from '@/lib/internal-accounts/settlement';

type OrderLike = {
    paymentMethod?: string | null;
    receivingAccount?: string | null;
    payments?: Array<{
        paymentMethod?: string | null;
        receivingAccount?: string | null;
    }> | null;
};

type PostedToInternalAccountProps = {
    order: OrderLike;
    className?: string;
};

/**
 * IA-028: Shows "Posted To: IA-0001 – Account Name" on restaurant order details.
 */
export function PostedToInternalAccount({
    order,
    className = '',
}: PostedToInternalAccountProps) {
    const { formatPaidThrough } = useInternalAccountOptions();

    if (!hasOrderInternalAccountSettlement(order)) {
        return null;
    }

    const code = getOrderInternalAccountCode(order);
    const label = formatPaidThrough(code) ?? code;

    if (!label) {
        return null;
    }

    return (
        <div
            className={`mt-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs ${className}`}
        >
            <span className="text-muted-foreground">Posted To: </span>
            <span className="font-medium text-slate-800">{label}</span>
        </div>
    );
}
