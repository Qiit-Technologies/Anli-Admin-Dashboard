'use client';

import { getStaffByDepartment } from '@/app/actions/staff';
import useHotelRooms from '@/hooks/useHotelRooms';
import useRoomTypes from '@/hooks/useRoomTypes';
import { useMemo } from 'react';
import useSWR from 'swr';

const SOURCE_OPTIONS = [
    { value: 'direct', label: 'Direct' },
    { value: 'walk-in', label: 'Walk-in Guest' },
    { value: 'booking-com', label: 'Booking.com' },
    { value: 'expedia', label: 'Expedia' },
];

export function useVoidReportOptions() {
    const { rooms } = useHotelRooms();
    const { roomTypes } = useRoomTypes();
    const { data: staffData } = useSWR(
        '/staff/department/frontoffice',
        () => getStaffByDepartment('frontoffice'),
        { revalidateOnFocus: false },
    );

    const roomOptions = useMemo(
        () =>
            (Array.isArray(rooms) ? rooms : []).map(
                (r: {
                    roomNumber: string | number;
                    roomtype?: { name?: string };
                }) => ({
                    value: String(r.roomNumber),
                    label: r.roomtype?.name
                        ? `${r.roomNumber} – ${r.roomtype.name}`
                        : String(r.roomNumber),
                }),
            ),
        [rooms],
    );

    const rateTypeOptions = useMemo(
        () =>
            (Array.isArray(roomTypes) ? roomTypes : []).map(
                (rt: { id: number; name: string }) => ({
                    value:
                        rt.name?.toLowerCase().replaceAll(/\s+/g, '-') ??
                        String(rt.id),
                    label: rt.name ?? `Type ${rt.id}`,
                }),
            ),
        [roomTypes],
    );

    const staffOptions = useMemo(() => {
        const staff = staffData?.data ?? [];
        return staff.map((s: { id: number; fullName?: string }) => ({
            value: String(s.id),
            label: s.fullName ?? `Staff ${s.id}`,
        }));
    }, [staffData]);

    return {
        roomOptions,
        rateTypeOptions,
        sourceOptions: SOURCE_OPTIONS,
        staffOptions,
    };
}
