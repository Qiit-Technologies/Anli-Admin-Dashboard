'use client';

import React, { useState } from 'react';
import VendorSpendHeader from './VendorSpendHeader';
// import VendorSpendFilters from './VendorSpendFilters';
import VendorSpendTable from './VendorSpendTable';
import ReportsTopBar from '../common/ReportsTopBar';
import { fetchVendorsReport } from '@/app/actions/report';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';

const VendorSpendReport = () => {
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { data: res, isLoading } = useSWR(
        ['fetchVendorsReport', startDate, endDate],
        () => fetchVendorsReport(startDate, endDate),
    );
    const vendorsData = res?.data?.data;

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="w-full min-h-screen bg-[#fff] flex flex-col px-4 md:px-6 py-6 md:py-10">
                <VendorSpendHeader
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />

                {isLoading ? (
                    <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <>
                        {/* <div className="mt-6">
                            <VendorSpendFilters />
                        </div> */}
                        <div className="mt-6 flex-1">
                            <VendorSpendTable fetchedVendors={vendorsData} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default VendorSpendReport;
