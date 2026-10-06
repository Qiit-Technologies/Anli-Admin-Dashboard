'use client';

import React, { useState } from 'react';
import DepartmentalExpenseHeader from './DepartmentalExpenseHeader';
// import DepartmentalExpenseFilters from './DepartmentalExpenseFilters';
import DepartmentalExpenseSummary from './DepartmentalExpenseSummary';
import DepartmentalExpenseTable from './DepartmentalExpenseTable';
import ReportsTopBar from '../common/ReportsTopBar';
import useSWR from 'swr';
import { fetchExpensesReport } from '@/app/actions/report';
import { Loader2 } from 'lucide-react';

const DepartmentalExpenseReport = () => {
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();
    const { data: res, isLoading } = useSWR(
        ['fetchExpensesReport', startDate, endDate],
        () => fetchExpensesReport(startDate, endDate),
    );
    const expensesData = res?.data?.data;
    const totalExpenses = res?.data?.totalExpenses;

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="w-full min-h-screen bg-[#fff] flex flex-col px-4 md:px-8">
                <DepartmentalExpenseHeader
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
                {isLoading ? (
                    <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <>
                        <div className="mt-7">
                            <DepartmentalExpenseSummary
                                totalExpenses={totalExpenses}
                            />
                        </div>
                        <div className="mt-7">
                            <DepartmentalExpenseTable
                                fetchExpenses={expensesData}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default DepartmentalExpenseReport;
