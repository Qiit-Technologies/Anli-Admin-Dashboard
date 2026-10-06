'use client';
import { getSentOrders } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import {
    sentItemsColumn,
    sentItemsFilters,
} from '@/components/front-of-house/tables/columns/SentItems';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const PaymentsPage = () => {
    const { data: orders } = useSWR('order-payment', getSentOrders);

    return (
        <PageWrapper
            permissions={[
                PERMISSIONS.VIEW_OR_INITIATE_ORDER_PAYMENT,
                PERMISSIONS.VIEW_ALL_PAGE,
            ]}
        >
            <PageHeader>
                <PageHeadertitle
                    title="Payment Info"
                    subtitle={`View all payments`}
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
                    columns={sentItemsColumn}
                    data={orders?.data ?? []}
                    filters={sentItemsFilters}
                />
            </div>
        </PageWrapper>
    );
};

export default PaymentsPage;
