'use client';

import {
    ComplimentaryReportData,
    ComplimentaryReportHeaderInfo,
} from './types';
import { formatCurrency } from '@/lib/utils';

interface ComplimentaryReportContentProps {
    data: ComplimentaryReportData | null;
    loading?: boolean;
    headerInfo?: ComplimentaryReportHeaderInfo;
}

export default function ComplimentaryReportContent({
    data,
    loading = false,
    headerInfo,
}: Readonly<ComplimentaryReportContentProps>) {
    if (loading) {
        return (
            <div className="py-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-4" />
                    <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const totalValue = data.summary?.totalComplimentaryValue ?? 0;

    return (
        <div className="py-8 max-w-full mx-auto">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complimentary Report
                </h2>
                {headerInfo && (
                    <>
                        {headerInfo.hotelName && (
                            <p className="text-sm text-gray-600 mb-1">
                                {headerInfo.hotelName}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 mb-2">
                            Date range: {headerInfo.dateRange}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                            Room: {headerInfo.room} | Room Type:{' '}
                            {headerInfo.roomType} | User: {headerInfo.user}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                            Printed by: {headerInfo.generatedBy}. · Generated at:{' '}
                            {headerInfo.generatedAt}
                        </p>
                        <p className="text-base font-semibold text-gray-900 mt-2">
                            Total Complimentary Value:{' '}
                            {formatCurrency(
                                headerInfo.totalComplimentaryValue ??
                                    totalValue,
                            )}
                        </p>
                    </>
                )}
            </div>

            {data.items.length > 0 && data.summary && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                        Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Complimentary Reservations
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {data.summary.totalReservations}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Complimentary Nights
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {data.summary.totalNights}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-[#F4F4F4]">
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Rsrv. No
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Rsrv. Date
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Guest Name
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Room No
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Room Type
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Created By
                            </th>
                            <th className="text-right py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Complimentary Value
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr
                                key={item.reservationNo + index}
                                className="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.reservationNo}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.reservationDate}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.guestName}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.roomNo}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.roomType}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.createdBy}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878] text-right">
                                    {formatCurrency(item.complimentaryValue)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No complimentary reservations found for the selected filters.
                </div>
            )}
        </div>
    );
}
