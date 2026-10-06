'use client';
import { Download } from 'lucide-react';
import { GuestType } from './ReservationSummaryReport';
import { downloadData } from '@/lib/downloadData';

const getStatusColor = (state: string) => {
    switch (state) {
        case 'Approved':
            return 'bg-green-100 text-green-700';
        case 'Checked-In':
            return 'bg-orange-100 text-orange-800';
        case 'Cancelled':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function ReservationSummaryTable({ dataToUse }: any) {
    const myData = dataToUse?.map((data: any) => ({
        'Room Type': data?.roomType,
        Guest: data?.guest,
        Ref: data?.ref,
        Amount: data?.amount,
        Payment: data?.payment,
        Booking: data?.booking,
        State: data?.state,
    }));
    return (
        <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-4 md:p-6 mt-2">
            {/* Top Bar: Export only */}
            <div className="flex flex-col md:justify-between md:items-center md:flex-row mb-3 md:mb-5">
                {/* Table Title */}
                <div className="font-medium text-[#23272E] text-base mb-2">
                    Reservation Summary Table
                </div>
                <button
                    onClick={() =>
                        downloadData(myData, 'xlsx', 'Reservations Report')
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
                                Room Type
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Guest Name
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Ref Code
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Amount (₦)
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Payment Method
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Booking Date
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                State
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataToUse.map((row: GuestType, idx: number) => (
                            <tr
                                key={idx}
                                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF6F1] transition-colors text-sm"
                            >
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.roomType}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.guest}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.ref}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.amount}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.payment}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.booking}
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
