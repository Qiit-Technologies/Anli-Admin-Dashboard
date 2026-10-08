import { BookingForm } from '../types';
import {
    calculateBanquetPricing,
    calculateAmenitiesSubtotal,
    calculateFoodSubtotal,
    formatMoney,
    lineTotal,
} from '../utils/banquet-pricing';
import {
    bookingStatusLabel,
    eventStatusLabel,
    formatBookingRef,
    formatEventTimeDisplay,
    getEventLifecycleStatus,
    parseBookingEventDate,
    paymentStatusLabel,
} from '../utils/booking-display';
import { format } from 'date-fns';

export type PaymentPlanOption = 'full' | 'partial' | 'later';

export interface BookingDetailModel {
    booking: BookingForm;
    ref: string;
    createdLabel: string;
    eventDateLabel: string;
    eventTimeLabel: string;
    bookingStatus: string;
    paymentStatus: string;
    eventStatus: string;
    pricing: ReturnType<typeof calculateBanquetPricing>;
    foodSubtotal: number;
    amenitiesSubtotal: number;
    totalAmount: number;
    amountPaid: number;
    outstandingBalance: number;
    paymentPlan: PaymentPlanOption;
    guestCountLabel: string;
    customerDisplayName: string;
    vipNotes: string;
}

export function formatEventDateLong(eventDate: string): string {
    const parsed = parseBookingEventDate(eventDate);
    if (!parsed) return eventDate || '—';
    return format(parsed, 'do-MMMM-yyyy').toLowerCase();
}

export function formatCreatedLabel(
    id: number,
    raw?: Record<string, unknown>,
): string {
    const ref = formatBookingRef(id);
    const createdAt = raw?.createdAt ?? raw?.created_at;
    if (createdAt) {
        try {
            const d = new Date(String(createdAt));
            return `Created on ${format(d, 'MMM-dd-yyyy')} . ${ref}`;
        } catch {
            return ref;
        }
    }
    return ref;
}

export function derivePaymentPlan(
    status: BookingForm['paymentStatus'],
    plan?: BookingForm['paymentPlan'],
): PaymentPlanOption {
    if (plan) return plan;
    if (status === 'paid') return 'full';
    if (status === 'partial') return 'partial';
    return 'later';
}

export function buildBookingDetailModel(
    booking: BookingForm,
    raw?: Record<string, unknown>,
): BookingDetailModel {
    const amenities = (booking.amenities ?? []).filter(
        (a) => Number(a.quantity) > 0,
    );
    const food = (booking.food ?? []).filter((f) => Number(f.quantity) > 0);

    const serviceChargePercent = booking.serviceChargePercent ?? 10;
    const vatPercent = booking.vatPercent ?? 7.5;

    const pricing = calculateBanquetPricing(
        amenities,
        food,
        Number(booking.discount) || 0,
        { serviceChargePercent, vatPercent },
    );

    const totalAmount = Number(booking.total) || pricing.total;
    let amountPaid = Number(booking.amountPaid) || 0;
    if (amountPaid <= 0) {
        if (booking.paymentStatus === 'paid') {
            amountPaid = totalAmount;
        } else if (booking.paymentStatus === 'partial') {
            amountPaid = Math.min(totalAmount, totalAmount * 0.5);
        }
    }

    const guestCount = booking.estimatedGuestCount?.trim();
    const guestQty = food.reduce((s, f) => s + (Number(f.quantity) || 0), 0);
    const guestCountLabel = guestCount
        ? `${guestCount} guest${guestCount === '1' ? '' : 's'}`
        : guestQty > 0
          ? `${guestQty} guest${guestQty === 1 ? '' : 's'}`
          : '—';

    const customerDisplayName = [booking.customerTitle, booking.customerName]
        .filter(Boolean)
        .join(' ')
        .trim();

    const vipNotes =
        String(
            booking.customerNotes ??
                raw?.customerNotes ??
                booking.amenitiesSpecialInstructions ??
                raw?.amenitiesSpecialInstructions ??
                '',
        ).trim() ||
        String(
            booking.menuSpecialInstructions ?? raw?.menuSpecialInstructions ?? '',
        ).trim();

    return {
        booking,
        ref: formatBookingRef(booking.id),
        createdLabel: formatCreatedLabel(booking.id, raw),
        eventDateLabel: formatEventDateLong(booking.eventDate),
        eventTimeLabel: formatEventTimeDisplay(booking.eventTime),
        bookingStatus: bookingStatusLabel(booking.bookingStatus),
        paymentStatus: paymentStatusLabel(booking.paymentStatus),
        eventStatus: eventStatusLabel(getEventLifecycleStatus(booking)),
        pricing,
        foodSubtotal: calculateFoodSubtotal(food),
        amenitiesSubtotal: calculateAmenitiesSubtotal(amenities),
        totalAmount,
        amountPaid,
        outstandingBalance: Math.max(0, totalAmount - amountPaid),
        paymentPlan: derivePaymentPlan(
            booking.paymentStatus,
            booking.paymentPlan ?? undefined,
        ),
        guestCountLabel,
        customerDisplayName,
        vipNotes,
    };
}

export function menuLineItems(booking: BookingForm) {
    return (booking.food ?? [])
        .filter((f) => Number(f.quantity) > 0 && f.name?.trim())
        .map((f) => ({
            id: f.id,
            name: f.name,
            detail: `${f.quantity} * ${formatMoney(Number(f.cost))}`,
            amount: formatMoney(lineTotal(f.cost, f.quantity)),
        }));
}

export function amenityLineItems(booking: BookingForm) {
    return (booking.amenities ?? [])
        .filter((a) => Number(a.quantity) > 0 && a.name?.trim())
        .map((a) => ({
            id: a.id,
            name: a.name,
            detail: `${a.quantity} * ${formatMoney(Number(a.cost))}`,
            amount: formatMoney(lineTotal(a.cost, a.quantity)),
        }));
}
