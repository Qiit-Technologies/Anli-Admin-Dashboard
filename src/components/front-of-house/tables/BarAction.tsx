'use client';
import { getBarOrdersForOrder } from '@/app/actions/bar';
import { ItemsTable } from '@/components/common/ItemsTable';
import { ItemOrderWithUpdateAction } from '@/components/common/table/column/ItemOrder';
import useSWR from 'swr';
import { ScopedOrder } from '../types';

interface ActionProps {
    order: ScopedOrder;
}

const BarAction = ({ order }: ActionProps) => {
    const { data: barOrders } = useSWR(
        order?.id ? `/orders/order-type?type=KOT&orderId=${order.id}` : null,
        () => getBarOrdersForOrder(order.id),
    );

    return (
        <div className="mt-4">
            <div>Bar Orders</div>
            <ItemsTable
                items={(barOrders?.data?.items || []).map((item: any) => ({
                    id: `${item.id}`,
                    name: item?.menuItem?.name || '',
                    quantity: item?.quantity,
                    price: Number(item.price),
                    isReady: item.isReady,
                }))}
                showTotal={false}
                columns={ItemOrderWithUpdateAction}
                totalValue={Number(order.totalPrice)}
            />
        </div>
    );
};

export default BarAction;
