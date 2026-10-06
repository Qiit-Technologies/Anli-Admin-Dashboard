/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { getOrderById } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SplitComponent from '@/components/front-of-house/SplitComponent';
import { Button } from '@/components/ui/button';
import useOrderStore from '@/store/useOrder';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect, useState } from 'react';

const SplitOrder = () => {
    const { orderId } = useParams();
    const router = useRouter();
    const order = useOrderStore((state) => state.order);
    const setOrder = useOrderStore((state) => state.setOrder);
    const clearOrder = useOrderStore((state) => state.clearOrder);
    const [referrer, setReferrer] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await getOrderById(Number(orderId));
            if (response.data && response.data.items) {
                const formattedItems = (response.data.items as any).map(
                    (item: any) => ({
                        // Preserve original OrderItem ID for backend relations
                        id: item.id,
                        orderItemId: item.id,
                        // Keep menu item reference separately for UI if needed
                        menuItemId: item.menuItem?.id,
                        name: item.name || item.menuItem?.name,
                        price: item.price,
                        quantity: item.quantity,
                        notes: item.notes,
                    }),
                );

                const formatedOrder = {
                    ...response.data,
                    requestId: response.data.id,
                    items: formattedItems,
                };

                response.data = formatedOrder;
            }
            setOrder(response.data);
        } catch (error: any) {
            console.error('Failed to fetch order:', error);
        }
    }, [orderId, setOrder]);

    useEffect(() => {
        if (orderId) {
            clearOrder();
            fetchOrder();
        }
    }, [orderId, clearOrder, fetchOrder]);

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

    const handleConfirmSplit = () => {
        clearOrder();
        router.push(referrer || '/front-of-house/incoming-orders');
    };

    if (!order || !order.id) {
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
                        <PageHeadertitle title={`Split Order #${orderId}`} />
                    </div>
                </PageHeader>
                <div>Loading order...</div>
            </PageWrapper>
        );
    }

    const orderForSplit = {
        ...order,
        id: order.id,
        items: order.items || [],
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
                    <PageHeadertitle title={`Split Order #${orderId}`} />
                </div>
            </PageHeader>
            <SplitComponent
                order={orderForSplit}
                onConfirmSplit={handleConfirmSplit}
            />
        </PageWrapper>
    );
};

export default SplitOrder;
