import {
    differenceInCalendarDays,
    format,
    isSameDay,
    parseISO,
    startOfDay,
} from 'date-fns';
import { BookingForm } from '../types';

export type EventLifecycleStatus = 'upcoming' | 'ongoing' | 'completed';

export function formatBookingRef(id: number): string {
    const hundreds = Math.floor(id / 1000);
    const remainder = id % 1000;
    return `Ref-${String(hundreds).padStart(3, '0')}-${String(remainder).padStart(3, '0')}`;
}

/** Parse event time from 12h (09:30 AM) or 24h (09:30) strings. */
export function parseEventHour(time?: string): number | null {
    if (!time) return null;
    const ampm = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampm) {
        let hour = parseInt(ampm[1], 10);
        const meridiem = ampm[3].toUpperCase();
        if (meridiem === 'PM' && hour !== 12) hour += 12;
        if (meridiem === 'AM' && hour === 12) hour = 0;
        return hour;
    }
    const h24 = time.match(/^(\d{1,2}):(\d{2})$/);
    if (h24) return parseInt(h24[1], 10);
    return null;
}

export function formatEventTimeDisplay(time?: string): string {
    if (!time) return '—';
    if (/AM|PM/i.test(time)) return time;
    const h24 = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!h24) return time;
    let hour = parseInt(h24[1], 10);
    const min = h24[2];
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${min} ${meridiem}`;
}

export function parseBookingEventDate(eventDate: string): Date | null {
    if (!eventDate) return null;
    try {
        return eventDate.includes('T')
            ? parseISO(eventDate)
            : parseISO(`${eventDate}T12:00:00`);
    } catch {
        return null;
    }
}

export function getEventLifecycleStatus(
    booking: Pick<BookingForm, 'eventDate' | 'bookingStatus'>,
): EventLifecycleStatus {
    if (booking.bookingStatus === 'cancelled') {
        return 'completed';
    }
    const eventDay = parseBookingEventDate(booking.eventDate);
    if (!eventDay) return 'upcoming';

    const today = startOfDay(new Date());
    const day = startOfDay(eventDay);

    if (isSameDay(day, today)) return 'ongoing';
    if (day < today) return 'completed';
    return 'upcoming';
}

export function formatEventDateCell(eventDate: string, eventTime?: string): {
    dateLine: string;
    timeLine: string;
    relativeLine: string;
} {
    const parsed = parseBookingEventDate(eventDate);
    if (!parsed) {
        return { dateLine: eventDate || '—', timeLine: eventTime || '', relativeLine: '' };
    }

    const dateLine = format(parsed, 'do-MMMM-yyyy').toLowerCase();
    const timeLine = formatEventTimeDisplay(eventTime);
    const days = differenceInCalendarDays(startOfDay(parsed), startOfDay(new Date()));

    let relativeLine = '';
    if (days > 0) {
        relativeLine = `(in ${days} day${days === 1 ? '' : 's'})`;
    } else if (days === 0) {
        relativeLine = '(today)';
    } else {
        relativeLine = `(${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago)`;
    }

    return { dateLine, timeLine, relativeLine };
}

export function paymentStatusLabel(
    status: BookingForm['paymentStatus'] | undefined,
): string {
    switch (status) {
        case 'paid':
            return 'Paid';
        case 'partial':
            return 'Partially Paid';
        default:
            return 'Unpaid';
    }
}

export function bookingStatusLabel(
    status: BookingForm['bookingStatus'] | undefined,
): string {
    switch (status) {
        case 'confirmed':
            return 'Approved';
        case 'cancelled':
            return 'Cancelled';
        default:
            return 'Tentative';
    }
}

export function eventStatusLabel(status: EventLifecycleStatus): string {
    switch (status) {
        case 'ongoing':
            return 'Ongoing';
        case 'completed':
            return 'Completed';
        default:
            return 'Upcoming';
    }
}

export interface BookingListStats {
    total: number;
    upcoming: number;
    today: number;
    completed: number;
}

export function computeBookingListStats(
    bookings: BookingForm[],
): BookingListStats {
    let upcoming = 0;
    let todayCount = 0;
    let completed = 0;

    for (const b of bookings) {
        if (b.bookingStatus === 'cancelled') continue;
        const lifecycle = getEventLifecycleStatus(b);
        if (lifecycle === 'ongoing') todayCount += 1;
        else if (lifecycle === 'upcoming') upcoming += 1;
        else completed += 1;
    }

    return {
        total: bookings.length,
        upcoming,
        today: todayCount,
        completed,
    };
}
