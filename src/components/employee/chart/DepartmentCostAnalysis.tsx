'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { getDepartments } from '@/app/actions/department';
import { getDepartmentCostAnalysis } from '@/app/actions/employee';

interface Department {
    id: number;
    name: string;
}

export default function DepartmentCostAnalysis() {
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

    // ✅ Get department list
    const { data: departments } = useSWR<Department[]>(
        '/departments',
        getDepartments,
    );

    // ✅ Get cost data based on selected department
    const { data: costData, isLoading: isCostLoading } = useSWR(
        selectedDeptId
            ? `/employees/${selectedDeptId}/department-cost-analysis`
            : null,
        () => getDepartmentCostAnalysis(selectedDeptId),
    );

    const selectedDeptName = departments?.find(
        (dept) => dept.id === selectedDeptId,
    )?.name;

    const chartConfig = {
        cost: {
            label: 'Department Cost',
            color: '#f97316',
        },
    };

    return (
        <Card className="w-full shadow-none">
            <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-semibold mb-2">
                            Department Cost Analysis
                        </CardTitle>
                        <p className="text-gray-600 text-sm">
                            Keep track of department payroll cost growth over
                            time.
                        </p>
                    </div>
                    <Select
                        onValueChange={(val) => setSelectedDeptId(Number(val))}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments?.map((dept) => (
                                <SelectItem
                                    key={dept.id}
                                    value={dept.id.toString()}
                                >
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {isCostLoading ? (
                    <div className="text-center text-sm text-gray-500">
                        Loading chart...
                    </div>
                ) : (
                    <div className="relative">
                        <ChartContainer
                            config={chartConfig}
                            className="h-[300px] w-full"
                        >
                            <LineChart
                                data={costData?.data ?? []}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis hide />
                                <ReferenceLine
                                    x="May"
                                    stroke="#d1d5db"
                                    strokeDasharray="4 4"
                                />
                                <ChartTooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload?.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
                                                    <div className="text-sm font-medium mb-1">
                                                        {label} 2025
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                                        <span className="text-green-400 font-medium">
                                                            {data.growth}%
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    '#f97316',
                                                            }}
                                                        ></div>
                                                        <span className="text-sm">
                                                            {selectedDeptName}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cost"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{
                                        r: 6,
                                        fill: '#f97316',
                                        stroke: '#fff',
                                        strokeWidth: 2,
                                    }}
                                />
                            </LineChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
