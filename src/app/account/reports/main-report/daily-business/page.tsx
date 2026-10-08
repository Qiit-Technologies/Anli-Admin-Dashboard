'use client';
import { fetchStockReport, getTransactionReport } from '@/app/actions/report';
import CompletedTransactions from '@/components/account/reports/dailyBusiness/completedTransactions';
import ExpensesBreakdown from '@/components/account/reports/dailyBusiness/expensesBreakdown';
import OutstandingPayments from '@/components/account/reports/dailyBusiness/outstandingPayments';
import Revenue from '@/components/account/reports/dailyBusiness/revenue';
import StockUsage from '@/components/account/reports/dailyBusiness/stockUsage';
import { DateSelection } from '@/components/account/types';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import DateRangeDropdown from '@/components/common/RangeDropdown';
import SearchInput from '@/components/common/SearchInput';
import { Button } from '@heroui/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const tabs = [
    { name: 'Revenue' },
    { name: 'Expenses Breakdown' },
    { name: 'Completed Transactions' },
    { name: 'Outstanding Payments' },
    { name: 'Stock Usage & Remaining' },
];

const DailyBusiness = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();
    const { data: res, isLoading } = useSWR(
        ['getTransactionReport', startDate, endDate],
        () => getTransactionReport(startDate, endDate),
    );
    const transactionStats = res?.data;

    const { data: stockRes, isLoading: stockLoading } = useSWR(
        ['fetchStockReport', startDate, endDate],
        () => fetchStockReport(startDate, endDate),
    );
    const stockRequest = stockRes?.data?.allStockRequest;
    const allItems = stockRes?.data?.allItems;

    const tabsArr = [
        <Revenue transactionStats={transactionStats} key={tabIndex} />,
        <ExpensesBreakdown
            transactionStats={transactionStats}
            key={tabIndex}
        />,
        <CompletedTransactions
            transactionStats={transactionStats}
            key={tabIndex}
        />,
        <OutstandingPayments
            transactionStats={transactionStats}
            key={tabIndex}
        />,
        <StockUsage
            allItems={allItems}
            stockRequest={stockRequest}
            key={tabIndex}
        />,
    ];

    return (
        <>
            <PageWrapper className="px-0">
                <div className="px-8">
                    <PageHeader>
                        <PageHeadertitle title="Reports" />
                        <div className="ml-auto flex items-center">
                            <SearchInput
                                className="w-full lg:w-[320px]"
                                value={''}
                                onChange={() => {}}
                            />
                            <Button
                                variant="light"
                                isIconOnly
                                className="ml-4 bg-white rounded-full border text-gray-400"
                            >
                                <LuBell size={18} />
                            </Button>
                        </div>
                    </PageHeader>
                </div>
                <div className="bg-[#D3D3D3] h-[1px] w-full" />
                <div className="px-8">
                    <div className="flex justify-between items-center">
                        <div className="">
                            <p className="text-[#354052] text-2xl font-semibold leading-[29px]">
                                Daily Business Summary Report
                            </p>
                            <p className="text-[#000] text-sm leading-6">
                                Your daily snapshot of overall business
                                performance
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <DateRangeDropdown
                                handleSelection={(selection: DateSelection) => {
                                    setStartDate(selection?.startDate);
                                    setEndDate(selection?.endDate);
                                }}
                            />
                        </div>
                    </div>

                    {isLoading || stockLoading ? (
                        <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                            <Loader2 className="text-brand animate-spin w-10 h-10" />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 mt-6 mb-7">
                                {tabs.map((tab, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setTabIndex(index)}
                                        className={`p-[10px] h-14 min-w-[130px] hover:bg-[#FFF9F5] ${tabIndex === index && 'bg-[#FFF9F5]'} flex justify-center items-center cursor-pointer hover:text-[#FF6F00] ${tabIndex === index ? 'text-[#FF6F00]' : 'text-[#676464]'}`}
                                    >
                                        <p className="text-[16px] font-medium leading-6">
                                            {tab.name}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {tabsArr[tabIndex]}
                        </>
                    )}
                </div>
            </PageWrapper>
        </>
    );
};

export default DailyBusiness;
