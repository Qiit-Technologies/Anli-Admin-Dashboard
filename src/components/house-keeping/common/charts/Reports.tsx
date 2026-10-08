import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { fetchHousekeepingReports } from '@/hooks/fetcher';
import { ArrowDown, ArrowUp, EllipsisVertical } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    YAxis,
} from 'recharts';
import useSWR from 'swr';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload) {
        const currentValue = payload[0].value;
        const previousValue = payload[0].payload.previousValue || 0;
        const percentChange = previousValue
            ? (((currentValue - previousValue) / previousValue) * 100).toFixed(
                  1,
              )
            : '0';
        const isPositive = currentValue >= previousValue;

        return (
            <div className="bg-white p-2 border rounded shadow-md text-sm">
                <p className="font-medium">{label}</p>
                <p>Current: {currentValue}</p>
                <p>Previous: {previousValue}</p>
                <p className={isPositive ? 'text-green-600' : 'text-red-600'}>
                    Change: {isPositive ? '+' : ''}
                    {percentChange}%
                </p>
            </div>
        );
    }
    return null;
};

interface CardProps {
    title: string;
    showFullChart?: boolean;
}

export function AreaChartComponent({
    title,
    showFullChart = false,
}: Readonly<CardProps>) {
    const { data: chartDataMap } = useSWR(
        '/housekeeping/reports',
        fetchHousekeepingReports,
    );
    console.log(chartDataMap);
    const chartData =
        chartDataMap?.[title] ?? chartDataMap?.['Staff Performance'] ?? [];
    const currentMonth = chartData[chartData?.length - 1]?.value ?? 0;
    const lastMonth = chartData[chartData?.length - 2]?.value ?? 0;

    console.log(currentMonth, lastMonth);
    const changePercentage = lastMonth
        ? (((currentMonth - lastMonth) / lastMonth) * 100).toFixed(1)
        : '0.0';

    const isPositive = currentMonth >= lastMonth;

    const gradientId = `color-${title.replace(/\s+/g, '-').toLowerCase()}`;

    const values = chartData?.map((item: any) => item.value);
    const maxValue = Math.max(...values) * 1.1;
    const minValue = Math.min(...values) * 0.9;

    return (
        <Card className="shadow-none border rounded-md">
            <CardHeader className="w-full py-3 px-3">
                <div className="flex items-center w-full">
                    <CardTitle>{title}</CardTitle>
                    <button className="ml-auto text-muted-foreground">
                        <EllipsisVertical />
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-3 py-3">
                <div className="flex">
                    <div className="h-14 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 0,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id={gradientId}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        {isPositive ? (
                                            <>
                                                <stop
                                                    offset="5%"
                                                    stopColor="rgba(72, 187, 120, 0.8)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="rgba(72, 187, 120, 0.1)"
                                                    stopOpacity={0.1}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <stop
                                                    offset="5%"
                                                    stopColor="rgba(245, 101, 101, 0.8)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="rgba(245, 101, 101, 0.1)"
                                                    stopOpacity={0.1}
                                                />
                                            </>
                                        )}
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    opacity={0.2}
                                />
                                {showFullChart && (
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        domain={[minValue, maxValue]}
                                    />
                                )}

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={
                                        isPositive
                                            ? 'rgb(72, 187, 120)'
                                            : 'rgb(245, 101, 101)'
                                    }
                                    fillOpacity={1}
                                    fill={`url(#${gradientId})`}
                                    strokeWidth={2}
                                />

                                {/* Custom tooltip */}
                                <CustomTooltip content={<CustomTooltip />} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex gap-2 items-center">
                        <div
                            className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'} font-medium`}
                        >
                            {isPositive ? (
                                <ArrowUp size={16} />
                            ) : (
                                <ArrowDown size={16} />
                            )}
                            <span>
                                {isPositive ? '+' : ''}
                                {changePercentage}%
                            </span>
                        </div>
                        <div className="text-sm text-center text-muted-foreground leading-4 flex items-center gap-1">
                            vs last month
                        </div>
                    </div>
                </div>
            </CardContent>

            {showFullChart && (
                <CardFooter className="border-t px-6 py-3">
                    <div className="text-sm text-muted-foreground">
                        {title === 'Staff Performance' &&
                            'Average staff rating out of 500 points'}
                        {title === 'Lost and Found' &&
                            'Number of items reported lost per month'}
                        {title === 'Guest Requests' &&
                            'Total service requests submitted by guests'}
                        {title === 'Maintenance' &&
                            'Number of maintenance tickets filed'}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
