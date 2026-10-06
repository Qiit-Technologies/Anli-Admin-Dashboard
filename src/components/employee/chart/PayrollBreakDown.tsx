'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Calendar, TrendingDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { getPayrollBreakdown } from '@/app/actions/employee';
import { formatCurrency } from '@/lib/utils';

export default function PayrollBreakDownChart() {
    const { data: payrollData } = useSWR(
        `/employees/payroll-breakdown`,
        getPayrollBreakdown,
    );

    const payrollConfig = {
        salaries: { label: 'Salaries', color: '#93c5fd' },
        benefits: { label: 'Benefits', color: '#3b82f6' },
        incentives: { label: 'Incentives', color: '#1e40af' },
    };

    const totalThisMonth = payrollData?.data.at(-1)?.salaries ?? 0;
    const percentageChange = -20; // Replace with actual backend calculation if available

    return (
        <Card className="border shadow-none w-full">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">
                        Payroll Breakdown
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 border rounded px-2 py-1">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                            day: 'numeric',
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">
                        {formatCurrency(totalThisMonth)}
                    </span>
                    <div className="flex items-center text-red-500">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">{percentageChange}%</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    Current year to year payroll
                </p>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#93c5fd]"></div>
                        <span>Salaries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                        <span>Benefits</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#1e40af]"></div>
                        <span>Incentives</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={payrollConfig}
                    className="h-[300px] w-full"
                >
                    <BarChart data={payrollData?.data ?? []} barSize={30}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => [
                                        `₦${value.toLocaleString()}`,
                                        '',
                                    ]}
                                />
                            }
                        />
                        <Bar
                            dataKey="salaries"
                            stackId="payroll"
                            fill="#93c5fd"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="benefits"
                            stackId="payroll"
                            fill="#3b82f6"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="incentives"
                            stackId="payroll"
                            fill="#1e40af"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
