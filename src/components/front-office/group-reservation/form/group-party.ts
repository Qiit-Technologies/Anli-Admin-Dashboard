import type { AllocatedRoom, GroupGuestDraft } from '../types';
import type { RoomRecord } from '../useGroupOptions';
import { isRoomFreeForStay } from '../useGroupOptions';

export type ResolvedStay = {
    guest: GroupGuestDraft;
    roomNumber: string;
    roomTypeId: string;
};

export function digitsOnly(value: string) {
    return value.replace(/\D/g, '');
}

export function isValidGroupPhone(value: string) {
    return digitsOnly(value).length === 11;
}

/** Calendar day key in local time — matches validate/create date-only APIs. */
export function stayDateKey(value: Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Allocation room number wins; room type comes from the allocated slot when
 * present so type and number cannot drift apart.
 */
export function resolveStay(
    guest: GroupGuestDraft,
    rooms: AllocatedRoom[],
): ResolvedStay {
    const allocated = rooms.find((room) => room.guestIds.includes(guest.id));
    return {
        guest,
        roomNumber: (allocated?.roomNumber || guest.roomNumber || '').trim(),
        roomTypeId: (
            allocated?.roomTypeId ||
            guest.roomTypeId ||
            ''
        ).trim(),
    };
}

/**
 * Problems that would make the reservation API reject or drop a guest.
 * Returned before any write so the draft stays intact.
 */
export function groupPartyErrors({
    arrivalDate,
    departureDate,
    guests,
    rooms,
    allowPastArrival,
    requireRooms = true,
    inventory,
}: {
    arrivalDate: Date | undefined;
    departureDate: Date | undefined;
    guests: GroupGuestDraft[];
    rooms: AllocatedRoom[];
    allowPastArrival: boolean;
    requireRooms?: boolean;
    inventory?: RoomRecord[];
}): string[] {
    const errors: string[] = [];
    if (!arrivalDate || !departureDate) {
        errors.push('Arrival and departure dates are required.');
        return errors;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrival = new Date(arrivalDate);
    arrival.setHours(0, 0, 0, 0);
    const departure = new Date(departureDate);
    departure.setHours(0, 0, 0, 0);
    if (arrival < today && !allowPastArrival) {
        errors.push(
            'Start date cannot be in the past. Please select a future date.',
        );
    }
    if (arrival >= departure) {
        errors.push('Start date must be before end date.');
    }
    if (guests.length < 1) {
        errors.push('Add at least one guest before creating the group.');
        return errors;
    }

    const seenRooms = new Set<string>();
    guests.forEach((guest) => {
        const name = guest.name.trim() || 'Guest';
        const stay = resolveStay(guest, rooms);
        if (guest.name.trim().length < 2) {
            errors.push(`${name}: full name must be at least 2 characters.`);
        }
        if (!isValidGroupPhone(guest.phoneNumber)) {
            errors.push(`${name}: phone number must be exactly 11 digits.`);
        }
        if (!stay.roomTypeId) {
            errors.push(`${name}: choose a room type.`);
        }
        if (!requireRooms) return;
        if (!stay.roomNumber) {
            errors.push(`${name}: assign a room before creating the group.`);
            return;
        }
        if (seenRooms.has(stay.roomNumber)) {
            errors.push(
                `${name}: room ${stay.roomNumber} is assigned to more than one guest.`,
            );
            return;
        }
        seenRooms.add(stay.roomNumber);

        if (inventory && stay.roomTypeId) {
            const match = inventory.find(
                (room) => room.roomNumber === stay.roomNumber,
            );
            if (!match) {
                errors.push(`${name}: room ${stay.roomNumber} was not found.`);
                return;
            }
            if (match.roomTypeId !== stay.roomTypeId) {
                errors.push(
                    `${name}: room ${stay.roomNumber} does not match the selected room type.`,
                );
                return;
            }
            if (
                !isRoomFreeForStay(match, arrivalDate, departureDate)
            ) {
                const who =
                    match.guests.find(
                        (booking) =>
                            booking.fullName &&
                            !booking.isVoid &&
                            !booking.isCheckedOut,
                    )?.fullName || 'another guest';
                errors.push(
                    `${name}: room ${stay.roomNumber} is already booked for these dates (${who}).`,
                );
            }
        }
    });
    return errors;
}

function lagosDay(value: string | Date) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Lagos',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(value));
}

function nextDay(yyyymmdd: string) {
    const [year, month, day] = yyyymmdd.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
}

/** Check-in opens the evening before arrival, and on every day after that. */
export function checkInBlockReason(startDate?: string | null) {
    if (!startDate) return null;
    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return null;
    const arrival = lagosDay(start);
    const earliest = nextDay(lagosDay(new Date()));
    if (arrival > earliest) {
        return `Check-in is only allowed on or after ${start.toLocaleDateString('en-US', { timeZone: 'Africa/Lagos', month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return null;
}
