'use client';

import React, { useState } from 'react';
import ReportsTopBar from '../common/ReportsTopBar';
import PettyCashHeader from './PettyCashHeader';
// import PettyCashFilters from './PettyCashFilters';
// import PettyCashSummary from './PettyCashSummary';
import PettyCashTable from './PettyCashTable';
import { fetchPettyCashReport } from '@/app/actions/report';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';

const PettyCashReports = () => {
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { data: res, isLoading } = useSWR(
        ['fetchPettyCashReport', startDate, endDate],
        () => fetchPettyCashReport(startDate, endDate),
    );
    const pettyCashData = res?.data?.data;

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="w-full min-h-screen bg-[#fff] flex flex-col px-4 md:px-8 max-md:pb-6">
                <div className="w-full">
                    <PettyCashHeader
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />
                    {/* <div className="mt-5 max-md:mt-0">
                        <PettyCashFilters />
                    </div> */}

                    {isLoading ? (
                        <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                            <Loader2 className="text-brand animate-spin w-10 h-10" />
                        </div>
                    ) : (
                        <>
                            {/* <div className="mt-7">
                                <PettyCashSummary />
                            </div> */}
                            <div className="mt-7">
                                <PettyCashTable
                                    fetchedPettyCash={pettyCashData}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default PettyCashReports;
