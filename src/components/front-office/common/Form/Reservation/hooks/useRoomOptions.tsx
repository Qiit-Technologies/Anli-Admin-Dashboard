import { useMemo } from 'react';
import { FormValues } from '../types';

interface Room {
    roomNumber: number;
    status: string;
    guests?: Guest[];
}

interface Guest {
    startDate?: string;
    endDate?: string;
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
    isVoid?: boolean;
}

interface UseRoomOptionsProps {
    formData: Partial<FormValues>;
    roomTypes: any[];
    mode: 'add' | 'update';
}

export const useRoomOptions = ({
    formData,
    roomTypes,
    mode,
}: UseRoomOptionsProps) => {
    const { roomOptions, filteredRooms } = useMemo(() => {
        if (
            !formData.roomtype ||
            !roomTypes ||
            roomTypes.length === 0 ||
            (mode === 'add' && (!formData.startDate || !formData.endDate))
        ) {
            return { roomOptions: [], filteredRooms: [] };
        }

        const selectedRoomType = roomTypes.find(
            (rt) => rt.id === formData.roomtype,
        );
        if (!selectedRoomType) return { roomOptions: [], filteredRooms: [] };

        let roomsToUse: Room[] = Array.isArray(selectedRoomType.rooms)
            ? selectedRoomType.rooms
            : [];

        if (mode === 'add') {
            const selectedStart = new Date(formData.startDate!);
            const selectedEnd = new Date(formData.endDate!);

            roomsToUse = roomsToUse.filter((room: Room) => {
                // Allow DIRTY and MAINTENANCE rooms to be booked
                if (!room.guests || room.guests.length === 0) return true;

                const hasOverlappingBooking = room.guests.some(
                    (guest: Guest) => {
                        if (
                            !guest.startDate ||
                            !guest.endDate ||
                            guest.isVoid === true ||
                            guest.isCheckedOut === true
                        )
                            return false;
                        const guestStart = new Date(guest.startDate);
                        const guestEnd = new Date(guest.endDate);

                        return (
                            guestStart < selectedEnd && guestEnd > selectedStart
                        );
                    },
                );

                return !hasOverlappingBooking;
            });
        }

        const roomOptions = roomsToUse.map((room) => ({
            value: room.roomNumber.toString(),
            label: `${room.roomNumber}`,
        }));

        return { roomOptions, filteredRooms: roomsToUse };
    }, [
        mode,
        formData.roomtype,
        formData.startDate,
        formData.endDate,
        roomTypes,
    ]);

    return { roomOptions, filteredRooms };
};
