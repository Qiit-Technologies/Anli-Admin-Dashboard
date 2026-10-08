import { getComplimentOrderStats } from '@/app/actions/order';
import React from 'react';
import useSWR from 'swr';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount);

const StatBox = () => {
    const { data: ordersStats } = useSWR(
        '/orders/compliment-stat',
        getComplimentOrderStats,
    );
    const stats = ordersStats?.data;
    const summary = stats?.summary;

    const statsToShow = [
        {
            title: 'Total Complimentary Orders',
            detail: summary?.totalComplimentaryOrders ?? stats?.orderNumbers ?? 0,
            bg: '#FEFAFA',
            icon: '/assets/images/compliment-stat3.png',
        },
        {
            title: 'Total Complimentary Value (₦)',
            detail: formatCurrency(
                summary?.totalComplimentaryValue ?? stats?.orderItemsSum ?? 0,
            ),
            bg: '#F6FCFF',
            icon: '/assets/images/compliment-stat1.png',
        },
        {
            title: 'Average Complimentary Value',
            detail: formatCurrency(
                summary?.totalComplimentaryOrders
                    ? (summary.totalComplimentaryValue ?? 0) /
                          summary.totalComplimentaryOrders
                    : (stats?.orderItemsAverage ?? 0),
            ),
            bg: '#F3F7FF',
            icon: '/assets/images/compliment-stat2.png',
        },
    ];

    return (
        <div>
            <div className="flex justify-center items-center mx-auto gap-6">
                {statsToShow?.map((stat) => (
                    <div
                        key={stat.title}
                        className={`w-full max-w-[345.33px] h-[132px] gap-4 p-6 rounded-lg border border-[#EAECF0] opacity-100`}
                        style={{ background: stat.bg }}
                    >
                        <div className="flex gap-2">
                            <img src={stat.icon} className="w-6 h-6" alt="" />
                            <p className="font-medium text-[14px] leading-5 text-[#667085]">
                                {stat.title}
                            </p>
                        </div>

                        <p className="mt-3 font-semibold text-[32px] leading-[44px] color-[#101828]">
                            {stat?.detail}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatBox;
