import type { DraftInvoiceLineItem } from '@/types/draft-invoice';

export interface QuotationRoomLine {
    roomTypeId: number;
    quantity: number;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
}

export interface QuotationRoomEntry {
    roomTypeId: number;
    quantity: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
}

type RoomTypeRef = {
    id: number;
    name?: string;
    rooms?: Array<{ price?: number }>;
};

export function getRoomNightlyRate(
    roomTypes: RoomTypeRef[],
    roomTypeId: number,
    selectedRoom?: any,
): number {
    if (
        selectedRoom &&
        selectedRoom.price !== undefined &&
        selectedRoom.price !== null
    ) {
        return Number(selectedRoom.price);
    }
    const roomType = (roomTypes ?? []).find(
        (rt) => Number(rt.id) === Number(roomTypeId),
    );
    return Number(roomType?.rooms?.[0]?.price ?? 0);
}

export function getRoomTypeName(
    roomTypes: RoomTypeRef[],
    roomTypeId: number,
): string {
    return (
        (roomTypes ?? []).find((rt) => Number(rt.id) === Number(roomTypeId))
            ?.name || 'Room'
    );
}

export function calculateNightsFromDates(
    startDate?: string,
    endDate?: string,
): number {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const msPerDay = 1000 * 60 * 60 * 24;

    if (!start || !end) return 1;

    const diffDays = Math.floor((end.getTime() - start.getTime()) / msPerDay);
    return Math.max(diffDays, 1);
}

export function normalizeQuotationRooms(value: unknown): QuotationRoomLine[] {
    if (!Array.isArray(value)) return [];

    return value
        .map((entry) => ({
            roomTypeId: Number((entry as QuotationRoomLine)?.roomTypeId ?? 0),
            quantity: Math.max(
                1,
                Number((entry as QuotationRoomLine)?.quantity ?? 1),
            ),
            startDate: (entry as QuotationRoomLine)?.startDate
                ? String((entry as QuotationRoomLine).startDate).slice(0, 10)
                : undefined,
            endDate: (entry as QuotationRoomLine)?.endDate
                ? String((entry as QuotationRoomLine).endDate).slice(0, 10)
                : undefined,
            startTime: (entry as QuotationRoomLine)?.startTime
                ? String((entry as QuotationRoomLine).startTime).slice(0, 5)
                : undefined,
            endTime: (entry as QuotationRoomLine)?.endTime
                ? String((entry as QuotationRoomLine).endTime).slice(0, 5)
                : undefined,
        }))
        .filter((entry) => entry.roomTypeId > 0);
}

/** All reservation lines — prefers unified `reservationLines`, falls back to legacy primary + additional. */
export function resolveReservationLines(
    formData: Record<string, unknown>,
): QuotationRoomLine[] {
    const unified = normalizeQuotationRooms(formData.reservationLines);
    if (unified.length) return unified;

    const primaryRoomTypeId = Number(formData.roomtype ?? 0);
    const primaryStart = String(formData.startDate || '');
    const primaryEnd = String(formData.endDate || '');
    const additional = normalizeQuotationRooms(formData.quotationRooms);
    const lines: QuotationRoomLine[] = [];

    if (primaryRoomTypeId > 0) {
        lines.push({
            roomTypeId: primaryRoomTypeId,
            quantity: 1,
            startDate: primaryStart,
            endDate: primaryEnd,
            startTime: formData.startTime
                ? String(formData.startTime).slice(0, 5)
                : undefined,
            endTime: formData.endTime
                ? String(formData.endTime).slice(0, 5)
                : undefined,
        });
    }

    lines.push(...additional);
    return lines;
}

export function buildQuotationRoomEntries(
    formData: Record<string, unknown>,
): QuotationRoomEntry[] {
    return resolveReservationLines(formData).map((line) => ({
        roomTypeId: line.roomTypeId,
        quantity: line.quantity,
        startDate: line.startDate || '',
        endDate: line.endDate || '',
        startTime: line.startTime,
        endTime: line.endTime,
    }));
}

export function calculateQuotationSubtotal(
    formData: Record<string, unknown>,
    roomTypes: RoomTypeRef[],
    _nights?: number,
    selectedRoom?: any,
): number {
    const primaryRoomTypeId = Number(formData.roomtype ?? 0);
    return buildQuotationRoomEntries(formData).reduce((sum, entry) => {
        const nights = calculateNightsFromDates(entry.startDate, entry.endDate);
        let rate: number;
        if (selectedRoom && Number(entry.roomTypeId) === primaryRoomTypeId) {
            rate = getRoomNightlyRate(
                roomTypes,
                entry.roomTypeId,
                selectedRoom,
            );
        } else {
            rate = getRoomNightlyRate(roomTypes, entry.roomTypeId);
        }
        return sum + rate * nights * entry.quantity;
    }, 0);
}

export function buildDraftLineItems(
    formData: Record<string, unknown>,
    roomTypes: RoomTypeRef[],
    selectedRoom?: any,
): DraftInvoiceLineItem[] {
    const primaryRoomTypeId = Number(formData.roomtype ?? 0);
    return buildQuotationRoomEntries(formData).map((entry) => {
        const nights = calculateNightsFromDates(entry.startDate, entry.endDate);
        let ratePerNight: number;
        if (selectedRoom && Number(entry.roomTypeId) === primaryRoomTypeId) {
            ratePerNight = getRoomNightlyRate(
                roomTypes,
                entry.roomTypeId,
                selectedRoom,
            );
        } else {
            ratePerNight = getRoomNightlyRate(roomTypes, entry.roomTypeId);
        }
        return {
            roomTypeId: entry.roomTypeId,
            roomTypeName: getRoomTypeName(roomTypes, entry.roomTypeId),
            quantity: entry.quantity,
            ratePerNight,
            nights,
            checkInDate: entry.startDate,
            checkOutDate: entry.endDate,
            checkInTime: entry.startTime,
            checkOutTime: entry.endTime,
            subtotal: ratePerNight * nights * entry.quantity,
        };
    });
}

export function resolveDocumentDateRange(lineItems: DraftInvoiceLineItem[]): {
    checkInDate: string;
    checkOutDate: string;
} {
    const checkIns = lineItems
        .map((item) => item.checkInDate)
        .filter((value): value is string => !!value);
    const checkOuts = lineItems
        .map((item) => item.checkOutDate)
        .filter((value): value is string => !!value);

    if (!checkIns.length || !checkOuts.length) {
        return { checkInDate: '', checkOutDate: '' };
    }

    return {
        checkInDate: [...checkIns].sort()[0],
        checkOutDate: [...checkOuts].sort().at(-1) ?? '',
    };
}

export function lineItemsToReservationLines(
    lineItems: DraftInvoiceLineItem[],
): QuotationRoomLine[] {
    return lineItems.map((item) => ({
        roomTypeId: item.roomTypeId,
        quantity: Math.max(1, Number(item.quantity ?? 1)),
        startDate: item.checkInDate?.slice(0, 10),
        endDate: item.checkOutDate?.slice(0, 10),
        startTime: item.checkInTime?.slice(0, 5),
        endTime: item.checkOutTime?.slice(0, 5),
    }));
}

/** @deprecated Use lineItemsToReservationLines — kept for legacy payload hydration. */
export function deriveQuotationRoomsFromLineItems(
    lineItems: DraftInvoiceLineItem[],
    primaryRoomTypeId: number,
): QuotationRoomLine[] {
    let skippedPrimary = false;
    const additional: QuotationRoomLine[] = [];

    for (const item of lineItems) {
        if (
            !skippedPrimary &&
            Number(item.roomTypeId) === Number(primaryRoomTypeId)
        ) {
            skippedPrimary = true;
            continue;
        }

        additional.push({
            roomTypeId: item.roomTypeId,
            quantity: Math.max(1, Number(item.quantity ?? 1)),
            startDate: item.checkInDate?.slice(0, 10),
            endDate: item.checkOutDate?.slice(0, 10),
            startTime: item.checkInTime?.slice(0, 5),
            endTime: item.checkOutTime?.slice(0, 5),
        });
    }

    return additional;
}

export function defaultReservationLine(
    startDate: string,
    endDate: string,
): QuotationRoomLine {
    return {
        roomTypeId: 0,
        quantity: 1,
        startDate,
        endDate,
        startTime: '14:00',
        endTime: '12:00',
    };
}

export function syncLegacyFormFieldsFromLines(
    lines: QuotationRoomLine[],
): Record<string, unknown> {
    const first = lines[0];
    if (!first) {
        return {
            roomtype: 0,
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            quotationRooms: [],
        };
    }

    return {
        roomtype: first.roomTypeId,
        startDate: first.startDate || '',
        endDate: first.endDate || '',
        startTime: first.startTime || '',
        endTime: first.endTime || '',
        quotationRooms: lines.slice(1),
    };
}
