'use client';

import {
    BanquetPricingBreakdown,
    formatMoney,
} from '@/components/banquest/utils/banquet-pricing';
import { cn } from '@/lib/utils';

interface LineItem {
    name: string;
    detail?: string;
    amount: number;
}

interface CostSummaryPanelProps {
    title?: string;
    meta?: { label: string; value: string }[];
    lineItems: LineItem[];
    pricing: BanquetPricingBreakdown;
    showServiceCharge?: boolean;
    serviceChargePercent?: number;
    vatPercent?: number;
    className?: string;
}

export default function CostSummaryPanel({
    title = 'Cost summary',
    meta,
    lineItems,
    pricing,
    showServiceCharge = true,
    serviceChargePercent = 0,
    vatPercent = 0,
    className,
}: CostSummaryPanelProps) {
    return (
        <div
            className={cn(
                'sticky top-4 rounded-xl border border-gray-200 bg-gray-50/80 p-5',
                className,
            )}
        >
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {meta?.length ? (
                <dl className="mt-3 space-y-2 border-b border-gray-200 pb-4 text-sm">
                    {meta.map((row) => (
                        <div
                            key={row.label}
                            className="flex justify-between gap-2"
                        >
                            <dt className="text-muted-foreground">
                                {row.label}
                            </dt>
                            <dd className="font-medium text-gray-900">
                                {row.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : null}
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">
                {lineItems.length === 0 ? (
                    <li className="text-muted-foreground">
                        No items selected yet
                    </li>
                ) : (
                    lineItems.map((item) => (
                        <li
                            key={`${item.name}-${item.detail}`}
                            className="flex justify-between gap-2"
                        >
                            <span className="text-gray-700">
                                {item.name}
                                {item.detail ? (
                                    <span className="block text-xs text-muted-foreground">
                                        {item.detail}
                                    </span>
                                ) : null}
                            </span>
                            <span className="shrink-0 font-medium">
                                {formatMoney(item.amount)}
                            </span>
                        </li>
                    ))
                )}
            </ul>
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatMoney(pricing.subtotal)}</span>
                </div>
                {showServiceCharge && serviceChargePercent > 0 ? (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Service charge ({serviceChargePercent}%)
                        </span>
                        <span>{formatMoney(pricing.serviceCharge)}</span>
                    </div>
                ) : null}
                {showServiceCharge && vatPercent > 0 ? (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            VAT ({vatPercent}%)
                        </span>
                        <span>{formatMoney(pricing.vat)}</span>
                    </div>
                ) : null}
                {pricing.discount > 0 ? (
                    <div className="flex justify-between text-emerald-700">
                        <span>Discount</span>
                        <span>-{formatMoney(pricing.discount)}</span>
                    </div>
                ) : null}
                <div className="flex justify-between pt-2 text-base font-semibold text-emerald-700">
                    <span>Total estimate</span>
                    <span>{formatMoney(pricing.total)}</span>
                </div>
            </div>
        </div>
    );
}
