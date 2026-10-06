'use client';

import { formatDate } from '@/lib/helpers';
import { ScopedOrder } from '../types';
import {
    formatOrderMoney,
    getComplimentaryAmounts,
    getComplimentaryStatus,
    isOrderVoided,
} from '../utils/complimentary';
import ComplimentaryBadge from './ComplimentaryBadge';

export default function ComplimentaryOrderSummary({
    order,
}: {
    order: ScopedOrder;
}) {
    const comp = getComplimentaryAmounts(order);
    const status = getComplimentaryStatus(order);

    if (isOrderVoided(order) || !comp || !status) {
        return null;
    }

    return (
        <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                    Complimentary summary
                </h3>
                <ComplimentaryBadge status={status} />
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Order value</span>
                    <span className="tabular-nums font-medium">
                        {formatOrderMoney(comp.orderValue)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-orange-700">
                    <span>Complimentary</span>
                    <span className="tabular-nums font-medium">
                        -{formatOrderMoney(comp.complimentary)}
                    </span>
                </div>
                {comp.customerPayment > 0 ? (
                    <div className="flex items-center justify-between gap-4 text-emerald-700">
                        <span>Customer payment</span>
                        <span className="tabular-nums font-medium">
                            {formatOrderMoney(comp.customerPayment)}
                        </span>
                    </div>
                ) : null}
                <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
                    <span className="font-semibold text-foreground">
                        {comp.balance > 0 ? 'Balance due' : 'Outstanding balance'}
                    </span>
                    <span className="tabular-nums text-base font-semibold">
                        {formatOrderMoney(comp.balance)}
                    </span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Approved by</span>
                <span className="text-foreground">
                    {order.complimentaryApprovedBy?.fullName ?? '—'}
                </span>
                <span className="text-muted-foreground">PIN override</span>
                <span className="text-foreground">
                    {order.pinOverrideUsed ? 'Yes' : 'No'}
                </span>
                {order.complimentReason ? (
                    <>
                        <span className="text-muted-foreground">Reason</span>
                        <span className="text-foreground">
                            {order.complimentReason}
                        </span>
                    </>
                ) : null}
                {order.complimentaryApprovedAt ? (
                    <>
                        <span className="text-muted-foreground">Approved at</span>
                        <span className="text-foreground">
                            {formatDate(order.complimentaryApprovedAt)}
                        </span>
                    </>
                ) : null}
            </div>
        </div>
    );
}
