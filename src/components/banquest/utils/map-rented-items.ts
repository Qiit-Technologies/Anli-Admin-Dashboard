import { addDays, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { BookingForm } from '../types';
import { RentedItemRow } from '../types/rented-item';
import { calculateAmenitiesSubtotal } from './banquet-pricing';

function parseEventDate(eventDate: string): Date | null {
    if (!eventDate) return null;
    try {
        const d = eventDate.includes('T')
            ? parseISO(eventDate)
            : parseISO(`${eventDate}T12:00:00`);
        return startOfDay(d);
    } catch {
        return null;
    }
}

function amenitiesQuantityTotal(amenities: BookingForm['amenities']): number {
    return amenities.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
}

function amountPaidForBooking(booking: BookingForm): number {
    const amenitiesTotal = calculateAmenitiesSubtotal(booking.amenities);
    if (booking.paymentStatus === 'paid') {
        return amenitiesTotal > 0 ? amenitiesTotal : Number(booking.total) || 0;
    }
    if (booking.paymentStatus === 'partial') {
        return amenitiesTotal > 0 ? amenitiesTotal * 0.5 : Number(booking.total) * 0.5;
    }
    return 0;
}

export function mapBookingToRentedItem(booking: BookingForm): RentedItemRow | null {
    const amenities = (booking.amenities ?? []).filter(
        (a) => Number(a.quantity) > 0 && String(a.name ?? '').trim(),
    );
    if (amenities.length === 0) return null;

    const eventDay = parseEventDate(booking.eventDate);
    const today = startOfDay(new Date());
    const isPastEvent = eventDay ? isBefore(eventDay, today) : false;
    const returnStatus = isPastEvent ? 'returned' : 'pending';

    const assignedDate = booking.eventDate;
    const returnedDate =
        returnStatus === 'returned' && eventDay
            ? format(addDays(eventDay, 0), 'yyyy-MM-dd')
            : null;

    return {
        id: booking.id,
        bookingId: booking.id,
        customerName: booking.customerName,
        eventName: booking.eventName,
        eventDate: booking.eventDate,
        assignedDate,
        returnedDate,
        amountPaid: amountPaidForBooking({ ...booking, amenities }),
        totalQuantity: amenitiesQuantityTotal(amenities),
        returnStatus,
        booking: { ...booking, amenities },
    };
}

export function mapBookingsToRentedItems(bookings: BookingForm[]): RentedItemRow[] {
    return bookings
        .map(mapBookingToRentedItem)
        .filter((row): row is RentedItemRow => row !== null)
        .sort((a, b) => {
            const da = parseEventDate(a.eventDate)?.getTime() ?? 0;
            const db = parseEventDate(b.eventDate)?.getTime() ?? 0;
            return db - da;
        });
}
