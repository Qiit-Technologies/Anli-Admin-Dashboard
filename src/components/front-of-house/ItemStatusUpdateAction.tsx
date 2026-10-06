'use client';
import { markItemAsReady } from '@/app/actions/order';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { mutate } from 'swr';
import Toast from '../toast';

interface Item {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    isReady?: boolean;
}
interface ItemStatusProps {
    item: Item;
    onRefresh?: () => void;
}

const ItemStatusUpdateAction = ({ item, onRefresh }: ItemStatusProps) => {
    const [, setIsReady] = useState(false);

    const handleItemUpdate = async () => {
        setIsReady(true);
        try {
            const response = await markItemAsReady(item.id);
            if ((response as any).data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={` Order item ${item.id} has been mark as ready. `}
                        type="success"
                    />
                ));
                mutate('/orders/order-type?=KOT');
                mutate('/orders/order-type?=KOT/stats');
                mutate('/orders/order-type?=KITCHEN');
                mutate('/orders/order-type?=KITCHEN/stats');
                mutate('/orders/order-history');
                item.isReady = true;

                if (onRefresh) {
                    onRefresh();
                }

                setIsReady(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={` Order item ${item.id} has not been mark as ready. `}
                        type="error"
                    />
                ));
                setIsReady(false);
            }
        } catch (error: any) {
            console.error('Error updating order item:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={` Order item ${item.id} has not been mark as ready. `}
                    type="error"
                />
            ));

            setIsReady(false);
        }
    };

    return (
        <button
            onClick={handleItemUpdate}
            disabled={item.isReady}
            className={`
                text-xs border rounded-md p-2 py-1
                ${
                    item.isReady
                        ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100'
                        : 'text-orion-blue border-orion-blue hover:bg-orion-blue hover:text-white cursor-pointer'
                }
            `}
        >
            {item.isReady ? 'Ready' : 'Mark as Ready'}
        </button>
    );
};
export default ItemStatusUpdateAction;
