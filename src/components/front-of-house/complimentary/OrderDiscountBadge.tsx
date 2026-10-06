'use client';

import { cn } from '@/lib/utils';
import { BadgePercent } from 'lucide-react';
import { formatOrderMoney } from '../utils/complimentary';

export type OrderDiscountFields = {
    isDiscounted?: boolean;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
    discountValue?: number | string | null;
    discountAmount?: number | string | null;
    discountReason?: string | null;
};

function toMoney(value?: number | string | null) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function hasOrderDiscount(order?: OrderDiscountFields | null) {
    if (!order) return false;
    return Boolean(order.isDiscounted) || toMoney(order.discountAmount) > 0;
}

export function discountOffLabel(order: OrderDiscountFields) {
    const value = toMoney(order.discountValue);
    if (order.discountType === 'PERCENTAGE' && value > 0) {
        return `${value}% Off`;
    }
    const amount = value > 0 ? value : toMoney(order.discountAmount);
    if (amount > 0) {
        return `${formatOrderMoney(amount)} Off`;
    }
    return 'Discounted';
}

export function previewDiscountAmount(
    total: number,
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: number,
) {
    const safeTotal = Math.max(0, total);
    if (discountType === 'PERCENTAGE') {
        const pct = Math.min(Math.max(discountValue, 0), 100);
        return Math.round(((safeTotal * pct) / 100) * 100) / 100;
    }
    return (
        Math.round(Math.min(Math.max(discountValue, 0), safeTotal) * 100) / 100
    );
}

export default function OrderDiscountBadge({
    order,
    compact = false,
    className,
}: {
    order: OrderDiscountFields;
    compact?: boolean;
    className?: string;
}) {
    if (!hasOrderDiscount(order)) return null;

    const label = discountOffLabel(order);
    const amount = toMoney(order.discountAmount);
    const title = [
        label,
        amount > 0 ? formatOrderMoney(amount) : '',
        order.discountReason ? order.discountReason : '',
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <span
            title={title}
            className={cn(
                'inline-flex max-w-full items-center gap-1 rounded-full bg-orion-blue font-medium text-white',
                compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
                className,
            )}
        >
            <BadgePercent className={compact ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
            <span className="truncate">{label}</span>
        </span>
    );
}
