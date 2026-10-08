'use client';

import {
    getArSummaryDashboard,
    type ArSummaryDashboardData,
} from '@/app/actions/receivables';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AR_SUMMARY_NET_TERMS_DAYS } from '@/constants/ar-summary';
import { downloadData } from '@/lib/downloadData';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, FileSpreadsheet, Printer } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import useSWR from 'swr';

function KpiCard({
    label,
    value,
    valueClassName,
}: Readonly<{
    label: string;
    value: string;
    valueClassName?: string;
}>) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p
                className={`text-xl font-semibold text-gray-900 ${valueClassName ?? ''}`}
            >
                {value}
            </p>
        </div>
    );
}

export default function ArSummaryPage() {
    const { data, error, isLoading } = useSWR<ArSummaryDashboardData>(
        'accounts-ar-summary',
        async () => {
            const r = await getArSummaryDashboard();
            if (r && typeof r === 'object' && 'error' in r) {
                throw new Error((r as { error: string }).error);
            }
            return r as ArSummaryDashboardData;
        },
        { revalidateOnFocus: true },
    );

    const chartData = useMemo(
        () =>
            (data?.agingBuckets ?? []).map((b) => ({
                name: b.label,
                amount: b.amount,
            })),
        [data?.agingBuckets],
    );

    const handleExport = useCallback(() => {
        if (!data?.rows?.length) return;
        const rows = data.rows.map((r) => ({
            'Guest Name': r.guestName,
            'Invoice No.': r.invoiceNo,
            'Service Date': r.serviceDate,
            'Invoice Date': r.invoiceDate,
            'Due Date': r.dueDate,
            'Total Invoiced': r.totalInvoiced,
            Paid: r.paid,
            Balance: r.balance,
            'Aging (days)': r.agingDays,
            Remarks: r.remarks ?? '',
        }));
        downloadData(rows, 'xlsx', 'AR-Summary');
    }, [data?.rows]);

    const handlePrint = useCallback(() => {
        if (!data?.rows?.length) return;
        const win = window.open('', '_blank');
        if (!win) return;

        const rowsHtml = data.rows
            .map(
                (r) => `
            <tr>
              <td>${r.guestName}</td>
              <td>${r.invoiceNo}</td>
              <td>${r.serviceDate}</td>
              <td>${r.invoiceDate}</td>
              <td>${r.dueDate}</td>
              <td>${r.totalInvoiced}</td>
              <td>${r.paid}</td>
              <td>${r.balance}</td>
              <td>${r.agingDays}</td>
              <td>${(r.remarks ?? '').replaceAll('<', '&lt;')}</td>
            </tr>`,
            )
            .join('');

        win.document
            .write(`<!doctype html><html><head><meta charset="utf-8"/><title>AR Summary</title>
        <style>
          body{font-family:sans-serif;padding:24px;color:#111}
          h1{font-size:22px}
          table{width:100%;border-collapse:collapse;font-size:11px;margin-top:16px}
          th,td{border:1px solid #ddd;padding:6px;text-align:left}
          th{background:#f4f4f4}
        </style></head><body>
        <h1>AR Summary</h1>
        <p>Printed ${new Date().toLocaleString()}</p>
        <table><thead><tr>
          <th>Guest Name</th><th>Invoice No.</th><th>Service Date</th><th>Invoice Date</th><th>Due Date</th>
          <th>Total Invoiced</th><th>Paid</th><th>Balance</th><th>Aging (days)</th><th>Remarks</th>
        </tr></thead><tbody>${rowsHtml}</tbody></table>
        <script>window.onload=()=>{window.print();window.close();}</script>
        </body></html>`);
        win.document.close();
    }, [data?.rows]);

    if (error) {
        return (
            <PageWrapper>
                <div className="p-6">
                    <Button variant="ghost" asChild className="mb-4 -ml-2">
                        <Link href="/front-office/account-section/receivables">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Link>
                    </Button>
                    <p className="text-red-600">{error.message}</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <Button variant="ghost" asChild className="mb-2 -ml-2">
                        <Link href="/front-office/account-section/receivables">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        AR Summary
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Due dates use net {AR_SUMMARY_NET_TERMS_DAYS} from
                        invoice date until per-invoice due dates exist in the
                        system.
                    </p>
                </div>

                {isLoading || !data ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-24 rounded-lg bg-gray-100"
                                />
                            ))}
                        </div>
                        <div className="h-64 rounded-lg bg-gray-100" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                <KpiCard
                                    label="Total Accounts Receivable"
                                    value={formatCurrency(
                                        data.kpis.totalAccountsReceivable,
                                    )}
                                />
                                <KpiCard
                                    label="Outstanding Invoices"
                                    value={String(
                                        data.kpis.outstandingInvoices,
                                    )}
                                />
                                <KpiCard
                                    label="Total Overdue"
                                    value={formatCurrency(
                                        data.kpis.totalOverdue,
                                    )}
                                />
                                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">
                                        Top Debtor
                                    </p>
                                    {data.kpis.topDebtorName ? (
                                        <>
                                            <p className="text-base font-medium text-gray-900 truncate">
                                                {data.kpis.topDebtorName}
                                            </p>
                                            <p className="text-xl font-semibold text-red-600 mt-1">
                                                {formatCurrency(
                                                    data.kpis.topDebtorAmount,
                                                )}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-xl font-semibold text-gray-400">
                                            —
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="rounded-lg border border-gray-200 bg-white p-4 min-h-[280px] w-full">
                                    <h2 className="text-sm font-semibold text-gray-800 mb-4">
                                        Aging distribution
                                    </h2>
                                    <div className="h-[240px] w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fontSize: 11 }}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 11 }}
                                                    tickFormatter={(v) =>
                                                        formatCurrency(
                                                            Number(v),
                                                        )
                                                    }
                                                />
                                                <Tooltip
                                                    formatter={(
                                                        value: number,
                                                    ) => formatCurrency(value)}
                                                />
                                                <Bar
                                                    dataKey="amount"
                                                    fill="#007BFF"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                {/* <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 flex items-center justify-center text-sm text-gray-500">
                                Totals reconcile with the Account Receivable list.
                                Generated {new Date(data.generatedAt).toLocaleString()}{' '}
                                · {data.generatedBy}
                            </div> */}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Outstanding Invoice Table
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Below the aging section is a detailed
                                        invoice table.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExport}
                                        disabled={!data.rows.length}
                                        className="gap-2"
                                    >
                                        <FileSpreadsheet className="h-4 w-4" />
                                        Export Report
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                        disabled={!data.rows.length}
                                        className="gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-[#F4F4F4]">
                                            <TableHead>Guest Name</TableHead>
                                            <TableHead>Invoice No.</TableHead>
                                            <TableHead>Service Date</TableHead>
                                            <TableHead>Invoice Date</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="text-right">
                                                Total Invoiced
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Paid
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Balance
                                            </TableHead>
                                            <TableHead>Aging</TableHead>
                                            <TableHead>Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.rows.map((r, i) => (
                                            <TableRow
                                                key={`${r.invoiceNo}-${i}`}
                                            >
                                                <TableCell className="font-medium">
                                                    {r.guestName}
                                                </TableCell>
                                                <TableCell>
                                                    {r.invoiceNo}
                                                </TableCell>
                                                <TableCell>
                                                    {r.serviceDate}
                                                </TableCell>
                                                <TableCell>
                                                    {r.invoiceDate}
                                                </TableCell>
                                                <TableCell>
                                                    {r.dueDate}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(
                                                        r.totalInvoiced,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {r.paid > 0
                                                        ? formatCurrency(r.paid)
                                                        : 'NO'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(r.balance)}
                                                </TableCell>
                                                <TableCell>
                                                    {r.agingDays <= 0
                                                        ? 'Current'
                                                        : `${r.agingDays} days`}
                                                </TableCell>
                                                <TableCell className="max-w-[140px] truncate text-gray-600">
                                                    {r.remarks ?? '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {data.rows.length === 0 && (
                                <p className="p-8 text-center text-gray-500">
                                    No outstanding receivable lines.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PageWrapper>
    );
}
