'use client';

import {
    getCardStatInDepth,
    getDineAreaStats,
    getHourlySalesBreakdown,
    getItemStats,
    getItemStatsInDepth,
    getOrderSalesMetrics,
    getPaymentMethodStats,
    getRevenueGeneratedPerWaiter,
    getSalesByDineInAreaMetrics,
    getWaiterStats,
} from '@/app/actions/order';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    ArrowDown,
    ArrowUp,
    Box,
    CreditCard,
    Table,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import { CustomHxBarChart } from './charts/CustomHxBar';
import { HSBChart } from './charts/HSBChart';
import CollapsibleCard from './components/CollapsibleCard';
import ReportsCard, { ReportsCardProps } from './components/ReportsCard';
import SalesCategoryReport from './SalesCategoryReport';

const SalesReport = () => {
    const reportSections = [
        { id: 'all', title: 'All Reports' },
        {
            id: 'sales',
            title: 'Sales Report',
            subTitle: 'General Sales Report',
        },
        {
            id: 'waiter',
            title: 'Sales by Waiter',
            subTitle: 'Sales tailored to waiters',
        },
        {
            id: 'item',
            title: 'Sales by Item',
            subTitle: 'General Sales Report',
        },
        { id: 'menu', title: 'Sales by Menu Category' },
        {
            id: 'dine',
            title: 'Sales by Dine-In Area',
            subTitle: 'Sales tailored to Dine-in Area',
        },
    ];

    const { data: salesStat } = useSWR(
        '/orders/sales-metrics',
        getOrderSalesMetrics,
    );

    const { data: dineInAreaData } = useSWR(
        '/orders/sales-by-dine-in-metrics',
        getSalesByDineInAreaMetrics,
    );

    const { data: waiterStat } = useSWR('/orders/waiter-stats', getWaiterStats);

    const { data: waiterData } = useSWR(
        '/orders/waiter-revenue',
        getRevenueGeneratedPerWaiter,
    );

    const { data: itemStat } = useSWR('/orders/item-stats', getItemStats);

    const { data: itemStatInDepth } = useSWR(
        '/orders/item-depth-stats',
        getItemStatsInDepth,
    );

    const { data: dineAreaStat } = useSWR(
        '/orders/dine-in-area-stats',
        getDineAreaStats,
    );

    const { data: hourlySalesBreakdown } = useSWR(
        '/orders/hourly-sales-breakdown',
        getHourlySalesBreakdown,
    );

    const { data: cardStatInDepth } = useSWR(
        '/orders/card-stats',
        getCardStatInDepth,
    );

    const { data: cardTypeData } = useSWR(
        '/orders/payment-method-stats',
        getPaymentMethodStats,
    );

    const [selectedReport, setSelectedReport] = useState('sales');

    const handleReportChange = (value: string) => {
        setSelectedReport(value);
    };

    const shouldDisplaySection = (sectionId: string) => {
        return selectedReport === 'all' || selectedReport === sectionId;
    };

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="w-full mb-4">
                <Select
                    value={selectedReport}
                    onValueChange={handleReportChange}
                >
                    <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select a report section" />
                    </SelectTrigger>
                    <SelectContent>
                        {reportSections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                                {section.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {shouldDisplaySection('sales') && (
                <CollapsibleCard
                    title="Sales Report"
                    subTitle="General Sales Report"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {salesStat?.data
                            .slice(0, 3)
                            .map((stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend}
                                    key={index}
                                />
                            ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {salesStat?.data
                            .slice(3, 5)
                            .map((stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend}
                                    key={index}
                                />
                            ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomHxBarChart
                            DataIcon={CreditCard}
                            title="Sales by Payment Type"
                            subtitle="Last Quarter"
                            data={cardTypeData?.data ?? []}
                            trendPercentage={3.2}
                            footerText="Showing payment distribution by card type"
                        />
                        <CustomHxBarChart
                            DataIcon={Table}
                            title="Sales by Dine-In Area"
                            subtitle="Current Month"
                            data={dineInAreaData?.data ?? []}
                            trendPercentage={-2.1}
                            footerText="Showing revenue distribution by dining area"
                        />
                    </div>
                </CollapsibleCard>
            )}

            {shouldDisplaySection('waiter') && (
                <CollapsibleCard
                    title="Sales by Waiter"
                    subTitle="Sales tailored to waiters"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {waiterStat?.data?.map(
                            (stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend}
                                    key={index}
                                />
                            ),
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomHxBarChart
                            DataIcon={Users}
                            title="Sales by Waiter"
                            subtitle="Last Quarter"
                            data={waiterData?.data ?? []}
                            trendPercentage={3.2}
                            footerText="Showing waiter distribution by each waiter"
                        />
                    </div>
                </CollapsibleCard>
            )}

            {shouldDisplaySection('item') && (
                <CollapsibleCard
                    title="Sales by Item"
                    subTitle="General Sales Report"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {itemStat?.data.map(
                            (stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend as 'up' | 'down'}
                                    key={index}
                                />
                            ),
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="shadow-none">
                            <CardHeader className="border-b">
                                <div className="flex items-center py-0 justify-between">
                                    <div className="flex items-center font-bold gap-2">
                                        <Box className="w-5 h-5" />
                                        <span>Sales by Item</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex h-full p-6 flex-col justify-between">
                                    {itemStatInDepth?.data.map(
                                        (item: any, index: number) => {
                                            const isPositive =
                                                item.previousValue <
                                                item.currentValue;

                                            const percentChange = Math.abs(
                                                ((item.currentValue -
                                                    item.previousValue) /
                                                    item.previousValue) *
                                                    100,
                                            );
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center h-full py-4 justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                                        <span className="font-medium">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium">
                                                        {item.value}
                                                    </span>
                                                    <Badge
                                                        className={cn(
                                                            'shadow-none rounded-full',
                                                            isPositive
                                                                ? 'bg-emerald-100 text-emerald-500'
                                                                : 'bg-red-100 text-red-500',
                                                        )}
                                                    >
                                                        <span>
                                                            {isPositive ? (
                                                                <ArrowUp className="w-3 h-3" />
                                                            ) : (
                                                                <ArrowDown className="w-3 h-3" />
                                                            )}
                                                        </span>
                                                        {percentChange.toFixed()}
                                                        %
                                                    </Badge>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CollapsibleCard>
            )}

            {shouldDisplaySection('menu') && (
                <CollapsibleCard title="Sales by Menu Category">
                    <SalesCategoryReport />
                </CollapsibleCard>
            )}

            {shouldDisplaySection('dine') && (
                <CollapsibleCard
                    title="Sales by Dine-In Area"
                    subTitle="Sales tailored to Dine-in Area"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {dineAreaStat?.data.map(
                            (stat: ReportsCardProps, index: number) => (
                                <ReportsCard
                                    title={stat.title}
                                    value={stat.value}
                                    percent={stat.percent}
                                    trend={stat.trend}
                                    key={index}
                                />
                            ),
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomHxBarChart
                            DataIcon={Table}
                            title="Sales by Dine-In Area"
                            subtitle="Current Month"
                            data={dineInAreaData?.data}
                            trendPercentage={-2.1}
                            footerText="Showing revenue distribution by dining area"
                        />
                    </div>
                </CollapsibleCard>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-none">
                    <CardHeader className="border-b">
                        <div className="flex items-center py-0 justify-between">
                            <div className="flex items-center font-bold gap-2">
                                <CreditCard className="w-5 h-5" />
                                <span>Payment Summary</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div>
                            <HSBChart data={hourlySalesBreakdown?.data ?? []} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="border-b">
                        <div className="flex items-center py-0 justify-between">
                            <div className="flex items-center font-bold gap-2">
                                <CreditCard className="w-5 h-5" />
                                <span>Payment Summary</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex h-full p-6 flex-col justify-between">
                            {cardStatInDepth?.data.map(
                                (item: any, index: number) => {
                                    const isPositive = item.trend === 'up';
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center h-full py-4 justify-between gap-2"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                                <span className="font-medium">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <Badge
                                                className={cn(
                                                    'shadow-none rounded-full',
                                                    isPositive
                                                        ? 'bg-emerald-100 text-emerald-500'
                                                        : 'bg-red-100 text-red-500',
                                                )}
                                            >
                                                <span>
                                                    {isPositive ? (
                                                        <ArrowUp className="w-3 h-3" />
                                                    ) : (
                                                        <ArrowDown className="w-3 h-3" />
                                                    )}
                                                </span>
                                                {item.percent.toFixed()}%
                                            </Badge>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalesReport;
