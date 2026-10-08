'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eraser, PackageSearch, Save, Search } from 'lucide-react';
import { useMemo } from 'react';
import { CategoryTabs } from '../stock-movement/CategoryTabs';
import { ProteinRow, PROTEIN_GRID_COLS } from './ProteinRow';
import {
    calcProteinClosing,
    type ProteinDayMovement,
    type ProteinField,
    type ProteinFilter,
} from './types';

type ProteinBoardProps = {
    rows: ProteinDayMovement[];
    categories: string[];
    category: string;
    onCategoryChange: (category: string) => void;
    categoriesLoading?: boolean;
    filter: ProteinFilter;
    query: string;
    onQueryChange: (q: string) => void;
    onFilterChange: (f: ProteinFilter) => void;
    onChange: (itemId: string, field: ProteinField, value: number) => void;
    onBdReasonChange: (itemId: string, reason: string) => void;
    onClear: () => void;
    onSave: () => void;
    dirty?: boolean;
    canClear?: boolean;
    loading?: boolean;
    saving?: boolean;
};

const FILTERS: { id: ProteinFilter; label: string }[] = [
    { id: 'all', label: 'All items' },
    { id: 'moved', label: 'Moved today' },
    { id: 'reorder', label: 'Reorder' },
    { id: 'available', label: 'Available' },
];

function matchesCategory(rowCategory: string, selected: string) {
    return rowCategory.trim().toLowerCase() === selected.trim().toLowerCase();
}

export function ProteinBoard({
    rows,
    categories,
    category,
    onCategoryChange,
    categoriesLoading,
    filter,
    query,
    onQueryChange,
    onFilterChange,
    onChange,
    onBdReasonChange,
    onClear,
    onSave,
    dirty = false,
    canClear = false,
    loading,
    saving = false,
}: ProteinBoardProps) {
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((row) => {
            if (category && !q && !matchesCategory(row.category, category)) {
                return false;
            }

            const closing = calcProteinClosing(row);
            const isReorder =
                closing <= 0 ||
                (row.minStock > 0 && closing < row.minStock);
            const moved =
                row.inPtn > 0 ||
                row.inPcs > 0 ||
                row.outPtn > 0 ||
                row.outPcs > 0 ||
                row.rtnPtn > 0 ||
                row.rtnPcs > 0 ||
                row.bdPtn > 0 ||
                row.bdPcs > 0;

            if (filter === 'moved' && !moved) return false;
            if (filter === 'reorder' && !isReorder) return false;
            if (filter === 'available' && isReorder) return false;

            if (!q) return true;
            return (
                row.itemName.toLowerCase().includes(q) ||
                row.unit.toLowerCase().includes(q)
            );
        });
    }, [rows, category, filter, query]);

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex flex-col gap-3 border-b p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-[14px] font-semibold">
                            Protein stock ledger
                            {category ? (
                                <span className="font-normal text-muted-foreground">
                                    {' '}
                                    · {category}
                                </span>
                            ) : null}
                        </h2>
                        <p className="text-[12px] text-muted-foreground">
                            Pieces-and-portions tracking. Enter PTN
                            (portions) and PCS (pieces) per column — typing 1
                            in OUT issues one more portion, it does not
                            replace what is already posted.
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9"
                            onClick={onClear}
                            disabled={!canClear || saving}
                        >
                            <Eraser className="mr-1.5 size-4" />
                            Reset edits
                        </Button>
                        <Button
                            type="button"
                            className="h-9 bg-orion-blue text-white hover:bg-orion-blue/90"
                            onClick={onSave}
                            disabled={!dirty || saving}
                        >
                            <Save className="mr-1.5 size-4" />
                            {saving ? 'Posting…' : dirty ? 'Post day' : 'Posted'}
                        </Button>
                    </div>
                </div>

                <CategoryTabs
                    categories={categories}
                    value={category}
                    onChange={onCategoryChange}
                    loading={categoriesLoading}
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder="Search all categories…"
                            className="h-9 rounded-sm pl-9 shadow-none"
                        />
                    </div>
                    <div className="flex rounded-md border bg-gray-50 p-0.5">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => onFilterChange(f.id)}
                                className={cn(
                                    'rounded-sm px-2.5 py-1.5 text-[12px] font-medium transition-colors',
                                    filter === f.id
                                        ? 'bg-orion-blue/10 text-orion-blue'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'hidden border-b bg-gray-50/50 px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground lg:grid lg:gap-3',
                    PROTEIN_GRID_COLS,
                )}
            >
                <span>Item</span>
                <span className="text-right">Opening</span>
                <span className="text-right text-emerald-700">Received IN</span>
                <span className="text-right text-sky-700">Issued OUT</span>
                <span className="text-right text-violet-700">Returned</span>
                <span className="text-right text-rose-700">B&amp;D</span>
                <span className="text-right">Closing</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Value</span>
            </div>

            {loading ? (
                <div className="space-y-0 divide-y">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse bg-gray-50/40"
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
                    <div className="rounded-md border bg-gray-50 p-3">
                        <PackageSearch className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-[14px] font-medium">No items to show</p>
                    <p className="max-w-sm text-[14px] text-muted-foreground">
                        {query.trim()
                            ? 'Matching items from every category are shown. Clear search to stay in the selected tab.'
                            : 'Only items classified as Protein (Item Type) or with Portioned tracking appear here. Add them on the Items page first.'}
                    </p>
                </div>
            ) : (
                <div>
                    {filtered.map((row) => (
                        <ProteinRow
                            key={row.itemId}
                            row={row}
                            showCategory={Boolean(query.trim())}
                            onChange={(field, value) =>
                                onChange(row.itemId, field, value)
                            }
                            onBdReasonChange={(reason) =>
                                onBdReasonChange(row.itemId, reason)
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
