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
import { BanquetFilterField, BanquetReportFiltersState } from '../types';

interface BanquetReportFiltersProps {
    fields: BanquetFilterField[];
    filters: BanquetReportFiltersState;
    onFiltersChange: (filters: BanquetReportFiltersState) => void;
    onGenerateReport: () => void;
    onExportExcel: () => void;
    onPrint: () => void;
    isLoading?: boolean;
}

export default function BanquetReportFilters({
    fields,
    filters,
    onFiltersChange,
    onGenerateReport,
    onExportExcel,
    onPrint,
    isLoading = false,
}: Readonly<BanquetReportFiltersProps>) {
    const updateFilter = (key: string, value: string) => {
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

            {fields.length > 0 ? (
                <div className="border-t pt-4">
                    <h3 className="text-base font-semibold text-[#667085] mb-4">
                        Filters
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {fields.map((field) => {
                            if (field.type === 'select') {
                                return (
                                    <div
                                        key={field.key}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                                            {field.label}
                                        </span>
                                        <Select
                                            value={filters[field.key] ?? 'all'}
                                            onValueChange={(value) =>
                                                updateFilter(field.key, value)
                                            }
                                        >
                                            <SelectTrigger className="w-[170px] bg-white border-gray-200">
                                                <SelectValue
                                                    placeholder={`All ${field.label.toLowerCase()}`}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(field.options ?? []).map(
                                                    (option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={field.key}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-sm font-medium text-[#1F0702] whitespace-nowrap">
                                        {field.label}
                                    </span>
                                    <Input
                                        type={
                                            field.type === 'amountMin' ||
                                            field.type === 'amountMax'
                                                ? 'number'
                                                : 'text'
                                        }
                                        value={filters[field.key] ?? ''}
                                        placeholder={field.placeholder}
                                        onChange={(e) =>
                                            updateFilter(
                                                field.key,
                                                e.target.value,
                                            )
                                        }
                                        className="w-[170px] bg-white border-gray-200"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}

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
