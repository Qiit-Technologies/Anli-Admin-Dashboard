'use client';

import { getComplimentaryReport } from '@/app/actions/guest';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import ComplimentaryReportContent from '@/components/front-office/complimentary-report/ComplimentaryReportContent';
import ComplimentaryReportFilters from '@/components/front-office/complimentary-report/ComplimentaryReportFilters';
import {
    ComplimentaryReportData,
    ComplimentaryReportFiltersState,
} from '@/components/front-office/complimentary-report/types';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from '@/components/front-office/complimentary-report/utils';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import { useVoidReportOptions } from '@/hooks/useVoidReportOptions';
import { useUser } from '@/context/useUser';
import { downloadData } from '@/lib/downloadData';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ComplimentaryReport() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();

    const [filters, setFilters] = useState<ComplimentaryReportFiltersState>({
        startDate: toYYYYMMDD(new Date()),
        endDate: toYYYYMMDD(new Date()),
        guestName: '',
        status: 'all',
        room: 'all',
        rateType: 'all',
        user: 'all',
        reservationNo: '',
    });

    const [reportData, setReportData] =
        useState<ComplimentaryReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const result = await getComplimentaryReport(filters);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as ComplimentaryReportData);
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
            'Rsrv. No': item.reservationNo,
            'Rsrv. Date': item.reservationDate,
            'Guest Name': item.guestName,
            'Room No': item.roomNo,
            'Room Type': item.roomType,
            'Created By': item.createdBy,
            'Complimentary Value': item.complimentaryValue,
            Nights: item.nights,
        }));

        const filename = `Complimentary Report (${filters.startDate} - ${filters.endDate})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Complimentary Report';
        const period = `${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`;
        const generatedBy = user?.fullName ?? 'System';
        const totalVal =
            reportData.summary?.totalComplimentaryValue?.toFixed(2) ?? '0.00';

        const tableRowsHtml = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.reservationNo}</td>
                    <td>${item.reservationDate}</td>
                    <td>${item.guestName}</td>
                    <td>${item.roomNo}</td>
                    <td>${item.roomType}</td>
                    <td>${item.createdBy}</td>
                    <td style="text-align:right">${item.complimentaryValue.toFixed(2)}</td>
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
                    .header .total-value { margin-top: 12px; font-size: 15px; color: #111; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #333; }
                    .summary { margin-top: 30px; padding: 16px; background: #f9fafb; border-radius: 8px; }
                    .summary h3 { margin: 0 0 12px 0; font-size: 14px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                    .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    .footer .created-by { color: #f97316; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Date range: ${period}</p>
                    <p>Printed at: ${new Date().toLocaleString()} · Printed by: ${generatedBy}.</p>
                    <p class="total-value"><strong>Total Complimentary Value:</strong> ${totalVal}</p>
                </div>
                
                ${
                    reportData.summary
                        ? `
                <div class="summary">
                    <h3>Summary</h3>
                    <div class="summary-grid">
                        <div><strong>Total Reservations:</strong> ${reportData.summary.totalReservations}</div>
                        <div><strong>Total Nights:</strong> ${reportData.summary.totalNights}</div>
                    </div>
                </div>
                `
                        : ''
                }

                <table>
                    <thead>
                        <tr>
                            <th>Rsrv. No</th>
                            <th>Rsrv. Date</th>
                            <th>Guest Name</th>
                            <th>Room No</th>
                            <th>Room Type</th>
                            <th>Created By</th>
                            <th>Complimentary Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>

                <div class="footer">
                    Report Generated on ${new Date().toLocaleDateString(
                        undefined,
                        {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        },
                    )} – ${to12Hour(toHHMM(new Date()))}
                    <br />
                    <span class="created-by">Printed by: ${generatedBy}.</span>
                </div>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `;

        win.document.write(html);
        win.document.close();
    };

    const hasData = reportData !== null;

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Complimentary Report"
                        subtitle="Track complimentary reservations and waived room revenue"
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <ComplimentaryReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    roomOptions={filterOptions.roomOptions}
                    roomTypeOptions={filterOptions.rateTypeOptions}
                    staffOptions={filterOptions.staffOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <ComplimentaryReportContent data={null} loading={true} />
                ) : hasData ? (
                    <ComplimentaryReportContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            hotelName: user?.orgName ?? '',
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            dateRange: `${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`,
                            room: filters.room === 'all' ? 'All' : filters.room,
                            roomType:
                                filters.rateType === 'all'
                                    ? 'All'
                                    : filters.rateType,
                            user:
                                filters.user === 'all'
                                    ? 'All Users'
                                    : filters.user,
                            generatedBy: user?.fullName ?? 'System',
                            generatedAt: reportGeneratedAt
                                ? reportGeneratedAt.toLocaleString()
                                : '',
                            totalComplimentaryValue:
                                reportData.summary?.totalComplimentaryValue,
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select filters and click Generate to see complimentary report."
                    />
                )}
            </div>

            {reportGeneratedAt && (
                <div className="mt-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                    Report Generated on{' '}
                    {reportGeneratedAt.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}{' '}
                    – {to12Hour(toHHMM(reportGeneratedAt))}
                    <br />
                    <span className="text-orange-500">
                        Printed by: {user?.fullName ?? 'System'}.
                    </span>
                </div>
            )}
        </PageWrapper>
    );
}
