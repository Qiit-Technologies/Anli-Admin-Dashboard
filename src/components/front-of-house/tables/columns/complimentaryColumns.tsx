import { ColumnDef } from '@tanstack/react-table';
import ComplimentaryBadge from '../../complimentary/ComplimentaryBadge';
import OrderDiscountBadge, {
    hasOrderDiscount,
} from '../../complimentary/OrderDiscountBadge';
import { ScopedOrder } from '../../types';
import { deriveOrderTotals } from '../../utils';
import {
    formatOrderMoney,
    getComplimentaryStatus,
    getIncomingOrderDisplayAmount,
} from '../../utils/complimentary';

export const complimentaryBadgeColumn: ColumnDef<ScopedOrder> = {
    id: 'complimentaryStatus',
    header: 'Comp',
    meta: {
        cellClassName: 'w-[4.5rem] max-w-[4.5rem] align-middle',
        headerClassName: 'w-[4.5rem] max-w-[4.5rem]',
    },
    cell: ({ row }) => {
        if (
            row.original.isVoided ||
            row.original.status === 'VOIDED' ||
            row.original.paymentStatus === 'VOIDED'
        ) {
            return <span className="text-muted-foreground">—</span>;
        }
        const status = getComplimentaryStatus(row.original);
        if (!status) {
            return <span className="text-muted-foreground">—</span>;
        }
        return <ComplimentaryBadge status={status} compact />;
    },
};

export const discountBadgeColumn: ColumnDef<ScopedOrder> = {
    id: 'discount',
    header: 'Discount',
    meta: {
        cellClassName: 'w-[6.5rem] max-w-[7.5rem] align-middle',
        headerClassName: 'w-[6.5rem] max-w-[7.5rem]',
    },
    cell: ({ row }) => {
        if (
            row.original.isVoided ||
            row.original.status === 'VOIDED' ||
            row.original.paymentStatus === 'VOIDED' ||
            !hasOrderDiscount(row.original)
        ) {
            return <span className="text-muted-foreground">—</span>;
        }
        return <OrderDiscountBadge order={row.original} compact />;
    },
};

/** Single balance/total column for tables — full breakdown lives in the order view sheet. */
export function orderAmountColumn(
    header = 'Amount',
): ColumnDef<ScopedOrder> {
    return {
        id: 'orderAmount',
        accessorKey: 'totalPrice',
        header,
        cell: ({ row }) => {
            if (
                row.original.isVoided ||
                row.original.status === 'VOIDED' ||
                row.original.paymentStatus === 'VOIDED'
            ) {
                return (
                    <span className="whitespace-nowrap tabular-nums font-medium">
                        {formatOrderMoney(0)}
                    </span>
                );
            }

            const status = getComplimentaryStatus(row.original);
            const amount = status
                ? getIncomingOrderDisplayAmount(row.original)
                : deriveOrderTotals(row.original).total;

            return (
                <span className="whitespace-nowrap tabular-nums font-medium">
                    {formatOrderMoney(amount)}
                </span>
            );
        },
    };
}
