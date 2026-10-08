'use client';

import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { cn } from '@/lib/utils';

interface CostBreakdownProps {
    subtotalLabel?: string;
    subtotal: number;
    serviceChargePercent?: number;
    serviceCharge: number;
    vatPercent?: number;
    vat: number;
    total: number;
    discount?: number;
    className?: string;
}

export default function CostBreakdown({
    subtotalLabel = 'SubTotal',
    subtotal,
    serviceChargePercent = 5,
    serviceCharge,
    vatPercent = 7.5,
    vat,
    total,
    discount = 0,
    className,
}: CostBreakdownProps) {
    return (
        <div className={cn('space-y-2 text-sm', className)}>
            <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{subtotalLabel}</span>
                <span className="font-medium text-gray-900">
                    {formatMoney(subtotal)}
                </span>
            </div>
            <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                    Service Charge ({serviceChargePercent}%)
                </span>
                <span className="font-medium text-gray-900">
                    {formatMoney(serviceCharge)}
                </span>
            </div>
            <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                    Vat ({vatPercent}%)
                </span>
                <span className="font-medium text-gray-900">
                    {formatMoney(vat)}
                </span>
            </div>
            {discount > 0 ? (
                <div className="flex justify-between gap-3 text-red-600">
                    <span>Discounts</span>
                    <span className="font-medium">-{formatMoney(discount)}</span>
                </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-gray-200 pt-3 text-base font-semibold text-emerald-700">
                <span>Total Estimate</span>
                <span>{formatMoney(total)}</span>
            </div>
        </div>
    );
}
