import type { DraftInvoice } from '@/types/draft-invoice';

export function resolveDraftInvoiceDisplayNumber(draft: DraftInvoice): string {
    const batchNumber = String(
        draft.payload?.quotationBatchNumber ?? '',
    ).trim();
    if (batchNumber) return batchNumber;
    return draft.invoiceNumber;
}

export function resolveDraftBatchLineLabel(draft: DraftInvoice): string | null {
    const total = Number(draft.payload?.quotationLineTotal ?? 0);
    if (total <= 1) return null;
    const index = Number(draft.payload?.quotationLineIndex ?? 0);
    return `${index + 1} of ${total}`;
}

export function resolveDraftBatchId(draft: DraftInvoice): string | null {
    const batchId = String(draft.payload?.quotationBatchId ?? '').trim();
    return batchId || null;
}

export function mergeBatchDraftsForPrint(drafts: DraftInvoice[]): DraftInvoice {
    const sorted = [...drafts].sort(
        (a, b) =>
            Number(a.payload?.quotationLineIndex ?? 0) -
            Number(b.payload?.quotationLineIndex ?? 0),
    );
    const primary = sorted[0];
    if (!primary || sorted.length === 1) return primary ?? drafts[0];

    const lineItems = sorted.flatMap((draft) => draft.lineItems ?? []);
    const pricing = {
        ...primary.pricing,
        subtotal: lineItems.reduce(
            (sum, item) => sum + Number(item.subtotal || 0),
            0,
        ),
        vatAmount: sorted.reduce(
            (sum, draft) => sum + Number(draft.pricing?.vatAmount ?? 0),
            0,
        ),
        serviceChargeAmount: sorted.reduce(
            (sum, draft) =>
                sum + Number(draft.pricing?.serviceChargeAmount ?? 0),
            0,
        ),
        discountAmount: sorted.reduce(
            (sum, draft) => sum + Number(draft.pricing?.discountAmount ?? 0),
            0,
        ),
        tipAmount: sorted.reduce(
            (sum, draft) => sum + Number(draft.pricing?.tipAmount ?? 0),
            0,
        ),
    };
    const amount = sorted.reduce(
        (sum, draft) => sum + Number(draft.amount || 0),
        0,
    );

    return {
        ...primary,
        invoiceNumber: resolveDraftInvoiceDisplayNumber(primary),
        lineItems,
        roomTypeSummary: lineItems
            .map((item) => item.roomTypeName)
            .filter(Boolean)
            .join(', '),
        pricing,
        amount,
        checkInDate:
            [...lineItems.map((item) => item.checkInDate).filter(Boolean)].sort()[0] ||
            primary.checkInDate,
        checkOutDate:
            [...lineItems.map((item) => item.checkOutDate).filter(Boolean)]
                .sort()
                .at(-1) || primary.checkOutDate,
        payload: {
            ...primary.payload,
            reservationLines: sorted.flatMap((draft) =>
                Array.isArray(draft.payload?.reservationLines)
                    ? draft.payload.reservationLines
                    : [],
            ),
        },
    };
}
