'use client';
import { Download } from 'lucide-react';
import { PayrollType } from './PayrollSummaryReport';
import { downloadData } from '@/lib/downloadData';

const getStatusColor = (state: string) => {
    switch (state) {
        case 'Paid':
            return 'bg-green-100 text-green-700';
        case 'Pending':
            return 'bg-orange-100 text-orange-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export default function PayrollSummaryTable({
    // search,
    // setSearch,
    dataToUse,
}: any) {
    const myData = dataToUse?.map((data: any) => ({
        Name: data?.name,
        Department: data?.department,
        'Work Mode': data?.workMode,
        Amount: data?.amount,
        Payment: data?.payment,
        Account: data?.account,
        State: data?.state,
    }));

    return (
        <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-4 md:p-6 mt-2">
            {/* Top Bar: Search + Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 md:mb-5">
                {/* Table Title */}
                <div className="font-medium text-[#23272E] text-base mb-2">
                    Detailed Payroll Table
                </div>
                {/* <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full max-w-[314px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8493] w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF872A]"
                            placeholder="Search by Reference No., Vendor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div> */}
                <button
                    onClick={() =>
                        downloadData(myData, 'xlsx', 'Payroll Report')
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#23272E] text-[15px] font-medium border border-[#E5E7EB] shadow-sm hover:bg-[#f0f2f7]"
                >
                    <Download size={18} className="text-[#23272E]" />
                    <span className="">Excel Report</span>
                </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-[800px] w-full">
                    <thead>
                        <tr className="bg-[rgba(244,244,244,1)] text-[#7C8493] text-[12px]">
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Staff Name
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Department
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Work Mode
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Amount (₦)
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left truncate">
                                Payment Method
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Account Used
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                State
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataToUse.map((row: PayrollType, idx: number) => (
                            <tr
                                key={idx}
                                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF6F1] transition-colors text-sm"
                            >
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.name}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.department}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.workMode}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.amount}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.payment}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.account}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.state)}`}
                                    >
                                        {row.state}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
