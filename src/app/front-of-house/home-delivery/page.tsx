'use client';
import { getHomeDeliveryStats, getOrderByType } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { IncomingOrdersStatCard } from '@/components/front-of-house/common/cards/StatsCard';
import FoodMenuComponent from '@/components/front-of-house/FoodMenu';
import HomeDeliveryForm from '@/components/front-of-house/HomeDeliveryForm';
import AreaSelectionModal from '@/components/front-of-house/AreaSelectionModal';

import {
    homeDeliveryColumns,
    homeDeliveryFilters,
} from '@/components/front-of-house/tables/columns/HomeDelivery';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { useSteps } from '@/hooks/useSteps';
import { StatProps } from '@/types';
import { Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import useOrderStore from '@/store/useOrder';

const HomeDeliveryPage = ({ openOrder }: { openOrder: () => void }) => {
    const { data: fetchedOrders, isLoading } = useSWR(
        '/orders/order-type?=DELIVERY',
        () => getOrderByType('DELIVERY'),
    );

    const { data: orderStat } = useSWR(
        '/orders/order-type?=DELIVERY/stats',
        getHomeDeliveryStats,
    );
    const orders = fetchedOrders?.data || [];
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const { order, setOrder } = useOrderStore();

    const handleAreaSelect = (area: any) => {
        setOrder({
            ...order,
            dineInArea: area,
            orderType: 'DELIVERY',
        });
        setIsAreaModalOpen(false);
        openOrder();
    };

    return (
        <PageWrapper permissions={[PERMISSIONS.VIEW_HOME_DELIVERY_ORDERS]}>
            <PageHeader>
                <PageHeadertitle
                    title="Home Delivery Service"
                    subtitle={`All delivery for today`}
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
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
            {isLoading ? (
                <div className="w-full mt-20 h-[50vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand w-12 h-12" />
                </div>
            ) : (
                <div>
                    <CustomTable
                        columns={homeDeliveryColumns}
                        data={orders}
                        filters={homeDeliveryFilters}
                        extend={
                            <>
                                <Button
                                    onClick={() => setIsAreaModalOpen(true)}
                                    className="bg-orion-blue"
                                >
                                    <Plus className="w-4 h-4" />
                                    Home Delivery Order
                                </Button>
                                <AreaSelectionModal
                                    isOpen={isAreaModalOpen}
                                    onClose={() => setIsAreaModalOpen(false)}
                                    onSelect={handleAreaSelect}
                                />
                            </>
                        }
                    />
                </div>
            )}
        </PageWrapper>
    );
};

const HomeDeliveryServicePage = () => {
    const { currentStepIndex, next, back, reset } = useSteps();

    const steps = useMemo(
        () => [
            {
                label: 'Take Away Service Page',
                component: <HomeDeliveryPage openOrder={next} />,
            },
            {
                label: 'Home Delivery Form',
                component: <HomeDeliveryForm onSubmit={next} goBack={back} />,
            },
            {
                label: 'Food Menu',
                component: (
                    <FoodMenuComponent onOrderComplete={reset} goBack={back} />
                ),
            },
        ],
        [back, next, reset],
    );
    return <>{steps[currentStepIndex]?.component}</>;
};

export default HomeDeliveryServicePage;
