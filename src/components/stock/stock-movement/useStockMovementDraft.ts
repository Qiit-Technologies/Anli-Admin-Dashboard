'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Item } from '@/types';
import {
    getStockMovements,
    submitStockMovements,
} from '@/app/actions/stock';
import {
    calcClosing,
    type DayMovement,
    type MovementDraftMap,
    roundQty,
} from './types';

export type PostedMovementMap = Record<
    string,
    {
        inQty: number;
        outQty: number;
        bdQty: number;
        unitCost?: number;
        opening?: number;
    }
>;

function itemKey(item: Item) {
    return String(item.id ?? item.itemNumber ?? item.itemName);
}

function openingForItem(item: Item, postedOpening?: number) {
    if (postedOpening != null && Number.isFinite(postedOpening)) {
        return roundQty(postedOpening);
    }
    return roundQty(
        Number(
            item.qtyInStockBase ??
                item.currentStock ??
                item.quantity ??
                item.qtyInStockOuter ??
                0,
        ),
    );
}

function unitCostForItem(item: Item) {
    const n = Number(item.costPerBase ?? item.unitPrice ?? item.costPerOuter ?? 0);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

function toDraft(posted: PostedMovementMap): MovementDraftMap {
    const draft: MovementDraftMap = {};
    for (const [id, line] of Object.entries(posted)) {
        draft[id] = {
            inQty: line.inQty,
            outQty: line.outQty,
            bdQty: line.bdQty,
            unitCost: line.unitCost,
        };
    }
    return draft;
}

/**
 * Builds day rows from catalog items + posted Stock Movement lines.
 * Save posts IN / OUT / B&D to the server so Purchase Log, Issued Stock,
 * and Bad & Perishable stay in sync.
 */
export function useStockMovementDraft(
    items: Item[] | undefined,
    dateKey: string,
) {
    const [posted, setPosted] = useState<PostedMovementMap>({});
    const [draft, setDraft] = useState<MovementDraftMap>({});
    const [dirty, setDirty] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setHydrated(false);
        setLoadError(null);
        getStockMovements({ date: dateKey }).then((result) => {
            if (cancelled) return;
            if (result.error) {
                setPosted({});
                setDraft({});
                setDirty(false);
                setHydrated(true);
                setLoadError(result.error);
                return;
            }
            const next: PostedMovementMap = {};
            for (const line of result.data?.lines ?? []) {
                next[String(line.itemId)] = {
                    inQty: Number(line.inQty) || 0,
                    outQty: Number(line.outQty) || 0,
                    bdQty: Number(line.bdQty) || 0,
                    unitCost: Number(line.unitCost) || undefined,
                    opening: Number(line.opening),
                };
            }
            setPosted(next);
            setDraft(toDraft(next));
            setDirty(false);
            setHydrated(true);
        });
        return () => {
            cancelled = true;
        };
    }, [dateKey]);

    const rows: DayMovement[] = useMemo(() => {
        if (!items?.length) return [];
        return items
            .filter((item) => Boolean(item.itemName?.trim()))
            .map((item) => {
                const id = itemKey(item);
                const patch = draft[id];
                const postedLine = posted[id];
                const catalogCost = unitCostForItem(item);
                return {
                    itemId: id,
                    itemName: item.itemName,
                    unit:
                        item.baseUnit ||
                        item.unitOfMeasurement ||
                        item.outerUnitOfMeasure ||
                        '—',
                    unitCost:
                        patch?.unitCost != null &&
                        Number.isFinite(Number(patch.unitCost))
                            ? Number(patch.unitCost)
                            : catalogCost,
                    category: item.category || 'General',
                    minStock: Number(item.minStock ?? 0),
                    opening: openingForItem(item, postedLine?.opening),
                    inQty: patch?.inQty ?? 0,
                    outQty: patch?.outQty ?? 0,
                    bdQty: patch?.bdQty ?? 0,
                };
            })
            .sort((a, b) => a.itemName.localeCompare(b.itemName));
    }, [items, draft, posted]);

    const updateField = useCallback(
        (
            itemId: string,
            field: 'unitCost' | 'inQty' | 'outQty' | 'bdQty',
            value: number,
        ) => {
            const nextVal = Number.isFinite(value) ? Math.max(0, value) : 0;
            setDraft((prev) => {
                const current = prev[itemId] ?? {
                    inQty: posted[itemId]?.inQty ?? 0,
                    outQty: posted[itemId]?.outQty ?? 0,
                    bdQty: posted[itemId]?.bdQty ?? 0,
                    unitCost: posted[itemId]?.unitCost,
                };
                const next = { ...current, [field]: nextVal };
                const copy = { ...prev };
                copy[itemId] = next;
                return copy;
            });
            setDirty(true);
        },
        [posted],
    );

    const save = useCallback(async () => {
        const lines = rows
            .filter((row) => row.inQty || row.outQty || row.bdQty)
            .map((row) => {
                const itemId = Number(row.itemId);
                const inQty = Number(row.inQty);
                const outQty = Number(row.outQty);
                const bdQty = Number(row.bdQty);
                const unitCost = Number(row.unitCost);
                return {
                    itemId,
                    inQty: Number.isFinite(inQty) && inQty > 0 ? inQty : 0,
                    outQty: Number.isFinite(outQty) && outQty > 0 ? outQty : 0,
                    bdQty: Number.isFinite(bdQty) && bdQty > 0 ? bdQty : 0,
                    unitCost: Number.isFinite(unitCost) && unitCost >= 0 ? unitCost : 0,
                };
            })
            .filter((line) => Number.isFinite(line.itemId) && line.itemId > 0);

        setSaving(true);
        try {
            const result = await submitStockMovements({ date: dateKey, lines });
            if (result.error) {
                return { error: result.error };
            }

            const next: PostedMovementMap = {};
            for (const line of result.data?.lines ?? []) {
                next[String(line.itemId)] = {
                    inQty: Number(line.inQty) || 0,
                    outQty: Number(line.outQty) || 0,
                    bdQty: Number(line.bdQty) || 0,
                    unitCost: Number(line.unitCost) || undefined,
                    opening: Number(line.opening),
                };
            }
            setPosted(next);
            setDraft(toDraft(next));
            setDirty(false);
            return { data: result.data };
        } catch (error) {
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to save stock movements.',
            };
        } finally {
            setSaving(false);
        }
    }, [dateKey, rows]);

    const clearDay = useCallback(() => {
        setDraft(toDraft(posted));
        setDirty(false);
    }, [posted]);

    const summary = useMemo(() => {
        let openingValue = 0;
        let purchaseValue = 0;
        let issueOutValue = 0;
        let bdValue = 0;
        let closingValue = 0;
        let movedCount = 0;
        let reorderCount = 0;

        for (const row of rows) {
            const closing = calcClosing(row);
            openingValue += row.opening * row.unitCost;
            purchaseValue += row.inQty * row.unitCost;
            issueOutValue += row.outQty * row.unitCost;
            bdValue += row.bdQty * row.unitCost;
            closingValue += closing * row.unitCost;
            if (row.inQty || row.outQty || row.bdQty) movedCount += 1;
            if (closing <= 0 || (row.minStock > 0 && closing < row.minStock)) {
                reorderCount += 1;
            }
        }

        return {
            openingValue: roundQty(openingValue),
            purchaseValue: roundQty(purchaseValue),
            issueOutValue: roundQty(issueOutValue),
            bdValue: roundQty(bdValue),
            closingValue: roundQty(closingValue),
            movedCount,
            reorderCount,
            itemCount: rows.length,
        };
    }, [rows]);

    return {
        rows,
        draft,
        dirty,
        hydrated,
        saving,
        loadError,
        summary,
        updateField,
        save,
        clearDay,
        postedCount: Object.keys(posted).length,
    };
}
