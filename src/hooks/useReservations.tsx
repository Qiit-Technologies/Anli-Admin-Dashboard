'use client';
import { getAllReservations } from '@/app/actions/reservation';
import useSWR from 'swr';

const RESERVATIONS_KEY = 'reservations-list';

const useReservations = () => {
    const { data, error, isLoading, mutate } = useSWR(
        RESERVATIONS_KEY,
        async () => {
            const result = (await getAllReservations()) as any;
            if (result && result.error) {
                console.log('Error:', result.error);
                throw new Error(result.error);
            }
            return result?.data ?? [];
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        },
    );

    const refreshReservations = () => {
        mutate();
    };

    return {
        reservations: data ?? [],
        error: error?.message ?? null,
        isLoading,
        refreshReservations,
    };
};

export default useReservations;
