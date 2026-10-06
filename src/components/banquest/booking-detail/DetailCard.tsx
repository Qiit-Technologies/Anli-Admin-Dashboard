'use client';

import SelectionDot from '@/components/banquest/shared/SelectionDot';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode } from 'react';

export function DetailCard({
    title,
    editHref,
    onEdit,
    children,
    className,
}: {
    title: string;
    editHref?: string;
    onEdit?: () => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-gray-200 bg-white overflow-hidden',
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="text-base font-semibold text-gray-900">
                    {title}
                </h3>
                {editHref ? (
                    <Link
                        href={editHref}
                        className="text-sm font-semibold text-orion-blue hover:underline"
                    >
                        Edit
                    </Link>
                ) : onEdit ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-sm font-semibold text-orion-blue hover:underline"
                    >
                        Edit
                    </button>
                ) : null}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

export function DetailFieldGrid({
    rows,
    columns = 2,
}: {
    rows: { label: string; value: string; fullWidth?: boolean }[];
    columns?: 2 | 3;
}) {
    return (
        <dl
            className={cn(
                'grid gap-x-6 gap-y-4',
                columns === 3
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2',
            )}
        >
            {rows.map((row) => (
                <div
                    key={row.label}
                    className={cn('min-w-0', row.fullWidth && 'sm:col-span-2')}
                >
                    <dt className="text-xs text-muted-foreground mb-1">
                        {row.label}
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900 break-words">
                        {row.value || '—'}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function LineItemsList({
    items,
}: {
    items: { id?: number; name: string; detail: string; amount: string }[];
}) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-2">No items added.</p>
        );
    }

    return (
        <ul className="space-y-4">
            {items.map((item) => (
                <li key={`${item.id ?? item.name}-${item.detail}`}>
                    <div className="flex items-start gap-2 min-w-0">
                        <SelectionDot />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 break-words">
                                {item.name}
                            </p>
                            <div className="mt-0.5 flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground">
                                    {item.detail}
                                </p>
                                <span className="shrink-0 text-sm font-semibold text-gray-900">
                                    {item.amount}
                                </span>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function CostFooter({
    subtotalLabel,
    subtotal,
    serviceCharge,
    vat,
    total,
}: {
    subtotalLabel: string;
    subtotal: string;
    serviceCharge: string;
    vat: string;
    total: string;
}) {
    return (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{subtotalLabel}</span>
                <span className="font-medium shrink-0">{subtotal}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Service Charge (5%)</span>
                <span className="font-medium shrink-0">{serviceCharge}</span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Vat (7.5%)</span>
                <span className="font-medium shrink-0">{vat}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                <span className="text-base font-semibold text-emerald-700">
                    Total Estimate
                </span>
                <span className="text-base font-bold text-emerald-700 shrink-0">
                    {total}
                </span>
            </div>
        </div>
    );
}
