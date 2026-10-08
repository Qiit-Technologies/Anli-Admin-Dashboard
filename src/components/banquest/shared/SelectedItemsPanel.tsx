'use client';

import CostBreakdown from '@/components/banquest/shared/CostBreakdown';
import SelectionDot from '@/components/banquest/shared/SelectionDot';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export interface SummaryMetaRow {
    label: string;
    value: string;
}

export interface SummaryLineItem {
    key: string;
    name: string;
    calcDetail: string;
    amount: number;
}

interface SelectedItemsPanelProps {
    title: string;
    meta?: SummaryMetaRow[];
    items: SummaryLineItem[];
    selectedCount: number;
    subtotalLabel?: string;
    subtotal: number;
    serviceChargePercent?: number;
    serviceCharge: number;
    vatPercent?: number;
    vat: number;
    total: number;
    defaultOpen?: boolean;
    onViewAll?: () => void;
    className?: string;
}

export default function SelectedItemsPanel({
    title,
    meta,
    items,
    selectedCount,
    subtotalLabel = 'SubTotal',
    subtotal,
    serviceChargePercent,
    serviceCharge,
    vatPercent,
    vat,
    total,
    defaultOpen = true,
    onViewAll,
    className,
}: SelectedItemsPanelProps) {
    const [open, setOpen] = useState(defaultOpen);
    const itemLabel = selectedCount === 1 ? 'item selected' : 'items selected';

    return (
        <aside
            className={cn(
                'h-fit min-w-0 rounded-xl border border-gray-200 bg-white p-5',
                className,
            )}
        >
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>

            {meta?.length ? (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 text-sm">
                    {meta.map((row) => (
                        <div
                            key={row.label}
                            className="flex justify-between gap-3"
                        >
                            <span className="text-muted-foreground">
                                {row.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mt-5 flex w-full items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-left text-sm font-semibold text-gray-900"
            >
                <span>
                    Selected Item ({selectedCount} {itemLabel})
                </span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {open ? (
                <ul className="mt-3 max-h-52 space-y-4 overflow-y-auto text-sm">
                    {items.length === 0 ? (
                        <li className="text-muted-foreground">
                            No items selected yet
                        </li>
                    ) : (
                        items.map((item) => (
                            <li key={item.key}>
                                <div className="flex items-start gap-2">
                                    <SelectionDot />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900">
                                            {item.name}
                                        </p>
                                        <div className="mt-0.5 flex items-center justify-between gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {item.calcDetail}
                                            </span>
                                            <span className="shrink-0 font-semibold text-gray-900">
                                                {formatMoney(item.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            ) : null}

            {onViewAll && items.length > 0 ? (
                <button
                    type="button"
                    onClick={onViewAll}
                    className="mt-2 text-xs font-medium text-orion-blue hover:underline"
                >
                    View all selected items
                </button>
            ) : null}

            <div className="mt-4 border-t border-gray-200 pt-4">
                <CostBreakdown
                    subtotalLabel={subtotalLabel}
                    subtotal={subtotal}
                    serviceChargePercent={serviceChargePercent}
                    serviceCharge={serviceCharge}
                    vatPercent={vatPercent}
                    vat={vat}
                    total={total}
                />
            </div>
        </aside>
    );
}
