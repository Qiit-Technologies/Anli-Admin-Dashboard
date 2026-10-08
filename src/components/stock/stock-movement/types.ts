export type MovementStatus = 'STOCK AVAILABLE' | 'REORDER';

export type MovementField = 'unitCost' | 'inQty' | 'outQty' | 'bdQty';

/** One item's movement for a single day — sheet columns IN / OUT / B&D / CL/STK. */
export type DayMovement = {
    itemId: string;
    itemName: string;
    unit: string;
    unitCost: number;
    category: string;
    minStock: number;
    /** Opening for the selected day (carry-forward from prior closing). */
    opening: number;
    inQty: number;
    outQty: number;
    bdQty: number;
};

export type MovementFilter = 'all' | 'moved' | 'reorder' | 'available';

export type MovementDraftEntry = {
    inQty: number;
    outQty: number;
    bdQty: number;
    /** Optional override of catalog unit price for this day. */
    unitCost?: number;
};

export type MovementDraftMap = Record<string, MovementDraftEntry>;

export function calcClosing(row: Pick<DayMovement, 'opening' | 'inQty' | 'outQty' | 'bdQty'>) {
    return Math.max(0, roundQty(row.opening + row.inQty - row.outQty - row.bdQty));
}

/** Apply one day's In / Out / B&D to an opening balance. */
export function applyDayToOpening(
    opening: number,
    movement: Pick<MovementDraftEntry, 'inQty' | 'outQty' | 'bdQty'> | undefined,
): number {
    if (!movement) return opening;
    return calcClosing({
        opening,
        inQty: movement.inQty ?? 0,
        outQty: movement.outQty ?? 0,
        bdQty: movement.bdQty ?? 0,
    });
}

/**
 * Opening for a later date is the chained closing of every earlier saved day.
 * `priorDrafts` must be oldest → newest.
 */
export function openingFromPriorDays(
    catalogOpening: number,
    itemId: string,
    priorDrafts: MovementDraftMap[],
): number {
    return priorDrafts.reduce(
        (opening, draft) => applyDayToOpening(opening, draft[itemId]),
        catalogOpening,
    );
}

export function resolveStatus(
    closing: number,
    minStock: number,
): MovementStatus {
    if (closing <= 0 || (minStock > 0 && closing < minStock)) {
        return 'REORDER';
    }
    return 'STOCK AVAILABLE';
}

export function roundQty(n: number) {
    return Math.round(n * 1000) / 1000;
}

export function movementValue(qty: number, unitCost: number) {
    return roundQty(qty * unitCost);
}
