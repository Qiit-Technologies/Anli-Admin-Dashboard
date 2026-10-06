'use client';

import React, { useState, useRef } from 'react';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import Link from 'next/link';
import { getAdrSnapshot } from '@/app/actions/guest';
import { FOStatCard } from '@/components/front-office/common/Card/StatsCard';
import { useUser } from '@/context/useUser';
import { usePermissions } from '@/hooks/auth/usePermission';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { getManagersFlash } from '@/app/actions/reports';
import BudgetInputModal from '@/components/front-office/flash/BudgetInputModal';
import { DatePicker } from '@/components/common/DatePicker';
import useSWR from 'swr';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    Cell,
    PieChart,
    Pie,
    BarChart,
    Bar,
} from 'recharts';
import {
    LuCalendar,
    LuDownload,
    LuPrinter,
    LuHotel,
    LuUsers,
    LuGlobe,
    LuTarget,
    LuUtensils,
    LuTriangleAlert,
    LuTrendingUp,
    LuDollarSign,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Loader2, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Format a non-currency number: 0 decimals for whole numbers, 1 for % values
const formatNum = (val: number | null | undefined, decimals = 0): string => {
    if (val === null || val === undefined || isNaN(Number(val))) return '—';
    return Number(val).toLocaleString('en-NG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const ManagersFlash = () => {
    const { user } = useUser();
    const { hasAnyPermission } = usePermissions();
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0],
    );
    const [isExporting, setIsExporting] = useState(false);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Role check: administrator, manager, general manager
    const allowedRoles = ['administrator', 'manager', 'general manager'];
    const userRole = user?.roles?.name?.toLowerCase() || '';
    const hasRoleAccess = allowedRoles.includes(userRole);

    // Permission check
    const hasPermissionAccess = hasAnyPermission([
        PERMISSIONS.VIEW_MANAGERS_FLASH,
    ]);

    // SWR for dashboard stats
    const {
        data: flashData,
        isLoading: flashLoading,
        error,
    } = useSWR(
        ['manager-flash', selectedDate],
        () => getManagersFlash(selectedDate),
        { refreshInterval: 300000 }, // 5 mins
    );

    // SWR for daily ADR details matching the dashboard
    const { data: adrResponse } = useSWR(
        ['adr-snapshot', selectedDate],
        async ([, d]: [string, string]) => {
            const r = await getAdrSnapshot({ date: d });
            if ('error' in r) {
                throw new Error(r.error);
            }
            return r.data;
        },
        { refreshInterval: 300000 },
    );
    const adrData = adrResponse;

    const handlePrint = () => {
        window.open(
            `/front-office/managers-flash/print?date=${selectedDate}`,
            '_blank',
        );
    };

    const handleExportPDF = async () => {
        if (!printRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1024,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Draw page 1
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Draw subsequent pages if content overflows A4 height
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`ManagerFlash_${selectedDate}.pdf`);
        } catch (err) {
            console.error('PDF Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    if (!hasRoleAccess && !hasPermissionAccess) {
        return (
            <PageWrapper className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LuTriangleAlert className="text-red-500 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You do not have the required role or permissions to view
                        the Manager&apos;s Flash report.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    const data = flashData?.data;

    return (
        <div className="flex flex-col h-full overflow-auto bg-[#F8F9FC]">
            <PageHeader>
                <PageHeadertitle
                    title="Manager's Flash Report"
                    subtitle="Executive operational summary & financial performance"
                />
                <div className="ml-auto flex items-center gap-3">
                    <div className="w-[180px]">
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            className="bg-white border border-gray-200 h-[38px] rounded-lg shadow-sm text-gray-700 text-sm font-medium focus-visible:ring-1 focus-visible:ring-brand"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="flex items-center justify-center bg-orion-blue hover:bg-orion-blue/90 shadow-md text-white w-9 h-9 p-0 rounded-lg transition-all"
                                disabled={isExporting}
                                title="Actions Menu"
                            >
                                {isExporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="w-5 h-5" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-1.5 z-50"
                        >
                            <DropdownMenuItem
                                onClick={() => setBudgetModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <LuTarget className="w-4 h-4 text-gray-500" />
                                <span>Set Budget</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <LuPrinter className="w-4 h-4 text-gray-500" />
                                <span>Print Report</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                                ) : (
                                    <LuDownload className="w-4 h-4 text-gray-500" />
                                )}
                                <span>Export PDF</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </PageHeader>

            {/* Budget Input Modal */}
            <BudgetInputModal
                isOpen={budgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                initialYear={new Date(selectedDate).getFullYear()}
                initialMonth={new Date(selectedDate).getMonth() + 1}
            />

            <PageWrapper>
                <div ref={reportRef}>
                    {flashLoading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
                            <span className="text-gray-500 font-medium">
                                Aggregating real-time property metrics...
                            </span>
                        </div>
                    ) : error || !data ? (
                        <div className="flex flex-col items-center justify-center h-96 text-red-500">
                            <LuTriangleAlert size={48} className="mb-4" />
                            <span className="font-medium">
                                Failed to load report data. Please check your
                                connection.
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-8">
                            {/* 1. KPI Snapshot Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link
                                    href="/front-office/reports/adr"
                                    className="bg-white rounded-md p-4 border gap-2 flex flex-col hover:border-orion-blue hover:shadow-sm cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground font-medium">
                                            Occupancy %
                                        </div>
                                        <span className="text-[10px] text-orion-blue font-semibold hover:underline">
                                            Full Report →
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start justify-between">
                                        <div className="text-2xl font-bold tracking-tight text-gray-900">
                                            {(adrData?.sellableRoomCount && adrData.sellableRoomCount > 0
                                                ? (adrData.roomsSoldNights / adrData.sellableRoomCount) * 100
                                                : data.kpis.occupancy
                                            ).toFixed(1)}%
                                        </div>
                                        <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                            {adrData ? (
                                                <>
                                                    <span>Rooms Sold: {adrData.roomsSoldNights}</span>
                                                    <span>Capacity: {adrData.sellableRoomCount ?? 0} rooms</span>
                                                    <span>Available: {Math.max(0, (adrData.sellableRoomCount ?? 0) - adrData.roomsSoldNights)} rooms</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Clean: {data.kpis.cleanRooms ?? 0}</span>
                                                    <span>Dirty: {data.kpis.dirtyRooms ?? 0}</span>
                                                    <span>Live Yield Tracking</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <Link
                                    href="/front-office/reports/adr"
                                    className="bg-white rounded-md p-4 border gap-2 flex flex-col hover:border-orion-blue hover:shadow-sm cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground font-medium">
                                            Average Daily Rate (ADR)
                                        </div>
                                        <span className="text-[10px] text-orion-blue font-semibold hover:underline">
                                            Full Report →
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start justify-between">
                                        <div className="text-2xl font-bold tracking-tight text-gray-900">
                                            {formatCurrency(adrData?.adr ?? data.kpis.adr)}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                            <span>Guest-nights: {adrData?.roomsSoldNights ?? 0}</span>
                                            <span>Revenue: {formatCurrency(adrData?.totalRoomRevenue ?? 0)}</span>
                                            {adrData?.context?.occupancyPercent != null ? (
                                                <span>Occ. ≈ {adrData.context.occupancyPercent}%</span>
                                            ) : null}
                                            {adrData?.context?.vsPriorDayPercent != null ? (
                                                <span
                                                    className={
                                                        adrData.context.band === 'up'
                                                            ? 'text-green-600'
                                                            : adrData.context.band === 'down'
                                                              ? 'text-red-600'
                                                              : ''
                                                    }
                                                >
                                                    vs prior: {adrData.context.vsPriorDayPercent > 0 ? '+' : ''}
                                                    {adrData.context.vsPriorDayPercent}%
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </Link>
                                <Link
                                    href="/front-office/reports/adr"
                                    className="bg-white rounded-md p-4 border gap-2 flex flex-col hover:border-orion-blue hover:shadow-sm cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground font-medium">
                                            Revenue Per Available Room (RevPAR)
                                        </div>
                                        <span className="text-[10px] text-orion-blue font-semibold hover:underline">
                                            Full Report →
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start justify-between">
                                        <div className="text-2xl font-bold tracking-tight text-gray-900">
                                            {formatCurrency(
                                                adrData?.context?.sellableRoomCount && adrData.context.sellableRoomCount > 0
                                                    ? adrData.totalRoomRevenue / adrData.context.sellableRoomCount
                                                    : data.kpis.revpar
                                            )}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                            <span>Capacity: {adrData?.context?.sellableRoomCount ?? 0} rooms</span>
                                            {adrData?.context?.occupancyPercent != null ? (
                                                <span>Occ. ≈ {adrData.context.occupancyPercent}%</span>
                                            ) : null}
                                            <span>Room Rev: {formatCurrency(adrData?.totalRoomRevenue ?? 0)}</span>
                                        </div>
                                    </div>
                                </Link>
                                <FOStatCard
                                    title="Total Revenue (₦)"
                                    valueType="currency"
                                    currentValue={data.kpis.totalRevenue}
                                    previousValue={data.kpis.totalRevenue * 0.9}
                                    percentageChange={10}
                                />
                            </div>

                            {/* Housekeeping & Tomorrow's Forecast Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
                                {/* Point-in-Time Housekeeping */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm font-bold text-gray-800 flex items-center justify-between uppercase tracking-tight">
                                            <span className="flex items-center gap-2">
                                                <LuHotel className="text-brand w-4 h-4" />
                                                Housekeeping Status
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold normal-case">
                                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                Real-Time Live Status
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="p-3 bg-green-50/50 rounded-xl border border-green-100/50">
                                                <div className="text-[10px] font-bold text-green-700 uppercase mb-0.5">
                                                    Clean Rooms
                                                </div>
                                                <div className="text-2xl font-black text-green-600">
                                                    {data.kpis.cleanRooms ?? 0}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                                                <div className="text-[10px] font-bold text-red-700 uppercase mb-0.5">
                                                    Dirty Rooms
                                                </div>
                                                <div className="text-2xl font-black text-red-600">
                                                    {data.kpis.dirtyRooms ?? 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {(() => {
                                            const total =
                                                (data.kpis.cleanRooms ?? 0) +
                                                (data.kpis.dirtyRooms ?? 0);
                                            const cleanPct =
                                                total > 0
                                                    ? ((data.kpis.cleanRooms ??
                                                          0) /
                                                          total) *
                                                      100
                                                    : 0;
                                            return (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                                                        <span>
                                                            {formatNum(
                                                                cleanPct,
                                                                1,
                                                            )}
                                                            % CLEAN
                                                        </span>
                                                        <span>
                                                            {formatNum(
                                                                100 - cleanPct,
                                                                1,
                                                            )}
                                                            % DIRTY
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden flex">
                                                        <div
                                                            className="h-full bg-green-500 transition-all duration-500"
                                                            style={{
                                                                width: `${cleanPct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>

                                {/* Tomorrow's Forecast */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader className="py-4">
                                        <CardTitle className="text-sm font-bold text-gray-800 flex items-center justify-between uppercase tracking-tight">
                                            <span className="flex items-center gap-2">
                                                <LuTrendingUp className="text-brand w-4 h-4" />
                                                Tomorrow&apos;s Forecast
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium normal-case">
                                                {(() => {
                                                    const tom = new Date(
                                                        selectedDate,
                                                    );
                                                    tom.setDate(
                                                        tom.getDate() + 1,
                                                    );
                                                    return tom.toLocaleDateString(
                                                        'en-US',
                                                        { dateStyle: 'medium' },
                                                    );
                                                })()}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-5">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/30 text-center">
                                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                                                    Arrivals
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    {data.tomorrowStats
                                                        ?.arrivalRooms ?? 0}
                                                </div>
                                                <div className="text-[9px] text-gray-500 mt-0.5">
                                                    {data.tomorrowStats
                                                        ?.arrivalPersons ??
                                                        0}{' '}
                                                    Pax
                                                </div>
                                            </div>
                                            <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/30 text-center">
                                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                                                    Departures
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    {data.tomorrowStats
                                                        ?.departureRooms ?? 0}
                                                </div>
                                                <div className="text-[9px] text-gray-500 mt-0.5">
                                                    {data.tomorrowStats
                                                        ?.departurePersons ??
                                                        0}{' '}
                                                    Pax
                                                </div>
                                            </div>
                                            <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/30 text-center flex flex-col justify-center items-center">
                                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                                                    Occupancy %
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    {data.tomorrowStats
                                                        ?.occupancyPct ?? 0}
                                                    %
                                                </div>
                                                <div className="text-[9px] text-transparent mt-0.5 select-none">
                                                    —
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 2. Budget vs Actual */}
                            {/* Master Operational & Financial Sections */}
                            {data?.sections?.map(
                                (section: any, idx: number) => (
                                    <Card
                                        key={idx}
                                        className="shadow-sm border-none bg-white overflow-hidden mb-6"
                                    >
                                        <CardHeader className="bg-gray-50/50 border-b py-3">
                                            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                                                {section.title ===
                                                    'Room Statistics' && (
                                                    <LuHotel className="text-brand w-4 h-4" />
                                                )}
                                                {section.title ===
                                                    'Revenue Statistics' && (
                                                    <LuDollarSign className="text-brand w-4 h-4" />
                                                )}
                                                {section.title ===
                                                    'Performance Averages' && (
                                                    <LuTarget className="text-brand w-4 h-4" />
                                                )}
                                                {section.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-[10px]">
                                                    <thead>
                                                        <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                                                            <th className="px-4 py-3 text-left font-bold text-gray-900 sticky left-0 bg-gray-50 z-10 w-48">
                                                                METRIC
                                                            </th>
                                                            <th className="px-1 py-3 text-center border-l bg-blue-50/30">
                                                                TODAY
                                                            </th>
                                                            <th className="px-1 py-3 text-center text-gray-400 bg-blue-50/30 font-medium">
                                                                BUDGET
                                                            </th>
                                                            <th className="px-1 py-3 text-center text-blue-600 border-r bg-blue-50/30 font-medium">
                                                                LY TODAY
                                                            </th>

                                                            <th className="px-1 py-3 text-center bg-gray-100/50">
                                                                MTD
                                                            </th>
                                                            <th className="px-1 py-3 text-center text-gray-400 bg-gray-100/50 font-medium">
                                                                BUDGET
                                                            </th>
                                                            <th className="px-1 py-3 text-center text-blue-600 border-r bg-gray-100/50 font-medium">
                                                                LY MTD
                                                            </th>

                                                            <th className="px-1 py-3 text-center bg-brand/5 font-bold text-brand">
                                                                YTD
                                                            </th>
                                                            <th className="px-1 py-3 text-center text-gray-400 bg-brand/5 font-medium">
                                                                BUDGET
                                                            </th>
                                                            <th className="px-1 py-3 text-center text-blue-800 bg-brand/5 font-medium">
                                                                LY YTD
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {section.rows?.map(
                                                            (
                                                                row: any,
                                                                i: number,
                                                            ) => {
                                                                const decimals =
                                                                    row.suffix ===
                                                                    '%'
                                                                        ? 1
                                                                        : 0;
                                                                const fmt = (
                                                                    val:
                                                                        | number
                                                                        | null,
                                                                ) => {
                                                                    if (
                                                                        val ===
                                                                            null ||
                                                                        val ===
                                                                            undefined
                                                                    )
                                                                        return '—';
                                                                    if (
                                                                        row.isCurrency
                                                                    )
                                                                        return formatCurrency(
                                                                            val,
                                                                        );
                                                                    return `${formatNum(val, decimals)}${row.suffix || ''}`;
                                                                };
                                                                const fmtActual =
                                                                    (
                                                                        val:
                                                                            | number
                                                                            | null,
                                                                    ) => {
                                                                        if (
                                                                            val ===
                                                                                null ||
                                                                            val ===
                                                                                undefined
                                                                        )
                                                                            return '—';
                                                                        if (
                                                                            row.isCurrency
                                                                        )
                                                                            return formatCurrency(
                                                                                val,
                                                                            );
                                                                        return `${formatNum(val, decimals)}${row.suffix || ''}`;
                                                                    };
                                                                return (
                                                                    <tr
                                                                        key={i}
                                                                        className="hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <td className="px-4 py-3 font-bold text-gray-800 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                                                                            {
                                                                                row.label
                                                                            }
                                                                        </td>

                                                                        <td className="px-1 py-3 text-center font-bold border-l">
                                                                            {fmtActual(
                                                                                row.t,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-1 py-3 text-center text-gray-400">
                                                                            {fmt(
                                                                                row.bt,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-1 py-3 text-center text-blue-600 border-r font-medium">
                                                                            {fmtActual(
                                                                                row.lyt,
                                                                            )}
                                                                        </td>

                                                                        <td className="px-1 py-3 text-center font-semibold bg-gray-50/50">
                                                                            {fmtActual(
                                                                                row.m,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-1 py-3 text-center text-gray-400 bg-gray-50/50">
                                                                            {fmt(
                                                                                row.bm,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-1 py-3 text-center text-blue-600 border-r bg-gray-50/50 font-medium">
                                                                            {fmtActual(
                                                                                row.lym,
                                                                            )}
                                                                        </td>

                                                                        <td className="px-1 py-3 text-center font-black text-brand bg-brand/[0.02]">
                                                                            {fmtActual(
                                                                                row.y,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-1 py-3 text-center text-gray-400 bg-brand/[0.02]">
                                                                            {fmt(
                                                                                row.by,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-1 py-3 text-center text-blue-800 bg-brand/[0.02] font-medium">
                                                                            {fmtActual(
                                                                                row.lyy,
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ),
                            )}

                            {/* 3. Market & Profile Analysis */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Source of Business */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <LuGlobe className="text-brand" />
                                            Source of Business
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[200px] w-full">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={
                                                            data?.sourceOfBusiness ||
                                                            []
                                                        }
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={70}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {data?.sourceOfBusiness?.map(
                                                            (
                                                                entry: any,
                                                                index: number,
                                                            ) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        entry.color ||
                                                                        '#FF872A'
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            {data?.sourceOfBusiness?.map(
                                                (item: any, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-2 h-2 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.color ||
                                                                        '#FF872A',
                                                                }}
                                                            />
                                                            <span className="text-gray-600">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold">
                                                            {item.value}%
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Guest Profiles */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <LuUsers className="text-brand" />
                                            Guest Profile Types
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[200px] w-full">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        data?.guestProfiles ||
                                                        []
                                                    }
                                                    layout="vertical"
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        horizontal={false}
                                                        vertical={false}
                                                    />
                                                    <XAxis type="number" hide />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fontSize: 11,
                                                            fontWeight: 500,
                                                        }}
                                                        width={80}
                                                    />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="value"
                                                        radius={[0, 4, 4, 0]}
                                                    >
                                                        {data?.guestProfiles?.map(
                                                            (
                                                                entry: any,
                                                                index: number,
                                                            ) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        entry.color ||
                                                                        '#1D6360'
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-2 text-center text-[11px] text-gray-500 italic">
                                            Real-time segment breakdown
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 7-Day Occupancy Forecast */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <LuTrendingUp className="text-brand" />
                                            7-Day Occupancy Forecast
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[220px] w-full">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <AreaChart
                                                    data={data?.forecast || []}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis
                                                        dataKey="day"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fontSize: 10,
                                                            fill: '#666',
                                                        }}
                                                    />
                                                    <YAxis
                                                        domain={[0, 100]}
                                                        hide
                                                    />
                                                    <Tooltip />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="occupancy"
                                                        stroke="#FF872A"
                                                        strokeWidth={2}
                                                        fill="#FF872A"
                                                        fillOpacity={0.1}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 px-2">
                                            <div className="text-center">
                                                <div className="text-[10px] text-gray-500 uppercase">
                                                    Weekly Snapshot
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    Projected trends
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 4. F&B & Operational Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* F&B Outlet Breakdown */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <LuUtensils className="text-brand" />
                                            F&B Outlet Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {data?.fbOutlets?.length > 0 ? (
                                                data.fbOutlets.map(
                                                    (
                                                        outlet: any,
                                                        i: number,
                                                    ) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-brand/30 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand font-bold text-xs group-hover:bg-brand group-hover:text-white transition-colors">
                                                                    {(outlet.name
                                                                        ?.replace(
                                                                            /_/g,
                                                                            ' ',
                                                                        )
                                                                        .trim() ||
                                                                        '—')[0]?.toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-800 text-sm">
                                                                        {outlet.name
                                                                            ?.replace(
                                                                                /_/g,
                                                                                ' ',
                                                                            )
                                                                            .trim()
                                                                            .replace(
                                                                                /\b\w/g,
                                                                                (
                                                                                    c: string,
                                                                                ) =>
                                                                                    c.toUpperCase(),
                                                                            ) ||
                                                                            '—'}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-500">
                                                                        {
                                                                            outlet.covers
                                                                        }{' '}
                                                                        Transactions
                                                                        today
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-gray-900">
                                                                    {formatCurrency(
                                                                        outlet.revenue,
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-green-600 font-medium">
                                                                    {outlet.covers >
                                                                    0
                                                                        ? formatCurrency(
                                                                              Math.round(
                                                                                  outlet.revenue /
                                                                                      outlet.covers,
                                                                              ),
                                                                          )
                                                                        : '₦0'}{' '}
                                                                    Avg Ticket
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="text-center py-8 text-gray-400 italic">
                                                    No F&B transactions recorded
                                                    today.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Geographic & Nationality Profile */}
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                                            <LuGlobe className="text-brand" />
                                            Nationality & Geographic Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-5">
                                            {data?.geographic?.length > 0 ? (
                                                data.geographic.map(
                                                    (item: any, i: number) => (
                                                        <div
                                                            key={i}
                                                            className="space-y-1.5"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg">
                                                                        {
                                                                            item.flag
                                                                        }
                                                                    </span>
                                                                    <span className="text-sm font-semibold text-gray-700">
                                                                        {
                                                                            item.country
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs font-bold text-gray-900">
                                                                    {Number(
                                                                        item.guests,
                                                                    ).toLocaleString(
                                                                        'en-NG',
                                                                    )}{' '}
                                                                    Guests (
                                                                    {formatNum(
                                                                        item.pct,
                                                                        1,
                                                                    )}
                                                                    %)
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-brand"
                                                                    style={{
                                                                        width: `${item.pct}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <div className="text-center py-8 text-gray-400 italic">
                                                    No geographic data
                                                    available.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden Print-Optimized Layout for PDF Export */}
                {data && (
                    <div
                        ref={printRef}
                        className="absolute left-[-9999px] top-0 w-[1024px] bg-white text-black p-8 flex flex-col gap-6"
                        style={{ width: '1024px', background: 'white' }}
                    >
                        {/* Print Header */}
                        <div className="flex justify-between items-start border-b-2 border-brand pb-4 mb-2">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-0.5">
                                    MANAGER&apos;S FLASH REPORT
                                </h1>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
                                    {user?.hotel?.name || 'Property Snapshot'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 uppercase font-bold">
                                    Report Date
                                </div>
                                <div className="text-lg font-black text-brand">
                                    {new Date(selectedDate).toLocaleDateString(
                                        'en-US',
                                        {
                                            dateStyle: 'full',
                                        },
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* KPIs snap */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                {
                                    label: 'Occupancy',
                                    value: `${data.kpis.occupancy.toFixed(1)}%`,
                                },
                                {
                                    label: 'ADR',
                                    value: formatCurrency(data.kpis.adr),
                                },
                                {
                                    label: 'RevPAR',
                                    value: formatCurrency(data.kpis.revpar),
                                },
                                {
                                    label: 'Total Revenue',
                                    value: formatCurrency(
                                        data.kpis.totalRevenue,
                                    ),
                                },
                            ].map((kpi, i) => (
                                <div
                                    key={i}
                                    className="p-3 border border-gray-200 rounded-xl bg-gray-50/20"
                                >
                                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">
                                        {kpi.label}
                                    </div>
                                    <div className="text-lg font-black text-gray-900">
                                        {kpi.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Housekeeping & Tomorrow's Forecast Row */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Housekeeping status */}
                            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/10">
                                <div className="text-xs font-bold text-gray-800 mb-3 flex items-center justify-between uppercase tracking-tight">
                                    <span className="flex items-center gap-1.5">
                                        <LuHotel className="text-brand w-3.5 h-3.5" />
                                        Housekeeping Status Summary
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium normal-case">
                                        Current Live Snapshot
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="p-2 border border-green-100 bg-green-50/20 rounded-lg">
                                        <div className="text-[9px] font-bold text-green-700 uppercase mb-0.5">
                                            Clean Rooms
                                        </div>
                                        <div className="text-lg font-black text-green-600">
                                            {data.kpis.cleanRooms ?? 0}
                                        </div>
                                    </div>
                                    <div className="p-2 border border-red-100 bg-red-50/20 rounded-lg">
                                        <div className="text-[9px] font-bold text-red-700 uppercase mb-0.5">
                                            Dirty Rooms
                                        </div>
                                        <div className="text-lg font-black text-red-600">
                                            {data.kpis.dirtyRooms ?? 0}
                                        </div>
                                    </div>
                                </div>
                                {(() => {
                                    const total =
                                        (data.kpis.cleanRooms ?? 0) +
                                        (data.kpis.dirtyRooms ?? 0);
                                    const cleanPct =
                                        total > 0
                                            ? ((data.kpis.cleanRooms ?? 0) /
                                                  total) *
                                              100
                                            : 0;
                                    return (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[8px] font-bold text-gray-500">
                                                <span>
                                                    {cleanPct.toFixed(1)}% CLEAN
                                                </span>
                                                <span>
                                                    {(100 - cleanPct).toFixed(
                                                        1,
                                                    )}
                                                    % DIRTY
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{
                                                        width: `${cleanPct}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Tomorrow's Forecast */}
                            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/10">
                                <div className="text-xs font-bold text-gray-800 mb-3 flex items-center justify-between uppercase tracking-tight">
                                    <span className="flex items-center gap-1.5">
                                        <LuTrendingUp className="text-brand w-3.5 h-3.5" />
                                        Tomorrow&apos;s Operations Forecast
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-medium normal-case">
                                        {(() => {
                                            const tom = new Date(selectedDate);
                                            tom.setDate(tom.getDate() + 1);
                                            return tom.toLocaleDateString(
                                                'en-US',
                                                { dateStyle: 'medium' },
                                            );
                                        })()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-2 border border-blue-50 bg-blue-50/10 rounded-lg text-center">
                                        <div className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                            Arrivals
                                        </div>
                                        <div className="text-sm font-black text-gray-900">
                                            {data.tomorrowStats?.arrivalRooms ??
                                                0}{' '}
                                            Rms
                                        </div>
                                        <div className="text-[8px] text-gray-500">
                                            {data.tomorrowStats
                                                ?.arrivalPersons ?? 0}{' '}
                                            Pax
                                        </div>
                                    </div>
                                    <div className="p-2 border border-blue-50 bg-blue-50/10 rounded-lg text-center">
                                        <div className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                            Departures
                                        </div>
                                        <div className="text-sm font-black text-gray-900">
                                            {data.tomorrowStats
                                                ?.departureRooms ?? 0}{' '}
                                            Rms
                                        </div>
                                        <div className="text-[8px] text-gray-500">
                                            {data.tomorrowStats
                                                ?.departurePersons ?? 0}{' '}
                                            Pax
                                        </div>
                                    </div>
                                    <div className="p-2 border border-blue-50 bg-blue-50/10 rounded-lg text-center flex flex-col justify-center items-center">
                                        <div className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                            Occupancy
                                        </div>
                                        <div className="text-sm font-black text-gray-900">
                                            {data.tomorrowStats?.occupancyPct ??
                                                0}
                                            %
                                        </div>
                                        <div className="text-[8px] text-transparent select-none">
                                            —
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Master Tables */}
                        {data?.sections?.map((section: any, idx: number) => (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white"
                            >
                                <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 font-bold text-gray-800 flex items-center gap-2 text-[9px] uppercase tracking-wider">
                                    {section.title === 'Room Statistics' && (
                                        <LuHotel className="text-brand w-3 h-3" />
                                    )}
                                    {section.title === 'Revenue Statistics' && (
                                        <LuDollarSign className="text-brand w-3 h-3" />
                                    )}
                                    {section.title ===
                                        'Performance Averages' && (
                                        <LuTarget className="text-brand w-3 h-3" />
                                    )}
                                    {section.title}
                                </div>
                                <table className="w-full text-[8px] border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100/40 text-gray-600 border-b border-gray-200 font-bold">
                                            <th className="px-3 py-1.5 text-left font-bold text-gray-900 w-44">
                                                METRIC
                                            </th>
                                            <th className="px-1 py-1.5 text-center border-l border-gray-200 bg-blue-50/10 w-20">
                                                TODAY
                                            </th>
                                            <th className="px-1 py-1.5 text-center text-gray-400 bg-blue-50/10 w-20">
                                                BUDGET
                                            </th>
                                            <th className="px-1 py-1.5 text-center text-blue-600 border-r border-gray-200 bg-blue-50/10 w-20">
                                                LY
                                            </th>

                                            <th className="px-1 py-1.5 text-center bg-gray-50/50 w-20">
                                                MTD
                                            </th>
                                            <th className="px-1 py-1.5 text-center text-gray-400 bg-gray-50/50 w-20">
                                                BUDGET
                                            </th>
                                            <th className="px-1 py-1.5 text-center text-blue-600 border-r border-gray-200 bg-gray-50/50 w-20">
                                                LY MTD
                                            </th>

                                            <th className="px-1 py-1.5 text-center bg-brand/5 font-bold text-brand w-20">
                                                YTD
                                            </th>
                                            <th className="px-1 py-1.5 text-center text-gray-400 bg-brand/5 w-20">
                                                BUDGET
                                            </th>
                                            <th className="px-1 py-1.5 text-center font-bold bg-brand/5 text-blue-900 w-20">
                                                LY YTD
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-150">
                                        {section.rows?.map(
                                            (row: any, i: number) => {
                                                const decimals =
                                                    row.suffix === '%' ? 1 : 0;
                                                const fmt = (
                                                    val: number | null,
                                                ) => {
                                                    if (
                                                        val === null ||
                                                        val === undefined
                                                    )
                                                        return '—';
                                                    if (row.isCurrency)
                                                        return formatCurrency(
                                                            val,
                                                        );
                                                    return `${formatNum(val, decimals)}${row.suffix || ''}`;
                                                };
                                                return (
                                                    <tr
                                                        key={i}
                                                        className={
                                                            i % 2 === 1
                                                                ? 'bg-gray-50/30'
                                                                : 'bg-white'
                                                        }
                                                    >
                                                        <td className="px-3 py-1 font-bold text-gray-800">
                                                            {row.label}
                                                        </td>
                                                        <td className="px-1 py-1 text-center font-bold border-l border-gray-150">
                                                            {fmt(row.t)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center text-gray-400">
                                                            {fmt(row.bt)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center text-blue-600 border-r border-gray-150">
                                                            {fmt(row.lyt)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center font-semibold bg-gray-50/20">
                                                            {fmt(row.m)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center text-gray-400 bg-gray-50/20">
                                                            {fmt(row.bm)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center text-blue-600 border-r border-gray-150 bg-gray-50/20">
                                                            {fmt(row.lym)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center font-black text-brand bg-brand/[0.01]">
                                                            {fmt(row.y)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center text-gray-400 bg-brand/[0.01]">
                                                            {fmt(row.by)}
                                                        </td>
                                                        <td className="px-1 py-1 text-center font-bold text-blue-900 bg-brand/[0.01]">
                                                            {fmt(row.lyy)}
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {/* Charts Row */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                                <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <LuGlobe className="text-brand w-3.5 h-3.5" />{' '}
                                    Source of Business
                                </div>
                                <div className="h-[140px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    data.sourceOfBusiness || []
                                                }
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={35}
                                                outerRadius={55}
                                                dataKey="value"
                                                isAnimationActive={false}
                                            >
                                                {data?.sourceOfBusiness?.map(
                                                    (
                                                        entry: any,
                                                        index: number,
                                                    ) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                entry.color ||
                                                                '#FF872A'
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                                <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <LuUsers className="text-brand w-3.5 h-3.5" />{' '}
                                    Guest Profiles
                                </div>
                                <div className="h-[140px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={data?.guestProfiles || []}
                                            layout="vertical"
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 8 }}
                                                width={55}
                                            />
                                            <Bar
                                                dataKey="value"
                                                radius={[0, 4, 4, 0]}
                                                isAnimationActive={false}
                                            >
                                                {data?.guestProfiles?.map(
                                                    (
                                                        entry: any,
                                                        index: number,
                                                    ) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                entry.color ||
                                                                '#1D6360'
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                                <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <LuTrendingUp className="text-brand w-3.5 h-3.5" />{' '}
                                    7-Day Forecast
                                </div>
                                <div className="h-[140px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart data={data?.forecast || []}>
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 8 }}
                                            />
                                            <YAxis domain={[0, 100]} hide />
                                            <Area
                                                type="monotone"
                                                dataKey="occupancy"
                                                stroke="#FF872A"
                                                strokeWidth={2}
                                                fill="#FF872A"
                                                fillOpacity={0.1}
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* F&B and Nationality Row */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm h-[260px] flex flex-col hover:border-brand/40 transition-all duration-300">
                                <div className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 flex-none">
                                    <LuUtensils className="text-brand w-3.5 h-3.5" />{' '}
                                    F&B Performance
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-gray-100 hover:scrollbar-thumb-gray-200">
                                    {data?.fbOutlets?.length > 0 ? (
                                        data.fbOutlets.map(
                                            (outlet: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between items-center border border-gray-100/50 text-[10px] p-2.5 bg-gray-50/50 hover:border-brand rounded-xl transition-all duration-200 group"
                                                >
                                                    <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                                        {outlet.name
                                                            ?.replace(/_/g, ' ')
                                                            .trim()
                                                            .replace(
                                                                /\b\w/g,
                                                                (c: string) =>
                                                                    c.toUpperCase(),
                                                            ) || '—'}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className="font-black text-brand text-[10.5px]">
                                                            {formatCurrency(
                                                                outlet.revenue,
                                                            )}
                                                        </div>
                                                        <div className="text-gray-400 text-[8px] font-medium mt-0.5">
                                                            {outlet.covers}{' '}
                                                            Covers
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="text-center py-10 text-gray-400 italic text-[9px]">
                                            No F&B data available today.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm h-[260px] flex flex-col hover:border-brand/40 transition-all duration-300">
                                <div className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 flex-none">
                                    <LuGlobe className="text-brand w-3.5 h-3.5" />{' '}
                                    Nationality Profile
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin scrollbar-thumb-gray-100 hover:scrollbar-thumb-gray-200">
                                    {data?.geographic?.length > 0 ? (
                                        data.geographic.map(
                                            (item: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="space-y-1 bg-gray-50/20 p-2 rounded-lg border border-gray-50"
                                                >
                                                    <div className="flex justify-between items-center text-[9px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs">
                                                                {item.flag}
                                                            </span>
                                                            <span className="font-bold text-gray-700">
                                                                {item.country}
                                                            </span>
                                                        </div>
                                                        <div className="font-black text-gray-900">
                                                            {Number(
                                                                item.guests,
                                                            ).toLocaleString(
                                                                'en-NG',
                                                            )}{' '}
                                                            Pax (
                                                            {formatNum(
                                                                item.pct,
                                                                1,
                                                            )}
                                                            %)
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                                        <div
                                                            className="h-full bg-brand"
                                                            style={{
                                                                width: `${item.pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="text-center py-10 text-gray-400 italic text-[9px]">
                                            No geographic data available.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-end text-[9px] text-gray-400">
                            <div>
                                <p>
                                    Generated by {user?.fullName} | Anli PMS
                                    Executive Reporting
                                </p>
                                <p>
                                    © {new Date().getFullYear()}{' '}
                                    {user?.hotel?.name ||
                                        'Hotel Management System'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p>Internal Use Only</p>
                                <p>Page 1 of 1</p>
                            </div>
                        </div>
                    </div>
                )}
            </PageWrapper>
        </div>
    );
};

export default ManagersFlash;
