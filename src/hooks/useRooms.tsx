'use client';
import { roomsApi } from '@/lib/api';
import { ROOM } from '@/types';
import useSWR, { mutate } from 'swr';
import { fetchRooms } from './fetcher';

export function useRooms() {
    const { data, error, isLoading } = useSWR('/hotelRooms', fetchRooms);

    if (error) {
        console.error('Error fetching rooms:', error);
    }

    const rooms = Array.isArray(data) ? data : [];

    return {
        rooms,
        isLoading,
        isError: !!error,

        async createRoom(roomData: ROOM) {
            await roomsApi.create(roomData);
            mutate('/hotelRooms');
        },

        async updateRoom(id: string, roomData: ROOM) {
            await roomsApi.update(id, roomData);
            mutate('/hotelRooms');
        },

        async deleteRoom(id: string) {
            await roomsApi.delete(id);
            mutate('/hotelRooms');
        },
    };
}
