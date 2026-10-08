'use client';
import { getOrderHistory } from '@/app/actions/order';
import {
    getWorkPeriodById,
    getActiveWorkPeriod,
} from '@/app/actions/work-period';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import {
    FOHOrdersColumn,
    FOHOrdersFilters,
} from '@/components/front-of-house/tables/columns/FOHOrderHistory';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import ControlSheetButton from '@/components/ControlSheetButton';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import { differenceInMinutes, format } from 'date-fns';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React from 'react';

const formatDuration = (start: Date, end: Date | null) => {
    const reference = end ?? new Date();
    const totalMinutes = differenceInMinutes(reference, start);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

const OrderHistoryPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const workPeriodId = searchParams.get('workPeriodId');
    const highlightOrderId = searchParams.get('highlightOrderId');

    const { data: period } = useSWR(
        workPeriodId ? `/restaurants/work-period/${workPeriodId}` : null,
        () => getWorkPeriodById(workPeriodId!),
    );

    const { data: activePeriod } = useSWR(
        workPeriodId ? null : '/restaurants/work-period/active',
        () => getActiveWorkPeriod(),
    );

    const { data: orders } = useSWR(
        workPeriodId
            ? `/orders/order-history?workPeriodId=${workPeriodId}`
            : '/orders/order-history',
        () => getOrderHistory(workPeriodId),
    );

    const periodData = period?.data;
    const isLoadingPeriod = !period && workPeriodId;

    let areaLabel = '—';
    let startDate = '—';
    let startTime = '—';
    let endDate: string | null = '—';
    let duration = '—';
    let status: string | null = null;

    if (periodData) {
        const start = new Date(periodData.startTime);
        const end = periodData.endTime ? new Date(periodData.endTime) : null;
        areaLabel =
            periodData.areaType === 'FAST_FOOD'
                ? 'Fast Food'
                : periodData.dineInArea?.name || 'Dine Area';
        startDate = format(start, 'MMM d, yyyy');
        startTime = format(start, 'h:mm a');
        endDate = end ? format(end, 'MMM d, yyyy h:mm a') : null;
        duration = formatDuration(start, end);
        status = periodData.isActive ? 'Active' : 'Closed';
    }

    return (
        <PageWrapper
            permissions={[
                PERMISSIONS.VIEW_ORDER_HISTORY,
                PERMISSIONS.VIEW_ALL_PAGE,
            ]}
        >
            <PageHeader>
                <div className="flex flex-col gap-2">
                    <PageHeadertitle
                        title="Order History"
                        subtitle={
                            workPeriodId
                                ? periodData
                                    ? `Work Period #${periodData.id} — ${areaLabel}`
                                    : `Work Period #${workPeriodId}`
                                : 'Order History Management'
                        }
                        hasBack={!!workPeriodId}
                        onBack={() =>
                            router.push('/front-of-house/work-period')
                        }
                    />
                    {workPeriodId && periodData && (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium text-gray-500">
                                Area:
                            </span>
                            <span className="bg-gray-100 rounded-full px-3 py-1 text-gray-700">
                                {areaLabel}
                            </span>
                            <span className="mx-1 text-gray-300">|</span>
                            <span className="font-medium text-gray-500">
                                Start:
                            </span>
                            <span className="bg-gray-100 rounded-full px-3 py-1 text-gray-700">
                                {startDate} {startTime}
                            </span>
                            {endDate && (
                                <>
                                    <span className="mx-1 text-gray-300">|</span>
                                    <span className="font-medium text-gray-500">
                                        End:
                                    </span>
                                    <span className="bg-gray-100 rounded-full px-3 py-1 text-gray-700">
                                        {endDate}
                                    </span>
                                </>
                            )}
                            <span className="mx-1 text-gray-300">|</span>
                            <span className="font-medium text-gray-500">
                                Duration:
                            </span>
                            <span className="bg-gray-100 rounded-full px-3 py-1 text-gray-700">
                                {duration}
                            </span>
                            <span className="mx-1 text-gray-300">|</span>
                            <span className="font-medium text-gray-500">
                                Status:
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 ${status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {status}
                            </span>
                        </div>
                    )}
                    {workPeriodId && isLoadingPeriod && (
                        <div className="text-xs text-muted-foreground">
                            Loading work period details…
                        </div>
                    )}
                </div>
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
                {/* {console.log('OrderHistoryPage orders:', orders)} */}
                <CustomTable
                    columns={FOHOrdersColumn}
                    data={orders?.data ?? []}
                    filters={FOHOrdersFilters}
                    highlightedRowId={highlightOrderId as any}
                    // dateFilter={{
                    //     enabled: true,
                    //     column: 'createdAt',
                    //     label: 'Filter by Date',
                    // }}
                    presetDateFilter={{
                        enabled: !workPeriodId,
                        column: 'createdAt',
                    }}
                    extend={
                        <ControlSheetButton
                            workPeriodId={
                                workPeriodId
                                    ? workPeriodId
                                    : activePeriod?.data?.id
                            }
                            orders={orders?.data ?? []}
                        />
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default OrderHistoryPage;
