import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
    dateRange: { from: Date | undefined; to: Date | undefined };
    onDateRangeChange: (range: {
        from: Date | undefined;
        to: Date | undefined;
    }) => void;
    label?: string;
}

const DateRangePicker = ({
    dateRange,
    onDateRangeChange,
    label = 'Date Range',
}: DateRangePickerProps) => {
    return (
        <div className="flex items-center space-x-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-[280px] justify-start text-left font-normal',
                            !dateRange.from && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                                    {format(dateRange.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(dateRange.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>{label}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range) =>
                            onDateRangeChange({
                                from: range?.from,
                                to: range?.to,
                            })
                        }
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            {(dateRange.from || dateRange.to) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                        onDateRangeChange({ from: undefined, to: undefined })
                    }
                >
                    Clear
                </Button>
            )}
        </div>
    );
};

export default DateRangePicker;
