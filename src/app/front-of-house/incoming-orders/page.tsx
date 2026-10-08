'use client';

import {
    getAllOrdersToday,
    getReadyOrders,
    getRunningOrders,
    getSettledOrders,
} from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import TabTriggerWithCount, {
    MobileTabSelect,
} from '@/components/front-of-house/common/TabTriggerWithCount';
import {
    incomingOrdersColumn,
    incomingOrdersFilters,
    readyOrdersColumn,
    runningOrdersColumn,
    settledOrdersColumn,
} from '@/components/front-of-house/tables/columns/IncomingOrders';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { useSocket } from '@/hooks/useSocket';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

const swrConfig = {
    refreshInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
};

const IncomingOrdersPage = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'all';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useSocket((event) => {
        if (event === 'work-period-update') {
            mutate('/orders/query/all');
            mutate('/orders/query/running');
            mutate('/orders/query/settled');
            mutate('/orders/query/ready');
        }
    });

    const { data: allOrders } = useSWR(
        '/orders/query/all',
        getAllOrdersToday,
        swrConfig,
    );
    const { data: runningOrders } = useSWR(
        '/orders/query/running',
        getRunningOrders,
        swrConfig,
    );
    const { data: settledOrders } = useSWR(
        '/orders/query/settled',
        getSettledOrders,
        swrConfig,
    );
    const { data: readyOrders } = useSWR(
        '/orders/query/ready',
        getReadyOrders,
        swrConfig,
    );

    const { data: dineAreasResponse } = useSWR(
        '/dine-in/areas',
        getDineInAreas,
        {
            revalidateOnFocus: false,
        },
    );
    const dineAreasData = dineAreasResponse?.data || [];

    const dynamicIncomingFilters = useMemo(() => {
        return incomingOrdersFilters.map((filter) => {
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

    const tabsConfig = useMemo(
        () => [
            {
                value: 'all',
                label: 'All Orders',
                data: allOrders?.data || [],
                columns: incomingOrdersColumn,
            },
            {
                value: 'running',
                label: 'Running Orders',
                data: runningOrders?.data || [],
                columns: runningOrdersColumn,
            },
            {
                value: 'ready',
                label: 'Ready Orders',
                data: readyOrders?.data || [],
                columns: readyOrdersColumn,
            },
            {
                value: 'settled',
                label: 'Settled Orders',
                data: settledOrders?.data || [],
                columns: settledOrdersColumn,
            },
        ],
        [
            allOrders?.data,
            runningOrders?.data,
            readyOrders?.data,
            settledOrders?.data,
        ],
    );

    const mobileTabsData = useMemo(
        () =>
            tabsConfig.map((tab) => ({
                label: tab.label,
                count: tab.data.length,
                value: tab.value,
            })),
        [tabsConfig],
    );

    return (
        <PageWrapper className="px-0">
            <div className="px-8">
                <PageHeader>
                    <PageHeadertitle title="Incoming Orders" />
                    {/* <Button
                        variant="light"
                        isIconOnly
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button> */}
                </PageHeader>
            </div>

            <div className="mt-2 px-4 lg:px-0">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <MobileTabSelect
                        tabs={mobileTabsData}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <TabsList className="hidden sm:flex w-full px-0 justify-start gap-0 bg-transparent border-none h-auto">
                        {tabsConfig.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                className="p-0 bg-transparent data-[state=active]:bg-transparent shadow-none data-[state=active]:shadow-none border rounded-none
                                border-b-2 w-full
                                data-[state=active]:border-b-hexbrand
                                "
                                value={tab.value}
                            >
                                <TabTriggerWithCount
                                    label={tab.label}
                                    count={tab.data.length}
                                    value={tab.value}
                                />
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabsConfig.map((tab) => (
                        <TabsContent
                            key={tab.value}
                            value={tab.value}
                            className="mt-5"
                        >
                            <CustomTable
                                columns={tab.columns}
                                data={tab.data}
                                filters={dynamicIncomingFilters}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </PageWrapper>
    );
};

export default IncomingOrdersPage;
