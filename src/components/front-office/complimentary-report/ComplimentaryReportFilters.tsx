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
import { FileSpreadsheet, Printer } from 'lucide-react';
import { ComplimentaryReportFiltersState } from './types';

interface ComplimentaryReportFiltersProps {
    filters: ComplimentaryReportFiltersState;
    onFiltersChange: (filters: ComplimentaryReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    roomOptions?: { value: string; label: string }[];
    roomTypeOptions?: { value: string; label: string }[];
    staffOptions?: { value: string; label: string }[];
}

export default function ComplimentaryReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    roomOptions = [],
    roomTypeOptions = [],
    staffOptions = [],
}: Readonly<ComplimentaryReportFiltersProps>) {
    const updateFilter = <K extends keyof ComplimentaryReportFiltersState>(
        key: K,
        value: ComplimentaryReportFiltersState[K],
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Date From
                    </span>
                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                            updateFilter('startDate', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Date To
                    </span>
                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                            updateFilter('endDate', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
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
                            Status
                        </span>
                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                updateFilter(
                                    'status',
                                    value as ComplimentaryReportFiltersState['status'],
                                )
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="inhouse">In-House</SelectItem>
                                <SelectItem value="reserved">Reserved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            User
                        </span>
                        <Select
                            value={filters.user}
                            onValueChange={(value) =>
                                updateFilter('user', value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
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
                            Room
                        </span>
                        <Select
                            value={filters.room}
                            onValueChange={(value) =>
                                updateFilter('room', value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="All Rooms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Rooms</SelectItem>
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
                            Room Type
                        </span>
                        <Select
                            value={filters.rateType}
                            onValueChange={(value) =>
                                updateFilter('rateType', value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="All Room Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Room Types
                                </SelectItem>
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
                            Reservation No
                        </span>
                        <Input
                            type="text"
                            placeholder="Search reservation"
                            value={filters.reservationNo}
                            onChange={(e) =>
                                updateFilter('reservationNo', e.target.value)
                            }
                            className="w-[180px] bg-white border-gray-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Guest Name
                        </span>
                        <Input
                            type="text"
                            placeholder="Full name"
                            value={filters.guestName}
                            onChange={(e) =>
                                updateFilter('guestName', e.target.value)
                            }
                            className="w-[150px] bg-white border-gray-200"
                        />
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
            </div>
        </div>
    );
}
