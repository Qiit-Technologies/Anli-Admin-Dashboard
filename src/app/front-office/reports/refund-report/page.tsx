'use client';

import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import { getRefundReport } from '@/app/actions/guest';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import RefundReportContent from '@/components/front-office/refund-report/RefundReportContent';
import {
    buildRefundAccountOptions,
    paymentMethodLabel,
    refundAccountLabel,
} from '@/components/front-office/refund-report/constants';
import RefundReportFilters from '@/components/front-office/refund-report/RefundReportFilters';
import {
    RefundReportData,
    RefundReportFiltersState,
} from '@/components/front-office/refund-report/types';
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
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';

export default function RefundReport() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);

    const refundAccountOptions = useMemo(
        () => buildRefundAccountOptions(bankAccounts),
        [bankAccounts],
    );

    const [filters, setFilters] = useState<RefundReportFiltersState>({
        startDate: toYYYYMMDD(new Date()),
        startTime: '00:00',
        endDate: toYYYYMMDD(new Date()),
        endTime: '23:59',
        user: 'all',
        paymentMethod: 'all',
        refundAccount: 'all',
        guestSearch: '',
        guestProfileId: 'all',
        guestFilterLabel: '',
    });

    const [reportData, setReportData] = useState<RefundReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const resolvePaymentLabel = useCallback(() => {
        return paymentMethodLabel(filters.paymentMethod);
    }, [filters.paymentMethod]);

    const resolveAccountLabel = useCallback(() => {
        return refundAccountLabel(filters.refundAccount, refundAccountOptions);
    }, [filters.refundAccount, refundAccountOptions]);

    const resolveStaffLabel = useCallback(() => {
        if (filters.user === 'all') return 'All staff';
        const found = filterOptions.staffOptions.find(
            (o: { value: string; label: string }) => o.value === filters.user,
        );
        return found?.label ?? filters.user;
    }, [filters.user, filterOptions.staffOptions]);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const guestSearch = filters.guestSearch.trim();
            const result = await getRefundReport({
                startDate: filters.startDate,
                startTime: filters.startTime,
                endDate: filters.endDate,
                endTime: filters.endTime,
                user: filters.user,
                paymentMethod: filters.paymentMethod,
                refundAccount: filters.refundAccount,
                guestProfileId:
                    filters.guestProfileId !== 'all'
                        ? filters.guestProfileId
                        : undefined,
                guestSearch:
                    filters.guestProfileId === 'all' && guestSearch
                        ? guestSearch
                        : undefined,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.data) {
                setReportData(result.data as RefundReportData);
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
            'Guest Name': item.guestName,
            'Room / Type': item.roomLabel,
            'Stay Period': item.stayPeriod,
            Nights: item.nights,
            'Opening Balance': item.openingBalance,
            'Refund Amount': item.refundAmount,
            'Remaining Balance': item.remainingBalance,
            'Processed By': item.processedBy,
            'Payment Method': item.paymentMethod,
            'Refund From (Hotel Account)': item.refundFromAccount,
            Reason: item.reason,
        }));

        const filename = `Refund Report (${filters.startDate} ${filters.startTime} – ${filters.endDate} ${filters.endTime})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;

        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Refund Report';
        const period = `${formatLongDate(filters.startDate)} ${to12Hour(filters.startTime)} → ${formatLongDate(filters.endDate)} ${to12Hour(filters.endTime)}`;
        const generatedBy =
            reportData.generatedBy ?? user?.fullName ?? 'System';

        const tableRowsHtml = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.time}</td>
                    <td>${item.guestName}</td>
                    <td>${item.roomLabel}</td>
                    <td>${item.stayPeriod}</td>
                    <td style="text-align:right">${item.nights}</td>
                    <td style="text-align:right">${item.openingBalance.toFixed(2)}</td>
                    <td style="text-align:right">${item.refundAmount.toFixed(2)}</td>
                    <td style="text-align:right">${item.remainingBalance.toFixed(2)}</td>
                    <td>${item.processedBy}</td>
                    <td>${item.paymentMethod}</td>
                    <td>${item.refundFromAccount}</td>
                    <td>${item.reason}</td>
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
                    .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    .footer .created-by { color: #f97316; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Report period: ${period}</p>
                    <p>Printed at: ${new Date().toLocaleString()} · Printed by: ${generatedBy}.</p>
                </div>
                <div class="summary">
                    <strong>Summary</strong><br/>
                    Total refund count: ${reportData.summary.totalRefundCount} ·
                    Total refund amount: ${reportData.summary.totalRefundAmount.toFixed(2)} ·
                    Average refund: ${reportData.summary.averageRefundAmount.toFixed(2)} ·
                    Guests refunded: ${reportData.summary.guestCount}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Guest Name</th>
                            <th>Room / Type</th>
                            <th>Stay Period</th>
                            <th>Nights</th>
                            <th>Opening Bal.</th>
                            <th>Refund Amount</th>
                            <th>Remaining Balance</th>
                            <th>Processed By</th>
                            <th>Payment Method</th>
                            <th>Refund From (Hotel Account)</th>
                            <th>Reason</th>
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

    const headerInfo =
        reportGeneratedAt && reportData
            ? {
                  hotelName: user?.orgName ?? '',
                  printedAt: `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`,
                  reportPeriod: `${formatLongDate(filters.startDate)} ${to12Hour(filters.startTime)} → ${formatLongDate(filters.endDate)} ${to12Hour(filters.endTime)}`,
                  paymentMethodLabel: resolvePaymentLabel(),
                  refundAccountLabel: resolveAccountLabel(),
                  staffLabel: resolveStaffLabel(),
                  generatedBy:
                      reportData.generatedBy ?? user?.fullName ?? 'System',
                  generatedAt: reportGeneratedAt.toLocaleString(),
              }
            : undefined;

    let reportMain: ReactNode;
    if (isLoading) {
        reportMain = <RefundReportContent data={null} loading={true} />;
    } else if (hasData && reportData) {
        reportMain = (
            <RefundReportContent
                data={reportData}
                loading={false}
                headerInfo={headerInfo}
            />
        );
    } else {
        reportMain = (
            <EmptyReportState
                title="No results found"
                description="Select a timeframe and click Generate to see refund transactions."
            />
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Refund Report"
                        subtitle="See all activities carried out"
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <RefundReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                    staffOptions={filterOptions.staffOptions}
                    refundAccountOptions={refundAccountOptions}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">{reportMain}</div>

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
                        Created By:{' '}
                        {reportData?.generatedBy ?? user?.fullName ?? 'System'}
                    </span>
                </div>
            )}
        </PageWrapper>
    );
}
