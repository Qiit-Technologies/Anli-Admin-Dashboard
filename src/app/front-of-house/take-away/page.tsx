'use client';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { getOrderByType } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import FoodMenuComponent from '@/components/front-of-house/FoodMenu';
import AreaSelectionModal from '@/components/front-of-house/AreaSelectionModal';
import {
    takeAwayColumns,
    takeAwayFilters,
} from '@/components/front-of-house/tables/columns/TakeAway';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { useSteps } from '@/hooks/useSteps';
import useOrderStore from '@/store/useOrder';
import { Loader2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const TakeAwayPage = ({ onOrder }: { onOrder: () => void }) => {
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

    const {
        data: fetchedOrders,
        isLoading,
        error,
    } = useSWR(
        '/orders/order-type?=TAKE_AWAY',
        () => getOrderByType('TAKE_AWAY'),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        },
    );

    const fetchedOrdersData = fetchedOrders?.data || [];
    const { order, setOrder } = useOrderStore();

    const handleAreaSelect = (area: any) => {
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
            orderType: 'TAKE_AWAY',
            dineInArea: area,
            bookingDate: formattedDate,
            bookingTime: time,
        });

        setIsAreaModalOpen(false);
        onOrder();
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Take Away"
                    subtitle={'Manage your take away orders'}
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
                        columns={takeAwayColumns}
                        data={fetchedOrdersData ?? []}
                        filters={takeAwayFilters}
                        extend={
                            <PermissionGate
                                permissions={[
                                    PERMISSIONS.CREATE_NEW_ORDER,
                                    PERMISSIONS.VIEW_TAKEAWAY_ORDERS,
                                ]}
                                permissionType="all"
                                blockType="modal"
                            >
                                <>
                                    <Button
                                        className="bg-orion-blue"
                                        onClick={() => setIsAreaModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Take Away
                                    </Button>
                                    <AreaSelectionModal
                                        isOpen={isAreaModalOpen}
                                        onClose={() =>
                                            setIsAreaModalOpen(false)
                                        }
                                        onSelect={handleAreaSelect}
                                    />
                                </>
                            </PermissionGate>
                        }
                    />
                </div>
            )}
        </PageWrapper>
    );
};

const TakeAwayServicePage = () => {
    const { currentStepIndex, next, back, reset } = useSteps();

    const steps = useMemo(
        () => [
            {
                label: 'Take Away Service Page',
                component: <TakeAwayPage onOrder={next} />,
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

export default TakeAwayServicePage;
