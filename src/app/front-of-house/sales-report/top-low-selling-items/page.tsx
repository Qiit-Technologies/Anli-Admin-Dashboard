'use client';

import { getDineInAreas } from '@/app/actions/back-of-house';
import { getTopLowSellingItemsReport } from '@/app/actions/order';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import TopLowSellingItemsReportContent from '@/components/front-of-house/report/TopLowSellingItemsReportContent';
import type { TopLowSellingItemsReportData } from '@/components/front-of-house/report/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadData } from '@/lib/downloadData';
import { Download, Inbox, Printer, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const PERIOD_OPTIONS = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly (last 7 days)' },
    { value: 'MONTHLY', label: 'Monthly (current month)' },
    { value: 'CUSTOM', label: 'Custom range' },
] as const;

const ORDER_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'DINE_IN', label: 'Dine In' },
    { value: 'ROOM', label: 'Room' },
    { value: 'TAKE_AWAY', label: 'Take Away' },
    { value: 'FAST_FOOD', label: 'Fast Food' },
    { value: 'DELIVERY', label: 'Delivery' },
    { value: 'NO_CHARGE', label: 'No Charge' },
];

function buildPrintHtml(reportData: TopLowSellingItemsReportData): string {
    const fmt = (n: number) =>
        n.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    const section = (
        title: string,
        rows: TopLowSellingItemsReportData['topByQuantity'],
    ) => `
<div class="section">
  <div class="bold">${title}</div>
  <table>
    <thead>
      <tr class="header"><th>#</th><th>Item</th><th>Category</th><th class="right">Qty</th><th class="right">Revenue</th></tr>
    </thead>
    <tbody>
      ${rows
          .map(
              (row, index) =>
                  `<tr><td>${index + 1}</td><td>${row.itemName}</td><td>${row.categoryName}</td><td class="right">${row.quantitySold}</td><td class="right">${fmt(row.revenue)}</td></tr>`,
          )
          .join('')}
    </tbody>
  </table>
</div>`;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Top & Low Selling Items Report</title>
<style>
body { font-family: Arial, sans-serif; padding: 18px; color: #111; }
.center { text-align: center; }
.bold { font-weight: 700; }
.meta { color: #666; font-size: 12px; }
.summary { margin: 10px 0; display: flex; gap: 8px; flex-wrap: wrap; }
.pill { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; font-size: 12px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
th, td { border: 1px solid #eee; padding: 6px; text-align: left; }
th.right, td.right { text-align: right; }
.header th { background: #fafafa; }
.section { margin-top: 14px; }
</style>
</head>
<body>
<div class="center bold">${reportData.businessName}</div>
<div class="center meta">${reportData.location}</div>
<div class="center bold" style="margin-top:10px">Top & Low Selling Items Report</div>
<div class="center meta">${reportData.periodStart} - ${reportData.periodEnd}</div>
<div class="summary">
  <div class="pill">Distinct Items: <strong>${reportData.totalDistinctItemsSold}</strong></div>
  <div class="pill">Total Qty: <strong>${reportData.totalQuantitySold}</strong></div>
  <div class="pill">Total Revenue: <strong>${fmt(reportData.totalRevenue)}</strong></div>
  <div class="pill">Guests: <strong>${reportData.totalGuestsCount}</strong></div>
  <div class="pill">Avg Spend/Guest: <strong>${fmt(reportData.averageSpendPerGuest)}</strong></div>
</div>
${section('Top Selling by Quantity', reportData.topByQuantity)}
${section('Low Selling by Quantity', reportData.lowByQuantity)}
${section('Top Selling by Revenue', reportData.topByRevenue)}
${section('Low Selling by Revenue', reportData.lowByRevenue)}
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

export default function TopLowSellingItemsReportPage() {
    const [period, setPeriod] =
        useState<TopLowSellingItemsReportData['periodType']>('DAILY');
    const [startDate, setStartDate] = useState<string>(() =>
        getTodayDateString(),
    );
    const [startTime, setStartTime] = useState<string>('00:00');
    const [endDate, setEndDate] = useState<string>(() => getTodayDateString());
    const [endTime, setEndTime] = useState<string>('23:59');
    const [orderType, setOrderType] = useState<string>('FAST_FOOD');
    const [dineAreaId, setDineAreaId] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [dineAreaOptions, setDineAreaOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [reportData, setReportData] =
        useState<TopLowSellingItemsReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getDineInAreas().then((res) => {
            if (res.data) {
                setDineAreaOptions([
                    { value: '', label: 'All outlets (incl. Take Away)' },
                    ...res.data.map((d: { id: number; name: string }) => ({
                        value: String(d.id),
                        label: d.name,
                    })),
                ]);
            }
        });
    }, []);

    const isCustomPeriod = period === 'CUSTOM';
    const hasData = reportData != null;

    const reportRowsForExport = useMemo(() => {
        if (!reportData) return [];
        const sectionRows = (
            title: string,
            rows: TopLowSellingItemsReportData['topByQuantity'],
        ) => [
            {
                Section: title,
                Rank: '',
                Item: '',
                Category: '',
                Qty: '',
                Revenue: '',
            },
            ...rows.map((r, idx) => ({
                Section: '',
                Rank: idx + 1,
                Item: r.itemName,
                Category: r.categoryName,
                Qty: r.quantitySold,
                Revenue: r.revenue,
            })),
            {
                Section: '',
                Rank: '',
                Item: '',
                Category: '',
                Qty: '',
                Revenue: '',
            },
        ];

        return [
            {
                Section: 'Summary',
                Rank: 'Distinct Items',
                Item: reportData.totalDistinctItemsSold,
                Category: 'Total Qty',
                Qty: reportData.totalQuantitySold,
                Revenue: reportData.totalRevenue,
            },
            {
                Section: 'Summary',
                Rank: 'Guests',
                Item: reportData.totalGuestsCount,
                Category: 'Avg Spend/Guest',
                Qty: '',
                Revenue: reportData.averageSpendPerGuest,
            },
            ...sectionRows('Top Selling by Quantity', reportData.topByQuantity),
            ...sectionRows('Low Selling by Quantity', reportData.lowByQuantity),
            ...sectionRows('Top Selling by Revenue', reportData.topByRevenue),
            ...sectionRows('Low Selling by Revenue', reportData.lowByRevenue),
        ];
    }, [reportData]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setReportData(null);
        try {
            const res = await getTopLowSellingItemsReport({
                period,
                ...(isCustomPeriod
                    ? {
                          startDate,
                          startTime,
                          endDate,
                          endTime,
                      }
                    : {}),
                ...(orderType ? { orderType } : {}),
                ...(orderType === 'DINE_IN' && dineAreaId
                    ? { dineAreaId: Number(dineAreaId) }
                    : {}),
                limit,
            });

            if (res.error) {
                toast.error(res.error);
                return;
            }
            const data = res.data as TopLowSellingItemsReportData;
            if (!data) {
                toast.error('No data returned');
                return;
            }
            setReportData(data);
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        if (!reportData) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(buildPrintHtml(reportData));
        win.document.close();
        win.focus();
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        downloadData(
            reportRowsForExport,
            'xlsx',
            `Top & Low Selling Items (${reportData.periodType})`,
        );
    };

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Top & Low Selling Items"
                        subtitle="Rank menu items by quantity sold and revenue for selected periods."
                    />
                </div>
            </PageHeader>

            <div className="flex flex-col w-full gap-2 rounded-lg border p-4">
                <div className="flex flex-wrap items-end gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Period
                        </label>
                        <select
                            value={period}
                            onChange={(e) =>
                                setPeriod(
                                    e.target
                                        .value as TopLowSellingItemsReportData['periodType'],
                                )
                            }
                            className="h-9 w-[210px] min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {PERIOD_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isCustomPeriod && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Start Date/Time
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-[160px] min-w-0"
                                    />
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className="w-[110px] min-w-0"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    End Date/Time
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="w-[160px] min-w-0"
                                    />
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        className="w-[110px] min-w-0"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Order Type
                        </label>
                        <select
                            value={orderType}
                            onChange={(e) => {
                                const v = e.target.value;
                                setOrderType(v);
                                if (v !== 'DINE_IN') setDineAreaId('');
                            }}
                            className="h-9 w-[140px] min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {ORDER_TYPE_OPTIONS.map((opt) => (
                                <option
                                    key={opt.value || 'all'}
                                    value={opt.value}
                                >
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {orderType === 'DINE_IN' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Dine Area
                            </label>
                            <select
                                value={dineAreaId}
                                onChange={(e) => setDineAreaId(e.target.value)}
                                className="h-9 w-[180px] min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {dineAreaOptions.map((opt) => (
                                    <option
                                        key={opt.value || 'all'}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Rows per list
                        </label>
                        <Input
                            type="number"
                            min={1}
                            max={100}
                            value={limit}
                            onChange={(e) =>
                                setLimit(
                                    Math.min(
                                        100,
                                        Math.max(
                                            1,
                                            Number(e.target.value || 10),
                                        ),
                                    ),
                                )
                            }
                            className="w-[100px]"
                        />
                    </div>
                </div>

                <hr className="my-3" />
                <div className="flex flex-wrap items-center gap-3">
                    <BrandButton
                        onClick={handleGenerate}
                        loading={isLoading}
                        icon={<RefreshCcw size={16} />}
                    >
                        Generate
                    </BrandButton>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="border-orion-blue text-orion-blue"
                        disabled={!hasData}
                    >
                        <Printer size={16} className="mr-2" />
                        Print
                    </Button>
                    <Button
                        onClick={handleExportExcel}
                        variant="outline"
                        className="border-orion-blue text-orion-blue"
                        disabled={!hasData}
                    >
                        <Download size={16} className="mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {hasData ? (
                <TopLowSellingItemsReportContent data={reportData} />
            ) : !isLoading ? (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    <Inbox size={40} className="mb-3 text-gray-400" />
                    <div className="font-medium text-gray-700">
                        No report generated
                    </div>
                    <div className="mt-1 text-sm">
                        Select filters, then click Generate to view top and low
                        selling menu items.
                    </div>
                </div>
            ) : null}

            {isLoading && (
                <div className="mt-4 text-sm text-muted-foreground">
                    Loading report...
                </div>
            )}
        </PageWrapper>
    );
}
