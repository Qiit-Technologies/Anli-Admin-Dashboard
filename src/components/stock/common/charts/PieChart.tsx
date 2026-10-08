'use client';
import { Pie, PieChart } from 'recharts';

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { convertColorToOpacity } from '@/lib/utils';

type StockMetricChartProps = {
    metricName: string;
    value: number;
    total: number;
    chartColorIndex?: number;
    valueColor?: string;
};

export function StockMetricChart({
    metricName,
    value,
    total,
    valueColor = '#1A8CFF',
}: StockMetricChartProps) {
    const safeTotal = Math.max(total, value);

    const chartData = [
        {
            name: metricName,
            value: value,
            fill: valueColor,
        },
        {
            name: 'Remaining',
            value: safeTotal - value,
            fill: convertColorToOpacity(valueColor, 0.1),
        },
    ];

    const chartConfig = {
        [metricName.replace(/\s+/g, '_')]: {
            label: metricName,
            color: valueColor,
        },
        Remaining: {
            label: 'Remaining',
            color: convertColorToOpacity(valueColor, 0.1),
        },
    };

    return (
        <div className="relative w-full min-h-[120px] h-full flex justify-center items-center">
            <ChartContainer config={chartConfig} className="w-[120px] h-full">
                <PieChart
                    margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                    className="h-full"
                >
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        nameKey="name"
                        innerRadius={35}
                        outerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                    />
                </PieChart>
            </ChartContainer>
        </div>
    );
}
