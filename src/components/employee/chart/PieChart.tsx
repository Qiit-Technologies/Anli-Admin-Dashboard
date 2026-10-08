'use client';
import { Cell, Pie, PieChart } from 'recharts';

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

type PieMetricChartProps = {
    data: Array<{
        color: string;
        title: string;
        value: number;
    }>;
};

export function PieMetricChart({ data }: PieMetricChartProps) {
    console.log(data);
    const chartData = data?.map((item) => ({
        name: item.title,
        value: item.value,
        fill: item.color,
    }));

    const chartConfig = data?.reduce(
        (acc, item) => ({
            ...acc,
            [item.title]: {
                label: item.title,
                color: item.color,
            },
        }),
        {},
    );

    return (
        <div className="relative w-full min-h-[120px] h-full flex justify-center items-center">
            <ChartContainer config={chartConfig} className="w-[120px] h-full">
                <PieChart
                    margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                    className="h-full"
                >
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
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
                    >
                        {chartData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
        </div>
    );
}
