'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';
import type { AdrReportFiltersState } from './types';

interface AdrReportFiltersProps {
    filters: AdrReportFiltersState;
    onFiltersChange: (next: AdrReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    hasReportData?: boolean;
    roomTypes?: { id: number; name: string }[];
    onMonthToDate?: () => void;
    liveRefreshActive?: boolean;
}

function FilterCell({
    label,
    htmlFor,
    children,
    className = '',
}: Readonly<{
    label: string;
    htmlFor?: string;
    children: ReactNode;
    className?: string;
}>) {
    return (
        <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
            <Label
                htmlFor={htmlFor}
                className="text-xs font-medium text-slate-600"
            >
                {label}
            </Label>
            {children}
        </div>
    );
}

export default function AdrReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    hasReportData = false,
    roomTypes = [],
    onMonthToDate,
    liveRefreshActive = false,
}: Readonly<AdrReportFiltersProps>) {
    const update = <K extends keyof AdrReportFiltersState>(
        key: K,
        value: AdrReportFiltersState[K],
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 text-center sm:text-left">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Report filters
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                        Set the period and scope, then generate the report.
                    </p>
                </div>

                <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                    <FilterCell label="View">
                        <Select
                            value={filters.mode}
                            onValueChange={(v) =>
                                update(
                                    'mode',
                                    v as AdrReportFiltersState['mode'],
                                )
                            }
                        >
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">
                                    Single day
                                </SelectItem>
                                <SelectItem value="range">
                                    Date range
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterCell>

                    {filters.mode === 'single' ? (
                        <FilterCell label="Report date">
                            <DatePicker
                                value={filters.singleDate}
                                onChange={(val) => update('singleDate', val)}
                                className="w-full bg-white border-slate-200"
                            />
                        </FilterCell>
                    ) : (
                        <>
                            <FilterCell label="From">
                                <DatePicker
                                    value={filters.fromDate}
                                    onChange={(val) => update('fromDate', val)}
                                    className="w-full bg-white border-slate-200"
                                />
                            </FilterCell>
                            <FilterCell label="To">
                                <DatePicker
                                    value={filters.toDate}
                                    onChange={(val) => update('toDate', val)}
                                    className="w-full bg-white border-slate-200"
                                />
                            </FilterCell>
                        </>
                    )}

                    <FilterCell label="Room type">
                        <Select
                            value={filters.roomTypeId}
                            onValueChange={(v) => update('roomTypeId', v)}
                        >
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All room types
                                </SelectItem>
                                {(roomTypes ?? []).map((rt) => (
                                    <SelectItem
                                        key={rt.id}
                                        value={String(rt.id)}
                                    >
                                        {rt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterCell>

                    <FilterCell
                        label="Booking source"
                        htmlFor="adr-booking-source"
                        className="sm:col-span-2"
                    >
                        <Input
                            id="adr-booking-source"
                            placeholder="Filter by source (optional)"
                            value={filters.bookingSource}
                            onChange={(e) =>
                                update('bookingSource', e.target.value)
                            }
                            className="w-full bg-white"
                        />
                    </FilterCell>

                    <div className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                            <input
                                id="adr-include-pending"
                                type="checkbox"
                                checked={filters.includePending}
                                onChange={(e) =>
                                    update('includePending', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            Include pending reservations
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                            <input
                                id="adr-include-noshow"
                                type="checkbox"
                                checked={filters.includeNoShows}
                                onChange={(e) =>
                                    update('includeNoShows', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            Include no-shows
                        </label>
                    </div>
                </div>

                {filters.mode === 'range' && onMonthToDate ? (
                    <div className="px-5 pb-2 flex justify-center sm:justify-start">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onMonthToDate}
                            className="text-orion-blue h-8"
                        >
                            Month to date
                        </Button>
                    </div>
                ) : null}

                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-3">
                    {liveRefreshActive ? (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                            Live refresh every 5 seconds
                        </p>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                        <Button
                            onClick={onGenerateReport}
                            disabled={isLoading}
                            className="bg-blue hover:bg-blue/90 text-white min-w-[148px]"
                        >
                            {isLoading ? 'Generating…' : 'Generate report'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onExportExcel}
                            disabled={isLoading || !hasReportData}
                            className="gap-2 min-w-[132px]"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Export Excel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onPrint}
                            disabled={isLoading || !hasReportData}
                            className="gap-2 min-w-[100px]"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
