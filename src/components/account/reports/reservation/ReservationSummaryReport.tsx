'use client';

import React, { useEffect, useState } from 'react';
import ReservationSummaryHeader from './ReservationSummaryHeader';
// import ReservationSummaryFilters from './ReservationSummaryFilters';
import ReservationSummaryTable from './ReservationSummaryTable';
import ReportsTopBar from '../common/ReportsTopBar';
import { fetchGuestReport } from '@/app/actions/report';
import useSWR from 'swr';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type GuestType = {
    roomType: string;
    guest: string;
    ref: string;
    amount: string;
    payment: string;
    booking: string;
    state: string;
};

const ReservationSummaryReport = () => {
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { data: res, isLoading } = useSWR(
        ['fetchGuestReport', startDate, endDate],
        () => fetchGuestReport(startDate, endDate),
    );
    const guestsData = res?.data;

    const [dataToUse, setDataToUse] = useState<GuestType[]>([]);

    useEffect(() => {
        const compiledData = [];

        for (const guest of guestsData?.allGuests || []) {
            compiledData.push({
                roomType: guest?.room?.roomtype?.name || 'N/A',
                guest: guest?.fullName || 'N/A',
                ref: `RES-${guest?.id}`,
                amount: formatCurrency(guest?.amountPaid || 0),
                payment: guest?.paymentMethod || 'N/A',
                booking: guest?.createdAt
                    ? new Date(guest.createdAt).toISOString().split('T')[0]
                    : 'N/A',
                state: guest?.isCheckedOut
                    ? 'Checked-out'
                    : guest?.isCheckedIn
                      ? 'Checked-In'
                      : guest?.isApproved
                        ? 'Approved'
                        : 'N/A',
            });
        }

        setDataToUse(compiledData);
    }, [guestsData?.allGuests]);

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="bg-white min-h-screen px-2 py-2 sm:px-4 md:px-8 md:py-6">
                <ReservationSummaryHeader
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
                {/* <ReservationSummaryFilters /> */}
                {isLoading ? (
                    <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <ReservationSummaryTable dataToUse={dataToUse} />
                )}
            </div>
        </>
    );
};

export default ReservationSummaryReport;
