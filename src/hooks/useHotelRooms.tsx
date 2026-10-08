'use client';
import { getRoomByHotelId } from '@/app/actions/room';
import useSWR from 'swr';

const useHotelRooms = () => {
    const fetcher = async () => {
        const response = await getRoomByHotelId();
        if (!response || !response.data) return [];
        return Array.isArray(response.data) ? response.data : [];
    };

    const { data, error, isLoading, mutate } = useSWR('/hotelRooms', fetcher, {
        fallbackData: [],
        onError: (err) => {
            console.error('Error fetching hotel rooms:', err);
        },
    });

    const rooms = Array.isArray(data) ? data : [];

    return {
        rooms,
        isLoading,
        error,
        refetch: () => mutate(),
    };
};

export default useHotelRooms;
