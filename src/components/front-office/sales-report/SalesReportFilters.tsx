'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, Filter, Printer } from 'lucide-react';
import { SalesReportFiltersState, SalesReportStatusFilter } from './types';

interface SalesReportFiltersProps {
    filters: SalesReportFiltersState;
    onFiltersChange: (filters: SalesReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    roomOptions?: { value: string; label: string }[];
    roomTypeOptions?: { value: string; label: string }[];
    staffOptions?: { value: string; label: string }[];
    sourceOptions?: { value: string; label: string }[];
}

export default function SalesReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    roomOptions = [],
    roomTypeOptions = [],
    staffOptions = [],
    sourceOptions = [],
}: Readonly<SalesReportFiltersProps>) {
    const updateFilter = <K extends keyof SalesReportFiltersState>(
        key: K,
        value: SalesReportFiltersState[K],
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Start date
                    </span>
                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                            updateFilter('startDate', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
                    />
                    <Input
                        type="time"
                        value={filters.startTime}
                        onChange={(e) =>
                            updateFilter('startTime', e.target.value)
                        }
                        className="w-[120px] bg-white border-gray-200"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        End date
                    </span>
                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => updateFilter('endDate', e.target.value)}
                        className="w-[150px] bg-white border-gray-200"
                    />
                    <Input
                        type="time"
                        value={filters.endTime}
                        onChange={(e) =>
                            updateFilter('endTime', e.target.value)
                        }
                        className="w-[120px] bg-white border-gray-200"
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-base font-semibold text-[#667085] mb-4">
                    Filters
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Room type
                        </span>
                        <Select
                            value={filters.rateType}
                            onValueChange={(value) =>
                                updateFilter('rateType', value)
                            }
                        >
                            <SelectTrigger className="w-[170px] bg-white border-gray-200">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Room num
                        </span>
                        <Select
                            value={filters.room}
                            onValueChange={(value) =>
                                updateFilter('room', value)
                            }
                        >
                            <SelectTrigger className="w-[170px] bg-white border-gray-200">
                                <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All rooms</SelectItem>
                                {roomOptions.map((option) => (
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
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            User (staff)
                        </span>
                        <Select
                            value={filters.user}
                            onValueChange={(value) =>
                                updateFilter('user', value)
                            }
                        >
                            <SelectTrigger className="w-[170px] bg-white border-gray-200">
                                <SelectValue placeholder="All users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
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
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Source
                        </span>
                        <Select
                            value={filters.source}
                            onValueChange={(value) =>
                                updateFilter('source', value)
                            }
                        >
                            <SelectTrigger className="w-[170px] bg-white border-gray-200">
                                <SelectValue placeholder="All sources" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {sourceOptions.map((option) => (
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
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Status
                        </span>
                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                updateFilter(
                                    'status',
                                    value as SalesReportStatusFilter,
                                )
                            }
                        >
                            <SelectTrigger className="w-[170px] bg-white border-gray-200">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="inhouse">In-House</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                                <SelectItem value="checked-out">
                                    Checked-Out
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
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
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        updateFilter('inHouseOnly', !filters.inHouseOnly)
                    }
                    className={`flex items-center gap-2 ${
                        filters.inHouseOnly
                            ? 'border-blue text-blue bg-blue/5'
                            : ''
                    }`}
                >
                    <Filter className="h-4 w-4" />
                    Filter by In-House
                </Button>
            </div>
        </div>
    );
}
