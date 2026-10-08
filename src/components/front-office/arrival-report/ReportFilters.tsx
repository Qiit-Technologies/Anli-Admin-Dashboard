'use client';

import { useState } from 'react';
import { Calendar, Clock, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrivalReportFiltersState, timeOptions } from './types';

export { type ArrivalReportFiltersState } from './types';

interface ReportFiltersProps {
    filters: ArrivalReportFiltersState;
    onFiltersChange: (filters: ArrivalReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    staffOptions?: { value: string; label: string }[];
    roomTypeOptions?: { value: string; label: string }[];
}

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
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    const updateFilter = (
        key: keyof ArrivalReportFiltersState,
        value: string | Date | undefined,
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Start Date and Time
                    </span>
                    <Popover
                        open={startDateOpen}
                        onOpenChange={setStartDateOpen}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium min-w-[140px]',
                                    !filters.startDate && 'text-gray-500',
                                )}
                            >
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {filters.startDate
                                        ? format(
                                              filters.startDate,
                                              'MMM d, yyyy',
                                          )
                                        : 'Select date'}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={filters.startDate}
                                onSelect={(date) => {
                                    updateFilter('startDate', date);
                                    setStartDateOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Select
                        value={filters.startTime}
                        onValueChange={(value) =>
                            updateFilter('startTime', value)
                        }
                    >
                        <SelectTrigger className="w-[120px] bg-white border-gray-200">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <SelectValue placeholder="Time" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        End Date and Time
                    </span>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium min-w-[140px]',
                                    !filters.endDate && 'text-gray-500',
                                )}
                            >
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {filters.endDate
                                        ? format(filters.endDate, 'MMM d, yyyy')
                                        : 'Select date'}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={filters.endDate}
                                onSelect={(date) => {
                                    updateFilter('endDate', date);
                                    setEndDateOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Select
                        value={filters.endTime}
                        onValueChange={(value) =>
                            updateFilter('endTime', value)
                        }
                    >
                        <SelectTrigger className="w-[120px] bg-white border-gray-200">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <SelectValue placeholder="Time" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <Select
                    value={filters.staff || 'all'}
                    onValueChange={(value) => updateFilter('staff', value)}
                >
                    <SelectTrigger className="w-[160px] bg-white border-gray-200">
                        <SelectValue placeholder="All Staff" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        {staffOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.roomType || 'all'}
                    onValueChange={(value) => updateFilter('roomType', value)}
                >
                    <SelectTrigger className="w-[200px] bg-white border-gray-200">
                        <SelectValue placeholder="Room Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {roomTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={onGenerateReport}
                    disabled={isLoading}
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
