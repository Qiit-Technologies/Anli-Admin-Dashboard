'use client';

import { FileSpreadsheet, Printer, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CashierSalesFiltersState } from './types';

const checkboxOptions = [
    { key: 'showVoidedReceipts' as const, label: 'Voided Receipts' },
    { key: 'showDetailedReceiptList' as const, label: 'Detailed Receipt List' },
    { key: 'showMenuItemBreakdown' as const, label: 'Menu Item Breakdown' },
];

interface ReportFiltersProps {
    filters: CashierSalesFiltersState;
    onFiltersChange: (filters: CashierSalesFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    onPrintThermal?: () => void;
    isPrintingThermal?: boolean;
    hasReportData?: boolean;
    isLoading?: boolean;
    outletOptions?: { value: string; label: string }[];
    cashierOptions?: { value: string; label: string }[];
    orderTypeOptions?: { value: string; label: string }[];
    menuTypeOptions?: { value: string; label: string }[];
}

export default function ReportFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    onPrintThermal,
    isPrintingThermal = false,
    hasReportData = false,
    isLoading = false,
    outletOptions = [],
    cashierOptions = [],
    orderTypeOptions = [],
    menuTypeOptions = [],
}: ReportFiltersProps) {
    const updateFilter = <K extends keyof CashierSalesFiltersState>(
        key: K,
        value: CashierSalesFiltersState[K],
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const toggleCheckbox = (key: keyof CashierSalesFiltersState) => {
        onFiltersChange({
            ...filters,
            [key]: !filters[key as keyof CashierSalesFiltersState],
        });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
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
                <Select
                    value={filters.outlet}
                    onValueChange={(value) => updateFilter('outlet', value)}
                >
                    <SelectTrigger className="w-[150px] bg-white border-gray-200">
                        <SelectValue placeholder="Select Dine Area" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Select Dine Area</SelectItem>
                        {outletOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.cashier}
                    onValueChange={(value) => updateFilter('cashier', value)}
                >
                    <SelectTrigger className="w-[160px] bg-white border-gray-200">
                        <SelectValue placeholder="Select Cashier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Select Cashier</SelectItem>
                        {cashierOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.orderType}
                    onValueChange={(value) => updateFilter('orderType', value)}
                >
                    <SelectTrigger className="w-[150px] bg-white border-gray-200">
                        <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {orderTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.menuType}
                    onValueChange={(value) => updateFilter('menuType', value)}
                >
                    <SelectTrigger className="w-[140px] bg-white border-gray-200">
                        <SelectValue placeholder="Menu Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {menuTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-[#ECECF080] rounded-[10px] p-3">
                {checkboxOptions.map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => toggleCheckbox(option.key)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                    >
                        <span
                            className={cn(
                                'flex items-center justify-center w-6 h-6 rounded-md border-2 transition-colors',
                                filters[option.key]
                                    ? 'bg-blue border-blue'
                                    : 'bg-white border-gray-300',
                            )}
                        >
                            {filters[option.key] && (
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

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    onClick={onGenerateReport}
                    disabled={
                        isLoading ||
                        !filters.cashier ||
                        filters.cashier === 'all'
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
                    <UploadCloud className="h-4 w-4" />
                    Print
                </Button>
                {onPrintThermal && (
                    <Button
                        variant="outline"
                        onClick={onPrintThermal}
                        disabled={
                            isLoading ||
                            isPrintingThermal ||
                            !hasReportData
                        }
                        className="flex items-center gap-2 border-orion-blue text-orion-blue"
                    >
                        <Printer className="h-4 w-4" />
                        {isPrintingThermal ? 'Sending…' : 'Print to thermal'}
                    </Button>
                )}
            </div>
        </div>
    );
}
