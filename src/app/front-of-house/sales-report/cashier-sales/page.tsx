'use client';

import { useState } from 'react';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import ReportFilters from '@/components/front-of-house/report/ReportFilters';
import CashierSalesReportContent from '@/components/front-of-house/report/CashierSalesReportContent';
import EmptyReportState from '@/components/front-of-house/report/EmptyReportState';
import {
    CashierSalesFiltersState,
    CashierSalesReportData,
} from '@/components/front-of-house/report/types';
import { getCashierSalesReport } from '@/app/actions/order';
import { getStaffList } from '@/app/actions/staff';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { useUser } from '@/context/useUser';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { downloadData } from '@/lib/downloadData';
import { formatCashierSalesReport } from '@/lib/print';
import { printReportToReceiptPrinter } from '@/lib/simplePrint';
import { formatCurrency } from '@/lib/utils';

const toYYYYMMDD = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())
        .toISOString()
        .slice(0, 10);

const toHHMM = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

const formatLongDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const to12Hour = (hhmm: string) => {
    const [hStr, m] = hhmm.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
};

export default function CashierSales() {
    const { user } = useUser();

    const [filters, setFilters] = useState<CashierSalesFiltersState>({
        startDate: toYYYYMMDD(new Date()),
        startTime: toHHMM(new Date()),
        endDate: toYYYYMMDD(new Date()),
        endTime: toHHMM(new Date()),
        outlet: 'all',
        cashier: '',
        orderType: 'all',
        menuType: 'all',
        showVoidedReceipts: true,
        showDetailedReceiptList: false,
        showMenuItemBreakdown: false,
    });

    const [reportData, setReportData] = useState<CashierSalesReportData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isPrintingThermal, setIsPrintingThermal] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );
    const [outletOptions, setOutletOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [cashierOptions, setCashierOptions] = useState<
        { value: string; label: string }[]
    >([]);

    const getOptionLabel = (
        options: { value: string; label: string }[],
        value: string,
        fallback: string,
    ) => {
        const option = options.find((o) => o.value === value);
        return option ? option.label : fallback;
    };

    const currentOutletName = getOptionLabel(
        outletOptions,
        filters.outlet,
        'All Dine Areas',
    );
    const currentCashierName = getOptionLabel(
        cashierOptions,
        filters.cashier,
        'Select Cashier',
    );

    useEffect(() => {
        const fetchOptions = async () => {
            const [dineAreasRes, staffRes] = await Promise.all([
                getDineInAreas(),
                getStaffList(1, 50),
            ]);

            if (dineAreasRes.data) {
                setOutletOptions(
                    dineAreasRes.data.map((d: any) => ({
                        value: String(d.id),
                        label: d.name,
                    })),
                );
            }

            if (staffRes.data) {
                // Filter staff to only show Waiters and Waitresses
                const filteredStaff = staffRes.data.filter((s: any) => {
                    const roleName = s.roles?.name?.toLowerCase() || '';
                    return (
                        roleName.includes('waiter') ||
                        roleName.includes('waitress')
                    );
                });

                setCashierOptions(
                    filteredStaff.map((s: any) => ({
                        value: String(s.id),
                        label: s.fullName,
                    })),
                );
            }
        };

        fetchOptions();
    }, []);

    // using real api
    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const res = await getCashierSalesReport({
                startDate: filters.startDate,
                startTime: filters.startTime,
                endDate: filters.endDate,
                endTime: filters.endTime,
                outletId: filters.outlet === 'all' ? '' : filters.outlet,
                cashierId: filters.cashier === 'all' ? '' : filters.cashier,
                orderType: filters.orderType === 'all' ? '' : filters.orderType,
                menuType: filters.menuType === 'all' ? '' : filters.menuType,
                showVoidedReceipts: filters.showVoidedReceipts,
                showDetailedReceiptList: filters.showDetailedReceiptList,
                showMenuItemBreakdown: filters.showMenuItemBreakdown,
            });

            if (res.error) {
                toast.error(res.error);
                setReportData(null);
            } else if (
                !res.data ||
                (res.data.salesSummary.length === 0 && res.data.netSales === 0)
            ) {
                toast.error('Please select a date range to generate Report');
                setReportData(null);
            } else {
                // Enrich data manually in frontend as per user requirement to ensure metrics consistency
                const data = res.data as CashierSalesReportData;
                const summary = data.receiptSummary;

                // 1. Total Payments
                if (!summary.find((i) => i.metric === 'Total Payments')) {
                    const totalPayments = data.paymentSummary.reduce(
                        (sum, item) => sum + item.value,
                        0,
                    );
                    summary.push({
                        metric: 'Total Payments',
                        value: totalPayments,
                    });
                }

                // 2. Voided Receipts
                if (!summary.find((i) => i.metric === 'Voided Receipts')) {
                    summary.push({
                        metric: 'Voided Receipts',
                        value: data.voidedReceipts.length,
                    });
                }

                // 3. Sales per Receipts
                const totalReceiptsItem = summary.find(
                    (i) => i.metric.toLowerCase() === 'total receipts',
                );
                const totalReceiptsVal = totalReceiptsItem
                    ? Number(totalReceiptsItem.value)
                    : 0;

                if (totalReceiptsVal > 0) {
                    const sprIdx = summary.findIndex(
                        (i) => i.metric === 'Sales per Receipt',
                    );
                    const sprVal = data.netSales / totalReceiptsVal;

                    if (sprIdx >= 0) {
                        summary[sprIdx].value = sprVal;
                    } else {
                        summary.push({
                            metric: 'Sales per Receipt',
                            value: sprVal,
                        });
                    }
                }

                // 4. Sales per Pax
                const totalPaxItem = summary.find(
                    (i) =>
                        i.metric.toLowerCase() === 'total pax' ||
                        i.metric.toLowerCase() === 'pax',
                );
                const totalPaxVal = totalPaxItem
                    ? Number(totalPaxItem.value)
                    : 0;
                if (totalPaxVal > 0) {
                    const sppIdx = summary.findIndex(
                        (i) => i.metric === 'Sales per Pax',
                    );
                    const sppVal = data.netSales / totalPaxVal;

                    if (sppIdx >= 0) {
                        summary[sppIdx].value = sppVal;
                    } else {
                        summary.push({
                            metric: 'Sales per Pax',
                            value: sppVal,
                        });
                    }
                }

                setReportData(data);
                setReportGeneratedAt(new Date());
            }
        } catch (error: any) {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };
    // this is the export to excel function
    const handleExportExcel = () => {
        if (!reportData) return;

        const dataToExport: any[] = [];

        // 1. Receipt Summary
        dataToExport.push({
            Section: 'RECEIPT SUMMARY',
            Metric: '',
            Value: '',
        });
        reportData.receiptSummary.forEach((item) => {
            const isMonetary =
                item.metric.toLowerCase().includes('payment') ||
                item.metric.toLowerCase().includes('sales per');
            dataToExport.push({
                Section: '',
                Metric: item.metric,
                Value: isMonetary
                    ? formatCurrency(Number(item.value))
                    : item.value,
            });
        });
        dataToExport.push({});

        // 2. Sales Summary
        dataToExport.push({
            Section: 'SALES SUMMARY',
            Metric: 'Description',
            Value: 'Amount',
        });
        reportData.salesSummary.forEach((item) => {
            dataToExport.push({
                Section: '',
                Metric: item.description,
                Value: item.amount,
            });
        });
        dataToExport.push({
            Section: '',
            Metric: 'Net Sales',
            Value: reportData.netSales,
        });
        dataToExport.push({});

        // 3. Category Summary
        dataToExport.push({
            Section: 'CATEGORY SUMMARY',
            Metric: 'Category',
            Value: 'Qty',
            Value2: 'Value',
        });
        reportData.categorySummary.forEach((item) => {
            dataToExport.push({
                Section: '',
                Metric: item.metric,
                Value: item.qty,
                Value2: item.value,
            });
        });
        dataToExport.push({});

        // 4. Detailed Receipt List
        if (
            filters.showDetailedReceiptList &&
            reportData.detailedReceiptList.length > 0
        ) {
            dataToExport.push({
                Section: 'DETAILED RECEIPTS',
                Metric: 'Receipt No',
                Value: 'Guest',
                Value2: 'Amount',
                Value3: 'Payment',
            });
            reportData.detailedReceiptList.forEach((item) => {
                dataToExport.push({
                    Section: '',
                    Metric: item.receiptNo,
                    Value: item.guestName,
                    Value2: item.amount,
                    Value3: item.payment,
                });
            });
            dataToExport.push({});
        }

        // 5. Voided Receipts
        if (
            filters.showVoidedReceipts &&
            reportData.voidedReceipts.length > 0
        ) {
            dataToExport.push({
                Section: 'VOIDED RECEIPTS',
                Metric: 'Receipt No',
                Value: 'Staff',
                Value2: 'Reason',
                Value3: 'Customer',
            });
            reportData.voidedReceipts.forEach((item) => {
                dataToExport.push({
                    Section: '',
                    Metric: item.receiptNo,
                    Value: item.staff,
                    Value2: item.reason,
                    Value3: item.customerName,
                });
            });
            dataToExport.push({});
        }

        // 6. Menu Item Breakdown
        if (
            filters.showMenuItemBreakdown &&
            reportData.menuItemBreakdown.length > 0
        ) {
            dataToExport.push({
                Section: 'MENU ITEM BREAKDOWN',
                Metric: 'Item Name',
                Value: 'Qty Sold',
                Value2: 'Amount',
            });
            reportData.menuItemBreakdown.forEach((item) => {
                dataToExport.push({
                    Section: '',
                    Metric: item.itemName,
                    Value: item.qtySold,
                    Value2: item.amount,
                });
            });
        }

        const filename = `Cashier Sales Report (${filters.startDate} - ${filters.endDate})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    // function to print the report
    const handlePrint = () => {
        if (!reportData) return;

        const win = window.open('', '_blank');
        if (!win) return;

        const title = 'Cashier Sales Report';
        const period = `Period: ${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`;
        const dineArea = currentOutletName;
        const cashier = currentCashierName;
        const generatedBy = user?.fullName ?? 'System';

        const receiptSummaryHtml = reportData.receiptSummary
            .map((item) => {
                const isMonetary =
                    item.metric.toLowerCase().includes('payment') ||
                    item.metric.toLowerCase().includes('sales per');
                const displayValue = isMonetary
                    ? formatCurrency(Number(item.value))
                    : item.value;
                return `<tr><td>${item.metric}</td><td style="text-align:right">${displayValue}</td></tr>`;
            })
            .join('');

        const salesSummaryHtml = reportData.salesSummary
            .map(
                (item) =>
                    `<tr><td>${item.description}</td><td style="text-align:right">${formatCurrency(item.amount)}</td></tr>`,
            )
            .join('');

        const categorySummaryHtml = reportData.categorySummary
            .map(
                (item) =>
                    `<tr><td>${item.metric}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">${formatCurrency(item.value)}</td></tr>`,
            )
            .join('');

        const paymentSummaryHtml = reportData.paymentSummary
            .map(
                (item) =>
                    `<tr><td>${item.paymentType}</td><td style="text-align:center">${item.count}</td><td style="text-align:right">${formatCurrency(item.value)}</td></tr>`,
            )
            .join('');

        const detailedReceiptsHtml =
            filters.showDetailedReceiptList &&
            reportData.detailedReceiptList.length > 0
                ? `
            <div class="section">
                <div class="section-title">Detailed Receipt List</div>
                <table>
                    <thead><tr><th>Guest Name</th><th>Receipt No</th><th style="text-align:right">Amount</th><th>Payment</th><th>Staff</th><th>Time</th></tr></thead>
                    ${reportData.detailedReceiptList
                        .map(
                            (o) => `
                        <tr>
                            <td>${o.guestName}</td>
                            <td>${o.receiptNo}</td>
                            <td style="text-align:right">${formatCurrency(o.amount)}</td>
                            <td>${o.payment}</td>
                            <td>${o.staff}</td>
                            <td>${o.time}</td>
                        </tr>
                    `,
                        )
                        .join('')}
                </table>
            </div>`
                : '';

        const voidedReceiptsHtml =
            filters.showVoidedReceipts && reportData.voidedReceipts.length > 0
                ? `
            <div class="section">
                <div class="section-title">Voided Receipts</div>
                <table>
                    <thead><tr><th>Receipt No</th><th>Staff</th><th>Reason</th><th>Customer</th><th>Dine Area</th><th>Time</th></tr></thead>
                    ${reportData.voidedReceipts
                        .map(
                            (o) => `
                        <tr>
                            <td>${o.receiptNo}</td>
                            <td>${o.staff}</td>
                            <td>${o.reason}</td>
                            <td>${o.customerName}</td>
                            <td>${o.dineArea}</td>
                            <td>${o.time}</td>
                        </tr>
                    `,
                        )
                        .join('')}
                </table>
            </div>`
                : '';

        const menuItemBreakdownHtml =
            filters.showMenuItemBreakdown &&
            reportData.menuItemBreakdown.length > 0
                ? `
            <div class="section">
                <div class="section-title">Menu Item Breakdown</div>
                <table>
                    <thead><tr><th>Item Name</th><th style="text-align:center">Qty Sold</th><th style="text-align:right">Amount</th></tr></thead>
                    ${reportData.menuItemBreakdown
                        .map(
                            (o) => `
                        <tr>
                            <td>${o.itemName}</td>
                            <td style="text-align:center">${o.qtySold}</td>
                            <td style="text-align:right">${formatCurrency(o.amount)}</td>
                        </tr>
                    `,
                        )
                        .join('')}
                </table>
            </div>`
                : '';

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; max-width: 900px; margin: auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 24px; color: #000; }
                    .header p { margin: 5px 0; color: #666; font-size: 14px; }
                    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                    .section { margin-bottom: 30px; }
                    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; }
                    th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                    .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                    @media print { body { padding: 0; } .sidebar { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>${period}</p>
                </div>
                
                <div class="meta-grid">
                    <div>
                        <p><strong>Dine Area:</strong> ${dineArea}</p>
                        <p><strong>Cashier:</strong> ${cashier}</p>
                    </div>
                    <div style="text-align: right">
                        <p><strong>Printed By:</strong> ${generatedBy}</p>
                        <p><strong>Printed At:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div class="summary-grid">
                    <div class="section">
                        <div class="section-title">Receipt Summary</div>
                        <table>
                            ${receiptSummaryHtml}
                        </table>
                    </div>
                    <div class="section">
                        <div class="section-title">Sales Summary</div>
                        <table>
                            ${salesSummaryHtml}
                            <tr style="font-weight: bold; background: #fafafa;">
                                <td>Net Sales</td>
                                <td style="text-align:right">${formatCurrency(reportData.netSales)}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="summary-grid">
                    <div class="section">
                        <div class="section-title">Category Summary</div>
                        <table>
                            <thead><tr><th>Metric</th><th style="text-align:center">Qty</th><th style="text-align:right">Value</th></tr></thead>
                            ${categorySummaryHtml}
                        </table>
                    </div>
                    <div class="section">
                        <div class="section-title">Payment Summary</div>
                        <table>
                            <thead><tr><th>Payment Type</th><th style="text-align:center">Count</th><th style="text-align:right">Value</th></tr></thead>
                            ${paymentSummaryHtml}
                            <tr style="font-weight: bold; background: #fafafa;">
                                <td>Total Settled</td>
                                <td></td>
                                <td style="text-align:right">${formatCurrency(reportData.paymentSummary.reduce((sum, item) => sum + item.value, 0))}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                ${detailedReceiptsHtml}
                ${voidedReceiptsHtml}
                ${menuItemBreakdownHtml}

                <div class="footer">
                    Oreon Technologies - Smart Hospitality Systems
                </div>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `;

        win.document.write(html);
        win.document.close();
    };

    const handlePrintToThermal = async () => {
        if (!reportData) return;
        setIsPrintingThermal(true);
        try {
            const headerInfo = {
                cashier: currentCashierName,
                printedAt: reportGeneratedAt
                    ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                    : '',
                reportPeriodStart: `${formatLongDate(filters.startDate)}`,
                reportPeriodEnd: `${formatLongDate(filters.endDate)}`,
                outlet: currentOutletName,
                orderType: getOptionLabel(
                    [
                        { value: 'DINE_IN', label: 'Dine In' },
                        { value: 'TAKE_AWAY', label: 'Take Away' },
                        { value: 'DELIVERY', label: 'Delivery' },
                        { value: 'ROOM', label: 'Room Service' },
                    ],
                    filters.orderType,
                    'All',
                ),
                menuType: getOptionLabel(
                    [
                        { value: 'Drink', label: 'Drinks' },
                        { value: 'Food', label: 'Food' },
                    ],
                    filters.menuType,
                    'All',
                ),
                printedBy: user?.fullName ?? '—',
            };
            const formatted = formatCashierSalesReport(reportData, headerInfo, {
                showVoidedReceipts: filters.showVoidedReceipts,
                showDetailedReceiptList: filters.showDetailedReceiptList,
                showMenuItemBreakdown: filters.showMenuItemBreakdown,
            });
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

    // check if there is data to display
    const hasData = reportData !== null;

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle title="Cashier Sales Report" subtitle="" />
                </div>
            </PageHeader>

            <div className="mt-4">
                <ReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    onPrintThermal={handlePrintToThermal}
                    isPrintingThermal={isPrintingThermal}
                    hasReportData={hasData}
                    isLoading={isLoading}
                    outletOptions={outletOptions}
                    cashierOptions={cashierOptions}
                    orderTypeOptions={[
                        { value: 'DINE_IN', label: 'Dine In' },
                        { value: 'TAKE_AWAY', label: 'Take Away' },
                        { value: 'DELIVERY', label: 'Delivery' },
                        { value: 'ROOM', label: 'Room Service' },
                    ]}
                    menuTypeOptions={[
                        { value: 'Drink', label: 'Drinks' },
                        { value: 'Food', label: 'Food' },
                    ]}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <CashierSalesReportContent data={null} loading={true} />
                ) : hasData ? (
                    <CashierSalesReportContent
                        data={reportData}
                        loading={false}
                        headerInfo={{
                            cashier: currentCashierName,
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            reportPeriodStart: `${formatLongDate(filters.startDate)}`,
                            reportPeriodEnd: `${formatLongDate(filters.endDate)}`,
                            outlet: currentOutletName,
                            orderType: getOptionLabel(
                                [
                                    { value: 'DINE_IN', label: 'Dine In' },
                                    { value: 'TAKE_AWAY', label: 'Take Away' },
                                    { value: 'DELIVERY', label: 'Delivery' },
                                    { value: 'ROOM', label: 'Room Service' },
                                ],
                                filters.orderType,
                                'All',
                            ),
                            menuType: getOptionLabel(
                                [
                                    { value: 'Drink', label: 'Drinks' },
                                    { value: 'Food', label: 'Food' },
                                ],
                                filters.menuType,
                                'All',
                            ),
                            printedBy: user?.fullName ?? 'John Oyo',
                        }}
                        showVoidedReceipts={filters.showVoidedReceipts}
                        showDetailedReceiptList={
                            filters.showDetailedReceiptList
                        }
                        showMenuItemBreakdown={filters.showMenuItemBreakdown}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select a timeframe and click Generate to see cashier sales."
                    />
                )}
            </div>

            {/* report generated at */}
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
                </div>
            )}
        </PageWrapper>
    );
}
