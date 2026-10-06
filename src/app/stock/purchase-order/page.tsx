'use client';
import { getPurchaseOrders } from '@/app/actions/stock';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { PurchaseOrderStockColumns } from '@/components/kitchen/tables/columns/PurchaseOrderStockColumns';
import {
    PURCHASE_ORDER_STAT_HREFS,
    StockStatCard,
} from '@/components/stock/common/cards/Dashboard';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import { fetchGoodsReceivedMetrics } from '@/hooks/fetcher';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const GoodsRecieveNote = () => {
    const { user } = useUser();
    const {
        data: goodsReceivedMetrics,
        isLoading,
        error,
    } = useSWR('/items/goods-received-metrics', fetchGoodsReceivedMetrics);
    const stockStats = goodsReceivedMetrics?.map((metric) => ({
        title: metric.title,
        currentValue: metric.currentValue ?? 0,
        previousValue: metric.previousValue ?? 0,
        percentageChange: metric.percentageChange ?? 0,
    }));
    // Removed goodsReceived fetch

    // Fetch purchase orders for stock
    const { data: purchaseOrders } = useSWR(
        '/accounts/purchase-orders',
        getPurchaseOrders,
    );
    type PurchaseOrder = {
        poNumber: string;
        vendor?: { name: string };
        total: number;
        itemGrouping: string;
        dateSent: string | Date;
        status: string;
        items: {
            item: string;
            quantity: number;
            amount: number;
        }[];
    };
    const tableData = (purchaseOrders?.data ?? []).map(
        (order: PurchaseOrder) => ({
            poNumber: order.poNumber,
            vendor: order.vendor,
            total: `₦${order.total?.toLocaleString?.() ?? order.total}`,
            itemGrouping: order.itemGrouping,
            dateSent: order.dateSent,
            status: order.status,
            items: order.items,
            // ...add any other fields needed for actions
        }),
    );
    console.log(tableData);

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Purchase Order"
                    subtitle={`Welcome back, ${user?.fullName}`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="w-full mt-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="animate-spin text-brand" />
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-red-500">
                                Failed to load goods received metrics.
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
                                    href={PURCHASE_ORDER_STAT_HREFS[stat.title]}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex gap-2 justify-end">
                        <Link
                            href={
                                '/stock/purchase-order/generate-restocking-list'
                            }
                        >
                            <Button className="bg-brand text-white hover:bg-brand">
                                Generate Restocking List
                            </Button>
                        </Link>
                        <Link href={'/stock/purchase-order/create'}>
                            <Button className="bg-orion-blue hover:bg-orion-blue text-white">
                                Create Purchase Order
                            </Button>
                        </Link>
                    </div>

                    {/* Purchase Management Table for purchase orders */}
                    <div className="mt-10">
                        <CustomTable
                            columns={PurchaseOrderStockColumns}
                            data={tableData}
                            hasHeader
                            title="Purchase Orders"
                            isPaginated
                        />
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default GoodsRecieveNote;
