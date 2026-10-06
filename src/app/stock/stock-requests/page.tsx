'use client';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import {
    STOCK_REQUEST_STAT_HREFS,
    StockStatCard,
} from '@/components/stock/common/cards/Dashboard';
import {
    stockRequestColumn,
    stockRequestsFilters,
} from '@/components/stock/tables/columns/stock-requests';
import StockRequestTable from '@/components/stock/tables/SRTable';
import {
    fetchStockRequest,
    fetchStockRequestMetrics,
    StockRequest,
} from '@/hooks/fetcher';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import useSWR from 'swr';

const StockRequestPage = () => {
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');

    const {
        data: stock,
        isLoading,
        error,
    } = useSWR('/items/stock/request/metrics', fetchStockRequestMetrics);

    const stockStats = stock?.map((metric) => ({
        title: metric.title,
        currentValue: metric.currentValue ?? 0,
        previousValue: metric.previousValue ?? 0,
        percentageChange: metric.percentageChange ?? 0,
    }));
    const { data: stockRequest } = useSWR('/items/pending', fetchStockRequest);

    const tableData = useMemo(() => {
        const rows =
            (stockRequest as StockRequest[])?.map((request) => ({
                ...request,
                id: request.requestNumber || `#RED-${request.id}`,
                numericId: request.id,
                quantity: request.quantity ?? request.itemCount ?? 0,
            })) ?? [];
        if (!statusFilter || statusFilter === 'all') return rows;
        return rows.filter(
            (row) =>
                String(row.status).toUpperCase() ===
                    statusFilter.toUpperCase() ||
                (statusFilter === 'PENDING' &&
                    ['PENDING', 'AWAITING_ADMIN_APPROVAL'].includes(
                        String(row.status).toUpperCase(),
                    )),
        );
    }, [stockRequest, statusFilter]);

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Stock Requests"
                    subtitle="Historical requests only. New issues are recorded as OUT on Stock Movement."
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="gap-3 py-4">
                {statusFilter ? (
                    <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm">
                        <span>
                            Filtered by status: <strong>{statusFilter}</strong>
                        </span>
                        <Link
                            href="/stock/stock-requests"
                            className="text-orion-blue hover:underline"
                        >
                            Back to all requests
                        </Link>
                    </div>
                ) : null}
                <div className="w-full">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-20">
                            <Loader2 className="animate-spin text-brand" />
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center h-20">
                            <p className="text-red-500 text-sm">
                                Failed to load stock request metrics.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                            {stockStats?.map((stat) => (
                                <StockStatCard
                                    key={stat.title}
                                    title={stat.title}
                                    currentValue={stat.currentValue}
                                    previousValue={stat.previousValue}
                                    percentageChange={stat.percentageChange}
                                    href={STOCK_REQUEST_STAT_HREFS[stat.title]}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <StockRequestTable
                    data={tableData}
                    columns={stockRequestColumn}
                    filters={stockRequestsFilters}
                    hasHeader={true}
                    title="Recent Activities"
                    seeMoreLink="/stock/stock-requests/recent-activities"
                />
            </PageWrapper>
        </div>
    );
};

export default StockRequestPage;
