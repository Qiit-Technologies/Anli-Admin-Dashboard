'use client';

import { StockMetricCard } from '@/components/stock/common/cards/Report';
import {
    fetchStockMetricsRowOne,
    fetchStockMetricsRowTwo,
} from '@/hooks/fetcher';
import useSWR from 'swr';

export function StockMetricsRowOne() {
    const { data = [], error } = useSWR(
        '/items/stock-metrics-row-one',
        fetchStockMetricsRowOne,
    );

    if (error)
        return <p className="text-red-500">Failed to load stock metrics.</p>;

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.length > 0 ? (
                data.map((metric: any, index: any) => (
                    <StockMetricCard
                        key={index}
                        title={metric.title}
                        subTitle={metric.subTitle}
                        value={metric.value}
                        change={metric.change}
                        changeType={
                            metric.changeType as 'positive' | 'negative'
                        }
                        metricName={metric.metricName}
                        total={metric.total}
                        chartColorIndex={metric.chartColorIndex}
                        valueColor={metric.valueColor}
                    />
                ))
            ) : (
                <p className="text-gray-500">No stock metrics available.</p>
            )}
        </div>
    );
}

export function StockMetricsRowTwo() {
    const { data = [], error } = useSWR(
        '/items/stock-metrics-row-two',
        fetchStockMetricsRowTwo,
    );

    if (error)
        return <p className="text-red-500">Failed to load stock metrics.</p>;

    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
            {data.length > 0 ? (
                data.map((metric: any, index: any) => (
                    <StockMetricCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        change={metric.change}
                        changeType={
                            metric.changeType as 'positive' | 'negative'
                        }
                        metricName={metric.metricName}
                        total={metric.total}
                        chartColorIndex={metric.chartColorIndex}
                        valueColor={metric.valueColor}
                    />
                ))
            ) : (
                <p className="text-gray-500">No stock metrics available.</p>
            )}
        </div>
    );
}
