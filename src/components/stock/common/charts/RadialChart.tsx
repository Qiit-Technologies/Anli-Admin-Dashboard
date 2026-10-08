import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import {
    Label,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from 'recharts';

export interface StockChartData {
    name: string;
    value: number;
    fill: string;
}

interface StockRadialChartProps {
    data: StockChartData[];
    centerText: string;
    receivedLabel: string;
    issuedLabel: string;
}

export function StockRadialChart({
    data,
    centerText,
    // receivedLabel = 'QUANTITY RECEIVED',
    // issuedLabel = 'QUANTITY ISSUED',
}: StockRadialChartProps) {
    const chartConfig: ChartConfig = {
        total: {
            label: centerText,
        },
        ...data.reduce((config, item) => {
            config[item.name] = {
                label: item.name,
                color: item.fill,
            };
            return config;
        }, {} as ChartConfig),
    };

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div>
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[250px] w-[250px]"
            >
                <RadialBarChart
                    data={data}
                    startAngle={0}
                    width={250}
                    height={250}
                    endAngle={250}
                    innerRadius={80}
                    outerRadius={110}
                    barSize={14}
                >
                    <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[86, 74]}
                    />
                    <RadialBar dataKey="value" background cornerRadius={10} />
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
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) - 20}
                                                className="fill-muted-foreground text-sm"
                                            >
                                                {centerText}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 10}
                                                className="fill-foreground text-4xl font-bold"
                                            >
                                                {totalValue.toLocaleString()}
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </PolarRadiusAxis>
                </RadialBarChart>
            </ChartContainer>
        </div>
    );
}
