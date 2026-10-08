'use client';

import React, { useState } from 'react';
import ReportSection from './ReportSection';
import ReportTable from './ReportTable';
import {
    NightAuditReportData,
    StructuredNightAuditReport,
} from './types';
import {
    Building2,
    Clock,
    CreditCard,
    DollarSign,
    FileText,
    TrendingUp,
    AlertTriangle,
    XCircle,
    Search,
    Shield,
    Utensils,
    ArrowRightLeft,
    BedDouble,
    Sun,
    Layers,
    X,
} from 'lucide-react';

interface ReportHeaderInfo {
    generatedBy?: string;
    businessDate?: string;
    auditCompletedAt?: string;
    outlet?: string;
    staffOnShift?: string;
    reportId?: string;
    systemTimezone?: string;
}

interface NightAuditReportContentProps {
    data: NightAuditReportData | null;
    loading?: boolean;
    visibleReportTypes?: string[];
    headerInfo?: ReportHeaderInfo;
}

const formatCurrency = (amount: any) => {
    const num = Number(amount ?? 0);
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num);
};

export default function NightAuditReportContent({
    data,
    loading = false,
    visibleReportTypes = [],
    headerInfo,
}: NightAuditReportContentProps) {
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [drillDownModal, setDrillDownModal] = useState<{
        isOpen: boolean;
        title: string;
        data: any[];
        columns: { key: string; header: string; render?: (v: any) => React.ReactNode }[];
    }>({
        isOpen: false,
        title: '',
        data: [],
        columns: [],
    });

    const structured: StructuredNightAuditReport | undefined = data?.structuredReport;
    const flash = structured?.managerFlash;
    const fo = structured?.frontOffice;
    const fin = structured?.guestFinancialPosition;
    const acc = structured?.accountPayments;
    const rec = structured?.paymentReconciliation;
    const rev = structured?.revenue;
    const fb = structured?.fbAudit;
    const dva = structured?.discountsVoidsAdjustments;
    const rp = structured?.receivablesPayables;
    const resExp = structured?.reservationsExceptions;
    const roomRec = structured?.roomReconciliation;
    const outlook = structured?.tomorrowOutlook;

    const openDrillDown = (
        title: string,
        items: any[],
        columns: { key: string; header: string; render?: (v: any) => React.ReactNode }[]
    ) => {
        setDrillDownModal({
            isOpen: true,
            title,
            data: items,
            columns,
        });
    };

    const isSectionVisibleByRole = (sectionKey: string) => {
        if (selectedRole === 'all') return true;
        if (selectedRole === 'gm' || selectedRole === 'manager') return true;
        if (selectedRole === 'accountant') {
            return ['all', 'flash', 'financials', 'accounts', 'rec_pay'].includes(sectionKey);
        }
        if (selectedRole === 'front_office') {
            return ['all', 'fo', 'exceptions', 'room_rec', 'outlook'].includes(sectionKey);
        }
        if (selectedRole === 'fb_manager') {
            return ['all', 'fb'].includes(sectionKey);
        }
        return true;
    };

    const tabs = [
        { id: 'all', label: 'All Sections', icon: Layers },
        { id: 'flash', label: 'Executive Flash', icon: TrendingUp },
        { id: 'fo', label: 'Front Office', icon: Building2 },
        { id: 'financials', label: 'Guest Financials', icon: DollarSign },
        { id: 'accounts', label: 'Account Payments & Rec', icon: CreditCard },
        { id: 'fb', label: 'F&B Audit', icon: Utensils },
        { id: 'dva', label: 'Discounts & Voids', icon: ArrowRightLeft },
        { id: 'rec_pay', label: 'Receivables / Payables', icon: FileText },
        { id: 'exceptions', label: 'Audit Exceptions', icon: AlertTriangle },
        { id: 'room_rec', label: 'Room Reconciliation', icon: BedDouble },
        { id: 'outlook', label: "Tomorrow's Outlook", icon: Sun },
    ].filter((t) => isSectionVisibleByRole(t.id));

    // Fallbacks from legacy fields if structured report is absent
    const stayoversData = fo?.stayovers ?? data?.stayingOverGuests?.map(s => ({
        guestName: s.guestName,
        room: s.room,
        arrivalDate: s.arrivalDate,
        departureDate: s.departureDate,
        nights: s.noNights,
        pax: 1,
        bookingCode: s.resNo,
        isComplimentary: false,
        isHouseUse: false,
        balance: s.balance,
    })) ?? [];

    const departuresData = fo?.departures ?? data?.departingGuests?.map(d => ({
        guestName: d.guestName,
        room: d.room,
        arrivalDate: d.arrivalDate,
        departureDate: d.departureDate,
        nights: d.noNights,
        pax: 1,
        bookingCode: d.resNo,
        hasOutstanding: false,
        earlyCheckout: false,
    })) ?? [];

    const paymentRecData = rec?.methods ?? data?.paymentSummary?.map(p => ({
        method: p.paymentMethod,
        expected: p.amount,
        actual: p.amount,
        variance: 0,
        variancePct: 0,
        status: 'balanced' as const,
    })) ?? [];

    const dvaData = dva?.discounts?.map(d => ({
        type: `Discount - ${d.guestName}`,
        count: 1,
        amount: d.amount,
    })) ?? data?.discountsVoids ?? [];

    return (
        <div className="space-y-6">
            {/* Header Info Banner */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {structured?.hotelName || 'ANLI Hotel'} — Night Audit Report
                            </h1>
                            <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${structured?.auditStatus === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                    }`}
                            >
                                {structured?.auditStatus === 'completed' ? 'Audit Completed' : 'Pending Audit'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Audited Business Date:{' '}
                            <span className="font-semibold text-gray-800">
                                {structured?.auditDate || headerInfo?.businessDate || new Date().toISOString().split('T')[0]}
                            </span>
                            {' • '}
                            Generated at {structured?.generatedAt || new Date().toLocaleTimeString()} by{' '}
                            <span className="font-medium text-gray-800">{structured?.generatedBy || headerInfo?.generatedBy || 'System'}</span>
                        </p>
                    </div>

                    {/* Role Access Selector */}
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">Role View:</span>
                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                setActiveTab('all');
                            }}
                            className="text-xs font-medium bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Roles (Full View)</option>
                            <option value="gm">Manager / General Manager</option>
                            <option value="accountant">Accountant / Auditor</option>
                            <option value="front_office">Front Office Staff</option>
                            <option value="fb_manager">F&B Manager</option>
                        </select>
                    </div>
                </div>

                {/* Section Quick Navigation Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-4 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 1. EXECUTIVE / MANAGER FLASH */}
            {(activeTab === 'all' || activeTab === 'flash') && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Executive / Manager Flash
                        </h2>
                        <span className="text-xs text-gray-500">Key Performance Indicators & Daily Summary</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div
                            onClick={() =>
                                openDrillDown('Occupancy & Room Breakdown', fo?.roomStatus || [], [
                                    { key: 'roomNumber', header: 'Room' },
                                    { key: 'roomType', header: 'Type' },
                                    { key: 'status', header: 'Status' },
                                ])
                            }
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-blue-300 transition-colors"
                        >
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy Rate</span>
                            <div className="flex items-baseline justify-between mt-2">
                                <span className="text-2xl font-extrabold text-gray-900">
                                    {flash?.occupancyPct ?? parseFloat(data?.stats?.occupancy || '0')}%
                                </span>
                                <span className="text-xs text-gray-500">
                                    {flash?.roomsSold ?? data?.stats?.roomsSold ?? 0} / {flash?.totalRooms ?? data?.stats?.totalRoomsInProperty ?? 0} Sold
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full"
                                    style={{ width: `${Math.min(100, flash?.occupancyPct ?? parseFloat(data?.stats?.occupancy || '0'))}%` }}
                                />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">ADR (Avg Daily Rate)</span>
                            <div className="text-2xl font-extrabold text-gray-900 mt-2">
                                {formatCurrency(flash?.adr ?? 0)}
                            </div>
                            <span className="text-xs text-emerald-600 font-medium">Room Rate Performance</span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">RevPAR</span>
                            <div className="text-2xl font-extrabold text-gray-900 mt-2">
                                {formatCurrency(flash?.revpar ?? 0)}
                            </div>
                            <span className="text-xs text-blue-600 font-medium">Revenue Per Available Room</span>
                        </div>

                        <div
                            onClick={() =>
                                openDrillDown('F&B Guest Room Transactions', fb?.guestRoomTransactions || [], [
                                    { key: 'guestName', header: 'Guest Name' },
                                    { key: 'room', header: 'Room' },
                                    { key: 'orderType', header: 'Order Type' },
                                    { key: 'amount', header: 'Amount (₦)', render: (v: any) => formatCurrency(v) },
                                ])
                            }
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-emerald-300 transition-colors"
                        >
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hotel Revenue</span>
                            <div className="text-2xl font-extrabold text-emerald-700 mt-2">
                                {formatCurrency(flash?.totalHotelRevenue ?? 0)}
                            </div>
                            <span className="text-xs text-gray-500">Rooms + F&B + Services</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payments Collected</span>
                            <div className="text-xl font-bold text-gray-900 mt-1">
                                {formatCurrency(flash?.paymentsReceived ?? rec?.totalActual ?? 0)}
                            </div>
                        </div>

                        <div
                            onClick={() =>
                                openDrillDown('Outstanding Guest Balances', fin?.outstandingBalances || [], [
                                    { key: 'guestName', header: 'Guest Name' },
                                    { key: 'room', header: 'Room' },
                                    { key: 'balance', header: 'Balance (₦)', render: (v: any) => formatCurrency(v) },
                                ])
                            }
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-amber-300"
                        >
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding Guest Balances</span>
                            <div className="text-xl font-bold text-amber-600 mt-1">
                                {formatCurrency(flash?.outstandingBalances ?? 0)}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Position (Receivables - Payables)</span>
                            <div className="text-xl font-bold text-blue-700 mt-1">
                                {formatCurrency(rp?.netPosition ?? (flash?.totalReceivables ?? 0) - (flash?.totalPayables ?? 0))}
                            </div>
                        </div>
                    </div>

                    {/* F&B KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            onClick={() =>
                                openDrillDown('F&B Guest Room Transactions', fb?.guestRoomTransactions || [], [
                                    { key: 'guestName', header: 'Guest Name' },
                                    { key: 'room', header: 'Room' },
                                    { key: 'orderType', header: 'Order Type' },
                                    { key: 'amount', header: 'Amount (₦)', render: (v: any) => formatCurrency(v) },
                                ])
                            }
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-orange-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">F&B Gross Sales</span>
                                <Utensils className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 mt-1">
                                {formatCurrency(fb?.dailySales?.grossSales ?? 0)}
                            </div>
                            <span className="text-xs text-gray-500">
                                {fb?.dailySales?.totalOrders ?? 0} order(s) today
                            </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">F&B Actual Revenue</span>
                                <Utensils className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-xl font-bold text-emerald-700 mt-1">
                                {formatCurrency(fb?.dailySales?.actualRevenue ?? 0)}
                            </div>
                            <span className="text-xs text-gray-500">
                                Expected: {formatCurrency(fb?.dailySales?.expectedRevenue ?? 0)}
                            </span>
                        </div>

                        <div
                            onClick={() =>
                                openDrillDown('F&B Work Periods', fb?.workPeriods || [], [
                                    { key: 'id', header: 'Period ID' },
                                    { key: 'area', header: 'Area' },
                                    { key: 'status', header: 'Status' },
                                    { key: 'startTime', header: 'Start' },
                                    { key: 'endTime', header: 'End' },
                                ])
                            }
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer hover:border-rose-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">F&B Pending / Unpaid</span>
                                <Utensils className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="text-xl font-bold text-rose-600 mt-1">
                                {formatCurrency(fb?.dailySales?.pendingUnpaidAmount ?? 0)}
                            </div>
                            <span className="text-xs text-gray-500">
                                {fb?.workPeriods?.length ?? 0} work period(s)
                            </span>
                        </div>
                    </div>

                    {/* Key Audit Exceptions Widget */}
                    {flash?.exceptions && flash.exceptions.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Audit Exceptions Requiring Management Attention ({flash.exceptions.length})
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {flash.exceptions.map((exc, idx) => (
                                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-800">{exc.type}</span>
                                        <span className={`px-2 py-0.5 rounded-full font-bold ${exc.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {exc.count} item(s)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 2. FRONT OFFICE OPERATIONS */}
            {(activeTab === 'all' || activeTab === 'fo') && (
                <ReportSection title="Front Office Operations Summary" subtitle="Arrivals, Departures, Stayovers, Walk-ins & Discrepancies">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <BedDouble className="w-4 h-4 text-blue-600" />
                                Staying Over Guests ({stayoversData.length})
                            </h4>
                            <ReportTable
                                columns={[
                                    { key: 'room', header: 'Room' },
                                    { key: 'guestName', header: 'Guest Name' },
                                    { key: 'arrivalDate', header: 'Arrival' },
                                    { key: 'departureDate', header: 'Departure' },
                                    { key: 'nights', header: 'Nights', align: 'center' },
                                    { key: 'bookingCode', header: 'Booking Code' },
                                    {
                                        key: 'balance',
                                        header: 'Balance (₦)',
                                        align: 'right',
                                        render: (v: any) => <span className={Number(v) > 0 ? 'text-amber-600 font-medium' : 'text-gray-700'}>{formatCurrency(v)}</span>,
                                    },
                                ]}
                                data={stayoversData}
                                loading={loading}
                                emptyMessage="No guests currently staying over"
                            />
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                Departing Guests Today ({departuresData.length})
                            </h4>
                            <ReportTable
                                columns={[
                                    { key: 'room', header: 'Room' },
                                    { key: 'guestName', header: 'Guest Name' },
                                    { key: 'arrivalDate', header: 'Arrival' },
                                    { key: 'departureDate', header: 'Departure' },
                                    { key: 'bookingCode', header: 'Booking Code' },
                                ]}
                                data={departuresData}
                                loading={loading}
                                emptyMessage="No departures scheduled for today"
                            />
                        </div>

                        {fo?.noShows && fo.noShows.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    No-Shows & Unresolved Cancellations ({fo.noShows.length})
                                </h4>
                                <ReportTable
                                    columns={[
                                        { key: 'guestName', header: 'Guest Name' },
                                        { key: 'bookingCode', header: 'Booking Code' },
                                        { key: 'arrivalDate', header: 'Arrival Date' },
                                        { key: 'source', header: 'Source' },
                                    ]}
                                    data={fo.noShows}
                                    loading={loading}
                                    emptyMessage="No no-shows recorded"
                                />
                            </div>
                        )}
                    </div>
                </ReportSection>
            )}

            {/* 3. GUEST FINANCIAL POSITION */}
            {(activeTab === 'all' || activeTab === 'financials') && (
                <ReportSection title="Guest Financial Position" subtitle="Complimentary stays, Paid amounts, Outstanding aging & Balances">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Guest Outstanding Balances</h4>
                            <ReportTable
                                columns={[
                                    { key: 'guestName', header: 'Guest Name' },
                                    { key: 'room', header: 'Room' },
                                    { key: 'bookingCode', header: 'Booking Code' },
                                    {
                                        key: 'balance',
                                        header: 'Balance (₦)',
                                        align: 'right',
                                        render: (v: any) => <span className="font-bold text-amber-600">{formatCurrency(v)}</span>,
                                    },
                                ]}
                                data={fin?.outstandingBalances ?? []}
                                loading={loading}
                                emptyMessage="No outstanding guest balances"
                            />
                        </div>

                        {fin?.complimentaryStays && fin.complimentaryStays.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Complimentary Stays & Rate Waivers</h4>
                                <ReportTable
                                    columns={[
                                        { key: 'guestName', header: 'Guest Name' },
                                        { key: 'room', header: 'Room' },
                                        { key: 'originalAmount', header: 'Original Rate (₦)', render: (v: any) => formatCurrency(v) },
                                        { key: 'waivedAmount', header: 'Waived Amount (₦)', render: (v: any) => formatCurrency(v) },
                                        { key: 'reason', header: 'Reason / Approval' },
                                    ]}
                                    data={fin.complimentaryStays}
                                    loading={loading}
                                    emptyMessage="No complimentary stays recorded"
                                />
                            </div>
                        )}
                    </div>
                </ReportSection>
            )}

            {/* 4. ACCOUNT-LEVEL PAYMENTS & RECONCILIATION */}
            {(activeTab === 'all' || activeTab === 'accounts') && (
                <ReportSection title="Account-Level Payments & Reconciliation" subtitle="Expected vs Actual amounts per payment method with variance">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Payment Method Reconciliation</h4>
                            <ReportTable
                                columns={[
                                    { key: 'method', header: 'Payment Method' },
                                    { key: 'expected', header: 'Expected (₦)', align: 'right', render: (v: any) => formatCurrency(v) },
                                    { key: 'actual', header: 'Actual Billed (₦)', align: 'right', render: (v: any) => formatCurrency(v) },
                                    {
                                        key: 'variance',
                                        header: 'Variance (₦)',
                                        align: 'right',
                                        render: (v: any) => {
                                            const val = Number(v ?? 0);
                                            return (
                                                <span className={val === 0 ? 'text-gray-700' : val > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                                                    {formatCurrency(val)}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        key: 'status',
                                        header: 'Status',
                                        align: 'center',
                                        render: (v: any) => (
                                            <span
                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${String(v) === 'balanced'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : String(v) === 'over'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {String(v)}
                                            </span>
                                        ),
                                    },
                                ]}
                                data={paymentRecData}
                                loading={loading}
                                emptyMessage="No payment reconciliation data"
                            />
                        </div>

                        {acc?.accounts && acc.accounts.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Configured Hotel Payment Accounts</h4>
                                <ReportTable
                                    columns={[
                                        { key: 'accountName', header: 'Account / Bank Destination' },
                                        { key: 'accountType', header: 'Type' },
                                        { key: 'totalReceived', header: 'Total Received (₦)', align: 'right', render: (v: any) => formatCurrency(v) },
                                        { key: 'transactionCount', header: 'Transactions', align: 'center' },
                                    ]}
                                    data={acc.accounts}
                                    loading={loading}
                                    emptyMessage="No configured accounts active"
                                />
                            </div>
                        )}
                    </div>
                </ReportSection>
            )}

            {/* 5. F&B AUDIT & WORK PERIODS */}
            {(activeTab === 'all' || activeTab === 'fb') && (
                <ReportSection title="Food & Beverage Audit" subtitle="POS postings to guest rooms, daily sales and active/closed work periods">
                    <div className="space-y-6">
                        {fb?.workPeriods && fb.workPeriods.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">F&B Work Periods Audit</h4>
                                <ReportTable
                                    columns={[
                                        { key: 'id', header: 'Period ID', align: 'center' },
                                        { key: 'area', header: 'Area Type' },
                                        { key: 'startTime', header: 'Start Time' },
                                        { key: 'endTime', header: 'End Time', render: (v: any) => (v ? String(v) : 'Ongoing') },
                                        { key: 'status', header: 'Status' },
                                    ]}
                                    data={fb.workPeriods}
                                    loading={loading}
                                    emptyMessage="No work period records"
                                />
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">F&B Charges Posted to Guest Folios</h4>
                            <ReportTable
                                columns={[
                                    { key: 'source', header: 'Room / Source' },
                                    { key: 'item', header: 'Item' },
                                    { key: 'quantity', header: 'Qty', align: 'center' },
                                    { key: 'amount', header: 'Amount (₦)', align: 'right', render: (v: any) => formatCurrency(v) },
                                    { key: 'paymentMode', header: 'Payment Mode' },
                                ]}
                                data={data?.foodBeverageCharges ?? []}
                                loading={loading}
                                emptyMessage="No F&B charges recorded"
                            />
                        </div>
                    </div>
                </ReportSection>
            )}

            {/* 7. DISCOUNTS, VOIDS & ADJUSTMENTS */}
            {(activeTab === 'all' || activeTab === 'dva') && (
                <ReportSection title="Discounts, Voids & Adjustments Audit Log" subtitle="Itemized list of all price modifications and cancellations">
                    <ReportTable
                        columns={[
                            { key: 'type', header: 'Adjustment Type' },
                            { key: 'count', header: 'Count', align: 'center' },
                            { key: 'amount', header: 'Total Value (₦)', align: 'right', render: (v: any) => formatCurrency(v) },
                        ]}
                        data={dvaData}
                        loading={loading}
                        emptyMessage="No discounts or voids recorded"
                    />
                </ReportSection>
            )}

            {/* 8. RECEIVABLES & PAYABLES */}
            {(activeTab === 'all' || activeTab === 'rec_pay') && (
                <ReportSection title="Business Receivables & Payables Position" subtitle="Summary as of audited business date">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Total Business Receivables</span>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(rp?.totalReceivables ?? flash?.totalReceivables ?? 0)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Total Business Payables</span>
                            <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(rp?.totalPayables ?? flash?.totalPayables ?? 0)}</div>
                        </div>
                    </div>
                </ReportSection>
            )}

            {/* 9. HOUSEKEEPING ROOM RECONCILIATION */}
            {(activeTab === 'all' || activeTab === 'room_rec') && (
                <ReportSection title="Housekeeping & Front Office Room Status Reconciliation" subtitle="Highlighting discrepancies between FO occupancy and HK room status">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-500">Total Rooms</span>
                                <div className="text-lg font-bold text-gray-900">{roomRec?.totalRooms ?? data?.stats?.totalRoomsInProperty ?? 0}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-500">Clean & Ready</span>
                                <div className="text-lg font-bold text-emerald-600">{roomRec?.cleanRooms ?? 0}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-500">Dirty / Unready</span>
                                <div className="text-lg font-bold text-amber-600">{roomRec?.dirtyRooms ?? 0}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="text-xs text-gray-500 font-semibold">Discrepancies</span>
                                <div className={`text-lg font-bold ${(roomRec?.discrepancyCount ?? 0) > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {roomRec?.discrepancyCount ?? 0}
                                </div>
                            </div>
                        </div>

                        {roomRec?.discrepancies && roomRec.discrepancies.length > 0 ? (
                            <ReportTable
                                columns={[
                                    { key: 'roomNumber', header: 'Room' },
                                    { key: 'roomType', header: 'Type' },
                                    { key: 'frontOfficeStatus', header: 'FO Status' },
                                    { key: 'housekeepingStatus', header: 'HK Status' },
                                    { key: 'discrepancy', header: 'Discrepancy Description', render: (v: any) => <span className="text-red-600 font-medium">{String(v)}</span> },
                                ]}
                                data={roomRec.discrepancies}
                                loading={loading}
                                emptyMessage="No discrepancies detected"
                            />
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium text-center">
                                ✅ All Front Office room statuses match Housekeeping room inspection statuses.
                            </div>
                        )}
                    </div>
                </ReportSection>
            )}

            {/* 10. TOMORROW'S OUTLOOK */}
            {(activeTab === 'all' || activeTab === 'outlook') && (
                <ReportSection title="Tomorrow's Operational Outlook" subtitle="Projected arrivals, departures & occupancy forecast">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                <span className="text-xs text-blue-700 font-semibold uppercase">Expected Tomorrow Arrivals</span>
                                <div className="text-2xl font-extrabold text-blue-900 mt-1">{outlook?.totalArrivals ?? 0}</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                <span className="text-xs text-amber-700 font-semibold uppercase">Expected Tomorrow Departures</span>
                                <div className="text-2xl font-extrabold text-amber-900 mt-1">{outlook?.totalDepartures ?? 0}</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                                <span className="text-xs text-purple-700 font-semibold uppercase">Projected Occupancy Rate</span>
                                <div className="text-2xl font-extrabold text-purple-900 mt-1">{outlook?.projectedOccupancyPct ?? 0}%</div>
                            </div>
                        </div>

                        {outlook?.arrivals && outlook.arrivals.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Tomorrow&apos;s Expected Arrivals List</h4>
                                <ReportTable
                                    columns={[
                                        { key: 'guestName', header: 'Guest Name' },
                                        { key: 'room', header: 'Assigned Room' },
                                        { key: 'bookingCode', header: 'Booking Code' },
                                        { key: 'source', header: 'Source' },
                                    ]}
                                    data={outlook.arrivals}
                                    loading={loading}
                                    emptyMessage="No arrivals expected tomorrow"
                                />
                            </div>
                        )}
                    </div>
                </ReportSection>
            )}

            {/* Interactive Drill-Down Modal */}
            {drillDownModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-600" />
                                {drillDownModal.title}
                            </h3>
                            <button
                                onClick={() => setDrillDownModal((prev) => ({ ...prev, isOpen: false }))}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <ReportTable
                                columns={drillDownModal.columns}
                                data={drillDownModal.data}
                                loading={false}
                                emptyMessage="No line items available"
                            />
                        </div>
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setDrillDownModal((prev) => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
