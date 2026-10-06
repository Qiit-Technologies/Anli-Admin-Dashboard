'use client';
import { getBarOrderHistory } from '@/app/actions/bar';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import {
    OrderHistoryColumn,
    OrderHistoryFilters,
} from '@/components/kitchen/tables/columns/OrderHistory';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const OrderHistoryPage = () => {
    const { data: orders } = useSWR('/orders/bar-history', getBarOrderHistory);
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Order History"
                    subtitle={`Order History Management`}
                />
                <div className="ml-auto flex items-center">
                    <Button
                        variant="light"
                        isIconOnly
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div>
                <CustomTable
                    columns={OrderHistoryColumn}
                    data={orders?.data ?? []}
                    filters={OrderHistoryFilters}
                    dateFilter={{
                        enabled: true,
                        column: 'requestDate',
                        label: 'Filter by Date',
                    }}
                />
            </div>
        </PageWrapper>
    );
};

export default OrderHistoryPage;
