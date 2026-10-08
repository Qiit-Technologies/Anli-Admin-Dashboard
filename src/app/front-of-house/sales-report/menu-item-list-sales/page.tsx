'use client';

import { getDineInAreas } from '@/app/actions/back-of-house';
import { getMenuItemListSalesReport } from '@/app/actions/order';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import MenuItemListSalesReportContent from '@/components/front-of-house/report/MenuItemListSalesReportContent';
import type { MenuItemListSalesReportData } from '@/components/front-of-house/report/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadData } from '@/lib/downloadData';
import { formatMenuItemListSalesReport } from '@/lib/print';
import { printReportToReceiptPrinter } from '@/lib/simplePrint';
import { Download, Inbox, Printer, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function buildPrintHtml(reportData: MenuItemListSalesReportData): string {
    const fmt = (n: number) =>
        n.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    const sections = reportData.categories
        .map(
            (cat) => `
<div class="section">
  <div class="bold">${cat.categoryName}</div>
  <table>
    <thead>
      <tr class="header"><th>Item</th><th class="right">Qty</th><th class="right">%</th><th class="right">Amount</th></tr>
    </thead>
    <tbody>
      ${cat.items
          .map(
              (i) =>
                  `<tr><td>${i.itemName}</td><td class="right">${i.quantity}</td><td class="right">${i.percent.toFixed(2)}%</td><td class="right">${fmt(i.amount)}</td></tr>`,
          )
          .join('')}
    </tbody>
    <tfoot>
      <tr class="total"><td>TOTAL (${cat.totalQuantity})</td><td class="right"></td><td class="right"></td><td class="right">${fmt(cat.totalAmount)}</td></tr>
    </tfoot>
  </table>
</div>`,
        )
        .join('');
    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Menu Item List Sales</title>
<style>
body { font-family: monospace; padding: 24px; color: #111; max-width: 480px; margin: 0 auto; font-size: 12px; }
.center { text-align: center; }
.bold { font-weight: bold; }
table { width: 100%; border-collapse: collapse; margin-top: 4px; }
th, td { padding: 2px 4px; text-align: left; }
th.right, td.right { text-align: right; }
.header th { font-size: 10px; color: #666; border-bottom: 1px dashed #999; padding-bottom: 4px; font-weight: normal; }
.total td { border-top: 1px dashed #999; font-weight: bold; padding-top: 4px; }
.hr { border-top: 1px dashed #999; margin: 10px 0; }
.section { margin-bottom: 16px; }
@media print { body { padding: 4px; font-size: 11px; } .hr { margin: 4px 0; } .section { margin-bottom: 8px; } th, td { padding: 1px 2px; } }
</style>
</head>
<body>
<div class="center bold">${reportData.businessName}</div>
<div class="center" style="font-size:10px;color:#666">${reportData.location}</div>
<div class="center bold" style="margin-top:12px">Menu Item List Sales</div>
<div class="center" style="font-size:10px">${reportData.periodStart}</div>
<div class="center" style="font-size:10px">${reportData.periodEnd}</div>
<div class="hr"></div>
${reportData.categories.length === 0 ? '<div class="center" style="color:#666">No categories with sales in this period.</div>' : sections}
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

/** Current calendar day in local time (YYYY-MM-DD). Use for defaults and half/full day print. */
const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const ORDER_TYPE_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'DINE_IN', label: 'Dine In' },
    { value: 'ROOM', label: 'Room' },
    { value: 'TAKE_AWAY', label: 'Take Away' },
    { value: 'FAST_FOOD', label: 'Fast Food' },
    { value: 'DELIVERY', label: 'Delivery' },
    { value: 'NO_CHARGE', label: 'No Charge' },
];

export default function MenuItemListSalesPage() {
    const [businessDateFrom, setBusinessDateFrom] = useState<string>(() =>
        getTodayDateString(),
    );
    const [businessDateTo, setBusinessDateTo] = useState<string>(() =>
        getTodayDateString(),
    );
    const [workPeriodFrom, setWorkPeriodFrom] = useState<string>('06:00');
    const [workPeriodTo, setWorkPeriodTo] = useState<string>('18:00');
    const [orderType, setOrderType] = useState<string>('FAST_FOOD');
    const [dineAreaId, setDineAreaId] = useState<string>('');
    const [dineAreaOptions, setDineAreaOptions] = useState<
        { value: string; label: string }[]
    >([]);

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

    const [reportData, setReportData] =
        useState<MenuItemListSalesReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPrintingThermal, setIsPrintingThermal] = useState(false);
    const [isPrintingHalfDay, setIsPrintingHalfDay] = useState(false);
    const [isPrintingFullDay, setIsPrintingFullDay] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setReportData(null);
        try {
            const res = await getMenuItemListSalesReport({
                startDate: businessDateFrom,
                startTime: workPeriodFrom,
                endDate: businessDateTo,
                endTime: workPeriodTo,
                ...(orderType ? { orderType } : {}),
                ...(orderType === 'DINE_IN' && dineAreaId
                    ? { dineAreaId: Number(dineAreaId) }
                    : {}),
            });
            if (res.error) {
                toast.error(res.error);
                return;
            }
            const data = res.data as MenuItemListSalesReportData;
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

    const handlePrintToThermal = async () => {
        if (!reportData) return;
        setIsPrintingThermal(true);
        try {
            const formatted = formatMenuItemListSalesReport(reportData);
            const result = await printReportToReceiptPrinter(formatted);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Failed to print to thermal printer.');
        } finally {
            setIsPrintingThermal(false);
        }
    };

    const handlePrintHalfDayToThermal = async () => {
        const today = getTodayDateString();
        setIsPrintingHalfDay(true);
        try {
            const res = await getMenuItemListSalesReport({
                startDate: today,
                startTime: '06:00',
                endDate: today,
                endTime: '18:00',
                ...(orderType ? { orderType } : {}),
                ...(orderType === 'DINE_IN' && dineAreaId
                    ? { dineAreaId: Number(dineAreaId) }
                    : {}),
            });
            if (res.error) {
                toast.error(res.error);
                return;
            }
            const data = res.data as MenuItemListSalesReportData;
            if (!data) {
                toast.error('No data returned');
                return;
            }
            setReportData(data);
            const formatted = formatMenuItemListSalesReport(data);
            const result = await printReportToReceiptPrinter(formatted);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Failed to print half day to thermal printer.');
        } finally {
            setIsPrintingHalfDay(false);
        }
    };

    const handlePrintFullDayToThermal = async () => {
        const today = getTodayDateString();
        setIsPrintingFullDay(true);
        try {
            const res = await getMenuItemListSalesReport({
                startDate: today,
                startTime: '00:00',
                endDate: today,
                endTime: '23:59',
                ...(orderType ? { orderType } : {}),
                ...(orderType === 'DINE_IN' && dineAreaId
                    ? { dineAreaId: Number(dineAreaId) }
                    : {}),
            });
            if (res.error) {
                toast.error(res.error);
                return;
            }
            const data = res.data as MenuItemListSalesReportData;
            if (!data) {
                toast.error('No data returned');
                return;
            }
            setReportData(data);
            const formatted = formatMenuItemListSalesReport(data);
            const result = await printReportToReceiptPrinter(formatted);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Failed to print full day to thermal printer.');
        } finally {
            setIsPrintingFullDay(false);
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
        const rows: Record<string, string | number>[] = [
            { Section: 'Menu Item List Sales', Metric: '', Value: '' },
            {
                Section: reportData.businessName,
                Metric: reportData.location,
                Value: '',
            },
            {
                Section: 'Period',
                Metric: reportData.periodStart,
                Value: reportData.periodEnd,
            },
            {},
        ];
        reportData.categories.forEach((cat) => {
            rows.push({ Section: cat.categoryName, Metric: '', Value: '' });
            cat.items.forEach((i) => {
                rows.push({
                    Section: i.itemName,
                    Metric: `${i.quantity} | ${i.percent.toFixed(2)}%`,
                    Value: i.amount,
                });
            });
            rows.push({
                Section: `TOTAL (${cat.totalQuantity})`,
                Metric: '',
                Value: cat.totalAmount,
            });
            rows.push({});
        });
        downloadData(
            rows,
            'xlsx',
            `Menu Item List Sales (${businessDateFrom} ${workPeriodFrom} - ${businessDateTo} ${workPeriodTo})`,
        );
    };

    const hasData = reportData != null;

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Menu Item List Sales"
                        subtitle="Category-grouped item sales for the selected period. Only categories with sales are shown. Report is generated on the backend."
                    />
                </div>
            </PageHeader>

            <div className="flex flex-col w-full gap-2 rounded-lg border p-4">
                <div className="flex flex-wrap items-end gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Business Date
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={businessDateFrom}
                                onChange={(e) =>
                                    setBusinessDateFrom(e.target.value)
                                }
                                className="w-[160px] min-w-0"
                            />
                            <span className="text-muted-foreground text-sm">
                                to
                            </span>
                            <Input
                                type="date"
                                value={businessDateTo}
                                onChange={(e) =>
                                    setBusinessDateTo(e.target.value)
                                }
                                className="w-[160px] min-w-0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Work Period (Time)
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                value={workPeriodFrom}
                                onChange={(e) =>
                                    setWorkPeriodFrom(e.target.value)
                                }
                                className="w-[110px] min-w-0"
                            />
                            <span className="text-muted-foreground text-sm">
                                to
                            </span>
                            <Input
                                type="time"
                                value={workPeriodTo}
                                onChange={(e) =>
                                    setWorkPeriodTo(e.target.value)
                                }
                                className="w-[110px] min-w-0"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="menu-item-list-order-type"
                            className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                            Order Type
                        </label>
                        <select
                            id="menu-item-list-order-type"
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
                            <label
                                htmlFor="menu-item-list-dine-area"
                                className="text-sm font-medium text-gray-700 whitespace-nowrap"
                            >
                                Dine Area
                            </label>
                            <select
                                id="menu-item-list-dine-area"
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
                        Print (browser)
                    </Button>
                    <Button
                        onClick={handlePrintToThermal}
                        variant="outline"
                        className="border-orion-blue text-orion-blue"
                        disabled={!hasData || isPrintingThermal}
                    >
                        <Printer size={16} className="mr-2" />
                        {isPrintingThermal ? 'Sending…' : 'Print to thermal'}
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
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            onClick={handlePrintHalfDayToThermal}
                            variant="outline"
                            className="border-orion-blue text-orion-blue"
                            disabled={isPrintingHalfDay || isPrintingFullDay}
                        >
                            <Printer size={16} className="mr-2" />
                            {isPrintingHalfDay
                                ? 'Sending…'
                                : 'Print half day (6 AM–6 PM)'}
                        </Button>
                        <Button
                            onClick={handlePrintFullDayToThermal}
                            variant="outline"
                            className="border-orion-blue text-orion-blue"
                            disabled={isPrintingHalfDay || isPrintingFullDay}
                        >
                            <Printer size={16} className="mr-2" />
                            {isPrintingFullDay ? 'Sending…' : 'Print full day'}
                        </Button>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                    Period: {reportData?.periodStart ?? '—'} —{' '}
                    {reportData?.periodEnd ?? '—'}
                </div>
            </div>

            {hasData ? (
                <MenuItemListSalesReportContent data={reportData ?? null} />
            ) : !isLoading ? (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    <Inbox size={40} className="mb-3 text-gray-400" />
                    <div className="font-medium text-gray-700">
                        No report generated
                    </div>
                    <div className="mt-1 text-sm">
                        Set Business Date From/To and Work Period times, then
                        click Generate. Only categories with sales in the period
                        are shown.
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
