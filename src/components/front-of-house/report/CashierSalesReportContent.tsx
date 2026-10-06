'use client';

import { formatCurrency } from '@/lib/utils';
import {
    CashierSalesReportData,
    CashierSalesHeaderInfo,
    DetailedReceiptItem,
    VoidedReceiptItem,
    MenuItemBreakdownItem,
} from './types';
import { SummaryCard, MetricRow, ThreeColumnRow } from './SummaryCard';
import ReportTable, { ReportTableColumn } from './ReportTable';

interface CashierSalesReportContentProps {
    data: CashierSalesReportData | null;
    loading?: boolean;
    headerInfo?: CashierSalesHeaderInfo;
    showVoidedReceipts?: boolean;
    showDetailedReceiptList?: boolean;
    showMenuItemBreakdown?: boolean;
}

const detailedReceiptColumns: ReportTableColumn<DetailedReceiptItem>[] = [
    { key: 'guestName', header: 'Guest Name', width: '150px' },
    { key: 'receiptNo', header: 'Receipt No.', width: '120px' },
    {
        key: 'amount',
        header: 'Amount',
        width: '100px',
        render: (v) => formatCurrency(Number(v)),
    },
    {
        key: 'discount',
        header: 'Discount',
        width: '100px',
        render: (v) => String(v),
    },
    { key: 'payment', header: 'Payment', width: '100px' },
    { key: 'staff', header: 'Staff', width: '100px' },
    { key: 'time', header: 'Time', width: '100px' },
];

const voidedReceiptColumns: ReportTableColumn<VoidedReceiptItem>[] = [
    { key: 'receiptNo', header: 'Receipt No.', width: '120px' },
    { key: 'staff', header: 'Staff', width: '120px' },
    { key: 'reason', header: 'Reason', width: '150px' },
    { key: 'customerName', header: 'Customer Name', width: '150px' },
    { key: 'dineArea', header: 'Dine Area', width: '120px' },
    { key: 'time', header: 'Time', width: '100px' },
];

const menuItemBreakdownColumns: ReportTableColumn<MenuItemBreakdownItem>[] = [
    { key: 'itemName', header: 'Item Name', width: '250px' },
    { key: 'qtySold', header: 'Qty Sold', width: '100px', align: 'center' },
    {
        key: 'amount',
        header: 'Amount',
        width: '150px',
        align: 'right',
        render: (v) => formatCurrency(Number(v)),
    },
];

export default function CashierSalesReportContent({
    data,
    loading = false,
    headerInfo,
    showVoidedReceipts = false,
    showDetailedReceiptList = false,
    showMenuItemBreakdown = false,
}: CashierSalesReportContentProps) {
    if (loading) {
        return (
            <div className="py-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-4" />
                    <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-48 bg-gray-100 rounded animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // i created a dummy data top test the report
    return (
        <div className="py-8 max-w-[828px] mx-auto">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Cashier Sales Report
                </h2>
                {headerInfo?.cashier && (
                    <p className="text-sm text-gray-600 mb-3">
                        Cashier: {headerInfo.cashier}
                    </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap justify-center">
                    {headerInfo?.printedAt && (
                        <>
                            <span>Printed At: {headerInfo.printedAt}</span>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    {headerInfo?.reportPeriodStart &&
                        headerInfo?.reportPeriodEnd && (
                            <>
                                <span>
                                    Report Period:{' '}
                                    {headerInfo.reportPeriodStart} →{' '}
                                    {headerInfo.reportPeriodEnd}
                                </span>
                                <span className="text-gray-300">|</span>
                            </>
                        )}
                    {headerInfo?.outlet && (
                        <span>Dine Area: {headerInfo.outlet}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap justify-center mt-1">
                    {headerInfo?.cashier && (
                        <>
                            <span>Cashier: {headerInfo.cashier}</span>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    {headerInfo?.menuType && (
                        <>
                            <span>Menu Type: {headerInfo.menuType}</span>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    {headerInfo?.printedBy && (
                        <>
                            <span>Printed By: {headerInfo.printedBy}</span>
                            <span className="text-gray-300">|</span>
                        </>
                    )}
                    {headerInfo?.orderType && (
                        <span>Order Type: {headerInfo.orderType}</span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SummaryCard title="Receipt Summary">
                    <div className="flex justify-between py-2">
                        <span className="text-sm font-semibold text-[#0A0A0A]">
                            Metric
                        </span>
                        <span className="text-sm font-semibold text-[#0A0A0A]">
                            Value
                        </span>
                    </div>
                    {data.receiptSummary.map((item, idx) => {
                        const isMonetary =
                            item.metric.toLowerCase().includes('payment') ||
                            item.metric.toLowerCase().includes('sales per');
                        return (
                            <MetricRow
                                key={idx}
                                label={item.metric}
                                value={
                                    isMonetary
                                        ? formatCurrency(Number(item.value))
                                        : item.value
                                }
                            />
                        );
                    })}
                </SummaryCard>

                <SummaryCard
                    title="Sales Summary"
                    badge={{
                        label: 'Net Sales',
                        value: data.netSales,
                        color: 'green',
                    }}
                >
                    <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-sm font-semibold text-[#0A0A0A] py-2">
                            Description
                        </span>
                        <span className="text-sm font-semibold text-[#0A0A0A] py-2 text-right">
                            Amount (₦)
                        </span>
                    </div>
                    {data.salesSummary.map((item, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-2 gap-x-4 py-2"
                        >
                            <span className="text-sm font-normal text-[#0A0A0A]">
                                {item.description}
                            </span>
                            <span className="text-sm font-normal text-[#0A0A0A] text-right">
                                {item.amount < 0
                                    ? `-${formatCurrency(Math.abs(item.amount))}`
                                    : formatCurrency(item.amount)}
                            </span>
                        </div>
                    ))}
                </SummaryCard>

                <SummaryCard title="Category Summary">
                    <ThreeColumnRow
                        col1="Metric"
                        col2="Qyt"
                        col3="Value"
                        isHeader
                    />
                    {data.categorySummary.map((item, idx) => (
                        <ThreeColumnRow
                            key={idx}
                            col1={item.metric}
                            col2={item.qty}
                            col3={item.value}
                            isTotal={item.metric === 'Total'}
                        />
                    ))}
                </SummaryCard>

                <SummaryCard
                    title="Payment Summary"
                    badge={{
                        label: 'Balance',
                        value: data.paymentBalance,
                        color: 'red',
                    }}
                >
                    <div className="grid grid-cols-3 gap-x-4">
                        <span className="text-sm font-semibold text-[#0A0A0A] py-2">
                            Payment Type
                        </span>
                        <span className="text-sm font-semibold text-[#0A0A0A] py-2 text-center">
                            Count
                        </span>
                        <span className="text-sm font-semibold text-[#0A0A0A] py-2 text-right">
                            Value
                        </span>
                    </div>
                    {data.paymentSummary.map((item, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-3 gap-x-4 py-2"
                        >
                            <span className="text-sm font-normal text-[#0A0A0A]">
                                {item.paymentType}
                            </span>
                            <span className="text-sm font-normal text-[#0A0A0A] text-center">
                                {item.count}
                            </span>
                            <span className="text-sm font-normal text-[#0A0A0A] text-right">
                                {formatCurrency(item.value)}
                            </span>
                        </div>
                    ))}
                    <div className="grid grid-cols-3 gap-x-4 py-2 mt-2 pt-3 font-semibold">
                        <span className="text-sm font-semibold text-[#0A0A0A]">
                            Total Settled
                        </span>
                        <span className="text-sm font-semibold text-[#0A0A0A] text-center"></span>
                        <span className="text-sm font-semibold text-[#0A0A0A] text-right">
                            {formatCurrency(
                                data.paymentSummary.reduce(
                                    (sum, item) => sum + item.value,
                                    0,
                                ),
                            )}
                        </span>
                    </div>
                </SummaryCard>
            </div>

            {(data.receivingAccountSummary?.length ?? 0) > 0 && (
                <div className="mb-6">
                    <SummaryCard title="Receiving Account Summary">
                        <div className="grid grid-cols-4 gap-x-4">
                            <span className="text-sm font-semibold text-[#0A0A0A] py-2">
                                Account
                            </span>
                            <span className="text-sm font-semibold text-[#0A0A0A] py-2">
                                Methods
                            </span>
                            <span className="text-sm font-semibold text-[#0A0A0A] py-2 text-center">
                                Count
                            </span>
                            <span className="text-sm font-semibold text-[#0A0A0A] py-2 text-right">
                                Value
                            </span>
                        </div>
                        {data.receivingAccountSummary?.map((item) => (
                            <div
                                key={item.account}
                                className="grid grid-cols-4 gap-x-4 py-2"
                            >
                                <span className="text-sm font-normal text-[#0A0A0A]">
                                    {item.account}
                                </span>
                                <span className="text-sm font-normal text-[#0A0A0A]">
                                    {item.paymentMethods}
                                </span>
                                <span className="text-sm font-normal text-[#0A0A0A] text-center">
                                    {item.count}
                                </span>
                                <span className="text-sm font-normal text-[#0A0A0A] text-right">
                                    {formatCurrency(item.value)}
                                </span>
                            </div>
                        ))}
                    </SummaryCard>
                </div>
            )}

            {showDetailedReceiptList && data.detailedReceiptList.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4 border-b pb-2">
                        Detailed Receipt List
                    </h3>
                    <ReportTable
                        columns={detailedReceiptColumns}
                        data={data.detailedReceiptList}
                        emptyMessage="No receipts found"
                    />
                </div>
            )}

            {showVoidedReceipts && data.voidedReceipts.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4 border-b pb-2">
                        Voided Receipts
                    </h3>
                    <ReportTable
                        columns={voidedReceiptColumns}
                        data={data.voidedReceipts}
                        emptyMessage="No voided receipts"
                    />
                </div>
            )}

            {showMenuItemBreakdown && data.menuItemBreakdown.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#0A0A0A] mb-4 border-b pb-2">
                        Menu Item Breakdown
                    </h3>
                    <ReportTable
                        columns={menuItemBreakdownColumns}
                        data={data.menuItemBreakdown}
                        emptyMessage="No menu items found"
                    />
                </div>
            )}
        </div>
    );
}
