'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Calendar } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// dummy data
const revenueData = [
    { month: 'Jan', revenue: 200 },
    { month: 'Feb', revenue: 350 },
    { month: 'Mar', revenue: 280 },
    { month: 'Apr', revenue: 420 },
    { month: 'May', revenue: 589 },
    { month: 'Jun', revenue: 320 },
    { month: 'Jul', revenue: 380 },
    { month: 'Aug', revenue: 290 },
    { month: 'Sep', revenue: 350 },
    { month: 'Oct', revenue: 400 },
    { month: 'Nov', revenue: 450 },
    { month: 'Dec', revenue: 380 },
];

const chartConfig = {
    revenue: {
        label: 'Total revenue',
        color: '#F97316',
    },
} satisfies ChartConfig;

interface RevenueReportProps {
    data?: any[];
    onDateChange?: (range: { start?: string; end?: string }) => void;
    loading?: boolean;
}

export default function RevenueReport({
    data = revenueData,
    onDateChange,
    loading = false,
}: RevenueReportProps) {
    const [date, setDate] = React.useState<DateRange | undefined>();

    const chartData = React.useMemo(() => {
        if (!data || data === revenueData) return data;
        return data.map((item) => ({
            month: item.month || item.date || '----',
            revenue: parseFloat(item.revenue) || 0,
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

    return (
        <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Revenue Report
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
                                'Select Dates'
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
                <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
            ) : (
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#F97316"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#F97316"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickMargin={10}
                        />
                        <YAxis hide />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name, item) => (
                                        <div className="flex flex-col gap-1 bg-[#1E3A5F] text-white p-3 rounded-lg min-w-[140px]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    {item.payload.month}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-orange-500 rounded-sm" />
                                                <span className="text-xs text-gray-300">
                                                    Total revenue :
                                                </span>
                                                <span className="text-sm font-medium">
                                                    ₦{value}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#F97316"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: '#F97316',
                                stroke: '#fff',
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ChartContainer>
            )}
        </div>
    );
}
