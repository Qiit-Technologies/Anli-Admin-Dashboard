'use client';

import { getMembershipBreakdownByTier } from '@/app/actions/membership';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';

interface MembershipBreakdownData {
    tierName: string;
    count: number;
}

interface ChartDataItem {
    plan: string;
    members: number;
    fill: string;
}

const planColors: Record<string, string> = {
    Black: '#1f2937',
    Platinum: '#6b7280',
    Gold: '#f59e0b',
    Silver: '#d1d5db',
    Bronze: '#cd7f32',
    Diamond: '#b9f2ff',
    // Default colors for other plans
    default: '#8b5cf6',
};

const chartConfig = {
    members: {
        label: 'Number of members',
        color: '#22c55e',
    },
} satisfies ChartConfig;

export function MembershipPlanBreakdown() {
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBreakdownData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getMembershipBreakdownByTier();

                if (response.error) {
                    setError(response.error);
                    return;
                }

                if (response.data && Array.isArray(response.data)) {
                    const formattedData: ChartDataItem[] = response.data.map(
                        (item: MembershipBreakdownData, index: number) => ({
                            plan: item.tierName,
                            members: item.count,
                            fill:
                                planColors[item.tierName] ||
                                planColors.default ||
                                `hsl(${(index * 60) % 360}, 70%, 50%)`,
                        }),
                    );
                    setChartData(formattedData);
                } else {
                    setChartData([]);
                }
            } catch (err) {
                setError('Failed to load membership breakdown data');
                console.error('Error fetching membership breakdown:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBreakdownData();
    }, []);

    const maxMembers = Math.max(...chartData.map((item) => item.members), 100);

    return (
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-md font-medium mb-2 text-[#101828]">
                Membership Breakdown (By Plan)
            </h3>
            <p className="text-sm font-normal text-gray-500 mb-4">
                This chart represents the distribution of members per plan
            </p>
            <div className="h-48">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading breakdown data...
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-sm">
                            No membership data available
                        </p>
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{
                                left: 0,
                                right: 0,
                                top: 10,
                                bottom: 10,
                            }}
                            barSize={30}
                        >
                            <XAxis
                                type="number"
                                dataKey="members"
                                hide
                                domain={[0, maxMembers]}
                            />
                            <YAxis
                                dataKey="plan"
                                type="category"
                                tickLine={false}
                                tickMargin={8}
                                axisLine={false}
                                width={60}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar dataKey="members" radius={[20, 20, 20, 20]} />
                        </BarChart>
                    </ChartContainer>
                )}
            </div>
        </div>
    );
}
