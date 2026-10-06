import { ScopedTotalExpenses } from '@/components/front-of-house/types';
import { formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const TotalExpensesColumns: ColumnDef<ScopedTotalExpenses>[] = [
    {
        accessorKey: 'expenseType',
        header: 'Expense Type',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.expenseType}
            </span>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount (₦)',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {formatCurrency(row.original.amount)}
            </span>
        ),
    },
    {
        accessorKey: 'growthOverTime',
        header: 'Growth over time',
        cell: ({ row }) => <GrowthChart scopedData={row.original} />,
    },
];

const GrowthChart = ({ scopedData }: { scopedData: ScopedTotalExpenses }) => {
    const data = [
        { x: 0, y: 0 },
        { x: 10, y: 20 },
        { x: 20, y: 10 },
        { x: 30, y: 30 },
    ];

    const declineData = [
        { x: 0, y: 30 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 0 },
    ];

    return (
        <div className="flex gap-2 items-center">
            {scopedData?.isNegative ? (
                <>
                    <ResponsiveContainer width={63} height={50}>
                        <AreaChart data={declineData}>
                            {/* gradient definition */}
                            <defs>
                                <linearGradient
                                    id="pinkGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="60%"
                                        stopColor="#FEF3F2"
                                        stopOpacity="0"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#FEF3F2"
                                        stopOpacity="1"
                                    />
                                </linearGradient>
                            </defs>

                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke="#F04438"
                                strokeWidth={2}
                                fill="url(#pinkGradient)"
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="gap-1 items-center flex flex-row text-[#F04438] text-sm font-medium leading-5 px-3 py-1 rounded-full bg-[#FEF3F2]">
                        <ArrowUp /> <p>15%</p>
                    </div>
                </>
            ) : (
                <>
                    <ResponsiveContainer width={63} height={50}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient
                                    id="colorGreen"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="60%"
                                        stopColor="#ECFDF3"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#ECFDF3"
                                        stopOpacity={1}
                                    />
                                </linearGradient>
                            </defs>

                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke="#12B76A"
                                strokeWidth={2}
                                fill="url(#colorGreen)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="gap-1 items-center flex flex-row text-[#12B76A] text-sm font-medium leading-5 px-3 py-1 rounded-full bg-[#ECFDF3]">
                        <ArrowUp /> <p>15%</p>
                    </div>
                </>
            )}
        </div>
    );
};
