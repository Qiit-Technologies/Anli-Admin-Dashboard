'use client';

import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    BD_REASONS,
    calcProteinClosing,
    formatPtnPcs,
    proteinValue,
    resolveProteinStatus,
    type ProteinDayMovement,
    type ProteinField,
} from './types';

type ProteinRowProps = {
    row: ProteinDayMovement;
    disabled?: boolean;
    showCategory?: boolean;
    onChange: (field: ProteinField, value: number) => void;
    onBdReasonChange: (reason: string) => void;
};

function parseQty(raw: string) {
    if (raw.trim() === '') return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export const PROTEIN_GRID_COLS =
    'lg:grid-cols-[minmax(0,1.5fr)_minmax(5.5rem,0.9fr)_repeat(4,minmax(6.5rem,1.05fr))_minmax(5.5rem,0.9fr)_minmax(4.5rem,0.7fr)_minmax(5rem,0.8fr)]';

export function ProteinRow({
    row,
    disabled,
    showCategory = false,
    onChange,
    onBdReasonChange,
}: ProteinRowProps) {
    const closing = calcProteinClosing(row);
    const status = resolveProteinStatus(closing, row.minStock);
    const isReorder = status === 'REORDER';
    const moved =
        row.inPtn > 0 ||
        row.inPcs > 0 ||
        row.outPtn > 0 ||
        row.outPcs > 0 ||
        row.rtnPtn > 0 ||
        row.rtnPcs > 0 ||
        row.bdPtn > 0 ||
        row.bdPcs > 0;

    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-3 border-b p-4 last:border-b-0 lg:gap-3 lg:items-center',
                PROTEIN_GRID_COLS,
                moved && 'bg-orion-blue/[0.03]',
                isReorder && 'bg-amber-50/40',
            )}
        >
            {/* Item + PPP badge */}
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
                    <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                        {row.ppp} pcs/PTN
                    </span>
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
                <p className="text-[12px] text-muted-foreground">
                    {row.unit} · reorder at {row.minStock} pcs
                </p>
            </div>

            {/* Opening */}
            <PtnPcsMetric
                label="Opening"
                pieces={row.openingPieces}
                ppp={row.ppp}
                className="text-muted-foreground"
            />

            {/* IN */}
            <DualQtyField
                label="Received IN"
                tone="in"
                ptn={row.inPtn}
                pcs={row.inPcs}
                disabled={disabled}
                onPtnChange={(v) => onChange('inPtn', v)}
                onPcsChange={(v) => onChange('inPcs', v)}
            />

            {/* OUT */}
            <DualQtyField
                label="Issued OUT"
                tone="out"
                ptn={row.outPtn}
                pcs={row.outPcs}
                disabled={disabled}
                onPtnChange={(v) => onChange('outPtn', v)}
                onPcsChange={(v) => onChange('outPcs', v)}
            />

            {/* RTN */}
            <DualQtyField
                label="Returned"
                tone="rtn"
                ptn={row.rtnPtn}
                pcs={row.rtnPcs}
                disabled={disabled}
                onPtnChange={(v) => onChange('rtnPtn', v)}
                onPcsChange={(v) => onChange('rtnPcs', v)}
            />

            {/* B&D + reason */}
            <div className="space-y-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                    B&amp;D
                </span>
                <div className="flex gap-1.5">
                    <DualQtyField
                        label="B&D"
                        tone="bd"
                        compact
                        ptn={row.bdPtn}
                        pcs={row.bdPcs}
                        disabled={disabled}
                        onPtnChange={(v) => onChange('bdPtn', v)}
                        onPcsChange={(v) => onChange('bdPcs', v)}
                    />
                </div>
                {(row.bdPtn > 0 || row.bdPcs > 0) && (
                    <Select
                        value={row.bdReason || undefined}
                        onValueChange={onBdReasonChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-8 rounded-sm text-[12px] shadow-none">
                            <SelectValue placeholder="Reason…" />
                        </SelectTrigger>
                        <SelectContent>
                            {BD_REASONS.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Closing */}
            <PtnPcsMetric
                label="Closing"
                pieces={closing}
                ppp={row.ppp}
                className={cn(
                    'font-semibold',
                    closing === 0 && 'text-amber-700',
                )}
            />

            {/* Unit price */}
            <label className="block space-y-1">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                    Unit Price
                </span>
                <Input
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    disabled={disabled}
                    value={row.unitCost === 0 ? '' : row.unitCost}
                    placeholder="0"
                    onChange={(e) =>
                        onChange(
                            'unitCost',
                            e.target.value === ''
                                ? 0
                                : Number(e.target.value),
                        )
                    }
                    className="h-9 rounded-sm bg-white text-right tabular-nums shadow-none focus-visible:ring-orion-blue/40"
                />
            </label>

            {/* Value */}
            <div className="flex items-center justify-between gap-2 lg:block">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                    Value
                </span>
                <span className="text-[14px] tabular-nums lg:block lg:text-right">
                    ₦
                    {proteinValue(closing, row.unitCost).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 },
                    )}
                </span>
            </div>
        </div>
    );
}

function PtnPcsMetric({
    label,
    pieces,
    ppp,
    className,
}: {
    label: string;
    pieces: number;
    ppp: number;
    className?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2 lg:block">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                {label}
            </span>
            <span className={cn('lg:block lg:text-right', className)}>
                <span className="block text-[13px] font-medium tabular-nums">
                    {formatPtnPcs(pieces, ppp)}
                </span>
                <span className="block text-[11px] tabular-nums text-muted-foreground">
                    {pieces.toLocaleString()} pcs
                </span>
            </span>
        </div>
    );
}

function DualQtyField({
    label,
    tone,
    ptn,
    pcs,
    disabled,
    compact,
    onPtnChange,
    onPcsChange,
}: {
    label: string;
    tone: 'in' | 'out' | 'rtn' | 'bd';
    ptn: number;
    pcs: number;
    disabled?: boolean;
    compact?: boolean;
    onPtnChange: (v: number) => void;
    onPcsChange: (v: number) => void;
}) {
    const toneClass =
        tone === 'in'
            ? 'focus-visible:ring-emerald-500/40 border-emerald-200/80'
            : tone === 'out'
              ? 'focus-visible:ring-sky-500/40 border-sky-200/80'
              : tone === 'rtn'
                ? 'focus-visible:ring-violet-500/40 border-violet-200/80'
                : 'focus-visible:ring-rose-500/40 border-rose-200/80';

    return (
        <label className="block space-y-1">
            {!compact && (
                <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                    {label}
                </span>
            )}
            <div className="flex items-center gap-1">
                <div className="relative flex-1">
                    <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        disabled={disabled}
                        value={ptn === 0 ? '' : ptn}
                        placeholder="0"
                        aria-label={`${label} portions`}
                        onChange={(e) => onPtnChange(parseQty(e.target.value))}
                        className={cn(
                            'h-9 rounded-sm bg-white pr-9 text-right tabular-nums shadow-none',
                            toneClass,
                        )}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-muted-foreground">
                        PTN
                    </span>
                </div>
                <div className="relative flex-1">
                    <Input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        disabled={disabled}
                        value={pcs === 0 ? '' : pcs}
                        placeholder="0"
                        aria-label={`${label} pieces`}
                        onChange={(e) => onPcsChange(parseQty(e.target.value))}
                        className={cn(
                            'h-9 rounded-sm bg-white pr-9 text-right tabular-nums shadow-none',
                            toneClass,
                        )}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-muted-foreground">
                        PCS
                    </span>
                </div>
            </div>
        </label>
    );
}
