'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar, FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';

export interface ReportFiltersState {
    businessDate: Date | undefined;
    staffOnShift: string;
    roomType: string;
    reportTypes: string[];
}

interface ReportFiltersProps {
    filters: ReportFiltersState;
    onFiltersChange: (filters: ReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    staffOptions?: { value: string; label: string }[];
    roomTypeOptions?: { value: string; label: string }[];
}

const reportTypeOptions = [
    { value: 'occupancy', label: 'Occupancy' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'pos', label: 'POS' },
    { value: 'payments', label: 'Payments' },
    { value: 'sales_service', label: 'Sales & Service' },
    { value: 'revenue_summary', label: 'Revenue Summary' },
];

export default function ReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    staffOptions = [],
    roomTypeOptions = [],
}: ReportFiltersProps) {
    const [dateOpen, setDateOpen] = useState(false);

    const toggleReportType = (value: string) => {
        const newReportTypes = filters.reportTypes.includes(value)
            ? filters.reportTypes.filter((v) => v !== value)
            : [...filters.reportTypes, value];
        onFiltersChange({ ...filters, reportTypes: newReportTypes });
    };

    const updateFilter = (
        key: keyof ReportFiltersState,
        value: string | Date | undefined,
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Business Date
                    </span>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium min-w-[140px]',
                                    !filters.businessDate && 'text-gray-500',
                                )}
                            >
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {filters.businessDate
                                        ? format(
                                              filters.businessDate,
                                              'MMM d, yyyy',
                                          )
                                        : 'Select date'}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={filters.businessDate}
                                onSelect={(date) => {
                                    updateFilter('businessDate', date);
                                    setDateOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Staff on shift
                    </span>
                    <Select
                        value={filters.staffOnShift || 'all'}
                        onValueChange={(value) =>
                            updateFilter('staffOnShift', value)
                        }
                    >
                        <SelectTrigger className="w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="All Staff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Staff</SelectItem>
                            {staffOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={filters.roomType}
                        onValueChange={(value) =>
                            updateFilter('roomType', value)
                        }
                    >
                        <SelectTrigger className="w-[140px] bg-white border-gray-200">
                            <SelectValue placeholder="Room Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {roomTypeOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Report Type Checkboxes */}
            <div className="flex flex-wrap items-center gap-3 bg-[#ECECF080] rounded-[10px] p-3">
                {reportTypeOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleReportType(option.value)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                    >
                        <span
                            className={cn(
                                'flex items-center justify-center w-6 h-6 rounded-md border-2 transition-colors',
                                filters.reportTypes.includes(option.value)
                                    ? 'bg-blue border-blue'
                                    : 'bg-white border-gray-300',
                            )}
                        >
                            {filters.reportTypes.includes(option.value) && (
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                >
                                    <path
                                        d="M2.5 6L5 8.5L9.5 3.5"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </span>
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Row 3: Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={onGenerateReport}
                    disabled={
                        isLoading ||
                        !filters.staffOnShift ||
                        filters.staffOnShift === 'all'
                    }
                    className="bg-blue hover:bg-blue/90 text-white px-6"
                >
                    {isLoading ? 'Generating...' : 'Generate report'}
                </Button>
                <Button
                    variant="outline"
                    onClick={onExportExcel}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                </Button>
                <Button
                    variant="outline"
                    onClick={onPrint}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    <Printer className="h-4 w-4" />
                    Print
                </Button>
            </div>
        </div>
    );
}
