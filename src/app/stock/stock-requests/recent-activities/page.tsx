'use client';
import { PageHeader } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import {
    stockRequestColumn,
    stockRequestsFilters,
} from '@/components/stock/tables/columns/stock-requests';
import StockRequestTable from '@/components/stock/tables/SRTable';
import { fetchStockRequest, StockRequest } from '@/hooks/fetcher';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import useSWR from 'swr';

const RecentStockRequestsActivities = () => {
    const { data: stockRequest } = useSWR('/items/pending', fetchStockRequest);
    console.log(stockRequest);
    return (
        <PageWrapper>
            <PageHeader>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/stock/stock-requests"
                    >
                        Stock Requests
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        Recent Activities
                    </BreadcrumbItem>
                </Breadcrumbs>
                <div className="ml-auto flex items-center">
                    <SearchInput />
                    <NotificationsPopover />
                </div>
            </PageHeader>
            <div>
                <StockRequestTable
                    data={(stockRequest as StockRequest[]) ?? []}
                    columns={stockRequestColumn}
                    filters={stockRequestsFilters}
                    hasHeader={true}
                    title="Recent Activities"
                    hasCreate
                    seeMoreLink="/stock/stock-requests/recent-activities"
                />
            </div>
        </PageWrapper>
    );
};

export default RecentStockRequestsActivities;
