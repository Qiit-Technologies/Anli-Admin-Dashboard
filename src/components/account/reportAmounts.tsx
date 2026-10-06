import { formatCurrency } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

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

const ReportAmounts = ({ transactionStats }: any) => {
    const {
        percentageChangeInBalance,
        percentageChangeInExpenses,
        percentageChangeInRevenue,
    } = transactionStats;

    return (
        <div className="flex gap-4 items-center mb-[31px]">
            <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                <div className="flex items-center w-full justify-between">
                    <p className="text-[16px] font-medium leading-6 text-[#667085]">
                        Total Balance
                    </p>
                </div>
                <p className="mt-6 text-[36px] font-semibold leading-[44px] tracking-[-0.045em] text-[#101828]">
                    {/* ₦12,98707.00 */}
                    {formatCurrency(transactionStats?.totalCurrentBalance)}
                </p>
                <div className="flex justify-between w-full items-baseline">
                    <p
                        className={`${percentageChangeInBalance >= 0 ? 'text-[#336133]' : 'text-[#A91F0B]'} text-sm font-medium leading-5`}
                    >
                        ▲ {percentageChangeInBalance || 0}% Growth
                        <span className="text-[#667085] p-2">vs Yesterday</span>
                    </p>

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
                                        stopColor={`${percentageChangeInBalance >= 0 ? '#ECFDF3' : '#FEF3F2'} `}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={`${percentageChangeInBalance >= 0 ? '#ECFDF3' : '#FEF3F2'} `}
                                        stopOpacity={1}
                                    />
                                </linearGradient>
                            </defs>

                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke={`${percentageChangeInBalance >= 0 ? '#12B76A' : '#F04438'} `}
                                strokeWidth={2}
                                fill="url(#colorGreen)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                <div className="flex items-center w-full justify-between">
                    <p className="text-[16px] font-medium leading-6 text-[#667085]">
                        Total Expenses
                    </p>
                </div>
                <p className="mt-6 text-[36px] font-semibold leading-[44px] tracking-[-0.045em] text-[#101828]">
                    {formatCurrency(transactionStats?.currentExpensesAmount)}
                </p>
                <div className="flex justify-between w-full items-baseline">
                    <p
                        className={`${percentageChangeInExpenses >= 0 ? 'text-[#336133]' : 'text-[#A91F0B]'} text-sm font-medium leading-5`}
                    >
                        ▲ {percentageChangeInExpenses || 0}% Growth
                        <span className="text-[#667085] p-2">vs Yesterday</span>
                    </p>

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
                                        stopColor={`${percentageChangeInExpenses >= 0 ? '#ECFDF3' : '#FEF3F2'} `}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={`${percentageChangeInExpenses >= 0 ? '#ECFDF3' : '#FEF3F2'} `}
                                        stopOpacity={1}
                                    />
                                </linearGradient>
                            </defs>

                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke={`${percentageChangeInExpenses >= 0 ? '#12B76A' : '#F04438'} `}
                                strokeWidth={2}
                                fill="url(#colorGreen)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                <div className="flex items-center w-full justify-between">
                    <p className="text-[16px] font-medium leading-6 text-[#667085]">
                        Total Revenue
                    </p>
                </div>
                <p className="mt-6 text-[36px] font-semibold leading-[44px] tracking-[-0.045em] text-[#101828]">
                    {formatCurrency(transactionStats?.currentRevenueAmount)}
                </p>
                <div className="flex justify-between w-full items-baseline">
                    <p
                        className={`${percentageChangeInRevenue >= 0 ? 'text-[#336133]' : 'text-[#A91F0B]'} text-sm font-medium leading-5`}
                    >
                        ▼ {percentageChangeInRevenue || 0}% Decline
                        <span className="text-[#667085] p-2">vs Yesterday</span>
                    </p>

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
                                        stopColor={`${percentageChangeInRevenue >= 0 ? '#ECFDF3' : '#FEF3F2'} `}
                                        stopOpacity="0"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={`${percentageChangeInRevenue >= 0 ? '#ECFDF3' : '#FEF3F2'} `}
                                        stopOpacity="1"
                                    />
                                </linearGradient>
                            </defs>

                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke={`${percentageChangeInRevenue >= 0 ? '#12B76A' : '#F04438'} `}
                                strokeWidth={2}
                                fill="url(#pinkGradient)"
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportAmounts;
