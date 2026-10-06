'use client';

import {
    getFrontOfficeSalesReport,
    getVoidReportOptions,
} from '@/app/actions/guest';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import SalesReportContent from '@/components/front-office/sales-report/SalesReportContent';
import SalesReportFilters from '@/components/front-office/sales-report/SalesReportFilters';
import {
    SalesReportData,
    SalesReportFiltersState,
} from '@/components/front-office/sales-report/types';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from '@/components/front-office/sales-report/utils';
import { useUser } from '@/context/useUser';
import { useVoidReportOptions } from '@/hooks/useVoidReportOptions';
import { downloadData } from '@/lib/downloadData';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';

const statusLabel = (s: SalesReportFiltersState['status']) => {
    switch (s) {
        case 'inhouse':
            return 'In-House';
        case 'reserved':
            return 'Reserved';
        case 'checked-out':
            return 'Checked-Out';
        default:
            return 'All';
    }
};

export default function SalesReportPage() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();
    const { data: voidOpts } = useSWR('guests-void-report-options', () =>
        getVoidReportOptions(),
    );

    const sourceOptions = useMemo(() => {
        const fromApi = voidOpts?.data?.sourceOptions ?? [];
        const merged = new Map<string, { value: string; label: string }>();
        for (const o of [...filterOptions.sourceOptions, ...fromApi]) {
            merged.set(o.value, o);
        }
        return Array.from(merged.values()).sort((a, b) =>
            a.label.localeCompare(b.label),
        );
    }, [voidOpts, filterOptions.sourceOptions]);

    const [filters, setFilters] = useState<SalesReportFiltersState>({
        startDate: toYYYYMMDD(new Date()),
        endDate: toYYYYMMDD(new Date()),
        startTime: '00:00',
        endTime: '23:59',
        room: 'all',
        rateType: 'all',
        user: 'all',
        source: 'all',
        status: 'all',
        inHouseOnly: false,
    });

    const [reportData, setReportData] = useState<SalesReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const result = await getFrontOfficeSalesReport({
                startDate: filters.startDate,
                endDate: filters.endDate,
                startTime: filters.startTime || undefined,
                endTime: filters.endTime || undefined,
                room: filters.room,
                rateType: filters.rateType,
                user: filters.user,
                source: filters.source,
                status: filters.status,
                inHouseOnly: filters.inHouseOnly,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as SalesReportData);
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
            'Room / type': item.roomNumType,
            'Guest name': item.guestName,
            'Arrival date': item.arrivalDate,
            'Departure date': item.departureDate,
            Status: item.status,
            'Nights (period)': item.nightsInPeriod,
            Pax: item.pax,
            User: item.user,
            'Original rate': item.originalRate,
            Discount: item.discount,
            'Discount total': item.discountTotal,
        }));

        const filename = `Sales Report (${filters.startDate} - ${filters.endDate})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Sales Report';
        const period = `${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`;
        const generatedBy = user?.fullName ?? 'System';
        const s = reportData.summary;

        const tableRowsHtml = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.reservationNo}</td>
                    <td>${item.roomNumType}</td>
                    <td>${item.guestName}</td>
                    <td>${item.arrivalDate}</td>
                    <td>${item.departureDate}</td>
                    <td>${item.status}</td>
                    <td style="text-align:right">${item.nightsInPeriod}</td>
                    <td style="text-align:right">${item.pax}</td>
                    <td>${item.user}</td>
                    <td style="text-align:right">${formatCurrency(item.originalRate)}</td>
                    <td style="text-align:right">${item.discount > 0 ? '-' : ''}${formatCurrency(item.discount)}</td>
                    <td style="text-align:right">${item.discountTotal > 0 ? '-' : ''}${formatCurrency(item.discountTotal)}</td>
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
                    .header { text-align: center; margin-bottom: 24px; }
                    .header h1 { margin: 0; font-size: 24px; color: #000; }
                    .header p { margin: 5px 0; color: #666; font-size: 14px; }
                    .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; font-size: 12px; }
                    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
                    .kpi strong { display: block; color: #555; font-size: 11px; margin-bottom: 4px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; border-bottom: 2px solid #333; }
                    .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    .footer .created-by { color: #f97316; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Report period: ${period}</p>
                    <p>Printed at: ${new Date().toLocaleString()} · Printed by: ${generatedBy}</p>
                </div>
                <div class="kpis">
                    <div class="kpi"><strong>Total payments</strong>${formatCurrency(s.totalPaymentsReceived)}</div>
                    <div class="kpi"><strong>Expected room revenue</strong>${formatCurrency(s.expectedRoomRevenue)}</div>
                    <div class="kpi"><strong>Checked-out</strong>${s.checkedOutCount}</div>
                    <div class="kpi"><strong>Realised room revenue</strong>${formatCurrency(s.realisedRoomRevenue)}</div>
                    <div class="kpi"><strong>Outstanding AR</strong>${formatCurrency(s.outstandingAr)}</div>
                    <div class="kpi"><strong>Account payable</strong>${formatCurrency(s.totalAccountsPayable)}</div>
                    <div class="kpi"><strong>Total bookings</strong>${s.totalBookings}</div>
                    <div class="kpi"><strong>In-house</strong>${s.inHouseCount}</div>
                    <div class="kpi"><strong>F&B revenue</strong>${formatCurrency(s.fbRevenue)}</div>
                    <div class="kpi"><strong>Total discounts</strong>${formatCurrency(s.totalDiscounts)}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Res. No</th>
                            <th>Room / type</th>
                            <th>Guest</th>
                            <th>Arrival</th>
                            <th>Departure</th>
                            <th>Status</th>
                            <th>Nights</th>
                            <th>Pax</th>
                            <th>User</th>
                            <th>Original rate</th>
                            <th>Discount</th>
                            <th>Discount total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
                <div class="footer">
                    Report generated on ${new Date().toLocaleDateString(
                        undefined,
                        {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        },
                    )}
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
                        title="Sales Report"
                        subtitle="See all activities carried out."
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <SalesReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    roomOptions={filterOptions.roomOptions}
                    roomTypeOptions={filterOptions.rateTypeOptions}
                    staffOptions={filterOptions.staffOptions}
                    sourceOptions={sourceOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <SalesReportContent data={null} loading={true} />
                ) : hasData ? (
                    <SalesReportContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            hotelName: user?.orgName ?? '',
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            dateRange: `${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`,
                            room:
                                filters.room === 'all'
                                    ? 'All'
                                    : (filterOptions.roomOptions.find(
                                          (o: {
                                              value: string;
                                              label: string;
                                          }) => o.value === filters.room,
                                      )?.label ?? filters.room),
                            roomType:
                                filters.rateType === 'all'
                                    ? 'All'
                                    : (filterOptions.rateTypeOptions.find(
                                          (o: {
                                              value: string;
                                              label: string;
                                          }) => o.value === filters.rateType,
                                      )?.label ?? filters.rateType),
                            user:
                                filters.user === 'all'
                                    ? 'All users'
                                    : (filterOptions.staffOptions.find(
                                          (o: {
                                              value: string;
                                              label: string;
                                          }) => o.value === filters.user,
                                      )?.label ?? filters.user),
                            source:
                                filters.source === 'all'
                                    ? 'All'
                                    : (sourceOptions.find(
                                          (o: {
                                              value: string;
                                              label: string;
                                          }) => o.value === filters.source,
                                      )?.label ?? filters.source),
                            status: statusLabel(filters.status),
                            inHouseOnly: filters.inHouseOnly,
                            generatedBy: user?.fullName ?? 'System',
                            generatedAt: reportGeneratedAt
                                ? reportGeneratedAt.toLocaleString()
                                : '',
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select filters and click Generate to see the sales report."
                    />
                )}
            </div>

            {reportGeneratedAt && (
                <div className="mt-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                    Report generated on{' '}
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
