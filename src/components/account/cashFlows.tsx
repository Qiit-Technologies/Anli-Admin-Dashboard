/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CashFlowData, RevenueSummary } from '@/types/accounts/dashboard';
import { EllipsisVertical } from 'lucide-react';
import React from 'react';
import {
    Area,
    CartesianGrid,
    Cell,
    ComposedChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const COLORS_OUTER = ['#80BDFF', '#F9F5FF']; // green + gray
const COLORS_INNER = ['#FFCFAA', '#B5B5B5']; // red + gray;

interface CashFlowsProps {
    data?: CashFlowData[] | null;
    revenueSummary?: RevenueSummary | null;
    fetchRevenueSummary?: (date: string) => void;
    selectedDate?: string;
}

const EmptyChart = () => (
    <div className="flex flex-col items-center justify-center h-[83%] text-[#667085]">
        <p className="text-base mb-2">No cash flow data available</p>
        <p className="text-sm text-center">
            Data will appear here once transactions are recorded
        </p>
    </div>
);

const EmptyRevenueSummary = () => (
    <div className="flex flex-col items-center justify-center h-4/5 text-[#667085]">
        <p className="text-base mb-2">No revenue summary available</p>
        <p className="text-sm text-center">
            Select a different date or check back later
        </p>
    </div>
);
const CashFlows: React.FC<CashFlowsProps> = ({
    data,
    revenueSummary,
    fetchRevenueSummary,
    selectedDate,
}) => {
    const chartData = data || [];
    const hasData = data && data.length > 0;
    // Show summary only if at least one value is non-zero
    const hasSummary =
        !!revenueSummary &&
        ((revenueSummary.total && revenueSummary.total !== 0) ||
            (revenueSummary.departmentRevenue?.frontDesk &&
                revenueSummary.departmentRevenue.frontDesk !== 0) ||
            (revenueSummary.departmentRevenue?.restaurant &&
                revenueSummary.departmentRevenue.restaurant !== 0) ||
            (revenueSummary.departmentRevenue?.bar &&
                revenueSummary.departmentRevenue.bar !== 0) ||
            (revenueSummary.departmentRevenue?.other &&
                revenueSummary.departmentRevenue.other !== 0));

    const outerRingData = [
        { name: 'Completed', value: revenueSummary?.status?.completed || 0 },
        { name: 'Remaining', value: revenueSummary?.status?.remaining || 0 },
    ];

    const innerRingData = [
        { name: 'Paid', value: revenueSummary?.status?.paid || 0 },
        { name: 'Pending', value: revenueSummary?.status?.pending || 0 },
    ];

    // Date input state and handler (always use UTC, avoid off-by-one)
    const [inputDate, setInputDate] = React.useState(() => {
        if (selectedDate) {
            // Parse 'Jul 03, 2025' as UTC and format yyyy-mm-dd
            const parsed = Date.parse(selectedDate + ' UTC');
            if (!isNaN(parsed)) {
                return new Date(parsed).toISOString().slice(0, 10);
            }
        }
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });

    // Menu state
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Click outside handler to close menu
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        // Only update inputDate if selectedDate changes and is different from inputDate
        if (selectedDate) {
            const parsed = Date.parse(selectedDate + ' UTC');
            if (!isNaN(parsed)) {
                const iso = new Date(parsed).toISOString().slice(0, 10);
                if (iso !== inputDate) {
                    setInputDate(iso);
                }
            }
        }
    }, [selectedDate]);

    function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
        // Always treat as UTC to avoid timezone issues
        setInputDate(e.target.value);
        // Format for backend: 'Jul 03, 2025'
        const dateObj = new Date(e.target.value + 'T00:00:00Z');
        const formatted = dateObj.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
        });
        if (fetchRevenueSummary) {
            fetchRevenueSummary(formatted);
        }
    }

    // Format amount for display (convert to thousands/millions)
    const formatAmount = (amount: number): string => {
        if (amount >= 1000000) {
            return `₦${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `₦${(amount / 1000).toFixed(1)}K`;
        } else {
            return `₦${amount.toLocaleString()}`;
        }
    };

    // Export data to CSV
    const exportDataToCSV = () => {
        if (!chartData || chartData.length === 0) return;

        const csvContent = [
            ['Month', 'Revenue (₦)', 'Expenses (₦)', 'Net Cash Flow (₦)'],
            ...chartData.map((item) => [
                item.month,
                item.revenue.toLocaleString(),
                item.expenses.toLocaleString(),
                (item.revenue - item.expenses).toLocaleString(),
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `cash-flow-${new Date().toISOString().split('T')[0]}.csv`,
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsMenuOpen(false);
    };

    // Download chart as image
    const downloadChart = () => {
        const chartContainer = document.querySelector('.recharts-wrapper');
        if (!chartContainer) return;

        // Use html2canvas to capture the chart
        import('html2canvas')
            .then(({ default: html2canvas }) => {
                html2canvas(chartContainer as HTMLElement, {
                    backgroundColor: '#FAFAFA',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                }).then((canvas) => {
                    const link = document.createElement('a');
                    link.download = `cash-flow-chart-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                    setIsMenuOpen(false);
                });
            })
            .catch((err) => {
                console.error('Failed to download chart:', err);
                // Fallback: show alert
                alert('Chart download failed. Please try again.');
            });
    };

    // Refresh data
    const refreshData = async () => {
        if (fetchRevenueSummary && selectedDate) {
            setIsRefreshing(true);
            try {
                await fetchRevenueSummary(selectedDate);
            } catch (error: any) {
                console.error('Failed to refresh data:', error);
                // You can add a toast notification here if you have one
            } finally {
                setIsRefreshing(false);
            }
        }
        setIsMenuOpen(false);
    };

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-800">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                        >
                            {entry.name}: {formatAmount(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex gap-6 items-center mb-[31px] h-[430px]">
            <div className="w-3/5 h-full bg-[#FAFAFA] shadow rounded-lg p-6 border gap-6">
                <div className="mb-6 flex items-center w-full justify-between">
                    <div className="flex flex-col">
                        <p className="text-[#101828] text-base font-medium leading-6">
                            Net Cash Flow
                        </p>
                        <p className="text-[#667085] text-sm font-normal leading-5">
                            Track how your rating compares to your industry
                            average.
                        </p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <EllipsisVertical color="#98A2B3" size={20} />
                        </button>

                        {isMenuOpen && (
                            <div
                                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                                ref={menuRef}
                            >
                                <div className="py-1">
                                    <button
                                        onClick={exportDataToCSV}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Export Data
                                    </button>
                                    <button
                                        onClick={downloadChart}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Download Chart
                                    </button>
                                    <button
                                        onClick={refreshData}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        {isRefreshing
                                            ? 'Refreshing...'
                                            : 'Refresh Data'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {hasData ? (
                    <ResponsiveContainer width="100%" height={'83%'}>
                        <ComposedChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 30,
                                bottom: 50,
                            }}
                        >
                            <defs>
                                {/* Revenue gradient */}
                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#ECFDF3"
                                        stopOpacity="0.3"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#ECFDF3"
                                        stopOpacity="0.8"
                                    />
                                </linearGradient>

                                {/* Expenses gradient */}
                                <linearGradient
                                    id="expensesGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#FEF3F2"
                                        stopOpacity="0.3"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#FEF3F2"
                                        stopOpacity="0.8"
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                stroke="#E5E7EB"
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="month"
                                label={{
                                    value: 'Month',
                                    position: 'insideBottom',
                                    offset: -35,
                                    style: {
                                        fontSize: '12px',
                                        fill: '#6B7280',
                                    },
                                }}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis
                                label={{
                                    value: 'Amount (₦)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: -25,
                                    style: {
                                        fontSize: '12px',
                                        fill: '#6B7280',
                                    },
                                }}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                                padding={{ top: 10, bottom: 10 }}
                                tickFormatter={formatAmount}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* Revenue area with gradient - rendered first (behind) */}
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="#12B76A"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                                dot={{ fill: '#12B76A', strokeWidth: 2, r: 4 }}
                                activeDot={{
                                    r: 6,
                                    stroke: '#12B76A',
                                    strokeWidth: 2,
                                }}
                                stackId="1"
                            />

                            {/* Expenses area with gradient - rendered second (in front) */}
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke="#F04438"
                                strokeWidth={2}
                                fill="url(#expensesGradient)"
                                dot={{ fill: '#F04438', strokeWidth: 2, r: 4 }}
                                activeDot={{
                                    r: 6,
                                    stroke: '#F04438',
                                    strokeWidth: 2,
                                }}
                                stackId="2"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart />
                )}
            </div>
            <div className="w-2/5 h-full bg-[#FAFAFA] shadow rounded-2xl border gap-6">
                <div className="flex items-center w-full justify-between border-b border-[#E1E4EA] px-3 py-2">
                    <p className="text-[#101828] text-base font-medium leading-7">
                        Daily Revenue Summary <br /> Preview
                    </p>

                    <input
                        type="date"
                        className="px-2 py-1 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5"
                        disabled={!hasSummary && !revenueSummary}
                        value={inputDate}
                        onChange={handleDateChange}
                        max={new Date().toISOString().slice(0, 10)}
                    />
                </div>
                {hasSummary ? (
                    <div className="p-4 flex flex-col justify-center items-center gap-3 h-4/5">
                        <div className="relative w-40 h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    {/* Outer ring */}
                                    <Pie
                                        data={outerRingData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {outerRingData.map((entry, index) => (
                                            <Cell
                                                key={`outer-${index}`}
                                                fill={
                                                    COLORS_OUTER[
                                                        index %
                                                            COLORS_OUTER.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>

                                    {/* Inner ring */}
                                    <Pie
                                        data={innerRingData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={56}
                                        outerRadius={66}
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {innerRingData.map((entry, index) => (
                                            <Cell
                                                key={`inner-${index}`}
                                                fill={
                                                    COLORS_INNER[
                                                        index %
                                                            COLORS_INNER.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-[#667085] text-xs font-medium leading-[18px]">
                                    Total
                                </p>
                                <p className="text-[#101828] text-[20px] font-semibold leading-[30px]">
                                    ₦
                                    {(
                                        revenueSummary?.total || 0
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-center items-center gap-8">
                                <p className="text-[#552500] text-base font-medium leading-5">
                                    Front Desk{' '}
                                    <span className="text-[#6C6C6C]">
                                        ₦
                                        {(
                                            revenueSummary?.departmentRevenue
                                                ?.frontDesk || 0
                                        ).toLocaleString()}
                                    </span>
                                </p>
                                <p className="text-[#552500] text-base font-medium leading-5">
                                    Restaurant{' '}
                                    <span className="text-[#6C6C6C]">
                                        ₦
                                        {(
                                            revenueSummary?.departmentRevenue
                                                ?.restaurant || 0
                                        ).toLocaleString()}
                                    </span>
                                </p>
                            </div>
                            <div className="mt-5 flex justify-center items-center gap-8">
                                <p className="text-[#552500] text-base font-medium leading-5">
                                    Bar{' '}
                                    <span className="text-[#6C6C6C]">
                                        ₦
                                        {(
                                            revenueSummary?.departmentRevenue
                                                ?.bar || 0
                                        ).toLocaleString()}
                                    </span>
                                </p>
                                <p className="text-[#552500] text-base font-medium leading-5">
                                    Other{' '}
                                    <span className="text-[#6C6C6C]">
                                        ₦
                                        {(
                                            revenueSummary?.departmentRevenue
                                                ?.other || 0
                                        ).toLocaleString()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyRevenueSummary />
                )}
            </div>
        </div>
    );
};

export default CashFlows;
