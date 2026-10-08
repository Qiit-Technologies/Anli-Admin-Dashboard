'use client';

import ReportTable, { ReportTableColumn } from './ReportTable';
import { ArrivalGuest, ArrivalReportData } from './types';

interface ArrivalReportContentProps {
    data: ArrivalReportData | null;
    loading?: boolean;
    headerInfo?: {
        printedBy?: string;
        accountType?: string;
        printedAt?: string;
        reportPeriodStart?: string;
        reportPeriodEnd?: string;
        roomType?: string;
    };
}

const arrivalColumns: ReportTableColumn<ArrivalGuest>[] = [
    { key: 'resNo', header: 'Res. No', width: '80px' },
    { key: 'guestName', header: 'Guest Name', width: '150px' },
    { key: 'room', header: 'Room', width: '140px' },
    {
        key: 'rate',
        header: 'Rate',
        width: '100px',
        render: (value) => {
            const numValue = value as number;
            return numValue.toFixed(2);
        },
    },
    { key: 'arrivalDate', header: 'Arrival Date', width: '120px' },
    { key: 'arrivalTime', header: 'Arrival Time', width: '100px' },
    { key: 'departureDate', header: 'Departure Date', width: '120px' },
    { key: 'staff', header: 'Staff', width: '100px' },
];

export default function ArrivalReportContent({
    data,
    loading = false,
    headerInfo,
}: ArrivalReportContentProps) {
    if (loading) {
        return (
            <div className="py-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
                    <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
                </div>
                <ReportTable
                    columns={arrivalColumns}
                    data={[]}
                    loading={true}
                />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="py-8">
            {/* Report Header */}
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-[#101828] mb-2">
                    Arrival List
                </h2>
                {headerInfo?.accountType ? (
                    <p className="text-sm text-gray-600 mb-1">
                        {headerInfo.accountType}
                    </p>
                ) : null}
                {headerInfo?.printedBy ? (
                    <p className="text-sm text-gray-600 mb-3">
                        Printed by: {headerInfo.printedBy}.
                    </p>
                ) : null}
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap justify-center">
                    {headerInfo?.printedAt && (
                        <>
                            <span>Printed At: {headerInfo.printedAt}</span>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    {headerInfo?.reportPeriodStart &&
                        headerInfo?.reportPeriodEnd && (
                            <>
                                <span>
                                    Report Period:{' '}
                                    {headerInfo.reportPeriodStart} →{' '}
                                    {headerInfo.reportPeriodEnd}
                                </span>
                                <span className="text-gray-300">|</span>
                            </>
                        )}
                    {headerInfo?.roomType && (
                        <span>Room type: {headerInfo.roomType}</span>
                    )}
                </div>
            </div>

            <ReportTable
                columns={arrivalColumns}
                data={data.arrivals}
                loading={loading}
                emptyMessage="No arrivals found for the selected period"
            />
        </div>
    );
}
