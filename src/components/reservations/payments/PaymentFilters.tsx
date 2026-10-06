import React from 'react';
import { Calendar as CalendarIcon, ListFilter } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface PaymentFiltersProps {
    onSearchChange?: (value: string) => void;
    onStatusChange?: (value: string) => void;
    onDateChange?: (range: { start?: string; end?: string }) => void;
}

export default function PaymentFilters({
    onSearchChange,
    onStatusChange,
    onDateChange,
}: PaymentFiltersProps) {
    const [date, setDate] = React.useState<DateRange | undefined>();

    const handleDateSelect = (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from && range?.to) {
            onDateChange?.({
                start: format(range.from, 'yyyy-MM-dd'),
                end: format(range.to, 'yyyy-MM-dd'),
            });
        } else if (!range) {
            onDateChange?.({ start: undefined, end: undefined });
        }
    };

    return (
        <div className="flex items-center justify-between">
            <SearchInput
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onSearchChange?.(e.target.value)
                }
            />

            <div className="flex item-center gap-3">
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors">
                            <CalendarIcon
                                size={16}
                                className="text-[#344054]"
                            />
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
                                'Select Dates'
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                <Select onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[180px] h-10 bg-white">
                        <div className="flex items-center gap-2">
                            <ListFilter size={16} className="text-[#344054]" />
                            <SelectValue placeholder="All Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
