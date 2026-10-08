'use client';
import { getKitchenOrderHistory } from '@/app/actions/kitchen';
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
import { getKitchens } from '@/app/actions/back-of-house';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'nextjs-toploader/app';
import { useSearchParams } from 'next/navigation';
import { Button as DialogButton } from '@/components/ui/button';

const OrderHistoryPage = () => {
    const router = useRouter();
    const [dialog, setDialog] = useState(false);

    const searchParams = useSearchParams();
    const kitchenId = searchParams.get('kitchen');

    const { data: kitchensData } = useSWR('/kitchen', getKitchens);
    const kitchens = kitchensData?.data;

    const { data: orders } = useSWR('/orders/kitchen-history', () =>
        getKitchenOrderHistory(kitchenId || ''),
    );

    const currentKitchen = kitchens?.find(
        (kitchen: { id: number }) => kitchen.id === Number(kitchenId),
    );

    // useEffect(() => {
    //     if (kitchens && !kitchenId) setDialog(true);
    // }, [kitchens]);

    return (
        <>
            <Dialog open={dialog} onOpenChange={setDialog}>
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="flex justify-center items-center">
                                {/* {itemOrderRejectedIllustration} */}
                            </span>
                        </DialogTitle>
                        <div className="flex flex-col ">
                            <h1 className="text-center text-lg font-semibold">
                                Select a Kitchen
                            </h1>
                            <DialogDescription className="text-center text-sm text-muted-foreground">
                                Select a kitchen to view
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="flex items-cente mt-4 flex-wrap gap-3 justify-between">
                        <div
                            onClick={() => {
                                setDialog(false);
                                router.push(
                                    `/kitchen/kds-overview?kitchen=none`,
                                );
                            }}
                            className="w-[47%] rounded-sm border border-gray-400 py-3 px-4 cursor-pointer"
                        >
                            <p className="text-center font-semibold text-lg">
                                General Kitchen
                            </p>
                            <p className="text-center font-normal text-md">
                                Orders coming from room service, take away and
                                home delivery
                            </p>
                        </div>
                        <div
                            onClick={() => {
                                setDialog(false);
                                router.push(`/kitchen/kds-overview`);
                            }}
                            className="w-[47%] rounded-sm border border-gray-400 py-3 px-4 cursor-pointer"
                        >
                            <p className="text-center font-semibold text-lg">
                                All Kitchen
                            </p>
                            <p className="text-center font-normal text-md">
                                Orders coming from all kitchens combined
                            </p>
                        </div>
                        {kitchens?.map(
                            (kitchen: {
                                name: string;
                                description: string;
                                id: number;
                            }) => (
                                <div
                                    onClick={() => {
                                        setDialog(false);
                                        router.push(
                                            `/kitchen/kds-overview?kitchen=${kitchen?.id}`,
                                        );
                                    }}
                                    key={kitchen?.id}
                                    className="w-[47%] rounded-sm border border-gray-400 py-3 px-4 cursor-pointer"
                                >
                                    <p className="text-center font-semibold text-lg">
                                        {kitchen?.name}
                                    </p>
                                    <p className="text-center font-normal text-md">
                                        {kitchen?.description}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <PageWrapper>
                <PageHeader>
                    <div className="mr-auto flex items-center">
                        <PageHeadertitle
                            title={`Order History (${currentKitchen?.name ? currentKitchen?.name : ''})`}
                            subtitle={`Order History Management`}
                        />

                        <DialogButton
                            onClick={() => setDialog(true)}
                            className="ml-2 bg-orion-blue text-white"
                        >
                            Change Kitchen
                        </DialogButton>
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
        </>
    );
};

export default OrderHistoryPage;
