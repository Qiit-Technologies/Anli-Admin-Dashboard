'use client';

import { FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export interface ComplimentaryOrderFiltersState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    outlet: string;
    orderType: string;
    approvedById: string;
    cashierId: string;
    menuType: string;
    waiterId: string;
    minAmount: string;
    maxAmount: string;
}

interface SelectOption {
    value: string;
    label: string;
}

interface ComplimentaryOrderFiltersProps {
    filters: ComplimentaryOrderFiltersState;
    onFiltersChange: (filters: ComplimentaryOrderFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
    /** @deprecated Prefer role-specific option lists */
    staffOptions?: SelectOption[];
    approverOptions?: SelectOption[];
    waiterOptions?: SelectOption[];
    cashierOptions?: SelectOption[];
    outletOptions?: SelectOption[];
    menuTypeOptions?: SelectOption[];
}

const orderTypeOptions = [
    { value: 'all', label: 'All' },
    { value: 'DINE_IN', label: 'Table services' },
    { value: 'ROOM', label: 'Room services' },
    { value: 'TAKE_AWAY', label: 'Take away' },
    { value: 'FAST_FOOD', label: 'Fast food' },
    { value: 'DELIVERY', label: 'Home delivery' },
];

export default function ComplimentaryOrderFilters({
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
    staffOptions = [],
    approverOptions,
    waiterOptions,
    cashierOptions,
    outletOptions = [],
    menuTypeOptions = [],
}: ComplimentaryOrderFiltersProps) {
    const approvedByOptions = approverOptions ?? staffOptions;
    const waiterSelectOptions = waiterOptions ?? staffOptions;
    const cashierSelectOptions = cashierOptions ?? staffOptions;

    const updateFilter = (
        key: keyof ComplimentaryOrderFiltersState,
        value: string,
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* date and time pickers */}
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

            {/* select outlet, order type, approved by, cashier, menu type, waiter */}
            <div className="flex flex-wrap items-center gap-3">
                <Select
                    value={filters.outlet}
                    onValueChange={(value) => updateFilter('outlet', value)}
                >
                    <SelectTrigger className="w-[140px] bg-white border-gray-200">
                        <SelectValue placeholder="Select Outlet" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Select Outlet</SelectItem>
                        {outletOptions.map((option) => (
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
                    <SelectTrigger className="w-[130px] bg-white border-gray-200">
                        <SelectValue placeholder="Order Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Order Type</SelectItem>
                        {orderTypeOptions
                            .filter((o) => o.value !== 'all')
                            .map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.approvedById}
                    onValueChange={(value) =>
                        updateFilter('approvedById', value)
                    }
                >
                    <SelectTrigger className="w-[140px] bg-white border-gray-200">
                        <SelectValue placeholder="Approved By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Approved By</SelectItem>
                        {approvedByOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.cashierId}
                    onValueChange={(value) => updateFilter('cashierId', value)}
                >
                    <SelectTrigger className="w-[150px] bg-white border-gray-200">
                        <SelectValue placeholder="Cashier Name" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cashier Name</SelectItem>
                        {cashierSelectOptions.map((option) => (
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
                    <SelectTrigger className="w-[130px] bg-white border-gray-200">
                        <SelectValue placeholder="Menu Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Menu Type</SelectItem>
                        {menuTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.waiterId}
                    onValueChange={(value) => updateFilter('waiterId', value)}
                >
                    <SelectTrigger className="w-[140px] bg-white border-gray-200">
                        <SelectValue placeholder="Select Waiter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Select Waiter</SelectItem>
                        {waiterSelectOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* amount range to select min and max amount */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Amount Range from
                </span>
                <input
                    type="text"
                    placeholder="₦5,000"
                    value={filters.minAmount}
                    onChange={(e) => updateFilter('minAmount', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm w-[100px]"
                />
                <span className="text-sm font-medium text-gray-700">To</span>
                <input
                    type="text"
                    placeholder="₦50,000"
                    value={filters.maxAmount}
                    onChange={(e) => updateFilter('maxAmount', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm w-[100px]"
                />
            </div>

            {/* action buttons to create report, export to excel and print */}
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
