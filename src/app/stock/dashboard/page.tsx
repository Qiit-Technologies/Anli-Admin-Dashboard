'use client';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import {
    STOCK_DASHBOARD_STAT_HREFS,
    StockStatCard,
} from '@/components/stock/common/cards/Dashboard';
import { stockAlertColumn } from '@/components/stock/tables/columns/stock-alerts';
import CustomTable from '@/components/stock/tables/CustomTable';
import { useUser } from '@/context/useUser';
import {
    fetchStockActivity,
    fetchStockAlert,
    fetchStockMetrics,
    StockActivityLog,
    StockAlertItem,
} from '@/hooks/fetcher';
import { Tooltip } from '@heroui/react';
import useSWR from 'swr';

interface Activity {
    id?: number;
    color: string;
    activity: string;
    date: Date;
    quantity: number;
    department: string;
    itemName: string;
}

const ActivityField = ({
    color,
    activity,
    date,
    quantity,
    department,
    itemName,
}: Activity) => {
    return (
        <Tooltip
            className="text-muted-foreground rounded-sm font-medium"
            content={`${activity} ${quantity} ${itemName} from ${department}`}
            showArrow={true}
        >
            <div className="w-full flex gap-3 items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <div className="flex-col min-w-0 flex-1 overflow-hidden">
                        <div className="text-sm font-medium truncate">
                            {itemName} {activity} to {department}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </div>
                    </div>
                </div>
                <div className="font-bold text-sm flex-shrink-0">
                    {quantity}pcs
                </div>
            </div>
        </Tooltip>
    );
};

const getActivityColor = (action: string): string => {
    switch (action.toLowerCase()) {
        case 'issued':
            return 'bg-green-500';
        case 'requested':
            return 'bg-red-500';
        case 'received':
            return 'bg-blue';
        default:
            return 'bg-gray-500';
    }
};

const ActivityList = () => {
    const { data: activities } = useSWR(
        '/items/stock-activity',
        fetchStockActivity,
    );
    return (
        <div className="flex flex-col h-full max-h-[400px] gap-4 p-4 w-full max-w-md overflow-y-auto">
            {activities?.length ? (
                activities.map((activity: StockActivityLog) => (
                    <ActivityField
                        key={activity.id}
                        color={getActivityColor(activity.action)}
                        activity={activity.action}
                        date={activity.timestamp}
                        quantity={activity.quantity}
                        department={activity.department}
                        itemName={activity.itemName}
                    />
                ))
            ) : (
                <div className="text-gray-500 text-center p-4">
                    No recent activities
                </div>
            )}
        </div>
    );
};

const StockDashboard = () => {
    const { user } = useUser();
    const {
        data: stock,
        isLoading,
        error,
    } = useSWR('/items/stock/metrics', fetchStockMetrics);
    const stockStats = stock?.map((metric) => ({
        title: metric.title,
        currentValue: metric.currentValue ?? 0,
        previousValue: metric.previousValue ?? 0,
        percentageChange: metric.percentageChange ?? 0,
    }));
    const { data: alert } = useSWR('/items/stock-alerts', fetchStockAlert);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Dashboard"
                    subtitle={`Welcome back, ${user?.fullName || 'User'}`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="flex-1 overflow-auto pt-2">
                <div className="w-full mt-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-gray-500 animate-pulse">
                                Loading stock metrics...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-red-500">
                                Failed to load stock metrics.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {stockStats?.map((stat) => (
                                <StockStatCard
                                    key={stat.title}
                                    title={stat.title}
                                    currentValue={stat.currentValue}
                                    previousValue={stat.previousValue}
                                    percentageChange={stat.percentageChange}
                                    href={STOCK_DASHBOARD_STAT_HREFS[stat.title]}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-10">
                    <div className="col-span-1 lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-6 scale-[0.99] origin-top">
                            <CustomTable
                                data={(alert as StockAlertItem[]) ?? []}
                                columns={stockAlertColumn}
                                filters={undefined}
                                isPaginated={false}
                                hasHeader={true}
                                title="Stock Alerts"
                                variant="none"
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 flex flex-col h-full overflow-hidden scale-[0.98] origin-top">
                        <div className="p-4 border-b border-gray-50 font-bold text-sm bg-gray-50/30">
                            Recent Stock Activity
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ActivityList />
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default StockDashboard;
