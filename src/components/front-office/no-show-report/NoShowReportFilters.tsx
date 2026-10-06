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
import { NoShowReportFiltersState } from './types';

interface NoShowReportFiltersProps {
    filters: NoShowReportFiltersState;
    onFiltersChange: (_next: NoShowReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    roomOptions?: { value: string; label: string }[];
    rateTypeOptions?: { value: string; label: string }[];
}

export default function NoShowReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    roomOptions = [],
    rateTypeOptions = [],
}: Readonly<NoShowReportFiltersProps>) {
    const updateFilter = <K extends keyof NoShowReportFiltersState>(
        key: K,
        value: NoShowReportFiltersState[K],
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Start Date and Time
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
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        End Date and Time
                    </span>
                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                            updateFilter('endDate', e.target.value)
                        }
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

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Reservation No
                    </span>
                    <Input
                        type="text"
                        placeholder="Enter Res No"
                        value={filters.reservationNo}
                        onChange={(e) =>
                            updateFilter('reservationNo', e.target.value)
                        }
                        className="w-[180px] bg-white border-gray-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Guest Name
                    </span>
                    <Input
                        type="text"
                        placeholder="Enter Guest Name"
                        value={filters.guestName}
                        onChange={(e) =>
                            updateFilter('guestName', e.target.value)
                        }
                        className="w-[220px] bg-white border-gray-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Room Number
                    </span>
                    <Select
                        value={filters.roomNumber}
                        onValueChange={(value) =>
                            updateFilter('roomNumber', value)
                        }
                    >
                        <SelectTrigger className="w-[200px] bg-white border-gray-200">
                            <SelectValue placeholder="Select Room Number" />
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
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Room Type
                    </span>
                    <Select
                        value={filters.roomType}
                        onValueChange={(value) =>
                            updateFilter('roomType', value)
                        }
                    >
                        <SelectTrigger className="w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="Room Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Room Types</SelectItem>
                            {rateTypeOptions.map((option) => (
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
