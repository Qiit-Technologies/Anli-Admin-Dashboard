'use client';

import { getReceivableSummaryReport } from '@/app/actions/receivables';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import AccountReceivableSummaryContent from '@/components/front-office/account-receivable-summary-report/AccountReceivableSummaryContent';
import AccountReceivableSummaryFilters from '@/components/front-office/account-receivable-summary-report/AccountReceivableSummaryFilters';
import {
    AccountReceivableSummaryData,
    AccountReceivableSummaryFiltersState,
} from '@/components/front-office/account-receivable-summary-report/types';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from '@/components/front-office/complimentary-report/utils';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import { useUser } from '@/context/useUser';
import { useVoidReportOptions } from '@/hooks/useVoidReportOptions';
import { downloadData } from '@/lib/downloadData';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AccountReceivableSummaryReport() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();

    const [filters, setFilters] =
        useState<AccountReceivableSummaryFiltersState>({
            startDate: toYYYYMMDD(new Date()),
            startTime: '00:00',
            endDate: toYYYYMMDD(new Date()),
            endTime: '23:59',
            reservationNo: '',
            guestName: '',
            roomNumber: 'all',
            roomType: 'all',
        });

    const [reportData, setReportData] =
        useState<AccountReceivableSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const result = await getReceivableSummaryReport({
                startDate: filters.startDate,
                startTime: filters.startTime,
                endDate: filters.endDate,
                endTime: filters.endTime,
                reservationNo: filters.reservationNo,
                guestName: filters.guestName,
                roomNumber: filters.roomNumber,
                roomType: filters.roomType,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as AccountReceivableSummaryData);
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
            Date: item.date,
            Time: item.time,
            'Reservation No': item.reservationNo,
            'Guest Name': item.guestName,
            'Room Number': item.roomNumber,
            'Room Type': item.roomType,
            'Opening Balance': item.openingBalance,
            'Amount Paid': item.amountPaid,
            Outstanding: item.outstandingBalance,
            'Created By': item.createdBy,
            Status: item.status,
        }));
        const filename = `Account Receivable Summary (${filters.startDate} ${filters.startTime} - ${filters.endDate} ${filters.endTime})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Account Receivable Summary Report';
        const period = `${formatLongDate(filters.startDate)} ${to12Hour(filters.startTime)} → ${formatLongDate(filters.endDate)} ${to12Hour(filters.endTime)}`;
        const generatedBy =
            reportData.generatedBy ?? user?.fullName ?? 'System';
        const printedAt = new Date().toLocaleString();

        const tableRowsHtml = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.time}</td>
                    <td>${item.reservationNo}</td>
                    <td>${item.guestName}</td>
                    <td>${item.roomNumber}</td>
                    <td>${item.roomType}</td>
                    <td style="text-align:right">${item.openingBalance.toFixed(2)}</td>
                    <td style="text-align:right">${item.amountPaid.toFixed(2)}</td>
                    <td style="text-align:right">${item.outstandingBalance.toFixed(2)}</td>
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
                    .summary { margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 8px; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; border-bottom: 2px solid #333; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Report period: ${period}</p>
                    <p>Printed at: ${printedAt} · Printed by: ${generatedBy}.</p>
                </div>
                <div class="summary">
                    <strong>Summary</strong><br/>
                    Total receivables: ${reportData.summary.totalReceivableCount} ·
                    Total outstanding: ${reportData.summary.totalOutstanding.toFixed(2)} ·
                    Total paid: ${reportData.summary.totalAmountPaid.toFixed(2)} ·
                    Guests: ${reportData.summary.guestCount}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Res. No</th>
                            <th>Guest Name</th>
                            <th>Room Number</th>
                            <th>Room Type</th>
                            <th>Opening Balance</th>
                            <th>Amount Paid</th>
                            <th>Outstanding</th>
                            <th>Created By</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
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
                        title="Account Receivable Summary Report"
                        subtitle="See all activities carried out"
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <AccountReceivableSummaryFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    roomOptions={filterOptions.roomOptions}
                    rateTypeOptions={filterOptions.rateTypeOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <AccountReceivableSummaryContent
                        data={null}
                        loading={true}
                    />
                ) : hasData ? (
                    <AccountReceivableSummaryContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            hotelName: user?.orgName ?? '',
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            reportPeriod: `${formatLongDate(filters.startDate)} ${to12Hour(filters.startTime)} → ${formatLongDate(filters.endDate)} ${to12Hour(filters.endTime)}`,
                            generatedBy:
                                reportData?.generatedBy ??
                                user?.fullName ??
                                'System',
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select filters and click Generate to see account receivable summary."
                    />
                )}
            </div>
        </PageWrapper>
    );
}
