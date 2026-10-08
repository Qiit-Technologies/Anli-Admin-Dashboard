'use client';

import React from 'react';
import ComplimentaryOrderStatCard from './ComplimentaryOrderStatCard';
import ReportSection from './ReportSection';
import ReportTable, { ReportTableColumn } from './ReportTable';

interface ComplimentaryOrderRow {
    orderId: string;
    orderNo?: number;
    guest: string;
    section: string;
    orderValue: number;
    complimentaryValue: number;
    balancePaid: number;
    approvedBy: string;
    pinOverride: string;
    staff: string;
    reason: string;
    dateTime: string;
    complimentaryStatus?: string;
}

interface BreakdownByApprover {
    approvedBy: string;
    noOfOrders: number;
    amount: number;
}

interface ComplimentaryOrderData {
    totalOrders: number;
    totalValue: number;
    averageValue: number;
    partialValue?: number;
    fullValue?: number;
    topApprover?: string | null;
    topSection?: string | null;
    topSectionCount?: number;
    breakdownByApprover: BreakdownByApprover[];
    orderRows: ComplimentaryOrderRow[];
}

interface ReportHeaderInfo {
    cashier?: string;
    printedAt?: string;
    reportPeriod?: string;
    outlet?: string;
    menuType?: string;
    printedBy?: string;
    orderType?: string;
}

interface ComplimentaryOrderReportContentProps {
    data: ComplimentaryOrderData | null;
    loading?: boolean;
    headerInfo?: ReportHeaderInfo;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount);
};

const orderColumns: ReportTableColumn<ComplimentaryOrderRow>[] = [
    { key: 'dateTime', header: 'Date' },
    { key: 'orderId', header: 'Order No.' },
    { key: 'guest', header: 'Guest' },
    { key: 'section', header: 'Section' },
    {
        key: 'orderValue',
        header: 'Order Value',
        align: 'right',
        render: (v) => formatCurrency(Number(v)),
    },
    {
        key: 'complimentaryValue',
        header: 'Complimentary Value',
        align: 'right',
        render: (v) => formatCurrency(Number(v)),
    },
    {
        key: 'balancePaid',
        header: 'Balance Paid',
        align: 'right',
        render: (v) => formatCurrency(Number(v)),
    },
    { key: 'approvedBy', header: 'Approved By' },
    { key: 'pinOverride', header: 'PIN Override' },
    { key: 'staff', header: 'Staff' },
    { key: 'reason', header: 'Reason' },
];

const breakdownByApproverColumns: ReportTableColumn<BreakdownByApprover>[] = [
    { key: 'approvedBy', header: 'Approved By' },
    { key: 'noOfOrders', header: 'No. of Orders', align: 'center' },
    {
        key: 'amount',
        header: 'Amount (₦)',
        align: 'right',
        render: (v) => formatCurrency(Number(v)),
    },
];

export default function ComplimentaryOrderReportContent({
    data,
    loading = false,
    headerInfo,
}: ComplimentaryOrderReportContentProps) {
    return (
        <div className="space-y-6">
            {headerInfo && (
                <div className="space-y-1 pb-3 text-center">
                    <h1 className="text-xl font-semibold text-[#101828]">
                        Complementary Report
                    </h1>
                    {headerInfo.cashier && (
                        <p className="text-base font-normal text-[#101828]">
                            Cashier: {headerInfo.cashier}
                        </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-normal text-gray-500">
                        {headerInfo.printedAt && (
                            <span>Printed At: {headerInfo.printedAt} |</span>
                        )}
                        {headerInfo.reportPeriod && (
                            <span>
                                Report Period: {headerInfo.reportPeriod} |
                            </span>
                        )}
                        {headerInfo.outlet && (
                            <span>Outlet: {headerInfo.outlet}</span>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ComplimentaryOrderStatCard
                    title="Total Complimentary Orders"
                    value={loading ? 0 : (data?.totalOrders ?? 0)}
                    backgroundImage="/images/night-audit-bg.png"
                    bgColor="#FEF6EE"
                    loading={loading}
                />
                <ComplimentaryOrderStatCard
                    title="Total Complimentary Value"
                    value={
                        loading ? '₦0' : formatCurrency(data?.totalValue ?? 0)
                    }
                    backgroundImage="/images/night-audit-bg.png"
                    bgColor="#F0FDF4"
                    loading={loading}
                />
                <ComplimentaryOrderStatCard
                    title="Average Complimentary Value"
                    value={
                        loading ? '₦0' : formatCurrency(data?.averageValue ?? 0)
                    }
                    backgroundImage="/images/night-audit-bg.png"
                    bgColor="#EFF6FF"
                    loading={loading}
                />
            </div>

            {(data?.partialValue !== undefined ||
                data?.fullValue !== undefined) && (
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <ComplimentaryOrderStatCard
                        title="Partial Complimentary"
                        value={formatCurrency(data?.partialValue ?? 0)}
                        backgroundImage="/images/night-audit-bg.png"
                        bgColor="#F5F3FF"
                        loading={loading}
                        compact
                    />
                    <ComplimentaryOrderStatCard
                        title="Full Complimentary"
                        value={formatCurrency(data?.fullValue ?? 0)}
                        backgroundImage="/images/night-audit-bg.png"
                        bgColor="#FFF7ED"
                        loading={loading}
                        compact
                    />
                    <ComplimentaryOrderStatCard
                        title="Top Approver"
                        value={data?.topApprover ?? '—'}
                        backgroundImage="/images/night-audit-bg.png"
                        bgColor="#F8FAFC"
                        loading={loading}
                        compact
                    />
                    <ComplimentaryOrderStatCard
                        title="Top Section"
                        value={data?.topSection ?? '—'}
                        subtitle={
                            data?.topSectionCount
                                ? `${data.topSectionCount} orders`
                                : undefined
                        }
                        backgroundImage="/images/night-audit-bg.png"
                        bgColor="#ECFDF5"
                        loading={loading}
                        compact
                    />
                </div>
            )}

            <ReportSection
                title="Complimentary Orders"
                subtitle="Complete transaction history and approvals"
            >
                <ReportTable
                    columns={orderColumns}
                    data={data?.orderRows ?? []}
                    loading={loading}
                    emptyMessage="No complimentary orders found"
                />
            </ReportSection>

            <ReportSection
                title="Breakdown by Approver"
                subtitle="Summary of complimentary orders grouped by approver"
            >
                <ReportTable
                    columns={breakdownByApproverColumns}
                    data={data?.breakdownByApprover ?? []}
                    loading={loading}
                    emptyMessage="No approver data available"
                />
            </ReportSection>
        </div>
    );
}
