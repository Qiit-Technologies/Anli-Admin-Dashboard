'use client';
import { getOrderByType } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import FoodMenuComponent from '@/components/front-of-house/FoodMenu';
import AreaSelectionModal from '@/components/front-of-house/AreaSelectionModal';
import OrderForm, {
    OrderFormData,
} from '@/components/front-of-house/OrderForm';
import PostedBillsPreviewModal from '@/components/front-of-house/report/PostedBillsPreviewModal';
import {
    roomServiceColumns,
    roomServiceFilters,
} from '@/components/front-of-house/tables/columns/RoomService';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useSteps } from '@/hooks/useSteps';
import useOrderStore from '@/store/useOrder';
import { Loader2, Plus, Printer } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';
import { useSocket } from '@/hooks/useSocket';

const CreateRoomServiceOrder = ({
    handleSubmit,
    handleAreaSelect,
    isAreaModalOpen,
    setIsAreaModalOpen,
    isOrderModalOpen,
    setIsOrderModalOpen,
    selectedArea,
}: {
    handleSubmit: (data: OrderFormData) => void;
    handleAreaSelect: (area: any) => void;
    isAreaModalOpen: boolean;
    setIsAreaModalOpen: (open: boolean) => void;
    isOrderModalOpen: boolean;
    setIsOrderModalOpen: (open: boolean) => void;
    selectedArea: any;
}) => {
    return (
        <PermissionGate
            permissions={[
                PERMISSIONS.CREATE_NEW_ORDER,
                PERMISSIONS.VIEW_ROOM_SERVICE,
            ]}
            permissionType="any"
            blockType="modal"
        >
            <>
                <Button
                    className="bg-orion-blue"
                    onClick={() => setIsAreaModalOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    Room Service Order
                </Button>

                <AreaSelectionModal
                    isOpen={isAreaModalOpen}
                    onClose={() => setIsAreaModalOpen(false)}
                    onSelect={(area) => {
                        handleAreaSelect(area);
                        setIsAreaModalOpen(false);
                        setIsOrderModalOpen(true);
                    }}
                />

                <Dialog
                    open={isOrderModalOpen}
                    onOpenChange={setIsOrderModalOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <OrderForm
                                variant="room"
                                initialData={{
                                    dineInArea: selectedArea,
                                }}
                                onSubmit={(data) => {
                                    handleSubmit({
                                        ...data,
                                        dineInArea: selectedArea,
                                    });
                                    setIsOrderModalOpen(false);
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        </PermissionGate>
    );
};

const RoomServicePage = ({ onOrder }: { onOrder: () => void }) => {
    const [showPostedBills, setShowPostedBills] = useState(false);
    const [postedBillsBusinessDate, setPostedBillsBusinessDate] = useState<string>('');
    const [postedBillsWorkPeriodId, setPostedBillsWorkPeriodId] = useState<number | undefined>(undefined);

    const {
        data: fetchedOrders,
        error,
        isLoading,
    } = useSWR('/orders/order-type?=ROOM', () => getOrderByType('ROOM'), {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError: (err) => {
            console.error('Error fetching room service orders:', err);
            toast.custom(() => (
                <Toast
                    type="error"
                    title="Error Fetching Room Service Orders"
                    description="An error occurred while fetching room service orders."
                />
            ));
        },
    });

    useSocket((event) => {
        if (event === 'order-update' || event === 'work-period-update') {
            mutate('/orders/order-type?=ROOM');
        }
    });

    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<any>(null);

    const fetchedOrdersData = fetchedOrders?.data || [];

    const { order, setOrder } = useOrderStore();

    const handleSubmit = (data: OrderFormData) => {
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
            orderType: 'ROOM',
            room: data.room,
            dineInArea: data.dineInArea,
            waiter: data.waiter,
            totalAmount: order.totalAmount,
            guestName: data.guestName,
            guestEmail: data.guestEmail,
            phoneNumber: data.phoneNumber,
            bookingDate: formattedDate,
            bookingTime: time,
        });
        onOrder();
    };

    if (error) {
        return <div>Failed to load orders</div>;
    }

    return (
        <PageWrapper
            permissions={[
                PERMISSIONS.VIEW_ALL_PAGE,
                PERMISSIONS.VIEW_ROOM_SERVICE,
            ]}
        >
            <PageHeader>
                <PageHeadertitle
                    title="Room Service"
                    subtitle={'Room Services Management'}
                />
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPostedBills(true)}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Posted Bills
                    </Button>
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
                        columns={roomServiceColumns}
                        data={fetchedOrdersData || []}
                        filters={roomServiceFilters}
                        extend={
                            <CreateRoomServiceOrder
                                handleSubmit={handleSubmit}
                                handleAreaSelect={setSelectedArea}
                                isAreaModalOpen={isAreaModalOpen}
                                setIsAreaModalOpen={setIsAreaModalOpen}
                                isOrderModalOpen={isOrderModalOpen}
                                setIsOrderModalOpen={setIsOrderModalOpen}
                                selectedArea={selectedArea}
                            />
                        }
                    />
                </div>
            )}
            <PostedBillsPreviewModal
                isOpen={showPostedBills}
                onClose={() => setShowPostedBills(false)}
                businessDate={postedBillsBusinessDate || undefined}
                workPeriodId={postedBillsWorkPeriodId}
                data={fetchedOrdersData}
            />
        </PageWrapper>
    );
};
const ParcelRoomServicePage = () => {
    const { currentStepIndex, next, back, reset } = useSteps();

    const steps = useMemo(
        () => [
            {
                label: 'Room Service',
                component: <RoomServicePage onOrder={next} />,
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

export default ParcelRoomServicePage;
