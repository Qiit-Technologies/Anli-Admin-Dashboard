'use client';
import { DownloadCloud } from 'lucide-react';
import ReportAmounts from '../../reportAmounts';
import { downloadData } from '@/lib/downloadData';
import { formatCurrency } from '@/lib/utils';

const Revenue = ({ transactionStats }: any) => {
    const myData = [
        {
            'Total Expenses': formatCurrency(
                transactionStats?.currentExpensesAmount,
            ),
        },
        {
            'Total Revenue': formatCurrency(
                transactionStats?.currentRevenueAmount,
            ),
        },
        {
            'Total Balance': formatCurrency(
                transactionStats?.totalCurrentBalance,
            ),
        },
    ];
    return (
        <>
            {/* <div className="flex items-center gap-4 mb-5">
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                    </select>
                </div>
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Top Revenue Channels</option>
                        <option>Top Revenue Channels</option>
                        <option>Top Revenue Channels</option>
                    </select>
                </div>

                <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px w-fit">
                    <Calendar size={20} />
                    <p className="text-base text-[#344054]">Start date</p>
                </div>

                <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px w-fit">
                    <Calendar size={20} />
                    <p className="text-base text-[#344054]">End date</p>
                </div>

                <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px">
                    <DownloadCloud size={20} />
                    <p className="text-base text-[#344054]">Export Report</p>
                </div>
            </div> */}
            <div className="flex justify-end items-center gap-4 mb-5">
                <div
                    onClick={() =>
                        downloadData(myData, 'xlsx', 'Revenue Report')
                    }
                    className="w-[180px] cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px"
                >
                    <DownloadCloud size={20} />
                    <p className="text-base text-[#344054]">Export Report</p>
                </div>
            </div>

            <ReportAmounts transactionStats={transactionStats} />
        </>
    );
};

export default Revenue;
