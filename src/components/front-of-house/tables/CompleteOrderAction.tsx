'use client';
import BrandButton from '@/components/common/Button';
import { ItemsTable } from '@/components/common/ItemsTable';
import { ItemOrderWithUpdateAction } from '@/components/common/table/column/ItemOrder';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import useHotel from '@/hooks/useHotel';
import { ScopedOrder } from '../types';
import BarAction from './BarAction';

interface Props {
    order: ScopedOrder;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}
const CompleteOrderSection = ({ order, isOpen, onToggle }: Props) => {
    const [showContent, setShowContent] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const open = isOpen ?? showContent;
    const { organization } = useHotel();
    const restaurantVatInclusive = organization?.restaurantVatInclusive ?? false;
    const restaurantServiceChargeInclusive = organization?.restaurantServiceChargeInclusive ?? false;
    const restaurantTipInclusive = organization?.restaurantTipInclusive ?? false;
    const restaurantCustomChargesInclusive = organization?.restaurantCustomChargesInclusive ?? false;

    const allItemsReady = useMemo(() => {
        const items = order?.items || [];
        if (items.length === 0) return false;
        return items.every((item) => item.isReady === true);
    }, [order?.items]);

    return (
        <div className="mt-4">
            <PermissionGate
                blockType="modal"
                permissions={[PERMISSIONS.SETTLE_BILL]}
            >
                <div
                    title={
                        allItemsReady
                            ? 'All items are already marked as ready'
                            : undefined
                    }
                >
                    <BrandButton
                        className="w-full h-12"
                        onClick={() =>
                            onToggle
                                ? onToggle(!open)
                                : setShowContent(!showContent)
                        }
                        disabled={allItemsReady}
                    >
                        {open
                            ? 'Hide Order'
                            : allItemsReady
                              ? 'All Items Ready'
                              : 'Settle Order'}
                    </BrandButton>
                </div>
            </PermissionGate>

            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={sectionRef}
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div>
                            <h1 className="mt-4">
                                Settle Order - BAR and KITCHEN
                            </h1>
                            <span className="text-sm text-muted-foreground">
                                Complete order from bar and kitchen to settle
                                books
                            </span>
                        </div>
                        <div className="mt-4">
                            {(() => {
                                const rawSubtotal =
                                    order.subtotal ??
                                    Math.max(
                                        Number(order.totalPrice ?? 0) -
                                            Number(order.vatAmount ?? 0),
                                        0,
                                    );
                                const vatAmount = Number(order.vatAmount ?? 0);
                                const vatRate = Number(
                                    order.vatRateSnapshot ??
                                        (order?.hotel as any)?.restaurantVatRate ??
                                        order?.hotel?.vatRate ??
                                        0,
                                );
                                const serviceChargeAmount = Number(
                                    order.serviceChargeAmount ?? 0,
                                );
                                const serviceChargeRate = Number(
                                    order.serviceChargeRateSnapshot ??
                                        (order?.hotel as any)?.restaurantServiceChargeRate ??
                                        order?.hotel?.serviceChargeRate ??
                                        0,
                                );
                                const tipAmount = Number(order.tipAmount ?? 0);
                                const tipRate = Number(
                                    order.tipRateSnapshot ??
                                        (order?.hotel as any)?.restaurantTipRate ??
                                        order?.hotel?.tipRate ??
                                        0,
                                );
                                const showVat = vatAmount > 0.009 && !restaurantVatInclusive;
                                const showServiceCharge =
                                    serviceChargeAmount > 0.009 && !restaurantServiceChargeInclusive;
                                const showTip = tipAmount > 0.009 && !restaurantTipInclusive;
                                const showSubtotal =
                                    showVat ||
                                    showServiceCharge ||
                                    showTip ||
                                    (order.subtotal !== undefined &&
                                        order.subtotal !== null);
                                const breakdownRows = [];
                                if (showSubtotal) {
                                    breakdownRows.push({
                                        label: 'Subtotal',
                                        value: rawSubtotal,
                                    });
                                }
                                if (showVat) {
                                    breakdownRows.push({
                                        label: `VAT (${vatRate.toFixed(2)}%)`,
                                        value: vatAmount,
                                    });
                                }
                                if (showServiceCharge) {
                                    breakdownRows.push({
                                        label: `Service Charge (${serviceChargeRate.toFixed(2)}%)`,
                                        value: serviceChargeAmount,
                                    });
                                }
                                if (showTip) {
                                    breakdownRows.push({
                                        label: `Tip (${tipRate.toFixed(2)}%)`,
                                        value: tipAmount,
                                    });
                                }
                                return (
                                    <ItemsTable
                                        items={(order?.items || []).map(
                                            (item) => ({
                                                id: `${item.id}`,
                                                name:
                                                    item?.menuItem?.name || '',
                                                quantity: item?.quantity,
                                                price: Number(item.price),
                                                isReady: item.isReady,
                                            }),
                                        )}
                                        showTotal={true}
                                        columns={ItemOrderWithUpdateAction}
                                        totalValue={Number(
                                            order.totalPrice ?? 0,
                                        )}
                                        currencyPrefix="₦"
                                        breakdownRows={breakdownRows}
                                    />
                                );
                            })()}
                            <BarAction order={order} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompleteOrderSection;
