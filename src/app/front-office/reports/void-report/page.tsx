'use client';

import { getVoidReport } from '@/app/actions/guest';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import {
    VoidReportData,
    VoidReportFiltersState,
} from '@/components/front-office/void-report/types';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from '@/components/front-office/void-report/utils';
import VoidReportContent from '@/components/front-office/void-report/VoidReportContent';
import VoidReportFilters from '@/components/front-office/void-report/VoidReportFilters';
import { useVoidReportOptions } from '@/hooks/useVoidReportOptions';
import { useUser } from '@/context/useUser';
import { downloadData } from '@/lib/downloadData';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VoidReport() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();

    const [filters, setFilters] = useState<VoidReportFiltersState>({
        arrivalDateFrom: toYYYYMMDD(new Date()),
        arrivalDateTo: toYYYYMMDD(new Date()),
        voidDateFrom: toYYYYMMDD(new Date()),
        voidDateTo: toYYYYMMDD(new Date()),
        guestName: '',
        room: 'all',
        rateType: 'all',
        source: 'all',
        paxFrom: 'all',
        paxType: '',
        paxTo: '',
        staff: 'all',
        voidReason: '',
    });

    const [reportData, setReportData] = useState<VoidReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const result = await getVoidReport(filters);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as VoidReportData);
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
            'Arrival Date': item.arrivalDate,
            'Rate Type': item.rateType,
            'Departure Date': item.departureDate,
            Source: item.source,
            Adult: item.adult,
            Child: item.child,
            User: item.user,
            'Void Date': item.voidDate,
            'Void Reason': item.voidReason,
        }));

        const filename = `Void Report (${filters.arrivalDateFrom} - ${filters.arrivalDateTo})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Void Report';
        const businessYearRange = `${formatLongDate(filters.arrivalDateFrom)} → ${formatLongDate(filters.arrivalDateTo)}`;
        const printedAt = new Date().toLocaleString();
        const generatedBy = user?.fullName ?? 'System';

        const tableRowsHtml = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.reservationNo}</td>
                    <td>${item.reservationDate}</td>
                    <td>${item.guestName}</td>
                    <td>${item.roomNo}</td>
                    <td>${item.arrivalDate}</td>
                    <td>${item.rateType}</td>
                    <td>${item.departureDate}</td>
                    <td>${item.source}</td>
                    <td style="text-align:center">${item.adult}</td>
                    <td style="text-align:center">${item.child}</td>
                    <td>${item.user}</td>
                    <td>${item.voidDate}</td>
                    <td>${item.voidReason}</td>
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
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; margin: auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 24px; color: #000; }
                    .header p { margin: 5px 0; color: #666; font-size: 14px; }
                    .header-summary {
                        display: table;
                        margin: 16px auto 0;
                        text-align: left;
                        color: #666;
                        font-size: 14px;
                        border-collapse: collapse;
                    }
                    .header-summary .meta-row { display: table-row; }
                    .header-summary .meta-label,
                    .header-summary .meta-value {
                        display: table-cell;
                        padding: 4px 0;
                        vertical-align: top;
                    }
                    .header-summary .meta-label {
                        padding-right: 1rem;
                        color: #888;
                        font-weight: 600;
                        white-space: nowrap;
                    }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 12px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #333; }
                    .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    .footer .created-by { color: #f97316; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <div class="header-summary" role="presentation">
                        <div class="meta-row">
                            <span class="meta-label">Printed at</span>
                            <span class="meta-value">${printedAt}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Business year</span>
                            <span class="meta-value">${businessYearRange}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-label">Printed by</span>
                            <span class="meta-value">${generatedBy}.</span>
                        </div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Rsrv. No</th>
                            <th>Rsrv. Date</th>
                            <th>Guest Name</th>
                            <th>Room No</th>
                            <th>Arrival Date</th>
                            <th>Rate Type</th>
                            <th>Departure Date</th>
                            <th>Source</th>
                            <th>Adult</th>
                            <th>Child</th>
                            <th>User</th>
                            <th>Void Date</th>
                            <th>Void Reason</th>
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
                    <PageHeadertitle title="Void Report" subtitle="" />
                </div>
            </PageHeader>

            <div className="mt-4">
                <VoidReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    roomOptions={filterOptions.roomOptions}
                    rateTypeOptions={filterOptions.rateTypeOptions}
                    sourceOptions={filterOptions.sourceOptions}
                    staffOptions={filterOptions.staffOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <VoidReportContent data={null} loading={true} />
                ) : hasData ? (
                    <VoidReportContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            hotelName: user?.orgName ?? '',
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            businessYear: `${formatLongDate(filters.arrivalDateFrom)} → ${formatLongDate(filters.arrivalDateTo)}`,
                            printedBy: user?.fullName ?? 'System',
                            source:
                                filters.source === 'all'
                                    ? 'All Sources'
                                    : filters.source,
                            room:
                                filters.room === 'all'
                                    ? 'All Rooms'
                                    : filters.room,
                            dineArea: 'All',
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select filters and click Generate to see void report."
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
