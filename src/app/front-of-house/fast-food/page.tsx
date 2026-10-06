'use client';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { getOrderByType } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import FoodMenuComponent from '@/components/front-of-house/FoodMenu';
import {
    fastFoodColumns,
    fastFoodFilters,
} from '@/components/front-of-house/tables/columns/FastFood';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/useSocket';
import { useSteps } from '@/hooks/useSteps';
import useOrderStore from '@/store/useOrder';
import { Loader2, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';
const FastFoodPage = ({ onOrder }: { onOrder: () => void }) => {
    const {
        data: fetchedOrders,
        isLoading,
        error,
    } = useSWR(
        '/orders/order-type?=FAST_FOOD',
        () => getOrderByType('FAST_FOOD'),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        },
    );

    useSocket((event) => {
        if (event === 'order-update' || event === 'work-period-update') {
            mutate('/orders/order-type?=FAST_FOOD');
        }
    });

    if (error) {
        console.error('Error fetching orders:', error);
    }

    const fetchedOrdersData = fetchedOrders?.data || [];

    const { data: dineAreasResponse } = useSWR(
        '/dine-in/areas',
        getDineInAreas,
        {
            revalidateOnFocus: false,
        },
    );
    const dineAreasData = dineAreasResponse?.data || [];

    const dynamicFastFoodFilters = useMemo(() => {
        return fastFoodFilters.map((filter) => {
            if (filter.id === 'orderType') {
                return {
                    ...filter,
                    subFilters: [
                        {
                            triggerValue: 'DINE_IN',
                            filter: {
                                id: 'dineInAreaId',
                                label: 'Dine Area',
                                options: dineAreasData.map((area: any) => ({
                                    value: String(area.id),
                                    label: area.name,
                                })),
                            },
                        },
                    ],
                };
            }
            return filter;
        });
    }, [dineAreasData]);

    const { order, setOrder } = useOrderStore();
    const handleSubmit = () => {
        const date = new Date();
        const time = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        setOrder({
            ...order,
            orderType: 'FAST_FOOD',
            bookingDate: formattedDate,
            bookingTime: time,
        });
        onOrder();
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Fast Food"
                    subtitle={'Manage your fast food orders'}
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            {isLoading ? (
                <div className="w-full mt-20 h-[50vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand w-12 h-12" />
                </div>
            ) : (
                <div>
                    <CustomTable
                        columns={fastFoodColumns}
                        data={fetchedOrdersData ?? []}
                        filters={dynamicFastFoodFilters}
                        columnDisplay={{
                            label: 'Show',
                            options: [
                                {
                                    value: 'guestName',
                                    columnId: 'guestName',
                                    label: 'Guest Name',
                                },
                                {
                                    value: 'totalAmount',
                                    columnId: 'totalAmount',
                                    label: 'Price',
                                },
                            ],
                            defaultColumnId:
                                (typeof window !== 'undefined' &&
                                    localStorage.getItem(
                                        'fastFoodDisplayColumn',
                                    )) ||
                                'guestName',
                            onChange: (columnId) => {
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem(
                                        'fastFoodDisplayColumn',
                                        columnId,
                                    );
                                }
                            },
                        }}
                        extend={
                            <PermissionGate
                                permissions={[
                                    PERMISSIONS.CREATE_NEW_ORDER,
                                    PERMISSIONS.VIEW_FAST_FOOD,
                                ]}
                                permissionType="all"
                                blockType="modal"
                            >
                                <Button
                                    onClick={() => handleSubmit()}
                                    className="bg-orion-blue"
                                >
                                    <Plus className="w-4 h-4" />
                                    Fast Food
                                </Button>
                            </PermissionGate>
                        }
                    />
                </div>
            )}
        </PageWrapper>
    );
};

const FastFoodServicePage = () => {
    const { currentStepIndex, next, back, reset } = useSteps();

    const steps = useMemo(
        () => [
            {
                label: 'Fast Food Service Page',
                component: <FastFoodPage onOrder={next} />,
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
    return <>{steps[currentStepIndex].component}</>;
};

export default FastFoodServicePage;
