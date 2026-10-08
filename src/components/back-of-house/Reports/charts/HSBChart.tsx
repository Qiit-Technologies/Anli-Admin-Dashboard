'use client';

import { Area, AreaChart, CartesianGrid, Label, XAxis, YAxis } from 'recharts';

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

interface HourlySalesData {
    hour: string;
    sales: number;
}

interface HSBChartProps {
    data: HourlySalesData[];
}

const chartConfig = {
    sales: {
        label: 'Sales',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

export function HSBChart({ data }: HSBChartProps) {
    return (
        <div>
            <ChartContainer config={chartConfig}>
                <AreaChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 25,
                        right: 20,
                        top: 20,
                        bottom: 40,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="hour"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    >
                        <Label
                            value="Revenue by Hour"
                            position="bottom"
                            offset={10}
                            style={{ textAnchor: 'middle' }}
                        />
                    </XAxis>
                    <YAxis
                        domain={[0, 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    >
                        <Label
                            value="Most Active Timeframes"
                            angle={-90}
                            position="left"
                            offset={5}
                            style={{ textAnchor: 'middle' }}
                        />
                    </YAxis>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                        dataKey="sales"
                        type="natural"
                        fill="#448bfd"
                        fillOpacity={0.4}
                        stroke="#0458cd"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
}
