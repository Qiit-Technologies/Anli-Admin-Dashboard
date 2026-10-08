'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Calendar } from 'lucide-react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

const statusData = [
    { name: 'Cancelled', value: 3, color: '#FBBF24' },
    { name: 'Confirmed', value: 12, color: '#F97316' },
    { name: 'Rescheduled', value: 5, color: '#FED7AA' },
];

const chartConfig = {
    cancelled: {
        label: 'Cancelled',
        color: '#FBBF24',
    },
    confirmed: {
        label: 'Confirmed',
        color: '#F97316',
    },
    rescheduled: {
        label: 'Rescheduled',
        color: '#FED7AA',
    },
} satisfies ChartConfig;

const statusColors: Record<string, string> = {
    CONFIRMED: '#F97316',
    PENDING: '#FBBF24',
    CANCELLED: '#B42318',
    COMPLETED: '#02542D',
    BOOKED: '#FED7AA',
};

interface ReservationStatusProps {
    data?: any[];
    totalReservations?: number;
    onDateChange?: (range: { start?: string; end?: string }) => void;
    loading?: boolean;
}

export default function ReservationStatus({
    data = statusData,
    totalReservations,
    onDateChange,
    loading = false,
}: ReservationStatusProps) {
    const [date, setDate] = React.useState<DateRange | undefined>();

    const chartData = React.useMemo(() => {
        if (!data || data === statusData) return statusData;
        return data.map((item) => ({
            name: item.name || item.status || 'Unknown',
            value: parseInt(item.value || item.count) || 0,
            color: statusColors[item.status?.toUpperCase()] || '#94A3B8',
        }));
    }, [data]);

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

    const total =
        totalReservations ??
        chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Reservation Status
                </h3>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 text-gray-600 font-normal"
                        >
                            <Calendar size={16} />
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
                                'Today'
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={1}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {loading ? (
                <div className="h-[200px] w-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
            ) : (
                <div className="flex items-center gap-8">
                    <ChartContainer
                        config={chartConfig}
                        className="h-[200px] w-[200px]"
                    >
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (
                                            viewBox &&
                                            'cx' in viewBox &&
                                            'cy' in viewBox
                                        ) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-gray-800 text-2xl font-bold"
                                                    >
                                                        {total}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={
                                                            (viewBox.cy || 0) +
                                                            20
                                                        }
                                                        className="fill-gray-500 text-xs"
                                                    >
                                                        Total RSV
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className="flex flex-col gap-4">
                        {chartData.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-600 min-w-[90px]">
                                    {item.name}
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
