'use client';

import { LucideIcon, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

export type BarItem = {
    name: string;
    value: number;
};

interface DynamicBarChartProps {
    title: string;
    DataIcon?: LucideIcon;
    subtitle?: string;
    data: BarItem[];
    valueLabel?: string;
    trendPercentage?: number;
    footer?: boolean;
    footerText?: string;
}

export function CustomHxBarChart({
    title = 'Sales Distribution',
    DataIcon,
    subtitle = 'Current Period',
    data = [
        { name: 'John', value: 1250 },
        { name: 'Sarah', value: 1800 },
        { name: 'Michael', value: 950 },
        { name: 'Emma', value: 1500 },
        { name: 'David', value: 1100 },
    ],
    valueLabel = 'Sales',
    trendPercentage = 5.2,
    footer = false,
    footerText = 'Showing total sales distribution',
}: DynamicBarChartProps) {
    const generateColors = (items: BarItem[]) => {
        const colors: Record<string, string> = {};

        const hexColors = [
            '#FF6B6B',
            '#4ECDC4',
            '#FFD166',
            '#06D6A0',
            '#118AB2',
            '#073B4C',
            '#8338EC',
            '#3A86FF',
            '#FB5607',
            '#FFBE0B',
        ];

        items.forEach((item, index) => {
            colors[item.name] = hexColors[index % hexColors.length];
        });

        return colors;
    };

    const chartData = data.map((item) => ({
        name: item.name,
        value: item.value,
    }));

    const barColors = generateColors(data);
    const chartConfig = {
        value: {
            label: valueLabel,
            color: 'hsl(var(--chart-1))',
        },
        label: {
            color: 'hsl(var(--background))',
        },
        ...Object.fromEntries(
            data.map((item) => [
                item.name,
                {
                    label: item.name,
                    color: barColors[item.name],
                },
            ]),
        ),
    };

    return (
        <Card className="shadow-none">
            <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                    {DataIcon && <DataIcon className="w-5 h-5" />}
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="sr-only">
                        {subtitle}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[200px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 0,
                            left: 0,
                            top: 10,
                            bottom: 0,
                        }}
                        barGap={20}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <XAxis
                            dataKey="value"
                            type="number"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="value"
                            layout="vertical"
                            radius={0}
                            fill="var(--color-value)"
                            isAnimationActive={true}
                            barSize={20}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={barColors[entry.name]}
                                />
                            ))}
                            {/* <LabelList
                                dataKey="name"
                                position="insideLeft"
                                offset={8}
                                className="fill-[--color-label]"
                                fontSize={12}
                            /> */}
                            {/* <LabelList
                                dataKey="value"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) =>
                                    value.toLocaleString()
                                }
                            /> */}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {footer && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    {trendPercentage && (
                        <div className="flex gap-2 font-medium leading-none">
                            Trending {trendPercentage > 0 ? 'up' : 'down'} by{' '}
                            {Math.abs(trendPercentage)}% this period{' '}
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    )}
                    <div className="leading-none text-muted-foreground">
                        {footerText}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
