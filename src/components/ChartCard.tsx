import { CategoryType } from '@/app/dashboard/components/FrontOffice/dashboard/Metrics.types';
import type { ButtonProps, CardProps } from '@heroui/react';
import { Card, cn } from '@heroui/react';
import React from 'react';
import {
    Cell,
    Label,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

type ChartData = {
    name: string;
    [key: string]: string | number;
};
type CircleChartProps = {
    title: string;
    total: number;
    color: ButtonProps['color'];
    categories: CategoryType[];
    chartData: ChartData[];
};

const formatTotal = (total: number) => {
    return total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total;
};

export const ChartCard = React.forwardRef<
    HTMLDivElement,
    Omit<CardProps, 'children'> & CircleChartProps
>(
    (
        { className, title, total, categories, color, chartData, ...props },
        ref,
    ) => {
        // Hero UI styling pattern is a bit different from nextui,
        // so for now, we'll just use the colorMap to map the colors
        const colorMap: Record<string, number> = {
            primary: 1,
            success: 2,
            warning: 3,
            danger: 4,
            secondary: 5,
            default: 1,
        };

        return (
            <Card
                ref={ref}
                className={cn(
                    'min-w-[265px] h-[150px] border border-transparent dark:border-default-100',
                    className,
                )}
                {...props}
            >
                <div className="flex flex-col gap-y-2 p-4 pb-2 border-b">
                    <div className="flex items-center justify-between gap-x-2">
                        <dt>
                            <h3 className="text-medium font-semibold">
                                {title}
                            </h3>
                        </dt>
                    </div>
                </div>
                <div className="flex h-full flex-wrap items-center justify-center gap-x-2 lg:flex-nowrap">
                    <ResponsiveContainer
                        className="[&_.recharts-surface]:outline-none"
                        height="100%"
                        width="100%"
                    >
                        <PieChart
                            accessibilityLayer
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                            <Tooltip
                                content={({ label, payload }) => (
                                    <div className="flex h-8 min-w-[120px] items-center gap-x-2 rounded-medium bg-background px-1 text-tiny shadow-small">
                                        <span className="font-medium text-foreground">
                                            {label}
                                        </span>
                                        {payload?.map((p, index) => {
                                            const name = p.name;
                                            const value = p.value;
                                            const category = categories.find(
                                                (c) => c?.name === name,
                                            );
                                            return (
                                                <div
                                                    key={`${index}-${name}`}
                                                    className="flex w-full items-center gap-x-2"
                                                >
                                                    <div
                                                        className="h-2 w-2 flex-none rounded-full"
                                                        style={{
                                                            backgroundColor: `hsl(var(--chart-${colorMap[color ?? 0]}))`,
                                                        }}
                                                    />
                                                    <div className="flex w-full items-center justify-between gap-x-2 pr-1 text-xs text-default-700">
                                                        <span className="text-default-500">
                                                            {category?.name}
                                                        </span>
                                                        <span className="font-mono font-medium text-default-700">
                                                            {formatTotal(
                                                                value as number,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                cursor={false}
                            />
                            <Pie
                                animationDuration={1000}
                                animationEasing="ease"
                                data={chartData}
                                dataKey="value"
                                innerRadius="60%"
                                nameKey="name"
                                textAnchor="middle"
                                startAngle={90}
                                endAngle={-270}
                                strokeWidth={0}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (!viewBox) return null;
                                        const { cx, cy } = viewBox as {
                                            cx: number;
                                            cy: number;
                                        };
                                        return (
                                            <text
                                                x={cx}
                                                y={cy}
                                                fill="black"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fontSize={20}
                                                fontWeight="bold"
                                            >
                                                {total}
                                            </text>
                                        );
                                    }}
                                    position="center"
                                />
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`hsl(var(--chart-${colorMap[color ?? 0]}))`}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="flex w-full flex-col justify-center gap-4 p-4 text-tiny text-default-500 lg:p-0">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: `hsl(var(--chart-${colorMap[color ?? 0]}))`,
                                    }}
                                />
                                <span className="first-letter:capitalize">
                                    {category.name} (
                                    {formatTotal(category.value)})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    },
);

ChartCard.displayName = 'CircleChartCard';
