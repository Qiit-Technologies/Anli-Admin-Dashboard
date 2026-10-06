'use client';

import type { ReactNode } from 'react';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartBundleItem } from '@/lib/membership-report-bundle';
import type { ChartDatum } from '@/lib/membership-report-types';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

function ChartLegendDots({ data }: { readonly data: ChartDatum[] }) {
    if (!data.length) return null;
    return (
        <ul
            className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-3"
            aria-label="Chart legend"
        >
            {data.map((item) => (
                <li
                    key={item.name}
                    className="flex items-center gap-2 text-xs text-gray-700"
                >
                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill || '#6366f1' }}
                        aria-hidden
                    />
                    <span className="font-medium">{item.name}</span>
                    <span className="tabular-nums text-gray-500">
                        {item.value.toLocaleString()}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function ChartCard({
    chart,
    children,
    variant = 'bar',
}: {
    readonly chart: ChartBundleItem;
    readonly children: ReactNode;
    readonly variant?: 'bar' | 'pie';
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">
                {chart.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
                {chart.description}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                {chart.legendTitle} · values shown in legend below
            </p>
            <div
                className={
                    variant === 'pie' ? 'mt-3 h-[200px]' : 'mt-3 h-[180px]'
                }
            >
                {children}
            </div>
            <ChartLegendDots data={chart.data} />
        </div>
    );
}

const barChartConfig = {
    value: { label: 'Count', color: 'hsl(var(--chart-2))' },
} as const;

const pieChartConfig = {
    value: { label: 'Members', color: 'hsl(var(--chart-1))' },
} as const;

function PieChartBlock({ chart }: { readonly chart: ChartBundleItem }) {
    if (!chart.data.length) {
        return (
            <ChartCard chart={chart} variant="pie">
                <p className="flex h-full items-center justify-center text-sm text-gray-500">
                    No data for this chart
                </p>
            </ChartCard>
        );
    }
    return (
        <ChartCard chart={chart} variant="pie">
            <ChartContainer config={pieChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chart.data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={40}
                            outerRadius={68}
                            paddingAngle={2}
                        >
                            {chart.data.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend
                            verticalAlign="bottom"
                            height={28}
                            formatter={(value) => (
                                <span className="text-[10px] text-gray-600">
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </ChartCard>
    );
}

function BarChartBlock({ chart }: { readonly chart: ChartBundleItem }) {
    if (!chart.data.length) {
        return (
            <ChartCard chart={chart}>
                <p className="flex h-full items-center justify-center text-sm text-gray-500">
                    No data for this chart
                </p>
            </ChartCard>
        );
    }
    return (
        <ChartCard chart={chart}>
            <ChartContainer config={barChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chart.data}
                        layout="vertical"
                        margin={{ left: 4, right: 8, top: 4, bottom: 4 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                        />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={92}
                            tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                            {chart.data.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </ChartCard>
    );
}

const PIE_CHART_IDS = new Set(['statusMix']);

export default function MembershipReportCharts({
    charts,
}: {
    readonly charts: ChartBundleItem[];
}) {
    if (!charts.length) {
        return (
            <p className="text-sm text-gray-500">
                No charts for this report type.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {charts.map((chart) =>
                PIE_CHART_IDS.has(chart.id) ? (
                    <PieChartBlock key={chart.id} chart={chart} />
                ) : (
                    <BarChartBlock key={chart.id} chart={chart} />
                ),
            )}
        </div>
    );
}
