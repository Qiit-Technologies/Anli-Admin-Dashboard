'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    calcClosing,
    resolveStatus,
    type DayMovement,
    type MovementField,
} from './types';

type MovementRowProps = {
    row: DayMovement;
    disabled?: boolean;
    showCategory?: boolean;
    onChange: (field: MovementField, value: number) => void;
    inputRefs?: {
        unitCost?: (el: HTMLInputElement | null) => void;
        inQty?: (el: HTMLInputElement | null) => void;
        outQty?: (el: HTMLInputElement | null) => void;
        bdQty?: (el: HTMLInputElement | null) => void;
    };
    onFieldKeyDown?: (
        field: MovementField,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => void;
};

function parseQty(raw: string) {
    if (raw.trim() === '') return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

export function MovementRow({
    row,
    disabled,
    showCategory = false,
    onChange,
    inputRefs,
    onFieldKeyDown,
}: MovementRowProps) {
    const closing = calcClosing(row);
    const status = resolveStatus(closing, row.minStock);
    const isReorder = status === 'REORDER';
    const moved = row.inQty > 0 || row.outQty > 0 || row.bdQty > 0;

    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-3 border-b p-4 last:border-b-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(5.5rem,0.85fr)_repeat(5,minmax(4.5rem,1fr))] lg:items-center lg:gap-3',
                moved && 'bg-orion-blue/[0.03]',
                isReorder && 'bg-amber-50/40',
            )}
        >
            <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-medium">
                        {row.itemName}
                    </p>
                    {showCategory && row.category ? (
                        <span className="rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {row.category}
                        </span>
                    ) : null}
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                            isReorder
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-800',
                        )}
                    >
                        <span
                            className={cn(
                                'size-1.5 rounded-full',
                                isReorder ? 'bg-amber-500' : 'bg-emerald-500',
                            )}
                        />
                        {isReorder ? 'Reorder' : 'Available'}
                    </span>
                </div>
                <p className="text-[12px] text-muted-foreground">{row.unit}</p>
            </div>

            <label className="block space-y-1">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                    Unit Price
                </span>
                <Input
                    ref={inputRefs?.unitCost}
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    disabled={disabled}
                    value={row.unitCost === 0 ? '' : row.unitCost}
                    placeholder="0"
                    onChange={(e) =>
                        onChange('unitCost', parseQty(e.target.value))
                    }
                    onKeyDown={(e) => onFieldKeyDown?.('unitCost', e)}
                    className="h-9 rounded-sm bg-white text-right tabular-nums shadow-none focus-visible:ring-orion-blue/40"
                />
            </label>

            <Metric
                label="Opening"
                value={row.opening}
                className="text-muted-foreground"
            />

            <QtyField
                label="In"
                tone="in"
                value={row.inQty}
                disabled={disabled}
                inputRef={inputRefs?.inQty}
                onChange={(v) => onChange('inQty', v)}
                onKeyDown={(e) => onFieldKeyDown?.('inQty', e)}
            />
            <QtyField
                label="Out"
                tone="out"
                value={row.outQty}
                disabled={disabled}
                inputRef={inputRefs?.outQty}
                onChange={(v) => onChange('outQty', v)}
                onKeyDown={(e) => onFieldKeyDown?.('outQty', e)}
            />
            <QtyField
                label="B&D"
                tone="bd"
                value={row.bdQty}
                disabled={disabled}
                inputRef={inputRefs?.bdQty}
                onChange={(v) => onChange('bdQty', v)}
                onKeyDown={(e) => onFieldKeyDown?.('bdQty', e)}
            />

            <Metric
                label="Closing"
                value={closing}
                className={cn(
                    'font-semibold',
                    closing === 0 && 'text-amber-700',
                )}
            />
        </div>
    );
}

function Metric({
    label,
    value,
    className,
}: {
    label: string;
    value: number;
    className?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2 lg:block">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                {label}
            </span>
            <span
                className={cn(
                    'text-[14px] tabular-nums lg:block lg:text-right',
                    className,
                )}
            >
                {value}
            </span>
        </div>
    );
}

function QtyField({
    label,
    tone,
    value,
    disabled,
    onChange,
    onKeyDown,
    inputRef,
}: {
    label: string;
    tone: 'in' | 'out' | 'bd';
    value: number;
    disabled?: boolean;
    onChange: (value: number) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    inputRef?: (el: HTMLInputElement | null) => void;
}) {
    const toneClass =
        tone === 'in'
            ? 'focus-visible:ring-emerald-500/40 border-emerald-200/80'
            : tone === 'out'
              ? 'focus-visible:ring-sky-500/40 border-sky-200/80'
              : 'focus-visible:ring-rose-500/40 border-rose-200/80';

    return (
        <label className="block space-y-1">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                {label}
            </span>
            <Input
                ref={inputRef}
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                disabled={disabled}
                value={value === 0 ? '' : value}
                placeholder="0"
                onChange={(e) => onChange(parseQty(e.target.value))}
                onKeyDown={onKeyDown}
                className={cn(
                    'h-9 rounded-sm bg-white text-right tabular-nums shadow-none',
                    toneClass,
                )}
            />
        </label>
    );
}
