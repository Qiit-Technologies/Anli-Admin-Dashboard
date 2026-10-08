'use client';
import { getGuestListByHotelId } from '@/app/actions/guest';
import useSWR from 'swr';

const useGuest = () => {
    const { data, error, isLoading } = useSWR(
        '/hotelGuests',
        getGuestListByHotelId,
        {
            onErrorRetry: (error: any) => {
                if (error.status === 404) return;
            },
            revalidateOnFocus: false,
        },
    );

    return {
        guestList: data?.data || [],
        loading: isLoading,
        error: error?.message || null,
        isEmpty: !isLoading && (!data || !data.data || data.data.length === 0),
    };
};

export default useGuest;
