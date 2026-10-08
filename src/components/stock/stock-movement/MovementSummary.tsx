'use client';

import { formatCurrency } from '@/lib/utils';

type MovementSummaryProps = {
    openingValue: number;
    purchaseValue: number;
    issueOutValue: number;
    bdValue: number;
    closingValue: number;
    movedCount: number;
    reorderCount: number;
    itemCount: number;
};

const cells = [
    { key: 'opening', label: 'Opening value', hint: 'Stock on hand' },
    { key: 'purchase', label: 'In / purchases', hint: 'Value received today' },
    {
        key: 'issueOut',
        label: 'Issue Out Stock Value',
        hint: 'Stock issued out today',
    },
    { key: 'bd', label: 'B&D value', hint: 'Breakage & damage' },
    { key: 'closing', label: 'Closing value', hint: 'Carry forward' },
] as const;

export function MovementSummary({
    openingValue,
    purchaseValue,
    issueOutValue,
    bdValue,
    closingValue,
    movedCount,
    reorderCount,
    itemCount,
}: MovementSummaryProps) {
    const values = {
        opening: openingValue,
        purchase: purchaseValue,
        issueOut: issueOutValue,
        bd: bdValue,
        closing: closingValue,
    };

    return (
        <div className="space-y-3">
            <div className="grid items-stretch gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-5">
                {cells.map((cell) => (
                    <div
                        key={cell.key}
                        className="flex h-full min-h-[5.5rem] flex-col bg-card p-4"
                    >
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {cell.label}
                        </p>
                        <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                            {formatCurrency(values[cell.key])}
                        </p>
                        <p className="mt-auto text-[12px] text-muted-foreground">
                            {cell.hint}
                        </p>
                    </div>
                ))}
            </div>
            <p className="text-[12px] text-muted-foreground">
                {itemCount} items · {movedCount} moved today · {reorderCount}{' '}
                need reorder
            </p>
        </div>
    );
}
