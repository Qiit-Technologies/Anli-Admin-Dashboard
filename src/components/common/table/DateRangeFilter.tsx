import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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

export type DateRangeFilterProps = {
    onDateRangeChange: (dateRange: DateRange | undefined) => void;
    dateField?: string;
    className?: string;
    presets?: {
        label: string;
        value: string;
        range: () => DateRange;
    }[];
    placeholder?: string;
    clearable?: boolean;
};

export const DateRangeFilter = ({
    onDateRangeChange,
    className,
    placeholder = 'Select date range',
    clearable = true,
    presets = [
        {
            label: 'Today',
            value: 'today',
            range: () => {
                const today = new Date();
                return {
                    from: today,
                    to: today,
                };
            },
        },
        {
            label: 'Last 7 days',
            value: 'last7Days',
            range: () => {
                const today = new Date();
                const last7Days = new Date(today);
                last7Days.setDate(today.getDate() - 6);
                return {
                    from: last7Days,
                    to: today,
                };
            },
        },
        {
            label: 'Last 30 days',
            value: 'last30Days',
            range: () => {
                const today = new Date();
                const last30Days = new Date(today);
                last30Days.setDate(today.getDate() - 29);
                return {
                    from: last30Days,
                    to: today,
                };
            },
        },
        {
            label: 'This month',
            value: 'thisMonth',
            range: () => {
                const today = new Date();
                const firstDayOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1,
                );
                const lastDayOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0,
                );
                return {
                    from: firstDayOfMonth,
                    to: lastDayOfMonth,
                };
            },
        },
    ],
}: DateRangeFilterProps) => {
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        onDateRangeChange(date);
    }, [date, onDateRangeChange]);

    const handlePresetChange = (value: string) => {
        const preset = presets.find((preset) => preset.value === value);
        if (preset) {
            setDate(preset.range());
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setDate(undefined);
    };

    return (
        <div className={cn('grid gap-2', className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !date && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'LLL dd, y')} -{' '}
                                    {format(date.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(date.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-3 border-b">
                        <div className="space-y-2">
                            <Select onValueChange={handlePresetChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select preset" />
                                </SelectTrigger>
                                <SelectContent>
                                    {presets.map((preset) => (
                                        <SelectItem
                                            key={preset.value}
                                            value={preset.value}
                                        >
                                            {preset.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {clearable && date && (
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={handleClear}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        className="p-3"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};
