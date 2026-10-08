'use client';
import { getRoomTypesByHotelId } from '@/app/actions/roomType';

import useSWR from 'swr';

const useRoomTypes = () => {
    const { data } = useSWR<{ id: number; name: string }[]>(
        '/roomTypes',
        async () => {
            const result = await getRoomTypesByHotelId();
            if (result && typeof result !== 'boolean' && result.data) {
                return Array.isArray(result.data) ? result.data : [];
            }
            return [];
        },
        { fallbackData: [] },
    );

    return { roomTypes: Array.isArray(data) ? data : [] };
};

export default useRoomTypes;
