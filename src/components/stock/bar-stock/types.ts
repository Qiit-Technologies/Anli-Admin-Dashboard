/**
 * Bar Stock — FRD §15 types.
 * Per-department stock balance: opening, received, sold, transferred,
 * wastage, closing per item.
 */

export type BarDepartment = 'bar' | 'kitchen' | 'restaurant' | 'store';

export const BAR_DEPARTMENTS: Array<{ value: BarDepartment; label: string }> = [
    { value: 'bar', label: 'Bar' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'store', label: 'Store' },
];

export interface BarStockRow {
    itemId: number;
    itemName: string;
    itemNumber?: string;
    unit: string;
    opening: number;
    received: number;
    sold: number;
    transferred: number;
    wastage: number;
    closing: number;
    unitPrice: number;
    value: number;
}

export interface BarStockSummary {
    itemCount: number;
    openingValue: number;
    receivedValue: number;
    soldValue: number;
    transferredValue: number;
    wastageValue: number;
    closingValue: number;
}

/** Backend dedicated-endpoint row shape (loose — backend normalises). */
interface BackendBarStockRow {
    itemId?: number;
    item?: { id?: number; name?: string; itemNumber?: string };
    itemName?: string;
    name?: string;
    itemNumber?: string;
    unit?: string;
    unitOfMeasurement?: string;
    baseUnit?: string;
    opening?: number;
    received?: number;
    inQty?: number;
    sold?: number;
    outQty?: number;
    transferred?: number;
    transferOut?: number;
    wastage?: number;
    bdQty?: number;
    closing?: number;
    unitPrice?: number;
    costPrice?: number;
    value?: number;
}

const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

/**
 * Normalise the dedicated `GET /items/bar-stock` payload to BarStockRow[].
 * Accepts an array directly or `{ items: [...] }` / `{ data: [...] }`.
 */
export function normalizeBarStockResponse(payload: unknown): BarStockRow[] {
    const raw: unknown = Array.isArray(payload)
        ? payload
        : (payload as any)?.items ?? (payload as any)?.data ?? [];
    if (!Array.isArray(raw)) return [];
    return (raw as BackendBarStockRow[]).map((r, i) => {
        const opening = num(r.opening);
        const received = num(r.received ?? r.inQty);
        const sold = num(r.sold ?? r.outQty);
        const transferred = num(r.transferred ?? r.transferOut);
        const wastage = num(r.wastage ?? r.bdQty);
        const closing = num(
            r.closing ?? opening + received - sold - transferred - wastage,
        );
        const unitPrice = num(r.unitPrice ?? r.costPrice);
        return {
            itemId: num(r.itemId ?? r.item?.id) || i,
            itemName:
                r.itemName ?? r.name ?? r.item?.name ?? `Item ${i + 1}`,
            itemNumber: r.itemNumber ?? r.item?.itemNumber,
            unit: r.unit ?? r.baseUnit ?? r.unitOfMeasurement ?? 'unit',
            opening,
            received,
            sold,
            transferred,
            wastage,
            closing,
            unitPrice,
            value: num(r.value ?? closing * unitPrice),
        };
    });
}

/** Daily-stock-register item shape (existing backend model). */
interface RegisterItem {
    item?: { id?: number; name?: string; itemNumber?: string };
    itemName?: string;
    unitOfMeasurement?: string;
    baseUnit?: string;
    costPrice?: number;
    storeOpening?: number;
    barOpening?: number;
    kitchenOpening?: number;
    issueOut?: number;
    returnedIn?: number;
    damagedWaste?: number;
    sold?: number;
    transferOut?: number;
    transferIn?: number;
    storeClosing?: number;
    barClosing?: number;
    kitchenClosing?: number;
    stockLevel?: number;
}

const registerItemsOf = (payload: unknown): RegisterItem[] => {
    const data = (payload as any)?.data ?? payload;
    const items = data?.items ?? data?.register?.items ?? [];
    return Array.isArray(items) ? items : [];
};

/**
 * Fallback mapping from the daily stock register when the dedicated
 * /items/bar-stock endpoint isn't deployed yet.
 * Opening/closing come from the department's register fields; received is
 * stock transferred into the department, transferred is stock moved out,
 * wastage is damaged/waste, sold is POS-recorded sales.
 */
export function normalizeRegisterFallback(
    payload: unknown,
    department: BarDepartment,
): BarStockRow[] {
    const openingKey =
        department === 'bar'
            ? 'barOpening'
            : department === 'kitchen'
              ? 'kitchenOpening'
              : 'storeOpening';
    const closingKey =
        department === 'bar'
            ? 'barClosing'
            : department === 'kitchen'
              ? 'kitchenClosing'
              : 'storeClosing';

    return registerItemsOf(payload).map((r, i) => {
        const opening = num(r[openingKey]);
        const received = num(r.transferIn) + num(r.issueOut);
        const sold = num(r.sold);
        const transferred = num(r.transferOut);
        const wastage = num(r.damagedWaste);
        const closing = num(r[closingKey] ?? r.stockLevel);
        const unitPrice = num(r.costPrice);
        return {
            itemId: num(r.item?.id) || i,
            itemName: r.itemName ?? r.item?.name ?? `Item ${i + 1}`,
            itemNumber: r.item?.itemNumber,
            unit: r.baseUnit ?? r.unitOfMeasurement ?? 'unit',
            opening,
            received,
            sold,
            transferred,
            wastage,
            closing,
            unitPrice,
            value: closing * unitPrice,
        };
    });
}

export function summarizeBarStock(rows: BarStockRow[]): BarStockSummary {
    return {
        itemCount: rows.length,
        openingValue: rows.reduce((s, r) => s + r.opening * r.unitPrice, 0),
        receivedValue: rows.reduce((s, r) => s + r.received * r.unitPrice, 0),
        soldValue: rows.reduce((s, r) => s + r.sold * r.unitPrice, 0),
        transferredValue: rows.reduce(
            (s, r) => s + r.transferred * r.unitPrice,
            0,
        ),
        wastageValue: rows.reduce((s, r) => s + r.wastage * r.unitPrice, 0),
        closingValue: rows.reduce((s, r) => s + r.value, 0),
    };
}

export const formatNaira = (v: number): string =>
    `₦${num(v).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

export const formatQty = (v: number): string =>
    num(v).toLocaleString('en-NG', { maximumFractionDigits: 2 });
