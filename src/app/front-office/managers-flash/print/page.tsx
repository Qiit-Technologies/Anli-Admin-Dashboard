'use client';

import React, { useEffect } from 'react';
import { useUser } from '@/context/useUser';
import { getManagersFlash } from '@/app/actions/reports';
import useSWR from 'swr';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    BarChart,
    Bar,
} from 'recharts';
import {
    LuHotel,
    LuDollarSign,
    LuUsers,
    LuGlobe,
    LuTarget,
    LuUtensils,
    LuTrendingUp,
} from 'react-icons/lu';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Format a non-currency number: 0 decimals for whole numbers, 1 for % values
const formatNum = (val: number | null | undefined, decimals = 0): string => {
    if (val === null || val === undefined || isNaN(Number(val))) return '—';
    return Number(val).toLocaleString('en-NG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const PrintManagersFlash = () => {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const date =
        searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data: flashData, isLoading } = useSWR(
        ['manager-flash-print', date],
        () => getManagersFlash(date),
    );

    useEffect(() => {
        if (!isLoading && flashData) {
            // Wait for charts to animate
            const timer = setTimeout(() => {
                window.print();
            }, 1500);

            // Listen to completion of printing event to close the tab cleanly
            window.onafterprint = () => {
                window.close();
            };

            return () => {
                clearTimeout(timer);
                window.onafterprint = null;
            };
        }
    }, [isLoading, flashData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
                <span className="text-gray-500 font-medium">
                    Preparing print preview...
                </span>
            </div>
        );
    }

    const data = flashData?.data;
    if (!data) return <div>No data found for this date.</div>;

    return (
        <div className="print-root p-8 bg-white text-black print:p-0 min-w-[1024px]">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    /* Reset high-level document shells */
                    html, body, #__next {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        overflow-y: visible !important;
                        display: block !important;
                        position: static !important;
                    }
                    
                    /* Reset all wrapping parents enclosing our printable canvas */
                    *:has(.print-root) {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        overflow-y: visible !important;
                        display: block !important;
                        position: static !important;
                    }

                    /* Reset class-based outer wrappers as robust fallbacks */
                    .flex.h-screen,
                    main.bg-gray-50,
                    main.bg-gray-50 > div,
                    .flex-1.overflow-auto,
                    [class*="flex"][class*="h-screen"],
                    [class*="overflow-auto"],
                    [class*="overflow-hidden"] {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        overflow-y: visible !important;
                        display: block !important;
                        position: static !important;
                    }

                    /* Hide sidebar, warnings and modals during print */
                    aside, nav, 
                    [class*="Sidebar"], 
                    [class*="SubscriptionWarningBannerClient"],
                    [class*="DailyRecognitionModal"],
                    .no-print {
                        display: none !important;
                    }
                }
            `,
                }}
            />
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-brand pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        MANAGER&apos;S FLASH REPORT
                    </h1>
                    <p className="text-gray-500 font-medium uppercase tracking-widest">
                        {user?.hotel?.name || 'Property Performance Snapshot'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500 uppercase font-bold">
                        Report Date
                    </div>
                    <div className="text-xl font-black text-brand">
                        {new Date(date).toLocaleDateString('en-US', {
                            dateStyle: 'full',
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. KPIs */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Occupancy',
                            value: `${data.kpis.occupancy.toFixed(1)}%`,
                        },
                        { label: 'ADR', value: formatCurrency(data.kpis.adr) },
                        {
                            label: 'RevPAR',
                            value: formatCurrency(data.kpis.revpar),
                        },
                        {
                            label: 'Total Revenue',
                            value: formatCurrency(data.kpis.totalRevenue),
                        },
                    ].map((kpi, i) => (
                        <div
                            key={i}
                            className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50/30"
                        >
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                {kpi.label}
                            </div>
                            <div className="text-xl font-black text-gray-900">
                                {kpi.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Housekeeping & Tomorrow's Forecast Row (Print Optimized) */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Housekeeping status */}
                    <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50/10">
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
                                    ? ((data.kpis.cleanRooms ?? 0) / total) *
                                      100
                                    : 0;
                            return (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-gray-500">
                                        <span>
                                            {cleanPct.toFixed(1)}% CLEAN
                                        </span>
                                        <span>
                                            {(100 - cleanPct).toFixed(1)}% DIRTY
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${cleanPct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Tomorrow's Forecast */}
                    <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50/10">
                        <div className="text-xs font-bold text-gray-800 mb-3 flex items-center justify-between uppercase tracking-tight">
                            <span className="flex items-center gap-1.5">
                                <LuTrendingUp className="text-brand w-3.5 h-3.5" />
                                Tomorrow&apos;s Operations Forecast
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium normal-case">
                                {(() => {
                                    const tom = new Date(date);
                                    tom.setDate(tom.getDate() + 1);
                                    return tom.toLocaleDateString('en-US', {
                                        dateStyle: 'medium',
                                    });
                                })()}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 border border-blue-50 bg-blue-50/10 rounded-lg text-center">
                                <div className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                    Arrivals
                                </div>
                                <div className="text-sm font-black text-gray-900">
                                    {data.tomorrowStats?.arrivalRooms ?? 0} Rms
                                </div>
                                <div className="text-[8px] text-gray-500">
                                    {data.tomorrowStats?.arrivalPersons ?? 0}{' '}
                                    Pax
                                </div>
                            </div>
                            <div className="p-2 border border-blue-50 bg-blue-50/10 rounded-lg text-center">
                                <div className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                    Departures
                                </div>
                                <div className="text-sm font-black text-gray-900">
                                    {data.tomorrowStats?.departureRooms ?? 0}{' '}
                                    Rms
                                </div>
                                <div className="text-[8px] text-gray-500">
                                    {data.tomorrowStats?.departurePersons ?? 0}{' '}
                                    Pax
                                </div>
                            </div>
                            <div className="p-2 border border-blue-50 bg-blue-50/10 rounded-lg text-center flex flex-col justify-center items-center">
                                <div className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">
                                    Occupancy
                                </div>
                                <div className="text-sm font-black text-gray-900">
                                    {data.tomorrowStats?.occupancyPct ?? 0}%
                                </div>
                                <div className="text-[8px] text-transparent select-none">
                                    —
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Master Operational & Financial Tables (Print Optimized) */}
                {data?.sections?.map((section: any, idx: number) => (
                    <div
                        key={idx}
                        className="border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm"
                    >
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 font-bold text-gray-800 flex items-center gap-2 text-[10px] uppercase tracking-wider">
                            {section.title === 'Room Statistics' && (
                                <LuHotel className="text-brand w-3.5 h-3.5" />
                            )}
                            {section.title === 'Revenue Statistics' && (
                                <LuDollarSign className="text-brand w-3.5 h-3.5" />
                            )}
                            {section.title === 'Performance Averages' && (
                                <LuTarget className="text-brand w-3.5 h-3.5" />
                            )}
                            {section.title}
                        </div>
                        <table className="w-full text-[8.5px] border-collapse">
                            <thead>
                                <tr className="bg-gray-100/40 text-gray-600 border-b border-gray-200 font-bold">
                                    <th className="px-3 py-2 text-left font-bold text-gray-900 w-44">
                                        METRIC
                                    </th>
                                    <th className="px-1 py-2 text-center border-l border-gray-200 bg-blue-50/10 w-20">
                                        TODAY
                                    </th>
                                    <th className="px-1 py-2 text-center text-gray-400 bg-blue-50/10 w-20">
                                        BUDGET
                                    </th>
                                    <th className="px-1 py-2 text-center text-blue-600 border-r border-gray-200 bg-blue-50/10 w-20">
                                        LY
                                    </th>

                                    <th className="px-1 py-2 text-center bg-gray-50/50 w-20">
                                        MTD
                                    </th>
                                    <th className="px-1 py-2 text-center text-gray-400 bg-gray-50/50 w-20">
                                        BUDGET
                                    </th>
                                    <th className="px-1 py-2 text-center text-blue-600 border-r border-gray-200 bg-gray-50/50 w-20">
                                        LY MTD
                                    </th>

                                    <th className="px-1 py-2 text-center bg-brand/5 font-bold text-brand w-20">
                                        YTD
                                    </th>
                                    <th className="px-1 py-2 text-center text-gray-400 bg-brand/5 w-20">
                                        BUDGET
                                    </th>
                                    <th className="px-1 py-2 text-center font-bold bg-brand/5 text-blue-900 w-20">
                                        LY YTD
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150">
                                {section.rows?.map((row: any, i: number) => {
                                    const decimals = row.suffix === '%' ? 1 : 0;
                                    const fmt = (val: number | null) => {
                                        if (val === null || val === undefined)
                                            return '—';
                                        if (row.isCurrency)
                                            return formatCurrency(val);
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
                                            <td className="px-3 py-1.5 font-bold text-gray-800">
                                                {row.label}
                                            </td>
                                            <td className="px-1 py-1.5 text-center font-bold border-l border-gray-150">
                                                {fmt(row.t)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center text-gray-400">
                                                {fmt(row.bt)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center text-blue-600 border-r border-gray-150">
                                                {fmt(row.lyt)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center font-semibold bg-gray-50/20">
                                                {fmt(row.m)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center text-gray-400 bg-gray-50/20">
                                                {fmt(row.bm)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center text-blue-600 border-r border-gray-150 bg-gray-50/20">
                                                {fmt(row.lym)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center font-black text-brand bg-brand/[0.01]">
                                                {fmt(row.y)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center text-gray-400 bg-brand/[0.01]">
                                                {fmt(row.by)}
                                            </td>
                                            <td className="px-1 py-1.5 text-center font-bold text-blue-900 bg-brand/[0.01]">
                                                {fmt(row.lyy)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* 3. Charts Row */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Source of Business */}
                    <div className="border-2 border-gray-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LuGlobe className="text-brand" /> Source of
                            Business
                        </div>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.sourceOfBusiness}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        {data?.sourceOfBusiness?.map(
                                            (entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.color || '#FF872A'
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {data?.sourceOfBusiness?.map(
                                (item: any, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-1.5 text-[9px]"
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    item.color || '#FF872A',
                                            }}
                                        />
                                        <span className="text-gray-500 truncate">
                                            {item.name} ({item.value}%)
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Profiles */}
                    <div className="border-2 border-gray-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LuUsers className="text-brand" /> Guest Profiles
                        </div>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
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
                                        tick={{ fontSize: 9 }}
                                        width={60}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[0, 4, 4, 0]}
                                        isAnimationActive={false}
                                    >
                                        {data?.guestProfiles?.map(
                                            (entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.color || '#1D6360'
                                                    }
                                                />
                                            ),
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Forecast */}
                    <div className="border-2 border-gray-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LuTrendingUp className="text-brand" /> 7-Day
                            Forecast
                        </div>
                        <div className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.forecast || []}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9 }}
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

                {/* 4. F&B & Operational */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="border-2 border-gray-100 rounded-xl p-4">
                        <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LuUtensils className="text-brand" /> F&B
                            Performance
                        </div>
                        <div className="space-y-3">
                            {data?.fbOutlets?.map((outlet: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center text-[10px] pb-2 border-b last:border-0 border-gray-50"
                                >
                                    <span className="font-bold">
                                        {outlet.name
                                            ?.replace(/_/g, ' ')
                                            .trim()
                                            .replace(/\b\w/g, (c: string) =>
                                                c.toUpperCase(),
                                            ) || '—'}
                                    </span>
                                    <div className="text-right">
                                        <div className="font-black">
                                            {formatCurrency(outlet.revenue)}
                                        </div>
                                        <div className="text-gray-400">
                                            {outlet.covers} Covers
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Geographic & Nationality Profile */}
                    <div className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white">
                        <div className="text-xs font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LuGlobe className="text-brand w-3.5 h-3.5" />{' '}
                            Nationality & Geographic Profile
                        </div>
                        <div className="space-y-4">
                            {data?.geographic?.length > 0 ? (
                                data.geographic.map((item: any, i: number) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm">
                                                    {item.flag}
                                                </span>
                                                <span className="font-semibold text-gray-700">
                                                    {item.country}
                                                </span>
                                            </div>
                                            <div className="font-bold text-gray-900">
                                                {Number(
                                                    item.guests,
                                                ).toLocaleString('en-NG')}{' '}
                                                Guests ({formatNum(item.pct, 1)}
                                                %)
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand"
                                                style={{
                                                    width: `${item.pct}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-400 italic text-[10px]">
                                    No geographic data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-end text-[10px] text-gray-400">
                <div>
                    <p>
                        Generated by {user?.fullName} | Anli PMS Executive
                        Reporting
                    </p>
                    <p>
                        © {new Date().getFullYear()}{' '}
                        {user?.hotel?.name || 'Hotel Management System'}
                    </p>
                </div>
                <div className="text-right">
                    <p>Internal Use Only</p>
                    <p>Page 1 of 1</p>
                </div>
            </div>
        </div>
    );
};

export default PrintManagersFlash;
