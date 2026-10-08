'use client';

import { Pie, PieChart } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend } from '@/components/ui/chart';
import { fetchHousekeepingCleaningTaskByStaff } from '@/hooks/fetcher';
import { RefreshCw } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

interface ChartLegendContentProps {
    payload?: Array<{
        value: string;
        color: string;
    }>;
}

const ChartLegendContent: React.FC<ChartLegendContentProps> = ({ payload }) => {
    if (!payload) return null;

    return (
        <div className="flex flex-col gap-2 mt-6">
            {payload.map((entry, index) => {
                if (!entry.value) return null;
                return (
                    <div
                        key={`item-${entry.value || index}`}
                        className="flex items-center"
                    >
                        <div
                            className="w-3 h-3 mr-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.value}</span>
                    </div>
                );
            })}
        </div>
    );
};

export function CleaningStaffPieChart(): React.JSX.Element {
    const { data: chartData, error, isLoading, mutate } = useSWR(
        '/housekeeping/cleaning-task-staff',
        fetchHousekeepingCleaningTaskByStaff,
    );

    const handleRefresh = async () => {
        try {
            await mutate();
            toast.success('Staff chart refreshed.');
        } catch {
            toast.error('Could not refresh staff data.');
        }
    };

    const rows = chartData ?? [];

    return (
        <Card className="flex flex-col shadow-none border rounded-md">
            <CardHeader className="border-b py-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Cleaning Per Staff Member</CardTitle>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="Refresh chart"
                        onClick={() => void handleRefresh()}
                        disabled={isLoading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                        />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 relative pb-0 flex items-center justify-center">
                {error ? (
                    <p className="text-sm text-red-600 py-12 text-center px-4">
                        {error.message}
                    </p>
                ) : isLoading ? (
                    <p className="text-sm text-muted-foreground py-12">
                        Loading…
                    </p>
                ) : rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-12 text-center px-4">
                        No cleaning tasks assigned to staff yet.
                    </p>
                ) : (
                    <div className="flex w-full h-full items-center justify-center gap-4">
                        <ChartContainer
                            config={{
                                cleaningTasks: { label: 'Cleaning Tasks' },
                            }}
                            className="w-full h-auto min-h-[24rem]"
                        >
                            <PieChart
                                margin={{
                                    top: 0,
                                    right: 30,
                                    bottom: 0,
                                    left: 0,
                                }}
                            >
                                <Pie
                                    data={rows}
                                    dataKey="cleaningTasks"
                                    nameKey="staff"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={130}
                                />
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                    layout="vertical"
                                    verticalAlign="top"
                                    align="right"
                                    className="mr-0"
                                />
                            </PieChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default CleaningStaffPieChart;
