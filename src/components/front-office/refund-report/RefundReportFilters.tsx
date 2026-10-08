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
import { PAYMENT_METHOD_OPTIONS, REFUND_ACCOUNT_OPTIONS } from './constants';
import { RefundGuestSearch } from './RefundGuestSearch';
import { RefundReportFiltersState } from './types';

interface RefundReportFiltersProps {
    filters: RefundReportFiltersState;
    onFiltersChange: (_next: RefundReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    staffOptions?: { value: string; label: string }[];
    refundAccountOptions?: { value: string; label: string }[];
}

export default function RefundReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    staffOptions = [],
    refundAccountOptions = REFUND_ACCOUNT_OPTIONS,
}: Readonly<RefundReportFiltersProps>) {
    const updateFilter = <K extends keyof RefundReportFiltersState>(
        key: K,
        value: RefundReportFiltersState[K],
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
                        User (Staff)
                    </span>
                    <Select
                        value={filters.user}
                        onValueChange={(value) => updateFilter('user', value)}
                    >
                        <SelectTrigger className="min-w-[180px] bg-white border-gray-200">
                            <SelectValue placeholder="All" />
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
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Payment Method
                    </span>
                    <Select
                        value={filters.paymentMethod}
                        onValueChange={(value) =>
                            updateFilter('paymentMethod', value)
                        }
                    >
                        <SelectTrigger className="min-w-[200px] bg-white border-gray-200">
                            <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_METHOD_OPTIONS.map((option) => (
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
                        Refund Account
                    </span>
                    <Select
                        value={filters.refundAccount}
                        onValueChange={(value) =>
                            updateFilter('refundAccount', value)
                        }
                    >
                        <SelectTrigger className="min-w-[200px] bg-white border-gray-200">
                            <SelectValue placeholder="Select Refund Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {refundAccountOptions.map((option) => (
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

            <div className="flex flex-col gap-3">
                <RefundGuestSearch
                    guestProfileId={filters.guestProfileId}
                    guestSearch={filters.guestSearch}
                    guestFilterLabel={filters.guestFilterLabel}
                    onFiltersChange={(next) =>
                        onFiltersChange({ ...filters, ...next })
                    }
                />

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
        </div>
    );
}
