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
import {
    ChevronDown,
    ChevronRight,
    FileSpreadsheet,
    Printer,
} from 'lucide-react';
import { VoidReportFiltersState } from './types';
import { useState } from 'react';

interface VoidReportFiltersProps {
    filters: VoidReportFiltersState;
    onFiltersChange: (filters: VoidReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    roomOptions?: { value: string; label: string }[];
    rateTypeOptions?: { value: string; label: string }[];
    sourceOptions?: { value: string; label: string }[];
    staffOptions?: { value: string; label: string }[];
}

export default function VoidReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    roomOptions = [],
    rateTypeOptions = [],
    sourceOptions = [],
    staffOptions = [],
}: Readonly<VoidReportFiltersProps>) {
    const [showReservationGuestFilters, setShowReservationGuestFilters] =
        useState(false);
    const [showPaxFilters, setShowPaxFilters] = useState(false);

    const updateFilter = <K extends keyof VoidReportFiltersState>(
        key: K,
        value: VoidReportFiltersState[K],
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Arrival Date From
                    </span>
                    <Input
                        type="date"
                        value={filters.arrivalDateFrom}
                        onChange={(e) =>
                            updateFilter('arrivalDateFrom', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Arrival Date To
                    </span>
                    <Input
                        type="date"
                        value={filters.arrivalDateTo}
                        onChange={(e) =>
                            updateFilter('arrivalDateTo', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Void Date From
                    </span>
                    <Input
                        type="date"
                        value={filters.voidDateFrom}
                        onChange={(e) =>
                            updateFilter('voidDateFrom', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                        Void Date To
                    </span>
                    <Input
                        type="date"
                        value={filters.voidDateTo}
                        onChange={(e) =>
                            updateFilter('voidDateTo', e.target.value)
                        }
                        className="w-[150px] bg-white border-gray-200"
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <button
                    type="button"
                    className="mb-4 flex items-center gap-2 text-base font-semibold text-[#667085]"
                    onClick={() =>
                        setShowReservationGuestFilters(
                            !showReservationGuestFilters,
                        )
                    }
                >
                    {showReservationGuestFilters ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                    Reservation & Guest Filters
                </button>
                {showReservationGuestFilters && (
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Guest Name
                        </span>
                        <Input
                            type="text"
                            placeholder="Enter Guest Full Name"
                            value={filters.guestName}
                            onChange={(e) =>
                                updateFilter('guestName', e.target.value)
                            }
                            className="w-[180px] bg-white border-gray-200"
                        />
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
                                <SelectValue placeholder="Select Room" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Select Room</SelectItem>
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
                </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Rate Type
                        </span>
                        <Select
                            value={filters.rateType}
                            onValueChange={(value) =>
                                updateFilter('rateType', value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="Select Rate Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Select Rate Type
                                </SelectItem>
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
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="Walk-in Guest" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
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
                </div>
            </div>

            <div className="border-t pt-4">
                <button
                    type="button"
                    className="mb-4 flex items-center gap-2 text-base font-semibold text-[#667085]"
                    onClick={() => setShowPaxFilters(!showPaxFilters)}
                >
                    {showPaxFilters ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                    Pax Filters
                </button>
                {showPaxFilters && (
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Pax From
                        </span>
                        <Select
                            value={filters.paxFrom}
                            onValueChange={(value) =>
                                updateFilter('paxFrom', value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="Pax From" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {Array.from(
                                    { length: 20 },
                                    (_, i) => i + 1,
                                ).map((n) => (
                                    <SelectItem key={n} value={n.toString()}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Pax Type
                        </span>
                        <Input
                            type="text"
                            placeholder="Enter Pay Type"
                            value={filters.paxType}
                            onChange={(e) =>
                                updateFilter('paxType', e.target.value)
                            }
                            className="w-[150px] bg-white border-gray-200"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            Pax To
                        </span>
                        <Input
                            type="text"
                            placeholder="Enter Pay to"
                            value={filters.paxTo}
                            onChange={(e) =>
                                updateFilter('paxTo', e.target.value)
                            }
                            className="w-[150px] bg-white border-gray-200"
                        />
                    </div>
                </div>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                            User (Staff)
                        </span>
                        <Select
                            value={filters.staff}
                            onValueChange={(value) =>
                                updateFilter('staff', value)
                            }
                        >
                            <SelectTrigger className="w-[150px] bg-white border-gray-200">
                                <SelectValue placeholder="Select Staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Select Staff
                                </SelectItem>
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
                            Void Reason
                        </span>
                        <Input
                            type="text"
                            placeholder="Enter Void Reason"
                            value={filters.voidReason}
                            onChange={(e) =>
                                updateFilter('voidReason', e.target.value)
                            }
                            className="w-[200px] bg-white border-gray-200"
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
