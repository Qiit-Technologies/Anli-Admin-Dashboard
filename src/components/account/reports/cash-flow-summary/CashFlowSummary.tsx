'use client';
import React, { useState } from 'react';
import ReportsTopBar from '../common/ReportsTopBar';
import CashFlowHeader from './CashFlowHeader';
import CashFlowFilters from './CashFlowFilters';
import CashFlowSummaryCards from './CashFlowSummaryCards';
import CashFlowTable from './CashFlowTable';
import useSWR from 'swr';
import { fetchCashFlowReport } from '@/app/actions/report';
import { Loader2 } from 'lucide-react';

const CashFlowSummary = () => {
    const [transactionType, setTransactionType] = useState('Inflows');
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const { data: res, isLoading } = useSWR(
        ['fetchCashFlowReport', startDate, endDate],
        () => fetchCashFlowReport(startDate, endDate),
    );
    const cashFlowData = res?.data?.data?.map((data: any) => ({
        label: data.category,
        value: data.amount,
        type: data.type,
    }));

    const cashInflow = cashFlowData?.filter(
        (data: any) => data.type === 'inflow',
    );

    const cashOutflow = cashFlowData?.filter(
        (data: any) => data.type === 'outflow',
    );

    const totalInflow = cashInflow?.reduce(
        (sum: number, inflow: { value: string }) => sum + Number(inflow.value),
        0,
    );

    const totalOutflow = cashOutflow?.reduce(
        (sum: number, inflow: { value: string }) => sum + Number(inflow.value),
        0,
    );
    console.log('totalInflow', totalInflow);

    return (
        <>
            <div className="w-full bg-[#fff] flex flex-col px-4 md:px-8">
                <ReportsTopBar />
            </div>
            <div className="w-full h-[1px] bg-[#D3D3D3]"></div>
            <div className="w-full min-h-screen bg-[#fff] flex flex-col px-4 md:px-8">
                <CashFlowHeader
                    cashFlowData={cashFlowData}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />
                <div className="mt-7">
                    <CashFlowFilters
                        transactionType={transactionType}
                        setTransactionType={setTransactionType}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                        <Loader2 className="text-brand animate-spin w-10 h-10" />
                    </div>
                ) : (
                    <>
                        <div className="mt-7">
                            <CashFlowSummaryCards
                                totalInflow={totalInflow}
                                totalOutflow={totalOutflow}
                                totalNetflow={totalInflow + totalOutflow}
                                transactionType={transactionType}
                            />
                        </div>
                        <div className="mt-7">
                            <CashFlowTable
                                cashInflow={cashInflow}
                                cashOutflow={cashOutflow}
                                fetchCashFlow={cashFlowData}
                                transactionType={transactionType}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CashFlowSummary;
