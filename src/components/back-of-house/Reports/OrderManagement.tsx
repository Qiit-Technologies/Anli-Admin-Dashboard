'use client';
import CustomTable from '@/components/common/table/CustomTable';
import { kdsColumn } from '../tables/columns/report/KDSPerformance';
import CollapsibleCard from './components/CollapsibleCard';
import ReportsCard, { ReportsCardProps } from './components/ReportsCard';
import useSWR from 'swr';
import {
    getKDSPerformanceData,
    getOrderManagementMetrics,
} from '@/app/actions/order';

const OrderManagement = () => {
    const { data: kdsStat } = useSWR(
        '/orders/management-metrics',
        getOrderManagementMetrics,
    );

    const { data: kdsData } = useSWR(
        '/orders/kds-performance-data',
        getKDSPerformanceData,
    );
    return (
        <div className="flex w-full h-full flex-col gap-4">
            <CollapsibleCard title="KDS Performance Report">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kdsStat?.data
                        .slice(0, 3)
                        .map((stat: ReportsCardProps, index: number) => (
                            <ReportsCard
                                title={stat.title}
                                value={stat.value}
                                percent={stat.percent}
                                trend={stat.trend}
                                key={index}
                            />
                        ))}
                </div>
                <div className="w-full gap-4">
                    <CustomTable
                        title="Recent KDS Activity"
                        columns={kdsColumn}
                        data={kdsData?.data ?? []}
                        hasHeader
                        hasFilter={false}
                    />
                </div>
            </CollapsibleCard>
        </div>
    );
};

export default OrderManagement;
