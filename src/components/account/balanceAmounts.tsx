import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import React, { useCallback } from 'react';
import { DashboardSummary } from '@/types/accounts/dashboard';
import DateRangeDropdown from '../common/RangeDropdown';
import { formatDate } from '@/lib/utils';

interface Props {
    balanceSummary?: DashboardSummary | null;
    revenueSummary?: DashboardSummary | null;
    expensesSummary?: DashboardSummary | null;
    loading?: boolean;
    onDateChange?: (
        type: 'balance' | 'revenue' | 'expenses',
        start: string | undefined,
        end: string | undefined,
    ) => void;
}

const EmptyCard = () => (
    <div className="bg-[#FAFAFA] h-[125px] flex-1 flex flex-col items-center justify-center text-[#667085]">
        <p className="text-base mb-2">No data available</p>
        <p className="text-sm text-center">
            Select a different time range or check back later
        </p>
    </div>
);

const BalanceAmounts = ({
    balanceSummary,
    revenueSummary,
    expensesSummary,
    loading,
    onDateChange,
}: Props) => {
    const revenueData = revenueSummary?.revenueRecentData?.map((data) => ({
        x: new Date(data?.date).getDate(),
        y: data.count,
    }));

    const expensesData = revenueSummary?.expensesRecentData?.map((data) => ({
        x: new Date(data?.date).getDate(),
        y: data.count,
    }));
    const handleDateChange = useCallback(
        (
            type: 'balance' | 'revenue' | 'expenses',
            startDate: string,
            endDate: string,
        ) => {
            onDateChange?.(type, startDate, endDate);
        },
        [onDateChange],
    );

    const handleSelection = (
        type: 'balance' | 'revenue' | 'expenses',
        selection: { startDate: string; endDate: string },
    ) => {
        const startDate = formatDate(selection?.startDate);
        const endDate = formatDate(selection?.endDate);
        if (selection.startDate !== selection.endDate)
            handleDateChange(type, startDate, endDate);
    };

    const isBalanceEmpty = !balanceSummary || balanceSummary.totalBalance === 0;
    const isRevenueEmpty = !revenueSummary || revenueSummary.revenue === 0;
    const isExpensesEmpty = !expensesSummary || expensesSummary.expenses === 0;

    return (
        <div className="flex gap-4 items-center mb-[31px]">
            <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                <div className="flex items-center w-full justify-between">
                    <p className="text-[#3E4450] text-sm font-medium leading-5">
                        Total Balance
                    </p>
                    <DateRangeDropdown
                        handleSelection={(selection: {
                            startDate: string;
                            endDate: string;
                        }) => handleSelection('balance', selection)}
                    />
                </div>
                {loading ? (
                    <>
                        <div className="mt-6 h-11 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="flex justify-between w-full items-baseline mt-4">
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="h-[50px] w-[63px] bg-gray-200 rounded animate-pulse" />
                        </div>
                    </>
                ) : isBalanceEmpty ? (
                    <EmptyCard />
                ) : (
                    <>
                        <p className="mt-6 text-[#101828] text-2xl font-semibold leading-[44px]">
                            ₦
                            {(
                                balanceSummary?.totalBalance || 0
                            ).toLocaleString()}
                        </p>
                        <div className="flex justify-between w-full items-baseline">
                            <p className="text-[#336133] font-inter text-sm font-medium leading-5">
                                ▲{' '}
                                {balanceSummary?.percentageChange?.toFixed(1) ||
                                    0}
                                % Growth
                                {/* <span className="text-[#667085] p-2">
                                    Last 24hr
                                </span> */}
                            </p>

                            <ResponsiveContainer width={63} height={50}>
                                <AreaChart
                                    data={[
                                        { x: 0, y: 0 },
                                        ...(revenueData || []),
                                        ...(expensesData || []),
                                    ]}
                                >
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
                        </div>
                    </>
                )}
            </div>

            <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                <div className="flex items-center w-full justify-between">
                    <p className="text-[#3E4450] text-sm font-medium leading-5">
                        Total Revenue
                    </p>
                    <DateRangeDropdown
                        handleSelection={(selection: {
                            startDate: string;
                            endDate: string;
                        }) => handleSelection('revenue', selection)}
                    />
                </div>
                {loading ? (
                    <>
                        <div className="mt-6 h-11 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="flex justify-between w-full items-baseline mt-4">
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="h-[50px] w-[63px] bg-gray-200 rounded animate-pulse" />
                        </div>
                    </>
                ) : isRevenueEmpty ? (
                    <EmptyCard />
                ) : (
                    <>
                        <p className="mt-6 text-[#101828] text-2xl font-semibold leading-[44px]">
                            ₦{(revenueSummary?.revenue || 0).toLocaleString()}
                        </p>
                        <div className="flex justify-between w-full items-baseline">
                            <p className="text-[#336133] font-inter text-sm font-medium leading-5">
                                ▼{' '}
                                {revenueSummary?.revenueChange?.toFixed(1) || 0}
                                % Decline
                                {/* <span className="text-[#667085] p-2">
                                    Last 24hr
                                </span> */}
                            </p>

                            <ResponsiveContainer width={63} height={50}>
                                <AreaChart
                                    data={[
                                        { x: 0, y: 0 },
                                        ...(expensesData || []),
                                    ]}
                                >
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
                                        stroke="#336133"
                                        strokeWidth={2}
                                        fill="url(#pinkGradient)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>

            <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                <div className="flex items-center w-full justify-between">
                    <p className="text-[#3E4450] text-sm font-medium leading-5">
                        Total Expenses
                    </p>
                    <DateRangeDropdown
                        handleSelection={(selection: {
                            startDate: string;
                            endDate: string;
                        }) => handleSelection('expenses', selection)}
                    />
                </div>
                {loading ? (
                    <>
                        <div className="mt-6 h-11 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="flex justify-between w-full items-baseline mt-4">
                            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                            <div className="h-[50px] w-[63px] bg-gray-200 rounded animate-pulse" />
                        </div>
                    </>
                ) : isExpensesEmpty ? (
                    <EmptyCard />
                ) : (
                    <>
                        <p className="mt-6 text-[#101828] text-2xl font-semibold leading-[44px]">
                            ₦{(expensesSummary?.expenses || 0).toLocaleString()}
                        </p>
                        <div className="flex justify-between w-full items-baseline">
                            <p className="text-[#336133] font-inter text-sm font-medium leading-5">
                                ▲{' '}
                                {expensesSummary?.expensesChange?.toFixed(1) ||
                                    0}
                                % Growth
                                {/* <span className="text-[#667085] p-2">
                                    vs last 24hr
                                </span> */}
                            </p>

                            <ResponsiveContainer width={63} height={50}>
                                <AreaChart
                                    data={[
                                        { x: 0, y: 0 },
                                        ...(revenueData || []),
                                    ]}
                                >
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BalanceAmounts;
