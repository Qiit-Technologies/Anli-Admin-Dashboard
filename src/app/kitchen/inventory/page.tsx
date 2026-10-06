'use client';
import EmptyState from '@/components/common/EmptyState';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { InventoryStatsCard } from '@/components/house-keeping/common/cards/Inventory';
import { inventoryIllustration } from '@/components/house-keeping/common/illustrations';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import { inventoryColumn } from '@/components/house-keeping/tables/columns/inventory';
import InventoryTable from '@/components/house-keeping/tables/InventoryTable';
import {
    fetchInventoryItems,
    fetchInventoryItemsMetrics,
} from '@/hooks/fetcher';
import { useDepartmentItems } from '@/hooks/useDepartmentItems';
import { Button } from '@heroui/react';
import { Activity, DollarSign, Users } from 'lucide-react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import DashboardLoader from '@/components/DashboardLoader';

const KitchenInventoryPage = () => {
    const { isLoading, isError } = useDepartmentItems();

    const department = 'kitchen';
    const { data: inventory } = useSWR(
        department
            ? `/inventory/metrics?department=${department}`
            : '/inventory/metrics',
        () => fetchInventoryItemsMetrics(department),
    );
    const inventoryStats = inventory?.map((metric) => {
        let icon;
        switch (metric.title) {
            case 'Total number of items in the store':
                icon = <DollarSign size={18} />;
                break;
            case 'Total number of Qty Taken':
                icon = <Users size={18} />;
                break;
            case 'Total number of Remaining Stock':
                icon = <Activity size={18} />;
                break;
            default:
                icon = <Activity size={18} />;
        }
        return {
            title: metric.title,
            value: metric.currentValue ?? 0,
            previousValue: metric.previousValue ?? 0,
            percentageChange: metric.percentageChange ?? 0,
            description: `${metric.percentageChange ?? 0}% from last month`,
            icon,
        };
    });
    const { data: items } = useSWR(
        department ? `/items/stock?department=${department}` : null,
        () => fetchInventoryItems(department),
    );

    if (isLoading) return <DashboardLoader />;
    if (isError) return <div>Error loading inventory item request...</div>;
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Kitchen Inventory"
                    subtitle={`Inventory of all your items`}
                />
                <div className="ml-auto flex items-center">
                    <NotificationsPopover>
                        <Button
                            variant="light"
                            isIconOnly
                            className="ml-4 bg-white rounded-full border text-gray-400"
                        >
                            <LuBell size={18} />
                        </Button>
                    </NotificationsPopover>
                </div>
            </PageHeader>
            {items && items.length === 0 ? (
                <div className="w-full mt-20 min-h-full flex items-center justify-center">
                    <EmptyState
                        icon={inventoryIllustration}
                        title="Inventory"
                        description="Store issues items as OUT on Stock Movement. Historical collections still appear here."
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-x-4">
                        {inventoryStats?.map((item) => {
                            return (
                                <InventoryStatsCard
                                    key={item.title}
                                    title={item.title}
                                    description={item.description}
                                    value={item.value}
                                    icon={item.icon}
                                />
                            );
                        })}
                    </div>
                    <div>
                        <InventoryTable
                            data={items ?? []}
                            columns={inventoryColumn}
                        />
                    </div>
                </>
            )}
        </PageWrapper>
    );
};

export default KitchenInventoryPage;
