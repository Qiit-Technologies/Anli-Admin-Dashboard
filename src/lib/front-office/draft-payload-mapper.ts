import type { FormDataType } from '@/components/front-office/common/Form/Reservation/types';
import {
    lineItemsToReservationLines,
    normalizeQuotationRooms,
    resolveReservationLines,
    syncLegacyFormFieldsFromLines,
    type QuotationRoomLine,
} from '@/lib/front-office/quotation-room-lines';
import type { DraftInvoice, DraftInvoiceLineItem } from '@/types/draft-invoice';

function coercePositiveInt(value: unknown): number | undefined {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 1) return undefined;
    return Math.trunc(num);
}

function resolveRoomTypeId(
    draft: DraftInvoice,
    singleLine?: QuotationRoomLine,
): number | undefined {
    const lineIndex = Number(draft.payload?.quotationLineIndex ?? 0);
    const lineItem = draft.lineItems?.[lineIndex] ?? draft.lineItems?.[0];

    const candidates: unknown[] = [
        singleLine?.roomTypeId,
        lineItem?.roomTypeId,
        draft.payload?.roomtype,
        (
            draft.payload?.reservationLines as
                | Array<{ roomTypeId?: unknown }>
                | undefined
        )?.[lineIndex]?.roomTypeId,
    ];

    for (const candidate of candidates) {
        const resolved =
            typeof candidate === 'object' &&
            candidate !== null &&
            'roomTypeId' in candidate
                ? coercePositiveInt(
                      (candidate as { roomTypeId?: unknown }).roomTypeId,
                  )
                : coercePositiveInt(candidate);
        if (resolved) return resolved;
    }

    return undefined;
}

/** Maps a stored draft quotation payload back into reservation wizard form values. */
export function draftPayloadToFormValues(
    payload: Record<string, unknown>,
    lineItems?: DraftInvoiceLineItem[],
): Partial<FormDataType> & {
    reservationLines?: ReturnType<typeof normalizeQuotationRooms>;
} {
    const numericKeys = new Set([
        'roomtype',
        'numberOfGuests',
        'amountPaid',
        'outstanding',
        'loyaltyPoints',
        'guestProfileId',
        'creditToApply',
        'discountValue',
    ]);

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload)) {
        if (value === null || value === undefined) continue;
        if (key === 'createdAt' || key === 'IDImage') continue;
        if (key === 'IDNumber') {
            result.IDNumber = String(value);
            continue;
        }

        if (numericKeys.has(key)) {
            const num = Number(value);
            if (!Number.isNaN(num)) {
                result[key] = num;
            }
        } else {
            result[key] = value;
        }
    }

    if (payload.startDate) {
        result.startDate = String(payload.startDate).slice(0, 10);
    }
    if (payload.endDate) {
        result.endDate = String(payload.endDate).slice(0, 10);
    }

    const primaryLine = lineItems?.[0];
    if (!result.startDate && primaryLine?.checkInDate) {
        result.startDate = primaryLine.checkInDate.slice(0, 10);
    }
    if (!result.endDate && primaryLine?.checkOutDate) {
        result.endDate = primaryLine.checkOutDate.slice(0, 10);
    }

    const mapped = result as Partial<FormDataType> & {
        reservationLines?: ReturnType<typeof normalizeQuotationRooms>;
    };

    if (
        Array.isArray(payload.reservationLines) &&
        payload.reservationLines.length > 0
    ) {
        mapped.reservationLines = normalizeQuotationRooms(
            payload.reservationLines,
        );
    } else if (lineItems?.length) {
        mapped.reservationLines = lineItemsToReservationLines(lineItems);
    } else if (payload.quotationRooms || mapped.roomtype) {
        mapped.reservationLines = resolveReservationLines(payload);
    }

    if (payload.quotationRooms) {
        mapped.quotationRooms = normalizeQuotationRooms(payload.quotationRooms);
    }

    return mapped;
}

/** Form values for the reservation wizard when converting a draft quotation. */
export function draftToReservationInitialValues(
    draft: DraftInvoice,
): Partial<FormDataType> {
    const values = draftPayloadToFormValues(
        draft.payload ?? {},
        draft.lineItems,
    );

    const lineIndex = Number(draft.payload?.quotationLineIndex ?? 0);
    const lines = values.reservationLines ?? [];
    const singleLine =
        lines[lineIndex] ??
        lines[0] ??
        (draft.lineItems?.[lineIndex]
            ? lineItemsToReservationLines(draft.lineItems)[lineIndex]
            : undefined);

    const lineScoped = singleLine
        ? syncLegacyFormFieldsFromLines([singleLine])
        : {};
    const roomtype = resolveRoomTypeId(draft, singleLine);

    return {
        ...values,
        ...lineScoped,
        roomtype:
            roomtype ?? coercePositiveInt(lineScoped.roomtype as unknown) ?? 0,
        quotationRooms: [],
        fullName: String(values.fullName ?? draft.guestName ?? ''),
        email: values.email ? String(values.email) : (draft.guestEmail ?? ''),
        phoneNumber: values.phoneNumber
            ? String(values.phoneNumber)
            : (draft.guestPhone ?? ''),
        numberOfGuests: coercePositiveInt(values.numberOfGuests) ?? 1,
        roomNumber: '',
    };
}

export function inferReservationTypeFromPayload(
    payload: Record<string, unknown>,
): 'REGULAR' | 'COMPLIMENTARY' | 'DISCOUNT' | 'VOID' {
    if (payload.isVoid) return 'VOID';
    if (payload.isComplimentary) return 'COMPLIMENTARY';
    if (payload.discountType) return 'DISCOUNT';
    return 'REGULAR';
}
