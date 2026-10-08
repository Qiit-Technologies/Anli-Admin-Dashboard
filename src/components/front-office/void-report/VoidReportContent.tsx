'use client';

import { VoidReportData, VoidReportHeaderInfo } from './types';

interface VoidReportContentProps {
    data: VoidReportData | null;
    loading?: boolean;
    headerInfo?: VoidReportHeaderInfo;
}

export default function VoidReportContent({
    data,
    loading = false,
    headerInfo,
}: Readonly<VoidReportContentProps>) {
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

    return (
        <div className="py-8 max-w-full mx-auto">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Void Report
                </h2>
                {headerInfo && (
                    <div className="text-center text-sm text-gray-500 space-y-2 max-w-3xl">
                        {headerInfo.hotelName ? (
                            <p className="text-gray-700 font-medium">
                                {headerInfo.hotelName}
                            </p>
                        ) : null}
                        <p>
                            <span className="text-gray-600">Period:</span>{' '}
                            {headerInfo.businessYear}
                        </p>
                        <p>
                            <span className="text-gray-600">Printed at:</span>{' '}
                            {headerInfo.printedAt}
                        </p>
                        <p>
                            Printed by: {headerInfo.printedBy}.
                        </p>
                        <p>
                            <span className="text-gray-600">Source:</span>{' '}
                            {headerInfo.source}
                            <span className="text-gray-300 mx-2">·</span>
                            <span className="text-gray-600">Room:</span>{' '}
                            {headerInfo.room}
                            {headerInfo.dineArea &&
                            headerInfo.dineArea !== 'All' ? (
                                <>
                                    <span className="text-gray-300 mx-2">
                                        ·
                                    </span>
                                    <span className="text-gray-600">
                                        Dine area:
                                    </span>{' '}
                                    {headerInfo.dineArea}
                                </>
                            ) : null}
                        </p>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-[#F4F4F4]">
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Rsrv. No
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Date
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Guest Name
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Room No
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Arrival Date
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Rate Type
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Departure Date
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Source
                            </th>
                            <th className="text-center py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Adult
                            </th>
                            <th className="text-center py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Child
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                User
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Void Date
                            </th>
                            <th className="text-left py-3 px-2 text-[14px] font-semibold text-[#0A0A0A]">
                                Void Reason
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
                                    {item.arrivalDate}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.rateType}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.departureDate}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.source}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878] text-center">
                                    {item.adult}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878] text-center">
                                    {item.child}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.user}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.voidDate}
                                </td>
                                <td className="py-4 px-2 text-[14px] text-[#7B7878]">
                                    {item.voidReason}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No voided records found for the selected filters.
                </div>
            )}
        </div>
    );
}
