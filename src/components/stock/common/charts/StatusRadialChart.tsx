'use client';

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useReport } from '@/context/useReport';
import { convertColorToOpacity } from '@/lib/utils';

const chartConfig = {
    lowStock: {
        label: 'Low Stock',
        color: '#ff8629',
    },
    inStock: {
        label: 'In Stock',
        color: convertColorToOpacity('#ff8629', 0.1),
    },
} satisfies ChartConfig;

export function LowStockRadialChart() {
    const { currentStock, stockData } = useReport();

    const chartData = [
        {
            month: 'Current',
            lowStock: currentStock < stockData[1].value ? currentStock : 0,
            inStock: stockData[1].value || 0,
        },
    ];

    return (
        <div className="flex items-center justify-center h-full w-full">
            <ChartContainer
                config={chartConfig}
                className="aspect-square flex items-center justify-center w-full h-[160px] max-w-[250px]"
            >
                <RadialBarChart
                    data={chartData}
                    endAngle={180}
                    innerRadius={80}
                    outerRadius={130}
                    width={250}
                    height={250}
                    cx="50%"
                    cy={130}
                >
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <PolarRadiusAxis
                        tick={false}
                        tickLine={false}
                        axisLine={false}
                    >
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
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) - 16}
                                                className="fill-foreground text-2xl font-bold"
                                            >
                                                {chartData[0].lowStock}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 4}
                                                className="fill-muted-foreground"
                                            >
                                                Low Stock Items
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </PolarRadiusAxis>
                    <RadialBar
                        dataKey="lowStock"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-lowStock)"
                        className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                        dataKey="inStock"
                        fill="var(--color-inStock)"
                        stackId="a"
                        cornerRadius={5}
                        className="stroke-transparent stroke-2"
                    />
                </RadialBarChart>
            </ChartContainer>
        </div>
    );
}
