'use client';

import { getDineInAreas } from '@/app/actions/back-of-house';
import { getWorkPeriodReport } from '@/app/actions/order';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import type {
    WorkPeriodItemSale,
    WorkPeriodPaymentRow,
    WorkPeriodReportData,
    WorkPeriodTicketCountRow,
    WorkPeriodUserSale,
} from '@/components/front-of-house/report/types';
import WorkPeriodReportContent from '@/components/front-of-house/report/WorkPeriodReportContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadData } from '@/lib/downloadData';
import { formatWorkPeriodReport } from '@/lib/print';
import { printReportToReceiptPrinter } from '@/lib/simplePrint';
import { Download, Inbox, Printer, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function buildPrintHtml(reportData: WorkPeriodReportData): string {
    const fmt = (n: number) =>
        n.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    const pay = (p: WorkPeriodPaymentRow) =>
        `<tr><td>${p.method}</td><td class="right">${p.percent.toFixed(2)}%</td><td class="right">${fmt(p.amount)}</td></tr>`;
    const tick = (r: WorkPeriodTicketCountRow) =>
        `<tr><td>${r.label}</td><td class="right">${r.count}</td><td class="right">${r.amount > 0 ? fmt(r.amount) : ''}</td></tr>`;
    const state = (r: { state: string; count: number; amount: number }) =>
        `<tr><td>${r.state}</td><td class="right">${r.count}</td><td class="right">${fmt(r.amount)}</td></tr>`;
    const item = (i: WorkPeriodItemSale) =>
        `<tr><td>${i.category}</td><td class="right">${i.percent.toFixed(2)}%</td><td class="right">${fmt(i.amount)}</td></tr>`;
    const user = (u: WorkPeriodUserSale) =>
        `<tr><td>${u.userName}</td><td class="right"></td><td class="right">${fmt(u.amount)}</td></tr>`;

    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Work Period Report</title>
<style>
body { font-family: monospace; padding: 24px; color: #111; max-width: 480px; margin: 0 auto; font-size: 12px; }
.center { text-align: center; }
.bold { font-weight: bold; }
table { width: 100%; border-collapse: collapse; margin-top: 4px; table-layout: fixed; }
th, td { padding: 2px 4px; text-align: left; vertical-align: middle; }
th.right, td.right { text-align: right; }
.hr { border-top: 1px dashed #999; margin: 10px 0; }
.section { margin-bottom: 16px; }
@media print { body { padding: 4px; font-size: 11px; } .hr { margin: 4px 0; } .section { margin-bottom: 8px; } th, td { padding: 1px 2px; } }
</style>
</head>
<body>
<div class="center bold">${reportData.businessName}</div>
<div class="center" style="font-size:10px;color:#666">${reportData.location}</div>
<div class="center bold" style="margin-top:12px">Work Period Report</div>
<div class="center" style="font-size:10px">${reportData.periodStart}</div>
<div class="center" style="font-size:10px">${reportData.periodEnd}</div>
<div class="hr"></div>
<div class="bold">Sales</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  <tr><td>Ticket</td><td class="right"></td><td class="right">${fmt(reportData.ticketSales)}</td></tr>
  <tr><td>GRAND TOTAL</td><td class="right"></td><td class="right">${fmt(reportData.grandTotal)}</td></tr>
</table>
<div class="hr"></div>
<div class="bold">Payments</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.payments.map(pay).join('')}
  <tr><td>Total</td><td class="right"></td><td class="right">${fmt(reportData.totalPayments)}</td></tr>
</table>
<div class="hr"></div>
<div class="bold">Ticket Details</div>
<div style="font-size:10px;margin-top:4px">Ticket Counts</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.ticketCounts.map(tick).join('')}
  <tr><td>Total</td><td class="right">${reportData.ticketCounts.reduce((a, r) => a + r.count, 0)}</td><td class="right">${fmt(reportData.ticketSales)}</td></tr>
  <tr><td>Amount/Ticket</td><td class="right"></td><td class="right">${fmt(reportData.amountPerTicket)}</td></tr>
</table>
<div style="font-size:10px;margin-top:8px">Order Counts</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.orderCounts.map(tick).join('')}
  <tr><td>Total</td><td class="right">${reportData.orderCounts.reduce((a, r) => a + r.count, 0)}</td><td class="right">${fmt(reportData.grandTotal)}</td></tr>
  <tr><td>Orders/Ticket</td><td class="right"></td><td class="right">${reportData.ordersPerTicket.toFixed(2)}</td></tr>
  <tr><td>Amount/Order</td><td class="right"></td><td class="right">${fmt(reportData.amountPerOrder)}</td></tr>
</table>
<div style="font-size:10px;margin-top:8px">Ticket Counts per State</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.ticketCountsByState.map(state).join('')}
</table>
<div class="hr"></div>
<div class="bold">Payment Details</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.paymentDetails.map(pay).join('')}
  <tr><td>7.5% VAT</td><td class="right"></td><td class="right">${fmt(reportData.vatAmount)}</td></tr>
</table>
<div style="font-size:10px;margin-top:4px">Delivery Ticket</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  <tr><td>7.5% VAT</td><td class="right"></td><td class="right">${fmt(reportData.deliveryVatAmount)}</td></tr>
</table>
<div class="hr"></div>
<div class="bold">User Sales</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.userSales.map(user).join('')}
</table>
<div class="bold" style="margin-top:8px">Settled by ${reportData.settledByUser.userName}</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.settledByUser.payments.map(pay).join('')}
  <tr><td>Total Income</td><td class="right"></td><td class="right">${fmt(reportData.settledByUser.totalIncome)}</td></tr>
</table>
<div class="hr"></div>
<div class="bold">Item Sales</div>
<table><colgroup><col style="width:auto" /><col style="width:80px" /><col style="width:120px" /></colgroup>
  ${reportData.itemSales.map(item).join('')}
  <tr><td>Total</td><td class="right"></td><td class="right">${fmt(reportData.totalItemSales)}</td></tr>
</table>
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

export default function WorkPeriodReportPage() {
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

    const [reportData, setReportData] = useState<WorkPeriodReportData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isPrintingThermal, setIsPrintingThermal] = useState(false);
    const [isPrintingHalfDay, setIsPrintingHalfDay] = useState(false);
    const [isPrintingFullDay, setIsPrintingFullDay] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setReportData(null);
        try {
            const res = await getWorkPeriodReport({
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
            const data = res.data as WorkPeriodReportData;
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
            const formatted = formatWorkPeriodReport(reportData);
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
            const res = await getWorkPeriodReport({
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
            const data = res.data as WorkPeriodReportData;
            if (!data) {
                toast.error('No data returned');
                return;
            }
            setReportData(data);
            const formatted = formatWorkPeriodReport(data);
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
            const res = await getWorkPeriodReport({
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
            const data = res.data as WorkPeriodReportData;
            if (!data) {
                toast.error('No data returned');
                return;
            }
            setReportData(data);
            const formatted = formatWorkPeriodReport(data);
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
            { Section: 'Work Period Report', Metric: '', Value: '' },
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
            {
                Section: 'Sales',
                Metric: 'Ticket',
                Value: reportData.ticketSales,
            },
            {
                Section: '',
                Metric: 'GRAND TOTAL',
                Value: reportData.grandTotal,
            },
            {},
        ];
        reportData.payments.forEach((p) => {
            rows.push({
                Section: 'Payments',
                Metric: p.method,
                Value: `${p.percent.toFixed(2)}% - ${p.amount}`,
            });
        });
        rows.push({
            Section: '',
            Metric: 'Total',
            Value: reportData.totalPayments,
        });
        rows.push({});
        reportData.userSales.forEach((u) => {
            rows.push({
                Section: 'User Sales',
                Metric: u.userName,
                Value: u.amount,
            });
        });
        rows.push({});
        reportData.itemSales.forEach((i) => {
            rows.push({
                Section: 'Item Sales',
                Metric: i.category,
                Value: `${i.percent.toFixed(2)}% - ${i.amount}`,
            });
        });
        rows.push({
            Section: '',
            Metric: 'Total Item Sales',
            Value: reportData.totalItemSales,
        });
        downloadData(
            rows,
            'xlsx',
            `Work Period Report (${businessDateFrom} ${workPeriodFrom} - ${businessDateTo} ${workPeriodTo})`,
        );
    };

    const hasData = reportData != null;

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Work Period Report"
                        subtitle="Generate report for a business date and work period time range. Report is generated on the backend."
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
                            htmlFor="work-period-order-type"
                            className="text-sm font-medium text-gray-700 whitespace-nowrap"
                        >
                            Order Type
                        </label>
                        <select
                            id="work-period-order-type"
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
                                htmlFor="work-period-dine-area"
                                className="text-sm font-medium text-gray-700 whitespace-nowrap"
                            >
                                Dine Area
                            </label>
                            <select
                                id="work-period-dine-area"
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
                <WorkPeriodReportContent data={reportData ?? null} />
            ) : !isLoading ? (
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                    <Inbox size={40} className="mb-3 text-gray-400" />
                    <div className="font-medium text-gray-700">
                        No report generated
                    </div>
                    <div className="mt-1 text-sm">
                        Set Business Date From/To and Work Period times, then
                        click Generate. Data is captured on the backend.
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
