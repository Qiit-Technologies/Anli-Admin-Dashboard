'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Item } from '@/types';
import { getProteinStock, submitProteinStock } from '@/app/actions/stock';
import {
    calcProteinClosing,
    type ProteinDayMovement,
    type ProteinDraftMap,
} from './types';

export type PostedProteinMap = Record<
    string,
    {
        inPtn: number;
        inPcs: number;
        outPtn: number;
        outPcs: number;
        rtnPtn: number;
        rtnPcs: number;
        bdPtn: number;
        bdPcs: number;
        bdReason?: string;
        unitCost?: number;
        openingPieces?: number;
    }
>;

function itemKey(item: Item) {
    return String(item.id ?? item.itemNumber ?? item.itemName);
}

function pppForItem(item: Item): number {
    const rec = item as unknown as Record<string, unknown>;
    const raw = Number(rec.piecesPerPortion ?? rec.portionRate ?? 1);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 1;
}

function openingForItem(item: Item, postedOpening?: number) {
    if (postedOpening != null && Number.isFinite(postedOpening)) {
        return Math.max(0, Math.round(postedOpening));
    }
    return Math.max(
        0,
        Math.round(
            Number(
                item.qtyInStockBase ??
                    item.currentStock ??
                    item.quantity ??
                    0,
            ),
        ),
    );
}

function unitCostForItem(item: Item) {
    const n = Number(item.costPerBase ?? item.unitPrice ?? item.costPerOuter ?? 0);
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Only items classified for the Protein store show on this ledger. */
export function isProteinItem(item: Item): boolean {
    const rec = item as unknown as Record<string, unknown>;
    const store = String(rec.store ?? '').toLowerCase();
    const itemType = String(rec.itemType ?? '').toLowerCase();
    const tracking = String(rec.trackingMode ?? '').toLowerCase();
    return (
        store === 'protein' ||
        itemType === 'protein' ||
        tracking === 'portioned'
    );
}

function toDraft(posted: PostedProteinMap): ProteinDraftMap {
    const draft: ProteinDraftMap = {};
    for (const [id, line] of Object.entries(posted)) {
        draft[id] = {
            inPtn: line.inPtn,
            inPcs: line.inPcs,
            outPtn: line.outPtn,
            outPcs: line.outPcs,
            rtnPtn: line.rtnPtn,
            rtnPcs: line.rtnPcs,
            bdPtn: line.bdPtn,
            bdPcs: line.bdPcs,
            bdReason: line.bdReason,
            unitCost: line.unitCost,
        };
    }
    return draft;
}

const zeroEntry = () => ({
    inPtn: 0,
    inPcs: 0,
    outPtn: 0,
    outPcs: 0,
    rtnPtn: 0,
    rtnPcs: 0,
    bdPtn: 0,
    bdPcs: 0,
    bdReason: undefined as string | undefined,
    unitCost: undefined as number | undefined,
});

/**
 * Builds protein day rows from catalog items + posted protein lines.
 * Quantities are tracked in pieces; the board edits in PTN + PCS.
 */
export function useProteinStockDraft(
    items: Item[] | undefined,
    dateKey: string,
) {
    const [posted, setPosted] = useState<PostedProteinMap>({});
    const [draft, setDraft] = useState<ProteinDraftMap>({});
    const [dirty, setDirty] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setHydrated(false);
        setLoadError(null);
        getProteinStock({ date: dateKey }).then((result) => {
            if (cancelled) return;
            if (result.error) {
                setPosted({});
                setDraft({});
                setDirty(false);
                setHydrated(true);
                setLoadError(result.error);
                return;
            }
            const next: PostedProteinMap = {};
            for (const line of result.data?.lines ?? []) {
                next[String(line.itemId)] = {
                    inPtn: Number(line.inPtn) || 0,
                    inPcs: Number(line.inPcs) || 0,
                    outPtn: Number(line.outPtn) || 0,
                    outPcs: Number(line.outPcs) || 0,
                    rtnPtn: Number(line.rtnPtn) || 0,
                    rtnPcs: Number(line.rtnPcs) || 0,
                    bdPtn: Number(line.bdPtn) || 0,
                    bdPcs: Number(line.bdPcs) || 0,
                    bdReason: line.bdReason ? String(line.bdReason) : undefined,
                    unitCost: Number(line.unitCost) || undefined,
                    openingPieces: Number(line.openingPieces),
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

    const rows: ProteinDayMovement[] = useMemo(() => {
        if (!items?.length) return [];
        return items
            .filter(
                (item) =>
                    Boolean(item.itemName?.trim()) && isProteinItem(item),
            )
            .map((item) => {
                const id = itemKey(item);
                const patch = draft[id];
                const postedLine = posted[id];
                const ppp = pppForItem(item);
                const catalogCost = unitCostForItem(item);
                const base = zeroEntry();
                return {
                    itemId: id,
                    itemName: item.itemName,
                    unit:
                        item.baseUnit ||
                        item.unitOfMeasurement ||
                        'pcs',
                    ppp,
                    unitCost:
                        patch?.unitCost != null &&
                        Number.isFinite(Number(patch.unitCost))
                            ? Number(patch.unitCost)
                            : catalogCost,
                    category: item.category || 'General',
                    minStock: Math.max(
                        0,
                        Math.round(Number(item.minStock ?? 0)),
                    ),
                    openingPieces: openingForItem(
                        item,
                        postedLine?.openingPieces,
                    ),
                    inPtn: patch?.inPtn ?? base.inPtn,
                    inPcs: patch?.inPcs ?? base.inPcs,
                    outPtn: patch?.outPtn ?? base.outPtn,
                    outPcs: patch?.outPcs ?? base.outPcs,
                    rtnPtn: patch?.rtnPtn ?? base.rtnPtn,
                    rtnPcs: patch?.rtnPcs ?? base.rtnPcs,
                    bdPtn: patch?.bdPtn ?? base.bdPtn,
                    bdPcs: patch?.bdPcs ?? base.bdPcs,
                    bdReason: patch?.bdReason ?? '',
                };
            })
            .sort((a, b) => a.itemName.localeCompare(b.itemName));
    }, [items, draft, posted]);

    const updateField = useCallback(
        (
            itemId: string,
            field:
                | 'unitCost'
                | 'inPtn'
                | 'inPcs'
                | 'outPtn'
                | 'outPcs'
                | 'rtnPtn'
                | 'rtnPcs'
                | 'bdPtn'
                | 'bdPcs',
            value: number,
        ) => {
            const nextVal = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
            setDraft((prev) => {
                const current = prev[itemId] ?? {
                    ...zeroEntry(),
                    unitCost: posted[itemId]?.unitCost,
                };
                const next = { ...current, [field]: nextVal };
                return { ...prev, [itemId]: next };
            });
            setDirty(true);
        },
        [posted],
    );

    const updateBdReason = useCallback((itemId: string, reason: string) => {
        setDraft((prev) => {
            const current = prev[itemId] ?? zeroEntry();
            return { ...prev, [itemId]: { ...current, bdReason: reason } };
        });
        setDirty(true);
    }, []);

    const save = useCallback(async () => {
        const lines = rows
            .filter(
                (row) =>
                    row.inPtn ||
                    row.inPcs ||
                    row.outPtn ||
                    row.outPcs ||
                    row.rtnPtn ||
                    row.rtnPcs ||
                    row.bdPtn ||
                    row.bdPcs,
            )
            .map((row) => {
                const itemId = Number(row.itemId);
                return {
                    itemId,
                    inPtn: Math.max(0, Math.floor(row.inPtn)),
                    inPcs: Math.max(0, Math.floor(row.inPcs)),
                    outPtn: Math.max(0, Math.floor(row.outPtn)),
                    outPcs: Math.max(0, Math.floor(row.outPcs)),
                    rtnPtn: Math.max(0, Math.floor(row.rtnPtn)),
                    rtnPcs: Math.max(0, Math.floor(row.rtnPcs)),
                    bdPtn: Math.max(0, Math.floor(row.bdPtn)),
                    bdPcs: Math.max(0, Math.floor(row.bdPcs)),
                    bdReason: row.bdReason || undefined,
                    unitCost:
                        Number.isFinite(row.unitCost) && row.unitCost >= 0
                            ? row.unitCost
                            : 0,
                };
            })
            .filter((line) => Number.isFinite(line.itemId) && line.itemId > 0);

        setSaving(true);
        try {
            const result = await submitProteinStock({ date: dateKey, lines });
            if (result.error) {
                return { error: result.error };
            }
            const next: PostedProteinMap = {};
            for (const line of result.data?.lines ?? []) {
                next[String(line.itemId)] = {
                    inPtn: Number(line.inPtn) || 0,
                    inPcs: Number(line.inPcs) || 0,
                    outPtn: Number(line.outPtn) || 0,
                    outPcs: Number(line.outPcs) || 0,
                    rtnPtn: Number(line.rtnPtn) || 0,
                    rtnPcs: Number(line.rtnPcs) || 0,
                    bdPtn: Number(line.bdPtn) || 0,
                    bdPcs: Number(line.bdPcs) || 0,
                    bdReason: line.bdReason ? String(line.bdReason) : undefined,
                    unitCost: Number(line.unitCost) || undefined,
                    openingPieces: Number(line.openingPieces),
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
                        : 'Failed to save protein stock.',
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
        let inValue = 0;
        let outValue = 0;
        let rtnValue = 0;
        let bdValue = 0;
        let closingValue = 0;
        let movedCount = 0;
        let reorderCount = 0;

        for (const row of rows) {
            const closing = calcProteinClosing(row);
            const inPieces =
                row.inPtn * row.ppp + row.inPcs;
            const outPieces =
                row.outPtn * row.ppp + row.outPcs;
            const rtnPieces =
                row.rtnPtn * row.ppp + row.rtnPcs;
            const bdPieces =
                row.bdPtn * row.ppp + row.bdPcs;
            openingValue += row.openingPieces * row.unitCost;
            inValue += inPieces * row.unitCost;
            outValue += outPieces * row.unitCost;
            rtnValue += rtnPieces * row.unitCost;
            bdValue += bdPieces * row.unitCost;
            closingValue += closing * row.unitCost;
            if (
                inPieces ||
                outPieces ||
                rtnPieces ||
                bdPieces
            ) {
                movedCount += 1;
            }
            if (
                closing <= 0 ||
                (row.minStock > 0 && closing < row.minStock)
            ) {
                reorderCount += 1;
            }
        }

        const round2 = (n: number) => Math.round(n * 100) / 100;
        return {
            openingValue: round2(openingValue),
            inValue: round2(inValue),
            outValue: round2(outValue),
            rtnValue: round2(rtnValue),
            bdValue: round2(bdValue),
            closingValue: round2(closingValue),
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
        updateBdReason,
        save,
        clearDay,
        postedCount: Object.keys(posted).length,
    };
}
