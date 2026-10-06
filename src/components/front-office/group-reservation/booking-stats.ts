import type { GroupBooking } from './types';

/** Void stays are off the books, so they never hold a group on a work list. */
function liveGuests(booking: GroupBooking) {
    return booking.guests.filter((guest) => !guest.isVoid);
}

export function isGroupVoided(booking: GroupBooking) {
    if (booking.isVoid) return true;
    return booking.guests.length > 0 && liveGuests(booking).length === 0;
}

/** After bulk check-in, the group belongs on Check Ins and Outs, not Reservations. */
export function isGroupFullyCheckedIn(booking: GroupBooking) {
    const live = liveGuests(booking);
    if (!live.length) return false;
    return live.every((guest) => guest.stayStatus === 'checked-in');
}

export function shouldShowGroupOnReservationsList(booking: GroupBooking) {
    if (isGroupVoided(booking)) return false;
    return !isGroupFullyCheckedIn(booking);
}

/**
 * Deleting pulls the rooms back, so it is only blocked while someone is still
 * in-house. A past or fully checked-out group stays deletable.
 */
export function canDeleteGroupReservation(booking: GroupBooking) {
    return !booking.guests.some((guest) => guest.stayStatus === 'checked-in');
}

export function bookingStats(booking: GroupBooking) {
    const guests = booking.guests.length;
    const checkedIn = booking.guests.filter(
        (g) => g.stayStatus === 'checked-in',
    ).length;
    const checkedOut = booking.guests.filter(
        (g) => g.stayStatus === 'checked-out',
    ).length;
    const expected = booking.guests.filter(
        (g) => g.stayStatus === 'expected',
    ).length;
    return {
        guests,
        rooms: booking.roomCount,
        checkedIn,
        checkedOut,
        expected,
    };
}
