'use client';

import { getGuestInHouseReport } from '@/app/actions/guest';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import GuestInHouseReportContent from '@/components/front-office/guest-in-house-report/GuestInHouseReportContent';
import GuestInHouseReportFilters from '@/components/front-office/guest-in-house-report/GuestInHouseReportFilters';
import {
    GuestInHouseReportData,
    GuestInHouseReportFiltersState,
} from '@/components/front-office/guest-in-house-report/types';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from '@/components/front-office/complimentary-report/utils';
import { useUser } from '@/context/useUser';
import { useVoidReportOptions } from '@/hooks/useVoidReportOptions';
import { downloadData } from '@/lib/downloadData';
import { useState } from 'react';
import { toast } from 'sonner';

export default function GuestInHouseReportPage() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();

    const [filters, setFilters] = useState<GuestInHouseReportFiltersState>({
        startDate: toYYYYMMDD(new Date()),
        startTime: '00:00',
        endDate: toYYYYMMDD(new Date()),
        endTime: '23:59',
        staff: 'all',
        roomNumber: 'all',
        roomType: 'all',
    });

    const [reportData, setReportData] = useState<GuestInHouseReportData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const result = await getGuestInHouseReport({
                startDate: filters.startDate,
                startTime: filters.startTime,
                endDate: filters.endDate,
                endTime: filters.endTime,
                roomNumber: filters.roomNumber,
                roomType: filters.roomType,
                staffId: filters.staff === 'all' ? undefined : filters.staff,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as GuestInHouseReportData);
                setReportGeneratedAt(
                    result.data.generatedAt
                        ? new Date(result.data.generatedAt)
                        : new Date(),
                );
                toast.success('Report generated successfully');
            }
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        const dataToExport = reportData.items.map((item) => ({
            'Res. No': item.reservationNo,
            'Guest Name': item.guestName,
            'Room Num /type': item.roomLabel,
            'Arrival Date': item.arrivalDate,
            'Departure Date': item.departureDate,
            Night: item.nights,
            Pax: item.pax,
            'Created By': item.createdBy,
            Status: item.status,
        }));
        const filename = `Guest In-House (${filters.startDate} ${filters.startTime} - ${filters.endDate} ${filters.endTime})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;
        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Guest In-House Report (Guest List)';
        const period = `${formatLongDate(filters.startDate)} ${to12Hour(filters.startTime)} → ${formatLongDate(filters.endDate)} ${to12Hour(filters.endTime)}`;
        const generatedBy =
            reportData.generatedBy ?? user?.fullName ?? 'System';
        const printedAt = new Date().toLocaleString();

        const rows = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.reservationNo}</td>
                    <td>${item.guestName}</td>
                    <td>${item.roomLabel}</td>
                    <td>${item.arrivalDate}</td>
                    <td>${item.departureDate}</td>
                    <td>${item.nights}</td>
                    <td>${item.pax}</td>
                    <td>${item.createdBy}</td>
                    <td>${item.status}</td>
                </tr>
            `,
            )
            .join('');

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; margin: auto; max-width: 100%; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 24px; color: #000; }
                    .header p { margin: 5px 0; color: #666; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; border-bottom: 2px solid #333; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Guest List</h1>
                    <p>Report period: ${period}</p>
                    <p>Printed at: ${printedAt} · Printed by: ${generatedBy}.</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Res. No</th>
                            <th>Guest Name</th>
                            <th>Room Num /type</th>
                            <th>Arrival Date</th>
                            <th>Departure Date</th>
                            <th>Night</th>
                            <th>Pax</th>
                            <th>Created By</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `;
        win.document.write(html);
        win.document.close();
    };

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Guest In-House Report (Guest List)"
                        subtitle="Stays overlapping the selected period"
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <GuestInHouseReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    roomOptions={filterOptions.roomOptions}
                    rateTypeOptions={filterOptions.rateTypeOptions}
                    staffOptions={filterOptions.staffOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <GuestInHouseReportContent data={null} loading={true} />
                ) : reportData ? (
                    <GuestInHouseReportContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            hotelName: user?.orgName ?? '',
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            reportPeriod: `${formatLongDate(filters.startDate)} ${to12Hour(filters.startTime)} → ${formatLongDate(filters.endDate)} ${to12Hour(filters.endTime)}`,
                            roomType:
                                filters.roomType === 'all'
                                    ? 'All room types'
                                    : filters.roomType,
                            generatedBy:
                                reportData.generatedBy ??
                                user?.fullName ??
                                'System',
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select filters and click Generate to see the guest in-house list."
                    />
                )}
            </div>
        </PageWrapper>
    );
}
