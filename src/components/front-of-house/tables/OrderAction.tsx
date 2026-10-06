import { cancelOrder, getOrderById, removeOrderFromBill, updateOrder } from '@/app/actions/order';
import { getOrderInternalAccountBillStatus } from '@/app/actions/internal-accounts-ledger';
import { getSplitBillsByOrder } from '@/app/actions/split-bill';
import { CustomSheet } from '@/components/common/CustomSheet';
import { InputField } from '@/components/common/Form';
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { SimplePrintButton } from '@/components/SimplePrintButton';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useUser } from '@/context/useUser';
import { formatDate } from '@/lib/helpers';
import { Edit, Eye, PlusCircle, X } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import useHotel from '@/hooks/useHotel';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import OrderForm, { OrderFormData } from '../OrderForm';
import PaymentForm from '../PaymentForm';
import { ScopedOrder } from '../types';
import {
    deriveOrderTotals,
    isPaymentStatusAddedToBill,
    isPaymentStatusPaidOrSettled,
} from '../utils';
import {
    getComplimentaryAmounts,
    getComplimentaryStatus,
    getItemDisplayUnitPrice,
    isFullyComplimentaryOrder,
    isOrderVoided,
} from '../utils/complimentary';
import ComplimentaryBadge from '../complimentary/ComplimentaryBadge';
import OrderDiscountBadge, {
    discountOffLabel,
    hasOrderDiscount,
} from '../complimentary/OrderDiscountBadge';
import ComplimentaryOrderSummary from '../complimentary/ComplimentaryOrderSummary';
import { PostedToInternalAccount } from '../PostedToInternalAccount';
import {
    isInternalAccountSettlementApproved,
    isInternalAccountSettlementPending,
    isInternalAccountSettlementRejected,
    isInternalAccountSettlementReversed,
} from '@/lib/internal-accounts/settlement';
import { clearPendingIaPaymentRequest } from '@/lib/internal-accounts/post-bill';
import CompleteOrderSection from './CompleteOrderAction';
import NoCharge from './NoCharge';
import VoidOrder from './VoidOrder';
import OrderDiscount from './OrderDiscount';
import OrderChargeWaiver from './OrderChargeWaiver';

interface OrderActionProps {
    row: ScopedOrder;
    section?: 'history' | 'other';
}
const OrderAction = ({ row }: OrderActionProps) => {
    const router = useRouter();
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [updateDialog, setUpdateDialog] = useState(false);
    const [formData, setFormData] = useState({
        cancelledReason: '',
    });
    const [localPaymentStatus, setLocalPaymentStatus] = useState<string | null>(
        null,
    );
    const [activeActionSection, setActiveActionSection] = useState<
        'settle' | null
    >(null);
    const [paymentFormOpen, setPaymentFormOpen] = useState(false);
    const [sheetOrder, setSheetOrder] = useState<ScopedOrder | null>(null);
    const [removingFromBill, setRemovingFromBill] = useState(false);
    const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

    const handleRemoveFromBill = async () => {
        setConfirmRemoveOpen(false);
        setRemovingFromBill(true);
        try {
            const response = await removeOrderFromBill(order.id);
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Removed from bill"
                        description="You can now collect payment directly from the guest."
                        type="success"
                    />
                ));
                mutate('/orders/query/all');
                mutate('/orders/query/running');
                mutate('/orders/query/settled');
                mutate('/orders/query/ready');
                mutate('order-payment');
                mutate('/checkedInGuests');
                mutate('list-data');
                mutate('/hotelGuests');
                mutate('/accounts/receivables');
                mutate(
                    (key) =>
                        typeof key === 'string' && key.startsWith('/guests'),
                );
                void refreshOrderInSheet();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error || 'Could not remove order from guest bill.'}
                        type="error"
                    />
                ));
            }
        } finally {
            setRemovingFromBill(false);
        }
    };

    const order = sheetOrder ?? row;
    const { data: iaBillStatus } = useSWR(
        open && order.id ? `ia-order-bill-status-${order.id}` : null,
        () => getOrderInternalAccountBillStatus(Number(order.id)),
        { refreshInterval: open ? 8000 : 0 },
    );
    const iaReversed = isInternalAccountSettlementReversed(iaBillStatus?.status);
    const iaRejected = isInternalAccountSettlementRejected(iaBillStatus?.status);
    const iaPending = isInternalAccountSettlementPending(iaBillStatus?.status);
    const iaApproved = isInternalAccountSettlementApproved(iaBillStatus?.status);
    const reopenPaymentAfterIaReversal = iaReversed || iaRejected;
    const isVoidedSheet =
        localPaymentStatus === 'VOIDED' || isOrderVoided(order);
    const effectivePaymentStatus = isVoidedSheet
        ? 'VOIDED'
        : reopenPaymentAfterIaReversal
          ? 'PENDING'
          : (localPaymentStatus ?? order.paymentStatus);
    const effectiveOrderStatus = isVoidedSheet ? 'VOIDED' : order.status;
    const priceTotals = deriveOrderTotals(order);

    const { user, loading: isUserLoading } = useUser();
    const { organization } = useHotel();
    const restaurantVatInclusive = organization?.restaurantVatInclusive ?? false;
    const restaurantServiceChargeInclusive = organization?.restaurantServiceChargeInclusive ?? false;
    const restaurantTipInclusive = organization?.restaurantTipInclusive ?? false;
    const restaurantCustomChargesInclusive = organization?.restaurantCustomChargesInclusive ?? false;
    const currentUserId = user?.id;
    const currentUserRole = user?.roles?.name?.toLowerCase() || '';

    const isCreator = useMemo(() => {
        if (!currentUserId) return false;
        if (!order?.createdBy) return false;
        const createdById =
            typeof order.createdBy === 'object'
                ? order.createdBy.id
                : order.createdBy;
        return Number(createdById) === Number(currentUserId);
    }, [order?.createdBy, currentUserId]);

    const isManagerOrAdmin = useMemo(
        () =>
            currentUserRole === 'administrator' ||
            currentUserRole === 'manager' ||
            currentUserRole === 'general manager',
        [currentUserRole],
    );

    const canDeterminePermissions =
        !isUserLoading && Boolean(currentUserId && order?.createdBy);
    const canModifyItems =
        canDeterminePermissions && (isCreator || isManagerOrAdmin);
    const formatCurrency = (value: number) =>
        `₦${value.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    const vatRateDisplay = Number.isFinite(priceTotals.vatRate)
        ? priceTotals.vatRate
        : 0;
    const serviceChargeRateDisplay = Number.isFinite(
        priceTotals.serviceChargeRate,
    )
        ? priceTotals.serviceChargeRate
        : 0;
    const tipRateDisplay = Number.isFinite(priceTotals.tipRate)
        ? priceTotals.tipRate
        : 0;
    const hasExplicitSubtotal =
        order.subtotal !== undefined && order.subtotal !== null;
    const isRestaurantOrder =
        order.orderType === 'DINE_IN' ||
        order.orderType === 'TAKE_AWAY' ||
        order.orderType === 'DELIVERY';

    const complimentaryStatus = isVoidedSheet
        ? null
        : getComplimentaryStatus(order);
    const complimentaryAmounts = isVoidedSheet
        ? null
        : getComplimentaryAmounts(order);
    const fullyComplimentary = isVoidedSheet
        ? false
        : isFullyComplimentaryOrder(order);
    const lockSplitAndMerge =
        fullyComplimentary ||
        (!reopenPaymentAfterIaReversal &&
            isPaymentStatusPaidOrSettled(effectivePaymentStatus)) ||
        isPaymentStatusAddedToBill(order.paymentStatus) ||
        iaPending ||
        iaApproved;
    const displayTotals = complimentaryAmounts?.bill
        ? {
            subtotal: complimentaryAmounts.bill.subtotal,
            vatAmount: complimentaryAmounts.bill.vatAmount,
            vatRate: complimentaryAmounts.bill.vatRate,
            serviceChargeAmount:
                complimentaryAmounts.bill.serviceChargeAmount,
            serviceChargeRate: complimentaryAmounts.bill.serviceChargeRate,
            tipAmount: complimentaryAmounts.bill.tipAmount,
            tipRate: complimentaryAmounts.bill.tipRate,
            customCharges: complimentaryAmounts.bill.customCharges,
            total: complimentaryAmounts.orderValue,
        }
        : {
            subtotal: priceTotals.subtotal,
            vatAmount: priceTotals.vatAmount,
            vatRate: vatRateDisplay,
            serviceChargeAmount: priceTotals.serviceChargeAmount,
            serviceChargeRate: serviceChargeRateDisplay,
            tipAmount: priceTotals.tipAmount,
            tipRate: tipRateDisplay,
            customCharges: order.customCharges,
            total:
                complimentaryAmounts && complimentaryAmounts.orderValue > 0.009
                    ? complimentaryAmounts.orderValue
                    : Number(
                        (order as { totalWithCustomCharges?: number })
                            .totalWithCustomCharges,
                    ) || priceTotals.total,
        };
    const hasDisplayVat = displayTotals.vatAmount > 0.009;
    const hasDisplayServiceCharge = displayTotals.serviceChargeAmount > 0.009;
    const hasDisplayTip = displayTotals.tipAmount > 0.009;
    const hasDisplaySubtotal =
        hasExplicitSubtotal ||
        hasDisplayVat ||
        hasDisplayServiceCharge ||
        hasDisplayTip ||
        (complimentaryAmounts?.orderValue ?? 0) > 0.009;

    const fields = [
        { label: 'Order type', value: order?.orderType },
        { label: 'Guest name', value: order?.guestName },
        { label: 'Created By', value: order.createdBy?.fullName },
        order.room
            ? { label: 'Room number', value: order.room?.roomNumber }
            : null,
        {
            label: 'Order Status',
            value: effectiveOrderStatus ?? '—',
        },
        {
            label: 'Payment Status',
            value: effectivePaymentStatus ?? '—',
        },
        {
            label: 'Date Requested',
            value: formatDate(order.createdAt),
        },
        hasDisplaySubtotal
            ? {
                label: 'Subtotal',
                value: formatCurrency(displayTotals.subtotal),
            }
            : null,
        hasDisplayVat && !restaurantVatInclusive
            ? {
                label: `VAT (${Number(displayTotals.vatRate).toFixed(2)}%)`,
                value: formatCurrency(displayTotals.vatAmount),
            }
            : null,
        hasDisplayServiceCharge && !restaurantServiceChargeInclusive
            ? {
                label: `Service Charge (${Number(displayTotals.serviceChargeRate).toFixed(2)}%)`,
                value: formatCurrency(displayTotals.serviceChargeAmount),
            }
            : null,
        isRestaurantOrder && hasDisplayTip && !restaurantTipInclusive
            ? {
                label: `Tip (${Number(displayTotals.tipRate).toFixed(2)}%)`,
                value: formatCurrency(displayTotals.tipAmount),
            }
            : null,
        ...(!restaurantCustomChargesInclusive &&
            order.customCharges && order.customCharges.length > 0
            ? order.customCharges.map((charge: any) => ({
                label: `${charge.name} (${Number(charge.rate).toFixed(2)}%)`,
                value: formatCurrency(Number(charge.amount)),
            }))
            : []),
        Number(order.waivedAmount ?? 0) > 0
            ? {
                label: 'Waived Charges',
                value: `-${formatCurrency(Number(order.waivedAmount))}`,
            }
            : null,
        hasOrderDiscount(order)
            ? {
                label: 'Discount',
                value: `-${formatCurrency(Number(order.discountAmount || 0))} (${discountOffLabel(order)})`,
            }
            : null,
        hasOrderDiscount(order) && order.discountReason
            ? {
                label: 'Discount reason',
                value: order.discountReason,
            }
            : null,
        {
            label: 'Total (Incl. VAT)',
            value: formatCurrency(displayTotals.total),
        },
    ].filter(Boolean);

    useEffect(() => {
        if (!open) {
            setSheetOrder(null);
            return;
        }

        setSheetOrder(row);
        let cancelled = false;
        getOrderById(row.id).then((response) => {
            if (cancelled || !response.data) return;
            setSheetOrder(
                (prev) =>
                    ({ ...(prev ?? row), ...response.data }) as ScopedOrder,
            );
        });

        return () => {
            cancelled = true;
        };
    }, [open, row]);

    const handleMutate = () => {
        const options = { revalidate: true };

        mutate('/orders/query/all', undefined, options);
        mutate('/orders/query/running', undefined, options);
        mutate('/orders/query/ready', undefined, options);
        mutate('/orders/query/settled', undefined, options);

        mutate('/orders/order-type?=FAST_FOOD', undefined, options);
        mutate('/orders/order-type?=ROOM', undefined, options);
        mutate('/orders/order-type?=TAKE_AWAY', undefined, options);
        mutate('/orders/order-type?=DELIVERY', undefined, options);
        mutate('/orders/order-type?=DELIVERY/stats', undefined, options);
        mutate('/orders/order-type?=KITCHEN', undefined, options);
        mutate('/orders/order-type?=KITCHEN/stats', undefined, options);
        mutate('/orders/order-type?=SENT', undefined, options);
    };

    const refreshOrderInSheet = async () => {
        handleMutate();
        const response = await getOrderById(row.id);
        if (response.data) {
            setSheetOrder((prev) => {
                const merged = {
                    ...(prev ?? row),
                    ...response.data,
                } as ScopedOrder;
                if (
                    localPaymentStatus === 'VOIDED' ||
                    prev?.isVoided ||
                    prev?.status === 'VOIDED' ||
                    isOrderVoided(merged)
                ) {
                    return {
                        ...merged,
                        status: 'VOIDED',
                        paymentStatus: 'VOIDED',
                        isVoided: true,
                    } as ScopedOrder;
                }
                return merged;
            });
        }
    };

    const reopenedPaymentRef = useRef<number | null>(null);
    useEffect(() => {
        if (!open || !reopenPaymentAfterIaReversal) {
            if (!open) reopenedPaymentRef.current = null;
            return;
        }
        if (reopenedPaymentRef.current === Number(order.id)) return;
        reopenedPaymentRef.current = Number(order.id);
        clearPendingIaPaymentRequest(Number(order.id));
        setLocalPaymentStatus('PENDING');
        void refreshOrderInSheet();
    }, [open, reopenPaymentAfterIaReversal, order.id]);

    const [hasSplitBills, setHasSplitBills] = useState(false);
    const [splitBillsCount, setSplitBillsCount] = useState(0);

    useEffect(() => {
        const checkSplits = async () => {
            try {
                const res = await getSplitBillsByOrder(order.id);
                if (res?.data && Array.isArray(res.data)) {
                    setHasSplitBills(res.data.length > 0);
                    setSplitBillsCount(res.data.length);
                } else {
                    setHasSplitBills(false);
                    setSplitBillsCount(0);
                }
            } catch (e) {
                setHasSplitBills(false);
                setSplitBillsCount(0);
            }
        };
        if (open) {
            checkSplits();
        }
    }, [open, order.id]);

    const handleCancelOrder = async () => {
        setLoadingCancel(true);
        try {
            const response = await cancelOrder(
                order.id,
                formData.cancelledReason,
            );
            if (response?.message === 'Order cancelled successfully!') {
                setLoadingCancel(false);
                setOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setOpen(false);
                setDeleteDialog(false);
                handleMutate();
            } else {
                setLoadingCancel(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message ?? response.error}
                        type="error"
                    />
                ));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
                setLoadingCancel(false);
            } else {
                console.log('An unexpected error occurred');
                setLoadingCancel(false);
            }
        }
    };

    const handleNavigateToUpdate = () => {
        sessionStorage.setItem('orderReferrer', window.location.pathname);
        router.push(`/front-of-house/update-item/${order.id}`);
    };

    const handleNavigateToUpdateDelivery = () => {
        sessionStorage.setItem('orderReferrer', window.location.pathname);
        router.push(`/front-of-house/update-delivery/${order.id}`);
    };

    const handleUpdateOrder = async (formOrder: OrderFormData) => {
        const mappedOrder = {
            guestName: formOrder.guestName,
            guestEmail: formOrder.guestEmail,
            guestPhoneNumber: formOrder.phoneNumber,
            waiterId: formOrder.waiter?.id,
            roomId: formOrder.room?.id,
            address: formOrder.address,
        };
        setLoadingUpdate(true);
        try {
            const response = await updateOrder(order.id, mappedOrder);
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Order ${order.id} updated successfully!`}
                        type="success"
                    />
                ));
                setLoadingUpdate(false);
                setUpdateDialog(false);
                handleMutate();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response?.error ||
                            `Failed to process payment. Please try again.`
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={`Failed to process payment. Please try again.`}
                    type="error"
                />
            ));
            setLoadingUpdate(false);
        } finally {
            setLoadingUpdate(false);
        }
    };
    const renderForm = () => {
        switch (order.orderType) {
            case 'ROOM':
                return (
                    <OrderForm
                        mode="edit"
                        variant="room"
                        order={order}
                        onSubmit={(data) => handleUpdateOrder(data)}
                    />
                );
            case 'DINE_IN':
                return (
                    <OrderForm
                        mode="edit"
                        order={order}
                        variant="in-house"
                        onSubmit={(data) => handleUpdateOrder(data)}
                    />
                );
            case 'TAKE_AWAY':
                return (
                    <OrderForm
                        mode="edit"
                        order={order}
                        variant="away"
                        onSubmit={(data) => handleUpdateOrder(data)}
                    />
                );
            case 'FAST_FOOD':
                return (
                    <OrderForm
                        mode="edit"
                        order={order}
                        variant="away"
                        onSubmit={(data) => handleUpdateOrder(data)}
                    />
                );
            case 'NO_CHARGE':
                return (
                    <OrderForm
                        mode="edit"
                        order={order}
                        variant="in-house"
                        onSubmit={(data) => handleUpdateOrder(data)}
                    />
                );
        }
    };

    const renderPaymentHistory = () => {
        if (!order.payments?.length) return null;

        return (
            <div className="mb-4">
                <h3 className="text-sm capitalize font-medium mb-2">
                    Previous Payments
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                    {order.payments.map((payment, index) => (
                        <div
                            key={payment.id}
                            className={
                                index !== 0
                                    ? 'mt-2 pt-2 border-t border-gray-200'
                                    : ''
                            }
                        >
                            <div className="flex justify-between text-sm">
                                <span>{payment.paymentMethod}</span>
                                <span>
                                    ₦
                                    {Number(payment.amount).toLocaleString(
                                        'en-NG',
                                    )}
                                </span>
                            </div>
                            {(payment.receivingAccount ||
                                (
                                    payment as {
                                        transactionReference?: string;
                                    }
                                ).transactionReference) && (
                                    <div className="text-xs text-muted-foreground mt-0.5 flex justify-between gap-2">
                                        <span>
                                            {payment.receivingAccount
                                                ? `Acct: ${payment.receivingAccount}`
                                                : ''}
                                        </span>
                                        <span>
                                            {(
                                                payment as {
                                                    transactionReference?: string;
                                                }
                                            ).transactionReference
                                                ? `Ref: ${(
                                                    payment as {
                                                        transactionReference?: string;
                                                    }
                                                ).transactionReference}`
                                                : ''}
                                        </span>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const goToSplitOrder = () => {
        sessionStorage.setItem('orderReferrer', window.location.pathname);
        router.push(`/front-of-house/order/${order.id}/split?ref=${order.id}`);
    };

    const goToMergeOrder = () => {
        sessionStorage.setItem('orderReferrer', window.location.pathname);
        router.push(`/front-of-house/order/merge?selectedOrder=${order.id}`);
    };
    return (
        <div className="flex relative items-center gap-4 justify-between">
            <CustomSheet
                title="Order Details"
                trigger={
                    <button
                        title={`View order details for Order #${order.id}`}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                }
                noTitle={true}
                open={open}
                setOpen={setOpen}
            >
                <div className="flex items-center mb-4 justify-between">
                    <h1 className="text-xl font-bold">
                        Request ID: {`#ORD-${order.id}`}
                    </h1>
                    <div className="flex items-center gap-2">
                        {isVoidedSheet ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                Voided
                            </span>
                        ) : complimentaryStatus ? (
                            <ComplimentaryBadge status={complimentaryStatus} />
                        ) : null}
                        <OrderDiscountBadge order={order} />
                    </div>
                </div>
                <div className="w-full flex mb-6 items-center">
                    <div className="grid grid-cols-3 gap-2">
                        {/* Receipt */}
                        <SimplePrintButton
                            orderId={order.id}
                            printType="receipt"
                        />
                        <SimplePrintButton
                            orderId={order.id}
                            printType="kot"
                            newItemsOnly={true}
                        >
                            Print KOT
                        </SimplePrintButton>

                        <SimplePrintButton
                            orderId={order.id}
                            printType="bot"
                            newItemsOnly={true}
                        >
                            Print BOT
                        </SimplePrintButton>

                        <SimplePrintButton
                            orderId={order.id}
                            printType="kot"
                            newItemsOnly={false}
                        >
                            Print All KOT
                        </SimplePrintButton>

                        <SimplePrintButton
                            orderId={order.id}
                            printType="bot"
                            newItemsOnly={false}
                        >
                            Print All BOT
                        </SimplePrintButton>

                        <OrderChargeWaiver
                            order={order}
                            disabled={isVoidedSheet}
                            onSuccess={refreshOrderInSheet}
                        />

                        <PermissionGate
                            permissions={[PERMISSIONS.MARK_ORDERS_COMPLEMENTARY]}
                            blockType="hide"
                        >
                            <NoCharge
                                order={order}
                                disabled={isVoidedSheet}
                                onSuccess={refreshOrderInSheet}
                            />
                        </PermissionGate>
                            <OrderDiscount
                                order={order}
                                disabled={isVoidedSheet}
                                onSuccess={refreshOrderInSheet}
                            />
                            <VoidOrder
                                order={order}
                                disabled={isVoidedSheet}
                                onSuccess={() => {
                                    setLocalPaymentStatus('VOIDED');
                                    setSheetOrder((prev) =>
                                        prev
                                            ? ({
                                                  ...prev,
                                                  status: 'VOIDED',
                                                  paymentStatus: 'VOIDED',
                                                  isVoided: true,
                                                  totalPrice: 0,
                                                  remainingBalance: 0,
                                                  totalWithCustomCharges: 0,
                                              } as ScopedOrder)
                                            : prev,
                                    );
                                    void refreshOrderInSheet();
                                }}
                            />
                    </div>
                </div>
                {isVoidedSheet ? null : (
                    <ComplimentaryOrderSummary order={order} />
                )}
                {hasOrderDiscount(order) && (
                    <div className="bg-[#E8F3FF] border border-orion-blue/30 rounded-lg p-4 mb-4 text-sm text-orion-blue">
                        <div className="flex justify-between items-center gap-3 font-semibold">
                            <OrderDiscountBadge order={order} />
                            <span className="text-orion-blue">
                                -{formatCurrency(Number(order.discountAmount || 0))}
                            </span>
                        </div>
                        {order.discountReason ? (
                            <p className="text-xs text-orion-blue mt-2">
                                <span className="font-medium">Reason:</span>{' '}
                                {order.discountReason}
                            </p>
                        ) : null}
                        <p className="text-xs text-orion-blue mt-1">
                            Taken off the full bill. The total below is after
                            this discount.
                        </p>
                    </div>
                )}
                {Number(order.waivedAmount ?? 0) > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-sm text-orange-900">
                        <div className="flex justify-between items-center font-semibold">
                            <span>Charge Waiver Applied</span>
                            <span className="text-orange-700">
                                -{formatCurrency(Number(order.waivedAmount))}
                            </span>
                        </div>
                        <div className="text-xs text-orange-800 mt-2 space-y-1">
                            {order.waivedCharges?.waivedByName && (
                                <p>
                                    <span className="font-medium">Waived By:</span>{' '}
                                    {order.waivedCharges.waivedByName}
                                </p>
                            )}
                            {order.waiverReason && (
                                <p>
                                    <span className="font-medium">Reason:</span>{' '}
                                    {order.waiverReason}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {!reopenPaymentAfterIaReversal && (
                    <PostedToInternalAccount order={order} className="mb-4" />
                )}
                <div className="bg-hexbrand/10 p-4 rounded-lg flex flex-col gap-4 ">
                    {fields.map((field, index) => (
                        <div className="grid grid-cols-2 text-sm" key={index}>
                            <span className="text-gray-500 capitalize">
                                {field?.label}
                            </span>
                            <span className="text-gray-600">
                                {field?.value}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="pt-6">{renderPaymentHistory()}</div>
                <div className="mt-4 rounded-lg p-4 border">
                    <h1>Items Ordered</h1>
                    <div className="mt-4">
                        <div className="bg-gray-100 grid grid-cols-3 p-3 text-sm text-muted-foreground">
                            <span>Item</span>
                            <span>Quantity</span>
                            <span>Amount</span>
                        </div>
                        {(order.items ?? []).map((item) => (
                            <div
                                className="grid grid-cols-3 px-3 py-4 text-sm text-muted-foreground border-b"
                                key={item.id}
                            >
                                <span>
                                    {item.menuItem?.name}
                                    {item.isComplimentary && !isVoidedSheet ? (
                                        <span className="ml-2 text-xs text-purple-600">
                                            (complimentary)
                                        </span>
                                    ) : null}
                                </span>
                                <span>{item.quantity}</span>
                                <span>
                                    {getItemDisplayUnitPrice(item).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    {['CANCELLED', 'VOIDED'].includes(effectiveOrderStatus) ? null : (
                        <div className="space-y-4">
                            {/* Primary Actions Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    Order Actions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                                    {/* <PermissionGate
                                        permissions={[
                                            PERMISSIONS.SEND_ORDER_TO_KITCHEN_OR_BAR,
                                        ]}
                                        blockType="hide"
                                    >
                                        <Button
                                            className="bg-orion-blue hover:bg-orion-blue text-white h-11 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                            onClick={() =>
                                                handleSendToKitchen(order.id)
                                            }
                                        >
                                            {loading && (
                                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                            )}
                                            {loading
                                                ? 'Sending...'
                                                : 'Send to Kitchen'}
                                        </Button>
                                    </PermissionGate> */}

                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.CREATE_NEW_ORDER,
                                        ]}
                                        blockType="hide"
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (!canModifyItems) {
                                                    toast.custom(() => (
                                                        <Toast
                                                            title="Permission Denied"
                                                            description="Only the staff who created this order or a manager can add items."
                                                            type="error"
                                                        />
                                                    ));
                                                    return;
                                                }
                                                handleNavigateToUpdate();
                                            }}
                                            className={`w-full border-brandblue text-brandblue hover:bg-brand-50 h-11 font-medium transition-all duration-200 ${!canModifyItems ? 'opacity-50' : ''}`}
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            Add More Items
                                        </Button>
                                    </PermissionGate>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mt-4">
                        {['COMPLETED', 'CANCELLED', 'VOIDED'].includes(
                            effectiveOrderStatus,
                        ) ? null : (
                            <>
                                {/* Split Bill Section */}
                                <PermissionGate
                                    permissions={[
                                        PERMISSIONS.EDIT_OR_CANCEL_ORDER,
                                        PERMISSIONS.CREATE_NEW_ORDER,
                                    ]}
                                    blockType="hide"
                                    permissionType="any"
                                >
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                                        <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                            Split Bill
                                        </h3>
                                        {hasSplitBills ? (
                                            <Button
                                                variant="outline"
                                                className="border-amber-600 text-amber-600 hover:bg-amber-50 h-11 font-medium transition-all duration-200 w-full"
                                                disabled={lockSplitAndMerge}
                                                onClick={() =>
                                                    router.push(
                                                        `/front-of-house/split-bills?orderId=${order.id}`,
                                                    )
                                                }
                                            >
                                                View Split Bills (
                                                {splitBillsCount})
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="border-amber-600 text-amber-600 hover:bg-amber-50 h-11 font-medium transition-all duration-200 w-full"
                                                disabled={lockSplitAndMerge}
                                                onClick={goToSplitOrder}
                                            >
                                                Split Order
                                            </Button>
                                        )}
                                    </div>
                                </PermissionGate>

                                {/* Merge Order Section */}
                                <PermissionGate
                                    permissions={[
                                        PERMISSIONS.EDIT_OR_CANCEL_ORDER,
                                        PERMISSIONS.CREATE_NEW_ORDER,
                                    ]}
                                    blockType="hide"
                                    permissionType="any"
                                >
                                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-4 rounded-lg border border-gray-100">
                                        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                            Merge Order
                                        </h3>
                                        <Button
                                            variant="outline"
                                            className="border-gray-600 text-gray-600 hover:bg-gray-50 h-11 font-medium transition-all duration-200 w-full"
                                            disabled={lockSplitAndMerge}
                                            onClick={goToMergeOrder}
                                        >
                                            Merge Order
                                        </Button>
                                    </div>
                                </PermissionGate>
                            </>
                        )}
                    </div>

                    {/* {['READY'].includes(order.status) && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 mt-4">
                            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Order Status
                            </h3>
                            <Button
                                variant="outline"
                                onClick={handleMarkAsComplete}
                                className="border-purple-600 text-purple-600 hover:bg-purple-50 h-11 font-medium transition-all duration-200 w-full"
                            >
                                Mark as Complete
                            </Button>
                        </div>
                    )} */}
                </div>
                <PermissionGate
                    permissions={[PERMISSIONS.VIEW_OR_INITIATE_ORDER_PAYMENT]}
                    blockType="hide"
                >
                    <div className=" p-4 rounded-lg border mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-emerald-900 flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                Payment
                            </h3>
                            {isPaymentStatusAddedToBill(order.paymentStatus) &&
                                !isVoidedSheet && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={removingFromBill}
                                    onClick={() => setConfirmRemoveOpen(true)}
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs h-7 px-2.5"
                                >
                                    {removingFromBill ? '…' : 'Remove'}
                                </Button>
                            )}
                        </div>
                        {fullyComplimentary ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium">
                                    Complimentary
                                </p>
                                <p className="text-sm text-gray-500">
                                    No payment required
                                </p>
                            </div>
                        ) : isVoidedSheet ? (
                            <div className="text-center py-4">
                                <p className="text-slate-700 font-medium">
                                    Voided
                                </p>
                                <p className="text-sm text-gray-500">
                                    This order is ₦0.00 and is not included in
                                    sales.
                                </p>
                            </div>
                        ) : effectivePaymentStatus === 'PAID' &&
                            order.status === 'COMPLETED' ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium">
                                    Order Settled
                                </p>
                                <p className="text-sm text-gray-500">
                                    Payment Completed
                                </p>
                            </div>
                        ) : effectivePaymentStatus === 'BILL_SETTLED_FROM_FRONT_DESK' ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium">
                                    Bill Settled from Front Desk
                                </p>
                                <p className="text-sm text-gray-500">
                                    Payment completed via guest folio
                                </p>
                            </div>
                        ) : isPaymentStatusAddedToBill(order.paymentStatus) ? (
                            <div className="text-center py-4">
                                <p className="text-emerald-900 font-medium">
                                    Posted to Room
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    On the guest folio. Remove from bill or
                                    wait for Front Office settlement.
                                </p>
                                {order.room?.roomNumber != null && (
                                    <p className="text-sm mt-2">
                                        Room:{' '}
                                        <span className="font-medium">
                                            {String(order.room.roomNumber)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        ) : effectivePaymentStatus === 'PAID' ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium">
                                    Order Paid
                                </p>
                                <p className="text-sm text-gray-500">
                                    Payment Completed
                                </p>
                            </div>
                        ) : (
                            <>
                                {reopenPaymentAfterIaReversal && (
                                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mb-3">
                                        Internal Account posting was reversed.
                                        Collect payment or post this bill to
                                        another Internal Account.
                                    </p>
                                )}
                                <PaymentForm
                                order={{
                                    id: order.id,
                                    guestName: order.guestName,
                                    paymentMethod: reopenPaymentAfterIaReversal
                                        ? ''
                                        : (order.paymentMethod ?? ''),
                                    paymentStatus: reopenPaymentAfterIaReversal
                                        ? 'PENDING'
                                        : (order.paymentStatus ?? ''),
                                    receivingAccount:
                                        reopenPaymentAfterIaReversal
                                            ? ''
                                            : (order.receivingAccount ?? ''),
                                    totalAmount:
                                        order.totalPrice?.toString() ?? '',
                                    orderType: order.orderType,
                                    room: order.room
                                        ? {
                                            id: order.room.id,
                                            roomNumber: order.room.roomNumber,
                                        }
                                        : undefined,
                                    table: order.table
                                        ? { number: order.table.number }
                                        : undefined,
                                    subtotal: order.subtotal,
                                    vatAmount: order.vatAmount,
                                    vatRateSnapshot: Number(
                                        order.vatRateSnapshot ?? order.vatRate,
                                    ),
                                    serviceChargeAmount:
                                        order.serviceChargeAmount,
                                    serviceChargeRateSnapshot: Number(
                                        order.serviceChargeRateSnapshot ??
                                        order.serviceChargeRate,
                                    ),
                                    tipAmount: order.tipAmount,
                                    tipRateSnapshot: Number(
                                        order.tipRateSnapshot ?? order.tipRate,
                                    ),
                                    hotel: order.hotel,
                                    complimentaryStatus:
                                        order.complimentaryStatus,
                                    complimentaryAmount:
                                        order.complimentaryAmount,
                                    remainingBalance: order.remainingBalance,
                                    isComplimented: order.isComplimented,
                                    waivedCharges: order.waivedCharges,
                                    waivedAmount: order.waivedAmount,
                                    waiverReason: order.waiverReason,
                                    payments: reopenPaymentAfterIaReversal
                                        ? []
                                        : (order.payments ?? []).map(
                                        (payment) => ({
                                            id: payment.id,
                                            paymentMethod:
                                                payment.paymentMethod ?? '',
                                            receivingAccount:
                                                payment.receivingAccount ?? '',
                                            amount: payment.amount.toString(),
                                            transactionReference:
                                                (
                                                    payment as {
                                                        transactionReference?: string;
                                                    }
                                                ).transactionReference ?? '',
                                        }),
                                    ),
                                }}
                                isOpen={paymentFormOpen}
                                onToggle={setPaymentFormOpen}
                                onRefresh={() => {
                                    void refreshOrderInSheet();
                                }}
                                onSuccess={() => {
                                    setLocalPaymentStatus(null);
                                    setPaymentFormOpen(false);
                                    void refreshOrderInSheet();
                                }}
                            />
                            </>
                        )}
                    </div>
                </PermissionGate>
                {isVoidedSheet ? null : (
                <CompleteOrderSection
                    order={order}
                    isOpen={activeActionSection === 'settle'}
                    onToggle={(isOpen: boolean) =>
                        setActiveActionSection(isOpen ? 'settle' : null)
                    }
                />
                )}
            </CustomSheet>
            <PermissionGate
                permissions={[PERMISSIONS.EDIT_OR_CANCEL_ORDER]}
                blockType="hide"
            >
                <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                    <DialogTrigger asChild>
                        <button
                            disabled={[
                                'READY',
                                'CANCELLED',
                                'COMPLETED',
                                'VOIDED',
                            ].includes(effectiveOrderStatus) || isVoidedSheet}
                            title={`Cancel order #${order.id}`}
                            className=" text-red-600 disabled:text-muted-foreground disabled:opacity-25 border-red-600"
                            onClick={() => {
                                setDeleteDialog(true);
                            }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="w-[400px]">
                        <DialogHeader>
                            <DialogTitle>
                                <span className="flex justify-center items-center">
                                    {itemOrderRejectedIllustration}
                                </span>
                            </DialogTitle>
                            <div className="flex flex-col ">
                                <h1 className="text-center text-lg font-semibold">
                                    Cancel Order
                                </h1>
                                <p className="text-center text-sm text-muted-foreground">
                                    Are you sure you want to cancel this order?
                                </p>
                            </div>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 mt-2">
                            <InputField
                                type="text"
                                label="Reason for cancellation"
                                required={true}
                                id="cancelledReason"
                                name="cancelledReason"
                                className="border rounded-lg"
                                value={formData.cancelledReason}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        cancelledReason: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                disabled={
                                    loadingCancel || !formData.cancelledReason
                                }
                                className=" bg-orion-blue hover:bg-orion-blue text-white w-full"
                                onClick={handleCancelOrder}
                            >
                                Yes, Sure
                            </Button>
                            <Button
                                variant={'outline'}
                                className=" text-orion-blue border-orion-blue w-full"
                                type="button"
                                onClick={() => setDeleteDialog(false)}
                            >
                                No, Cancel
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </PermissionGate>
            <PermissionGate
                permissions={[PERMISSIONS.EDIT_OR_CANCEL_ORDER]}
                blockType="hide"
            >
                {order.orderType !== 'DELIVERY' && (
                    <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
                        <DialogTrigger asChild>
                            <button
                                disabled={
                                    [
                                        'READY',
                                        'CANCELLED',
                                        'COMPLETED',
                                        'VOIDED',
                                    ].includes(effectiveOrderStatus) ||
                                    isVoidedSheet ||
                                    loadingUpdate
                                }
                                title={`Edit order #${order.id}`}
                                className="disabled:text-muted-foreground disabled:opacity-25"
                                onClick={() => {
                                    setUpdateDialog(true);
                                }}
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    <span className="flex justify-center items-center">
                                        Update Order Details
                                    </span>
                                </DialogTitle>
                            </DialogHeader>
                            <div>{renderForm()}</div>
                        </DialogContent>
                    </Dialog>
                )}
            </PermissionGate>
            {/* Split Order button moved into the drawer above */}
            <PermissionGate
                permissions={[PERMISSIONS.EDIT_OR_CANCEL_ORDER]}
                blockType="hide"
            >
                {order.orderType === 'DELIVERY' && (
                    <button
                        title={`Edit order #${order.id}`}
                        className="disabled:text-muted-foreground disabled:opacity-25"
                        onClick={handleNavigateToUpdateDelivery}
                    >
                        Edit
                    </button>
                )}
            </PermissionGate>

            {/* Confirmation modal: remove order from guest bill */}
            <Dialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remove from guest bill?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will remove the order from the room folio. You will be able to collect payment directly from the guest.
                    </p>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmRemoveOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={removingFromBill}
                            onClick={handleRemoveFromBill}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {removingFromBill ? 'Removing…' : 'Yes, Remove'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderAction;
