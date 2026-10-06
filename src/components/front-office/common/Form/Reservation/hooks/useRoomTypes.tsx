import { getRoomTypesByHotelId } from '@/app/actions/roomType';
import { useEffect, useState } from 'react';
export const useRoomTypes = () => {
    const [roomTypes, setRoomTypes] = useState<
        { id: number; name: string; rooms: any[] }[]
    >([]);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(
        null,
    );
    const [selectedRoomType, setSelectedRoomType] = useState<any | null>(null);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            const result = await getRoomTypesByHotelId();
            if (result && typeof result !== 'boolean' && result.data) {
                setRoomTypes(Array.isArray(result.data) ? result.data : []);
            }
        };
        fetchRoomTypes();
    }, []);

    return {
        roomTypes,
        setRoomTypes,
        selectedRoom,
        setSelectedRoom,
        selectedRoomTypeId,
        setSelectedRoomTypeId,
        selectedRoomType,
        setSelectedRoomType,
    };
};
