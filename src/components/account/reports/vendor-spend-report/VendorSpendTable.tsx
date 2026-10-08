/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Download } from 'lucide-react';
import { downloadData } from '@/lib/downloadData';

const stateColors: Record<string, string> = {
    active: 'bg-[#E6F9F0] text-[#1BC58D]',
    completed: 'bg-[#FFF6E6] text-[#FF872A]',
    blacklisted: 'bg-[#FFE6E6] text-[#FF4D4F]',
};

const VendorSpendTable = ({ fetchedVendors }: any) => {
    const myData = fetchedVendors?.map((vend: any) => ({
        Vendor: vend?.vendor,
        TotalSpent: vend?.totalSpent,
        Outstanding: vend?.outstanding,
        Status: vend?.state,
    }));

    return (
        <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 md:p-6 mt-2">
            <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-[#23272E] text-base">
                    Summary View – Top Vendors
                </span>
                <button
                    onClick={() =>
                        downloadData(myData, 'xlsx', 'Vendor Spend Report')
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#23272E] text-[15px] font-medium border border-[#E5E7EB] shadow-sm hover:bg-[#f0f2f7]"
                >
                    <Download size={18} className="text-[#23272E]" />
                    <span className="hidden sm:inline">Export Report</span>
                </button>
            </div>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-[700px] w-full text-[15px]">
                    <thead>
                        <tr className="bg-[rgba(244,244,244,1)] text-[#7C8493] text-[12px]">
                            <th className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Vendor Name
                            </th>
                            <th className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Total Spent (₦)
                            </th>
                            <th className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Order Count
                            </th>
                            <th className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Status
                            </th>
                            <th className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Last Transaction
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(fetchedVendors || []).map((row: any, idx: number) => (
                            <tr
                                key={idx}
                                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF6F1] transition-colors text-sm"
                            >
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.vendorName}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.totalAmount}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.orderCount}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6">
                                    <span
                                        className={`px-3 py-1 rounded-lg font-medium text-xs ${stateColors[row.status] || ''}`}
                                    >
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6">
                                    {row.lastTransaction}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorSpendTable;
