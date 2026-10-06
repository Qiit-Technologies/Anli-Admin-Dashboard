'use client';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { Button as DialogButton } from '@/components/ui/button';

import { getKitchenOrders, getKitchenOrderStats } from '@/app/actions/kitchen';
import PageWrapper from '@/components/common/PageWrapper';
import { IncomingOrdersStatCard } from '@/components/front-of-house/common/cards/StatsCard';
import { kotOverviewFilters } from '@/components/front-of-house/tables/columns/KotOverview';
import { KDSOverviewColumns } from '@/components/kitchen/tables/columns/KDS';
import { StatProps } from '@/types';
import { Button } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import useAlarm, { unlockAlarmAudio } from '@/hooks/useAlarm';
import { useNewOrderBanner } from '@/hooks/useNewOrderBanner';
import { NewOrderBanner } from '@/components/front-of-house/common/NewOrderBanner';
import { PrinterStatusCard } from '@/components/print/PrinterStatusCard';
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

const KOTOverviewPage = () => {
    const router = useRouter();
    const [dialog, setDialog] = useState(false);

    const searchParams = useSearchParams();
    const kitchenId = searchParams.get('kitchen');

    const { data: orders } = useSWR(
        ['/orders/order-type?=KITCHEN', kitchenId],
        () => getKitchenOrders(kitchenId || ''),
        {
            refreshInterval: 2000,
            revalidateOnFocus: true,
            refreshWhenHidden: true,
        },
    );

    const { data: kitchensData } = useSWR('/kitchen', getKitchens);
    const kitchens = kitchensData?.data;

    const { data: orderStat } = useSWR(
        ['/orders/order-type?=KITCHEN/stat', kitchenId],
        () => getKitchenOrderStats(kitchenId || ''),
    );

    const currentKitchen = kitchens?.find(
        (kitchen: { id: number }) => kitchen.id === Number(kitchenId),
    );

    // useEffect(() => {
    //     if (kitchens && !kitchenId) setDialog(true);
    // }, [kitchens]);

    useAlarm(orders?.data, {
        soundPath: '/sounds/doorbell.mp3',
        volume: 0.3,
        playOnInitialLoad: false,
        playOnIncrease: true,
    });

    const { showBanner, newOrders, dismiss } = useNewOrderBanner(orders?.data);

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
                            title={`KDS Overview ${currentKitchen?.name ? `(${currentKitchen?.name})` : ''}`}
                            subtitle={'KDS Management'}
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
                        const isNegative =
                            stat.previousValue > stat.currentValue;
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
        </>
    );
};

export default KOTOverviewPage;
