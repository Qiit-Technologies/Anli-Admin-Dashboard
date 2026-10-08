import Image from 'next/image';
import type { VendorMetrics } from '@/types/vendor';

interface VendorMetricsProps {
    metrics: VendorMetrics;
}

export function VendorMetric({ metrics }: VendorMetricsProps) {
    const metricCards = [
        {
            title: 'Total Number of Vendors',
            value: metrics.totalVendors.toLocaleString(),
            change: metrics.totalVendorsChange,
            isPositive: metrics.totalVendorsChange > 0,
            chartColor: 'green',
            src: '/up.png',
        },
        {
            title: 'Blacklist Vendor',
            value: metrics.blacklistedVendors.toLocaleString(),
            change: Math.abs(metrics.blacklistedChange),
            isPositive: metrics.blacklistedChange < 0,
            chartColor: 'red',
            src: '/down.png',
        },
        {
            title: 'Active now',
            value: metrics.activeVendors.toLocaleString(),
            change: metrics.activeChange,
            isPositive: metrics.activeChange > 0,
            chartColor: 'green',
            src: '/up.png',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metricCards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                >
                    <div className="flex justify-between items-end mb-4">
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-2">
                                {card.title}
                            </h3>
                            <p className="text-3xl font-bold text-gray-900">
                                {card.value}
                            </p>
                            <div className="flex items-center mt-2">
                                <span
                                    className={`text-sm ${card.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}
                                >
                                    {card.isPositive ? '↗' : '↘'}{' '}
                                    {card.change}% vs last month
                                </span>
                            </div>
                        </div>
                        <div className="w-20 h-12">
                            <Image
                                src={card.src}
                                alt={`${card.title} chart`}
                                width={80}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
