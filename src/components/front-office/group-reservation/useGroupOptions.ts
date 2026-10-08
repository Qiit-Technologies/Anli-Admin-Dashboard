'use client';

import { getRoomByHotelId } from '@/app/actions/room';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import { useEffect, useState } from 'react';
import type { RoomTypeOption } from './types';

export type SelectOption = { value: string; label: string };

export type RoomStayBooking = {
    startDate?: string;
    endDate?: string;
    isVoid?: boolean;
    isCheckedOut?: boolean;
    fullName?: string;
};

export type RoomRecord = {
    id: number;
    roomNumber: string;
    roomTypeId: string;
    price: number;
    vacant: boolean;
    guests: RoomStayBooking[];
};

export function compareRoomNumbers(a: string, b: string) {
    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base',
    });
}

/** Same date-overlap rule as regular reservation room picks. */
export function isRoomFreeForStay(
    room: RoomRecord,
    startDate?: Date | null,
    endDate?: Date | null,
) {
    if (!startDate || !endDate) return false;
    const selectedStart = new Date(startDate);
    const selectedEnd = new Date(endDate);
    if (
        Number.isNaN(selectedStart.getTime()) ||
        Number.isNaN(selectedEnd.getTime()) ||
        !(selectedStart < selectedEnd)
    ) {
        return false;
    }
    if (!room.guests || room.guests.length === 0) return true;
    return !room.guests.some((guest) => {
        if (
            !guest.startDate ||
            !guest.endDate ||
            guest.isVoid === true ||
            guest.isCheckedOut === true
        ) {
            return false;
        }
        const guestStart = new Date(guest.startDate);
        const guestEnd = new Date(guest.endDate);
        return guestStart < selectedEnd && guestEnd > selectedStart;
    });
}

/**
 * Rooms of a type that are free for the stay dates.
 * Matches regular reservation: no dates → empty list; booked rooms stay hidden.
 */
export function roomsForType(
    rooms: RoomRecord[],
    roomTypeId: string,
    startDate?: Date | null,
    endDate?: Date | null,
) {
    if (!roomTypeId) return [];
    const ofType = rooms.filter((room) => room.roomTypeId === roomTypeId);
    if (!startDate || !endDate) {
        return [];
    }
    return ofType
        .filter((room) => isRoomFreeForStay(room, startDate, endDate))
        .sort((a, b) => compareRoomNumbers(a.roomNumber, b.roomNumber));
}

export function roomNumberPlaceholder(
    roomTypeId: string,
    optionCount: number,
    hasStayDates = true,
) {
    if (!roomTypeId) return 'Select room type first';
    if (!hasStayDates) return 'Select arrival and departure first';
    if (optionCount === 0) return 'No rooms free for these dates';
    return 'Select room Number';
}

function isVacant(room: any) {
    return (
        room?.status === 'AVAIL' && !room?.isBooked && !room?.isOccupied
    );
}

type Inventory = { roomTypes: RoomTypeOption[]; rooms: RoomRecord[] };

let inventoryRequest: Promise<Inventory> | null = null;

/** Shared across the page and every action dialog, so inventory loads once. */
function loadInventory(): Promise<Inventory> {
    if (inventoryRequest) return inventoryRequest;

    inventoryRequest = (async () => {
        const [typeResult, roomResult] = await Promise.all([
            getRoomTypesByHotelId(),
            getRoomByHotelId(),
        ]);

        const roomRows: any[] = Array.isArray(
            (roomResult as { data?: any[] })?.data,
        )
            ? ((roomResult as { data?: any[] }).data as any[])
            : [];
        const priceByTypeId = new Map<string, number>();
        const roomMetaById = new Map<
            number,
            { price: number; vacant: boolean }
        >();
        roomRows.forEach((room) => {
            const id = Number(room?.id);
            if (!Number.isFinite(id)) return;
            roomMetaById.set(id, {
                price: Number(room?.price ?? 0),
                vacant: isVacant(room),
            });
            const typeId = room?.roomtype?.id;
            const price = Number(room?.price ?? 0);
            if (!typeId || !price) return;
            const key = String(typeId);
            const current = priceByTypeId.get(key);
            if (current === undefined || price < current) {
                priceByTypeId.set(key, price);
            }
        });

        const typeRows: any[] = Array.isArray(
            typeof typeResult === 'object' && typeResult
                ? (typeResult as { data?: any[] }).data
                : null,
        )
            ? ((typeResult as { data?: any[] }).data as any[])
            : [];

        // Same guest set as regular reservation: all non-void / non-checked-out
        // stays on each room (from /roomtypes), not only checked-in guests.
        const rooms: RoomRecord[] = [];
        typeRows.forEach((type) => {
            const typeId = String(type?.id ?? '');
            const nestedRooms: any[] = Array.isArray(type?.rooms)
                ? type.rooms
                : [];
            nestedRooms.forEach((room) => {
                if (!room?.roomNumber) return;
                const id = Number(room?.id);
                const meta = roomMetaById.get(id);
                const guests = Array.isArray(room?.guests) ? room.guests : [];
                rooms.push({
                    id,
                    roomNumber: String(room.roomNumber),
                    roomTypeId: typeId,
                    price: meta?.price ?? Number(room?.price ?? 0),
                    vacant: meta?.vacant ?? isVacant(room),
                    guests: guests.map(
                        (guest: {
                            startDate?: string;
                            endDate?: string;
                            isVoid?: boolean;
                            isCheckedOut?: boolean;
                            fullName?: string;
                        }) => ({
                            startDate: guest?.startDate,
                            endDate: guest?.endDate,
                            isVoid: guest?.isVoid,
                            isCheckedOut: guest?.isCheckedOut,
                            fullName: guest?.fullName,
                        }),
                    ),
                });
            });
        });

        if (rooms.length === 0) {
            roomRows.forEach((room) => {
                if (!room?.roomNumber) return;
                rooms.push({
                    id: Number(room?.id),
                    roomNumber: String(room.roomNumber),
                    roomTypeId: String(room?.roomtype?.id ?? ''),
                    price: Number(room?.price ?? 0),
                    vacant: isVacant(room),
                    guests: [],
                });
            });
        }

        return {
            roomTypes: typeRows.map((row) => ({
                id: String(row?.id),
                name: row?.name || 'Room type',
                pricePerNight: priceByTypeId.get(String(row?.id)) ?? 0,
            })),
            rooms,
        };
    })().catch((error) => {
        // Let the next caller retry instead of caching the failure.
        inventoryRequest = null;
        throw error;
    });

    return inventoryRequest;
}

/**
 * Room types and assignable room numbers for the group reservation forms.
 * Nightly rate lives on the room, not the room type, so it is derived from the
 * cheapest room of each type. A failed lookup yields empty selects rather than
 * stale inventory.
 */
export function useGroupOptions() {
    const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
    const [rooms, setRooms] = useState<RoomRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const inventory = await loadInventory();
                if (!active) return;
                setRoomTypes(inventory.roomTypes);
                setRooms(inventory.rooms);
            } catch {
                if (active) {
                    setRoomTypes([]);
                    setRooms([]);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        void load();
        return () => {
            active = false;
        };
    }, []);

    const roomTypeOptions: SelectOption[] = (roomTypes ?? []).map((room) => ({
        value: room.id,
        label: room.name,
    }));

    // Occupancy flags are often stale, so offer vacant rooms first and fall
    // back to the full list rather than an empty select.
    const vacant = rooms.filter((room) => room.vacant);
    const assignable = vacant.length > 0 ? vacant : rooms;
    const roomNumberOptions: SelectOption[] = [...assignable]
        .sort((a, b) => compareRoomNumbers(a.roomNumber, b.roomNumber))
        .map((room) => ({
            value: room.roomNumber,
            label: room.roomNumber,
        }));

    const roomByNumber = (roomNumber: string) =>
        rooms.find((room) => room.roomNumber === roomNumber) || null;

    return {
        roomTypes,
        roomTypeOptions,
        rooms,
        roomNumberOptions,
        roomByNumber,
        loading,
    };
}
