'use client';

import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import React from 'react';

export function SelectionCard({
    label,
    selected,
    onSelect,
    variant = 'radio',
}: {
    label: string;
    selected: boolean;
    onSelect: () => void;
    variant?: 'radio' | 'solid';
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition',
                selected && variant === 'solid'
                    ? 'border-hexbrand bg-hexbrand text-white'
                    : selected
                      ? 'border-hexbrand bg-orange-50 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            )}
        >
            <span>{label}</span>
            <span
                className={cn(
                    'h-4 w-4 shrink-0 rounded-full border-2',
                    selected && variant === 'solid'
                        ? 'border-white bg-white'
                        : selected
                          ? 'border-hexbrand bg-hexbrand'
                          : 'border-gray-300 bg-white',
                )}
                aria-hidden
            />
        </button>
    );
}

export function SelectionCardGroup({
    title,
    hint,
    children,
}: {
    title: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            <div className="mt-4 space-y-2">{children}</div>
        </div>
    );
}

export function AddOnCheckboxList({
    items,
    selected,
    onToggle,
}: {
    items: readonly { id: string; label: string; price: number }[];
    selected: string[];
    onToggle: (id: string) => void;
}) {
    return (
        <div className="space-y-3">
            {items.map((item) => {
                const checked = selected.includes(item.id);
                return (
                    <label
                        key={item.id}
                        className="flex cursor-pointer items-center justify-between gap-3 text-sm"
                    >
                        <span className="flex items-center gap-3">
                            <Checkbox
                                checked={checked}
                                onCheckedChange={() => onToggle(item.id)}
                            />
                            <span className="text-gray-800">{item.label}</span>
                        </span>
                        <span className="font-medium text-gray-900 tabular-nums">
                            {formatMoney(item.price)}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
