export interface ReturnVoucherLine {
    id?: string | number;
    itemId?: number;
    name?: string;
    itemName?: string;
    item?: { id?: number; name?: string };
    quantity?: number;
    qty?: number;
    unitOfMeasurement?: string;
    unit?: string;
    unitPrice?: number;
    costPerUnit?: number;
    totalValue?: number;
    value?: number;
    reason?: string;
}

export interface ReturnVoucher {
    id: string | number;
    rtvNumber?: string;
    returnNo?: string;
    voucherNumber?: string;
    returnDate?: string;
    date?: string;
    createdAt?: string;
    fromDepartment?: string;
    department?: string;
    receivedBy?: { fullName?: string } | string;
    receivedByName?: string;
    items?: ReturnVoucherLine[];
    itemCount?: number;
    totalValue?: number;
    remarks?: string;
    status?: string;
}

export const RETURN_REASONS = [
    'Excess issued',
    'Wrong item issued',
    'Damaged on arrival',
    'Expired / Spoiled',
    'No longer needed',
    'Quality issue',
    'Other',
] as const;

export const rtvNumber = (rtv: ReturnVoucher): string =>
    String(
        rtv.rtvNumber ||
            rtv.returnNo ||
            rtv.voucherNumber ||
            `#${rtv.id}`,
    );

export const rtvDate = (rtv: ReturnVoucher): string =>
    rtv.returnDate || rtv.date || rtv.createdAt || '';

export const rtvFromDepartment = (rtv: ReturnVoucher): string =>
    rtv.fromDepartment || rtv.department || '—';

export const rtvReceivedBy = (rtv: ReturnVoucher): string => {
    if (typeof rtv.receivedBy === 'object')
        return rtv.receivedBy?.fullName || '—';
    return rtv.receivedBy || rtv.receivedByName || '—';
};

export const rtvLines = (rtv: ReturnVoucher): ReturnVoucherLine[] =>
    Array.isArray(rtv.items) ? rtv.items : [];

export const rtvItemCount = (rtv: ReturnVoucher): number =>
    rtv.itemCount ?? rtvLines(rtv).length;

export const lineName = (line: ReturnVoucherLine): string =>
    line.name || line.itemName || line.item?.name || 'Item';

export const lineQty = (line: ReturnVoucherLine): number =>
    Number(line.quantity ?? line.qty ?? 0);

export const lineUnit = (line: ReturnVoucherLine): string =>
    line.unitOfMeasurement || line.unit || '—';

export const lineUnitPrice = (line: ReturnVoucherLine): number =>
    Number(line.unitPrice ?? line.costPerUnit ?? 0);

export const lineValue = (line: ReturnVoucherLine): number =>
    Number(
        line.totalValue ??
            line.value ??
            lineUnitPrice(line) * lineQty(line),
    );

export const rtvTotalValue = (rtv: ReturnVoucher): number =>
    Number(rtv.totalValue ?? rtvLines(rtv).reduce((s, l) => s + lineValue(l), 0));
