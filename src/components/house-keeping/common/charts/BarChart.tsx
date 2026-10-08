'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { fetchHousekeepingCleaningTrends } from '@/hooks/fetcher';
import { useCallback, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import useSWR from 'swr';

const chartConfig = {
    desktop: {
        label: 'Cleaning tasks',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

const timeStampOptions = [
    '12 months',
    '3 months',
    '30 days',
    '7 days',
    '24 hours',
] as const;

type TrendPoint = { label: string; desktop: number };

export function BarChartComponent() {
    const [selectedRange, setSelectedRange] =
        useState<(typeof timeStampOptions)[number]>('12 months');
    const swrKey = `/housekeeping/cleaning-trends?range=${encodeURIComponent(selectedRange)}`;
    const { data: chartData, error, isLoading } = useSWR<TrendPoint[]>(
        swrKey,
        () => fetchHousekeepingCleaningTrends(selectedRange),
    );

    const getTickFormatter = (value: string) => {
        if (selectedRange === '24 hours') {
            return value.slice(0, 5);
        }
        if (selectedRange === '7 days' || selectedRange === '30 days') {
            return value.slice(0, 6);
        }
        return value.slice(0, 6);
    };

    const getBarSize = () => {
        if (selectedRange === '24 hours') return 12;
        if (selectedRange === '7 days' || selectedRange === '30 days')
            return 20;
        return 35;
    };

    const handleGenerateReport = useCallback(() => {
        const rows = chartData ?? [];
        if (rows.length === 0) {
            toast.error('No cleaning trend data for this period.');
            return;
        }
        const header = 'Period,Cleaning tasks';
        const body = rows
            .map((r) => `"${r.label.replace(/"/g, '""')}",${r.desktop}`)
            .join('\n');
        const blob = new Blob([`${header}\n${body}`], {
            type: 'text/csv;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cleaning-trends-${selectedRange.replace(/\s+/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Cleaning trends report downloaded.');
    }, [chartData, selectedRange]);

    return (
        <Card
            id="cleaning-trends"
            className="shadow-none border rounded-md scroll-mt-24"
        >
            <CardHeader className="border-b py-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle>Cleaning Trends</CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateReport}
                        disabled={isLoading || !chartData?.length}
                    >
                        Generate Report
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="my-4 flex items-center gap-2 flex-wrap">
                    {timeStampOptions.map((item) => (
                        <Button
                            key={item}
                            type="button"
                            size="sm"
                            variant={
                                selectedRange === item ? 'default' : 'ghost'
                            }
                            onClick={() => setSelectedRange(item)}
                        >
                            {item}
                        </Button>
                    ))}
                </div>
                {error ? (
                    <p className="text-sm text-red-600 py-8 text-center">
                        {error.message}
                    </p>
                ) : isLoading ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                        Loading trends…
                    </p>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData ?? []}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    left: 10,
                                    bottom: 70,
                                }}
                            >
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                    tickFormatter={getTickFormatter}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fontSize: 12 }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent hideLabel />
                                    }
                                />
                                <Bar
                                    dataKey="desktop"
                                    fill="hsl(var(--brand-opaque))"
                                    radius={[4, 4, 0, 0]}
                                    barSize={getBarSize()}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
