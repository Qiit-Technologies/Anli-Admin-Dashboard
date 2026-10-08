'use client';

import { getMergeableOrders } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import MergeOrders from '@/components/front-of-house/MergeOrderComponent';
import { ScopedOrder } from '@/components/front-of-house/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';

const MergeOrdersPage = () => {
    const { data: orders } = useSWR('/orders/mergeable', getMergeableOrders);
    const [referrer, setReferrer] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedOrderId = searchParams.get('selectedOrder');

    const mappedOrders = orders?.data?.map((order: ScopedOrder) => ({
        id: order.id.toString(),
        table: order.table?.number ?? 'Table 3',
        items: order.items.map((item) => ({
            id: item.id,
            name: item.menuItem?.name ?? 'Unknown',
            quantity: item.quantity,
            price: Number(item.price),
        })),
        total: Number(order.totalPrice),
        createdAt: order.createdAt,
        orderType: order.orderType,
        orderBy: order.waiter?.fullName || 'Unknown',
        status: order.status,
        paymentStatus: order.paymentStatus,
        guestName: order.guestName,
        guestEmail: order.guestEmail,
    }));

    useEffect(() => {
        const storedReferrer = sessionStorage.getItem('orderReferrer');
        setReferrer(storedReferrer || '/front-of-house/incoming-orders');
    }, []);

    const handleGoBack = useCallback(() => {
        if (referrer) {
            router.push(referrer);
        } else {
            router.back();
        }
    }, [referrer, router]);

    const handleConfirmMerge = () => {
        console.log('Merging orders...');
        // Revalidate SWR caches so the updated order list is shown
        mutate('/orders/mergeable');
        mutate('/orders/query/all');
        mutate('/orders/query/running');
        mutate('/orders/query/ready');
        mutate('/orders/query/settled');
        router.push(referrer || '/front-of-house/incoming-orders');
    };

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2"
                        onClick={handleGoBack}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <PageHeadertitle title={`Merge Orders`} />
                </div>
                <div className="ml-auto flex items-center">
                    <Button
                        size={'icon'}
                        className="ml-4 bg-white rounded-full border text-gray-400"
                    >
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <MergeOrders
                orders={mappedOrders ?? []}
                onConfirmMerge={handleConfirmMerge}
                selectedOrderId={selectedOrderId}
            />
        </PageWrapper>
    );
};

export default MergeOrdersPage;
