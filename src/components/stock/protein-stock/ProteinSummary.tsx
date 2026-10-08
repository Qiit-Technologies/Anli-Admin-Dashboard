'use client';

import { formatCurrency } from '@/lib/utils';

type ProteinSummaryProps = {
    openingValue: number;
    inValue: number;
    outValue: number;
    rtnValue: number;
    bdValue: number;
    closingValue: number;
    movedCount: number;
    reorderCount: number;
    itemCount: number;
};

const cells = [
    { key: 'opening', label: 'Opening value', hint: 'Protein on hand' },
    { key: 'in', label: 'Received value', hint: 'Protein received today' },
    { key: 'out', label: 'Issued value', hint: 'Protein issued today' },
    { key: 'rtn', label: 'Returned value', hint: 'Returned to store' },
    { key: 'bd', label: 'B&D value', hint: 'Write-offs today' },
    { key: 'closing', label: 'Closing value', hint: 'Carry forward' },
] as const;

export function ProteinSummary({
    openingValue,
    inValue,
    outValue,
    rtnValue,
    bdValue,
    closingValue,
    movedCount,
    reorderCount,
    itemCount,
}: ProteinSummaryProps) {
    const values = {
        opening: openingValue,
        in: inValue,
        out: outValue,
        rtn: rtnValue,
        bd: bdValue,
        closing: closingValue,
    };

    return (
        <div className="space-y-3">
            <div className="grid items-stretch gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-6">
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
                {itemCount} protein items · {movedCount} moved today ·{' '}
                {reorderCount} need reorder
            </p>
        </div>
    );
}
