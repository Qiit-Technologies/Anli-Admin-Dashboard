import { BookingForm } from '../../types';
import { CalendarEventBlock, CalendarVenueRow } from './types';

function toEventBlock(booking: BookingForm): CalendarEventBlock {
    return {
        id: booking.id,
        title: booking.eventName,
        venue: booking.eventVenue,
        eventDate: booking.eventDate,
        eventTime: booking.eventTime,
        customerName: booking.customerName,
        customerPhone: booking.customerPhoneNumber,
        customerEmail: booking.customerEmailAddress,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        total: Number(booking.total) || 0,
        booking,
    };
}

export function mapBookingsToVenueRows(
    bookings: BookingForm[],
): CalendarVenueRow[] {
    const active = bookings.filter((b) => b.bookingStatus !== 'cancelled');
    const byVenue = new Map<string, CalendarEventBlock[]>();

    for (const booking of active) {
        const venue = booking.eventVenue?.trim() || 'Unassigned venue';
        const list = byVenue.get(venue) ?? [];
        list.push(toEventBlock(booking));
        byVenue.set(venue, list);
    }

    return Array.from(byVenue.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, events]) => ({
            id: name,
            name,
            events: events.sort((x, y) =>
                `${x.eventDate}${x.eventTime}`.localeCompare(
                    `${y.eventDate}${y.eventTime}`,
                ),
            ),
        }));
}
