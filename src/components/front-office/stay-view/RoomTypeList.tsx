'use client';

import useHotel from '@/hooks/useHotel';
import { ROOM } from '@/types';
import { RoomTypeSection } from './room-type-section';

interface RoomTypeListProps {
    rooms: ROOM[];
    reservations: any[];
}

export function RoomTypeList({ rooms, reservations }: RoomTypeListProps) {
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;
    const safeRooms = Array.isArray(rooms) ? rooms : [];

    if (safeRooms.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">No rooms available to display.</p>
            </div>
        );
    }

    const getReservations = (roomNumber: number | string) => {
        if (
            !Array.isArray(reservations) ||
            reservations.length < 1 ||
            !roomNumber
        )
            return [];

        const rsv = reservations.filter((res) => res?.roomNumber === roomNumber);
        const rst = rsv.map((res) => {
            return {
                id: res.id || `res-${Math.random().toString(36).substr(2, 9)}`,
                fullName: res.fullName,
                startDate: res.startDate,
                endDate: res.endDate,
                status: res.status || 'confirmed',
                roomNumber: res.roomNumber,
                isCheckedIn: res.isCheckedIn,
                isCheckedOut: res.isCheckedOut,
                email: res.email,
                phoneNumber: res.phoneNumber,
                amountPaid: res.amountPaid,
                outstanding: res.outstanding,
                roomType: res.roomType,
                paymentMethod: res.paymentMethod,
            };
        });

        return rst.length > 0 ? rst : [];
    };

    const roomTypesSet = new Set();

    safeRooms.forEach((room) => {
        if (room && room.roomtype && room.roomtype.id) {
            roomTypesSet.add(room.roomtype.id);
        }
    });

    return (
        <div className="divide-y relative">
            {Array.from(roomTypesSet).map((roomTypeId: any) => {
                const roomTypeInfo = safeRooms.find(
                    (r) => r?.roomtype?.id === roomTypeId,
                )?.roomtype;

                if (!roomTypeInfo) return null;

                return (
                    <RoomTypeSection
                        key={roomTypeId.toString()}
                        roomType={{
                            id: roomTypeId.toString(),
                            name: roomTypeInfo.name,
                            rooms: safeRooms
                                .filter((rm) => rm?.roomtype?.id === roomTypeId)
                                .map((rm) => {
                                    return {
                                        id: rm.id?.toString() || '',
                                        number: rm.roomNumber?.toString() || '',
                                        reservations: getReservations(
                                            rm.roomNumber,
                                        ),
                                        roomCapacity: rm.roomCapacity || 0,
                                        isDirty: rm.isDirty || false,
                                        price: rm.price || '',
                                        floor: rm.floor || 0,
                                        roomNumberRoman: showRoman
                                            ? rm.roomNumberRoman || ''
                                            : '',
                                    };
                                }),
                        }}
                    />
                );
            })}
        </div>
    );
}
