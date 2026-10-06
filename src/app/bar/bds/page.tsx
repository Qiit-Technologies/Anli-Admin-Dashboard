'use client';
import { getBarOrders, getBarOrderStats } from '@/app/actions/bar';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { IncomingOrdersStatCard } from '@/components/front-of-house/common/cards/StatsCard';
import { kotOverviewFilters } from '@/components/front-of-house/tables/columns/KotOverview';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { KDSOverviewColumns } from '@/components/kitchen/tables/columns/KDS';
import useAlarm, { unlockAlarmAudio } from '@/hooks/useAlarm';
import { useNewOrderBanner } from '@/hooks/useNewOrderBanner';
import { NewOrderBanner } from '@/components/front-of-house/common/NewOrderBanner';
import { PrinterStatusCard } from '@/components/print/PrinterStatusCard';
import { StatProps } from '@/types';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const BDS = () => {
    const { data: orders } = useSWR(
        '/orders/order-type?=KITCHEN',
        getBarOrders,
        {
            refreshInterval: 2000,
            revalidateOnFocus: true,
        },
    );

    const { data: orderStat } = useSWR(
        '/orders/order-type?=KITCHEN/stat',
        getBarOrderStats,
    );

    useAlarm(orders?.data, {
        soundPath: '/sounds/doorbell.mp3',
        volume: 0.3,
        playOnInitialLoad: false,
        playOnIncrease: true,
    });

    const { showBanner, newOrders, dismiss } = useNewOrderBanner(orders?.data);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Bar Display System (BDS)"
                    subtitle={'Shows real time incoming drinks orders'}
                />
                <div className="ml-auto flex items-center">
                    <Button
                        variant="light"
                        isIconOnly
                        onClick={() => {
                            void unlockAlarmAudio();
                        }}
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <NewOrderBanner
                show={showBanner}
                newOrders={newOrders}
                onDismiss={dismiss}
                className="mb-4"
            />
            <PrinterStatusCard className="mb-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {orderStat?.data?.map((stat: StatProps) => {
                    const isNegative = stat.previousValue > stat.currentValue;
                    const percentageChange = (
                        ((stat.currentValue - stat.previousValue) /
                            stat.previousValue) *
                        100
                    ).toFixed();
                    return (
                        <IncomingOrdersStatCard
                            key={stat.title}
                            title={stat.title}
                            currentValue={stat.currentValue}
                            previousValue={stat.previousValue}
                            percentageChange={
                                isNegative
                                    ? -Number.isFinite(percentageChange)
                                        ? percentageChange
                                        : 0
                                    : Number.isFinite(percentageChange)
                                      ? percentageChange
                                      : 0
                            }
                        />
                    );
                })}
            </div>
            <div>
                <CustomTable
                    columns={KDSOverviewColumns}
                    data={orders?.data ?? []}
                    filters={kotOverviewFilters}
                />
            </div>
        </PageWrapper>
    );
};

export default BDS;
