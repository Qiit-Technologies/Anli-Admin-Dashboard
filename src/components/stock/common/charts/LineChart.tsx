'use client';

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { fetchUsageReport } from '@/hooks/fetcher';
import useSWR from 'swr';

const chartConfig = {
    itemsIssued: {
        label: 'ITEMS ISSUED',
        color: 'hsl(var(--chart-1))',
    },
    itemsRemaining: {
        label: 'ITEMS REMAINING',
        color: 'hsl(var(--chart-2))',
    },
    totalStockUsed: {
        label: 'TOTAL STOCK USED (%)',
        color: 'hsl(var(--chart-3))',
    },
} satisfies ChartConfig;

export function LineChartComponent() {
    const { data: chartData } = useSWR('/items/usage-report', fetchUsageReport);
    return (
        <div className="w-full h-full">
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
                <LineChart
                    data={chartData}
                    className="bg-gray-100/5"
                    margin={{
                        top: 5,
                        right: 5,
                        left: 5,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        vertical={false}
                        horizontal={true}
                        strokeDasharray="3 3"
                    />
                    <XAxis
                        dataKey="monthYear"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        fontSize={20}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        label={{
                            value: 'Active',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fontSize: 10 },
                        }}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    <Line
                        dataKey="itemsIssued"
                        type="basis"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={1.5}
                        dot={true}
                        name="ITEMS ISSUED"
                    />
                    <Line
                        dataKey="itemsRemaining"
                        type="basis"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={1.5}
                        dot={true}
                        name="ITEMS REMAINING"
                    />
                    <Line
                        dataKey="totalStockUsed"
                        type="basis"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={1.5}
                        dot={true}
                        name="TOTAL STOCK USED (%)"
                    />
                </LineChart>
            </ChartContainer>
        </div>
    );
}
