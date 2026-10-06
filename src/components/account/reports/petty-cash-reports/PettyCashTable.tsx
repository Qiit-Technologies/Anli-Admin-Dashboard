import React from 'react';
import { Download } from 'lucide-react';
import { downloadData } from '@/lib/downloadData';
import { getStatusColor } from '@/lib/utils';

const PettyCashTable = ({ fetchedPettyCash }: any) => {
    const myData = fetchedPettyCash?.map((petCash: any) => ({
        Date: petCash?.date,
        Purpose: petCash?.purpose,
        Amount: petCash?.amount,
        Department: petCash?.department,
        'Paid By': petCash?.paidBy,
        'Paid From': petCash?.paidFrom,
        'Payment Method': petCash?.paymentMethod,
        Status: petCash?.status,
    }));

    return (
        <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 md:p-6 mt-2">
            <div className="flex items-center justify-between mb-3 md:mb-5">
                <span className="font-medium text-[#23272E] text-base">
                    Report Output Table
                </span>
                <button
                    onClick={() =>
                        downloadData(myData, 'xlsx', 'Pettycash Report')
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#23272E] text-[15px] font-medium border border-[#E5E7EB] shadow-sm hover:bg-[#f0f2f7]"
                >
                    <Download size={18} className="text-[#23272E]" />
                    <span className="hidden sm:inline">Export Report</span>
                </button>
            </div>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-[900px] w-full text-[15px]">
                    <thead>
                        <tr className="bg-[rgba(244,244,244,1)] text-[#7C8493] text-[12px]">
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium text-left">
                                Date
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium text-left">
                                Purpose
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium text-left">
                                Amount (₦)
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium text-left">
                                Department
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium text-left">
                                Paid By
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium truncate text-left">
                                Paid From (Account)
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium text-left">
                                Payment Method
                            </th>
                            <th className="px-0 py-3 md:py-[13px] md:pr-[0px] md:pl-0 font-medium truncate text-left">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(fetchedPettyCash || []).map(
                            (row: any, idx: number) => (
                                <tr
                                    key={idx}
                                    className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF6F1] transition-colors text-sm"
                                >
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] whitespace-nowrap">
                                        {row.date}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] truncate max-w-[160px]">
                                        {row.purpose}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] whitespace-nowrap">
                                        {row.amount}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] truncate max-w-[140px]">
                                        {row.department}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] truncate max-w-[140px]">
                                        {row.paidBy}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] truncate max-w-[160px]">
                                        {row.paidFrom}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] truncate max-w-[100px]">
                                        {row.paymentMethod}
                                    </td>
                                    <td className="px-0 py-3 md:py-[26px] md:pr-[0px] md:pl-0 text-[#7B7878] truncate whitespace-nowrap">
                                        <div
                                            className={`w-fit px-3 py-1 rounded-full capitalize ${getStatusColor(row.status?.toLocaleLowerCase())}`}
                                        >
                                            <span
                                                className={`text-xs caption-top`}
                                            >
                                                {row.status
                                                    ?.replaceAll('_', ' ')
                                                    ?.toLocaleLowerCase()}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PettyCashTable;
