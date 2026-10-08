'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eraser, PackageSearch, Save, Search } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { MovementRow } from './MovementRow';
import {
    type DayMovement,
    type MovementField,
    type MovementFilter,
} from './types';

type MovementBoardProps = {
    rows: DayMovement[];
    categories: string[];
    category: string;
    onCategoryChange: (category: string) => void;
    categoriesLoading?: boolean;
    filter: MovementFilter;
    query: string;
    onQueryChange: (q: string) => void;
    onFilterChange: (f: MovementFilter) => void;
    onChange: (itemId: string, field: MovementField, value: number) => void;
    onClear: () => void;
    onSave: () => void;
    dirty?: boolean;
    canClear?: boolean;
    loading?: boolean;
    saving?: boolean;
};

const FILTERS: { id: MovementFilter; label: string }[] = [
    { id: 'all', label: 'All items' },
    { id: 'moved', label: 'Moved today' },
    { id: 'reorder', label: 'Reorder' },
    { id: 'available', label: 'Available' },
];

const FIELD_ORDER: MovementField[] = ['unitCost', 'inQty', 'outQty', 'bdQty'];

const GRID_COLS =
    'lg:grid-cols-[minmax(0,1.5fr)_minmax(5.5rem,0.85fr)_repeat(5,minmax(4.5rem,1fr))]';

function matchesCategory(rowCategory: string, selected: string) {
    return rowCategory.trim().toLowerCase() === selected.trim().toLowerCase();
}

export function MovementBoard({
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
    onClear,
    onSave,
    dirty = false,
    canClear = false,
    loading,
    saving = false,
}: MovementBoardProps) {
    const inputMap = useRef(
        new Map<string, Partial<Record<MovementField, HTMLInputElement>>>(),
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows.filter((row) => {
            if (category && !q && !matchesCategory(row.category, category)) {
                return false;
            }

            const closing = row.opening + row.inQty - row.outQty - row.bdQty;
            const isReorder =
                closing <= 0 || (row.minStock > 0 && closing < row.minStock);
            const moved = row.inQty > 0 || row.outQty > 0 || row.bdQty > 0;

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

    const focusCell = (
        rowIndex: number,
        field: MovementField,
        rowDelta: number,
        fieldDelta: number,
    ) => {
        const fieldIdx = FIELD_ORDER.indexOf(field);
        let nextRow = rowIndex + rowDelta;
        let nextFieldIdx = fieldIdx + fieldDelta;

        if (fieldDelta !== 0) {
            if (nextFieldIdx > FIELD_ORDER.length - 1) {
                nextFieldIdx = 0;
                nextRow += 1;
            } else if (nextFieldIdx < 0) {
                nextFieldIdx = FIELD_ORDER.length - 1;
                nextRow -= 1;
            }
        }

        const target = filtered[nextRow];
        if (!target) return;
        const nextField = FIELD_ORDER[nextFieldIdx];
        const el = inputMap.current.get(target.itemId)?.[nextField];
        el?.focus();
        el?.select();
    };

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex flex-col gap-3 border-b p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h2 className="text-[14px] font-semibold">
                            Daily movement ledger
                            {category ? (
                                <span className="font-normal text-muted-foreground">
                                    {' '}
                                    · {category}
                                </span>
                            ) : null}
                        </h2>
                        <p className="text-[12px] text-muted-foreground">
                            IN posts to Purchase Log, OUT to Issued Stock, and
                            B&amp;D to Bad &amp; Perishable. Figures are today&apos;s
                            running totals — typing 1 in OUT issues one more, it
                            does not replace what is already posted. Enter moves
                            to the next cell.
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
                    GRID_COLS,
                )}
            >
                <span>Item</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Opening</span>
                <span className="text-right text-emerald-700">In</span>
                <span className="text-right text-sky-700">Out</span>
                <span className="text-right text-rose-700">B&amp;D</span>
                <span className="text-right">Closing</span>
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
                            : category
                            ? `No items in “${category}” for the current filters.`
                            : query || filter !== 'all'
                              ? 'Try clearing search or filters.'
                              : 'Add stock items first, then come back to log daily movement.'}
                    </p>
                </div>
            ) : (
                <div>
                    {filtered.map((row, index) => (
                        <MovementRow
                            key={row.itemId}
                            row={row}
                            showCategory={Boolean(query.trim())}
                            onChange={(field, value) =>
                                onChange(row.itemId, field, value)
                            }
                            inputRefs={{
                                unitCost: (el) => {
                                    const map =
                                        inputMap.current.get(row.itemId) ?? {};
                                    map.unitCost = el ?? undefined;
                                    inputMap.current.set(row.itemId, map);
                                },
                                inQty: (el) => {
                                    const map =
                                        inputMap.current.get(row.itemId) ?? {};
                                    map.inQty = el ?? undefined;
                                    inputMap.current.set(row.itemId, map);
                                },
                                outQty: (el) => {
                                    const map =
                                        inputMap.current.get(row.itemId) ?? {};
                                    map.outQty = el ?? undefined;
                                    inputMap.current.set(row.itemId, map);
                                },
                                bdQty: (el) => {
                                    const map =
                                        inputMap.current.get(row.itemId) ?? {};
                                    map.bdQty = el ?? undefined;
                                    inputMap.current.set(row.itemId, map);
                                },
                            }}
                            onFieldKeyDown={(field, e) => {
                                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    focusCell(index, field, 1, 0);
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    focusCell(index, field, -1, 0);
                                } else if (
                                    e.key === 'ArrowRight' &&
                                    e.currentTarget.selectionStart ===
                                        e.currentTarget.value.length
                                ) {
                                    e.preventDefault();
                                    focusCell(index, field, 0, 1);
                                } else if (
                                    e.key === 'ArrowLeft' &&
                                    e.currentTarget.selectionStart === 0
                                ) {
                                    e.preventDefault();
                                    focusCell(index, field, 0, -1);
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
