'use client';

import { BankAccount, getAllBankAccounts } from '@/app/actions/bank-accounts';
import { getInternalAccounts } from '@/app/actions/internal-accounts';
import {
    createOrder,
    removeOrderFromBill,
    updateOrder,
} from '@/app/actions/order';
import { CustomSheet } from '@/components/common/CustomSheet';
import { InputField, SelectField } from '@/components/common/Form';
import { ItemsTable } from '@/components/common/ItemsTable';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { formatBankAccountLabel } from '@/lib/utils';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import {
    maybePostBillToInternalAccount,
    resolveOrderGuestCustomerName,
    resolveOrderRoomTableNo,
    resolveSourceModuleFromOrderType,
} from '@/lib/internal-accounts/post-bill';
import useOrderStore, { Order } from '@/store/useOrder';
import { LoaderCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import Toast from '../toast';
import { PostedToInternalAccount } from './PostedToInternalAccount';
import {
    isPaymentStatusAddedToBill,
    isPaymentStatusBillSettledFromFrontDesk,
    isPaymentStatusPaidOrSettled,
} from './utils';
import { isFullyComplimentaryOrder } from './utils/complimentary';
import NoCharge from './tables/NoCharge';
import OrderDiscount from './tables/OrderDiscount';
import OrderDiscountBadge from './complimentary/OrderDiscountBadge';
import VoidOrder from './tables/VoidOrder';

interface PaymentActionCellProps {
    order: Order;
    trigger?: React.JSX.Element;
    resetParentStep?: () => void;
    mode?: 'create' | 'edit';
    updateId?: string;
}

export const PaymentActionCell: React.FC<PaymentActionCellProps> = ({
    order,
    trigger,
    resetParentStep,
    mode = 'create',
    updateId,
}) => {
    const { setOrder } = useOrderStore();
    const { organization } = useHotel();
    const restaurantVatInclusive = organization?.restaurantVatInclusive ?? false;
    const { user } = useUser();
    const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
    const [step, setStep] = useState(0);
    const [includeTip, setIncludeTip] = useState(false);
    const derivedVatRate = useMemo(() => {
        const rate = order.vatRate ?? order.vatRateSnapshot ?? (order as any).hotel?.restaurantVatRate ?? (order as any).hotel?.vatRate ?? 0;
        return Number(rate ?? 0);
    }, [order.vatRate, order.vatRateSnapshot, (order as any).hotel?.restaurantVatRate, (order as any).hotel?.vatRate]);

    const derivedServiceChargeRate = useMemo(() => {
        const rate =
            order.serviceChargeRate ??
            order.serviceChargeRateSnapshot ??
            (order as any).hotel?.restaurantServiceChargeRate ??
            (order as any).hotel?.serviceChargeRate ??
            0;
        return Number(rate ?? 0);
    }, [
        order.serviceChargeRate,
        order.serviceChargeRateSnapshot,
        (order as any).hotel?.restaurantServiceChargeRate,
        (order as any).hotel?.serviceChargeRate,
    ]);

    const derivedTipRate = useMemo(() => {
        const rate =
            order.tipRate ??
            order.tipRateSnapshot ??
            (order as any).hotel?.restaurantTipRate ??
            (order as any).hotel?.tipRate ??
            0;
        return Number(rate ?? 0);
    }, [order.tipRate, order.tipRateSnapshot, (order as any).hotel?.restaurantTipRate, (order as any).hotel?.tipRate]);

    const isRestaurantOrder = useMemo(() => {
        return (
            order.orderType === 'DINE_IN' ||
            order.orderType === 'TAKE_AWAY' ||
            order.orderType === 'DELIVERY'
        );
    }, [order.orderType]);

    const subtotalValue = useMemo(() => {
        if (order.subtotal !== undefined && order.subtotal !== null) {
            return Number(order.subtotal);
        }
        if (order.totalAmount && order.vatAmount && !restaurantVatInclusive) {
            return Number(order.totalAmount) - Number(order.vatAmount ?? 0);
        }
        if (order.items?.length) {
            return order.items.reduce(
                (sum, item) => sum + (item.price ?? 0) * item.quantity,
                0,
            );
        }
        return 0;
    }, [order.subtotal, order.totalAmount, order.vatAmount, order.items, restaurantVatInclusive]);

    const vatAmountValue = useMemo(() => {
        if (order.vatAmount !== undefined && order.vatAmount !== null) {
            return Number(order.vatAmount);
        }
        if (derivedVatRate > 0 && subtotalValue > 0) {
            return Number(((subtotalValue * derivedVatRate) / 100).toFixed(2));
        }
        return 0;
    }, [order.vatAmount, derivedVatRate, subtotalValue]);

    const serviceChargeAmountValue = useMemo(() => {
        if (
            order.serviceChargeAmount !== undefined &&
            order.serviceChargeAmount !== null
        ) {
            return Number(order.serviceChargeAmount);
        }
        if (derivedServiceChargeRate > 0 && subtotalValue > 0) {
            return Number(
                ((subtotalValue * derivedServiceChargeRate) / 100).toFixed(2),
            );
        }
        return 0;
    }, [order.serviceChargeAmount, derivedServiceChargeRate, subtotalValue]);

    const tipAmountValue = useMemo(() => {
        if (!includeTip || !isRestaurantOrder || derivedTipRate <= 0) {
            return 0;
        }
        if (order.tipAmount !== undefined && order.tipAmount !== null) {
            return Number(order.tipAmount);
        }
        if (subtotalValue > 0) {
            return Number(((subtotalValue * derivedTipRate) / 100).toFixed(2));
        }
        return 0;
    }, [
        order.tipAmount,
        derivedTipRate,
        subtotalValue,
        isRestaurantOrder,
        includeTip,
    ]);

    const totalAmountValue = useMemo(() => {
        if (order.totalAmount !== undefined && order.totalAmount !== null) {
            return Number(order.totalAmount);
        }
        return Number(
            (
                subtotalValue +
                vatAmountValue +
                serviceChargeAmountValue +
                tipAmountValue
            ).toFixed(2),
        );
    }, [
        order.totalAmount,
        subtotalValue,
        vatAmountValue,
        serviceChargeAmountValue,
        tipAmountValue,
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { data: internalAccounts = [] } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );

    const remappedBankAccounts = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.id?.toString() || '',
        }),
    );
    const remappedInternalAccounts = internalAccounts.map((account) => ({
        label: `${account.accountName} (${account.accountCode})`,
        value: account.accountCode || account.id,
    }));

    const fields = [
        { label: 'Order type', value: order.orderType },
        { label: 'Guest name', value: order.guestName },
        { label: 'Waiter/Waitress', value: order.waiter?.fullName || '' },
        {
            label: 'Date Requested',
            value: order.bookingDate,
        },
        {
            label: 'Time Requested',
            value: order.bookingTime,
        },
        {
            label: 'Delivery time',
            value: order.timeExpected,
        },
    ];

    const tableFields = [
        { label: 'Table Number', value: order.table?.number || '' },
    ];

    const roomFields = [
        { label: 'Room Number', value: order.room?.roomNumber || '' },
    ];

    const deliveryFields = [
        { label: 'Delivery Address', value: order.address },
    ];

    const resetStep = () => {
        setStep(0);
    };

    const renderStep0 = () => (
        <div className="flex flex-col gap-4 mt-4">
            <SelectField
                id="paymentMethod"
                name="paymentMethod"
                label="Payment Method"
                options={[
                    { value: 'cash', label: 'Cash Payment' },
                    { value: 'card', label: 'Card Payment' },
                    { value: 'transfer', label: 'Bank Transfer' },
                    { value: 'internal_account', label: 'Internal Account' },
                    // { value: 'added to bill', label: 'Added to bill' },
                ]}
                value={order.paymentMethod as string}
                onValueChange={(value) =>
                    setOrder({
                        ...order,
                        paymentMethod: value,
                        recievingAccount: '',
                    })
                }
            />
            {order.paymentMethod !== 'added to bill' && (
                <SelectField
                    name="receivingAccount"
                    id="receivingAccount"
                    label={
                        order.paymentMethod === 'internal_account'
                            ? 'Internal Account (Optional)'
                            : 'Account to pay into (Optional)'
                    }
                    options={
                        order.paymentMethod === 'internal_account'
                            ? remappedInternalAccounts
                            : remappedBankAccounts
                    }
                    value={order.recievingAccount as string}
                    onValueChange={(value) =>
                        setOrder({
                            ...order,
                            recievingAccount: value,
                        })
                    }
                    placeholder={
                        order.paymentMethod === 'internal_account'
                            ? 'Select internal account'
                            : 'Select account'
                    }
                />
            )}
            {order.paymentMethod === 'added to bill' && (
                <InputField
                    id="roomNumber"
                    name="roomNumber"
                    label="Room Number"
                    value={order.room?.roomNumber?.toString() || ''}
                    onChange={(e) =>
                        setOrder({
                            ...order,
                            room: {
                                id: 1,
                                roomNumber: e.target.value,
                            },
                        })
                    }
                />
            )}
            <InputField
                id="amount"
                name="amount"
                label="Total Cost (incl. VAT)"
                type="text"
                value={
                    order.totalAmount
                        ? `₦${Number(order.totalAmount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                        : '₦0'
                }
                onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    setOrder({
                        ...order,
                        totalAmount: rawValue ? rawValue : '0',
                    });
                }}
            />
        </div>
    );

    const renderStep1 = () => (
        <div className="flex flex-col gap-4">
            {isRestaurantOrder && derivedTipRate > 0 && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Include Tip
                        </label>
                        <p className="text-xs text-gray-500">
                            Add {derivedTipRate.toFixed(2)}% tip to the order
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIncludeTip(!includeTip)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${includeTip ? 'bg-orion-blue' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeTip ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            )}
            <ItemsTable
                title="Items Ordered"
                items={order.items}
                showTotal={true}
                totalValue={totalAmountValue}
                currencyPrefix="₦"
                breakdownRows={[
                    {
                        label: 'Subtotal',
                        value: subtotalValue,
                    },
                    {
                        label: `VAT (${derivedVatRate.toFixed(2)}%)`,
                        value: vatAmountValue,
                    },
                    ...(derivedServiceChargeRate > 0
                        ? [
                            {
                                label: `Service Charge (${derivedServiceChargeRate.toFixed(2)}%)`,
                                value: serviceChargeAmountValue,
                            },
                        ]
                        : []),
                    ...(isRestaurantOrder && derivedTipRate > 0 && includeTip
                        ? [
                            {
                                label: `Tip (${derivedTipRate.toFixed(2)}%)`,
                                value: tipAmountValue,
                            },
                        ]
                        : []),
                    ...(order.customCharges && order.customCharges.length > 0
                        ? order.customCharges.map((charge: any) => ({
                            label: `${charge.name} (${Number(charge.rate).toFixed(2)}%)`,
                            value: charge.amount,
                        }))
                        : []),
                ]}
            />
            {/* <Button
                className="text-white bg-orion-blue h-12 hover:bg-orion-blue/80"
                onClick={handleAddToBill}
            >
                Add to bill
            </Button> */}
        </div>
    );

    const isOrderPaidOrSettled = isPaymentStatusPaidOrSettled(
        order.paymentStatus,
    );
    const isOrderComplemented = useMemo(() => {
        const s = String(order.paymentStatus ?? '')
            .toUpperCase()
            .replace(/\s+/g, '_');
        return s === 'COMPLEMENTED';
    }, [order.paymentStatus]);

    const postedToGuestBill = isPaymentStatusAddedToBill(order.paymentStatus);
    const settledFromFrontDesk =
        isPaymentStatusBillSettledFromFrontDesk(order.paymentStatus);
    const fullyComplimentary = isFullyComplimentaryOrder(order as any);
    const isVoided =
        Boolean((order as { isVoided?: boolean }).isVoided) ||
        order.status === 'VOIDED' ||
        String(order.paymentStatus ?? '').toUpperCase() === 'VOIDED';

    const isOrderSettled = useMemo(() => {
        return (
            (order.status === 'COMPLETED' || settledFromFrontDesk) &&
            isOrderPaidOrSettled &&
            !isOrderComplemented
        );
    }, [order.status, isOrderPaidOrSettled, isOrderComplemented, settledFromFrontDesk]);

    const handleRemoveFromBill = async () => {
        if (!confirm('Are you sure you want to remove this from guest bill?')) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await removeOrderFromBill(Number(order.id));
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Removed from bill"
                        description="You can collect payment for this order again."
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
                setOpenPaymentSheet(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.error ||
                            'Could not remove order from guest bill.'
                        }
                        type="error"
                    />
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderActionButtons = () => {
        if (isVoided) {
            return (
                <div className="text-center p-4">
                    <p className="text-slate-700 font-medium">Voided</p>
                    <p className="text-sm text-gray-500">
                        This order is ₦0.00 and is not included in sales.
                    </p>
                </div>
            );
        }

        if (isOrderComplemented || fullyComplimentary) {
            return (
                <div className="text-center p-4">
                    <p className="text-green-600 font-medium">Complimentary</p>
                    <p className="text-sm text-gray-500">No payment required</p>
                </div>
            );
        }

        if (isOrderSettled) {
            return (
                <div className="text-center p-4">
                    <p className="text-green-600 font-medium">
                        {settledFromFrontDesk
                            ? 'Bill Settled from Front Desk'
                            : 'Order Settled'}
                    </p>
                    <p className="text-sm text-gray-500">
                        {settledFromFrontDesk
                            ? 'Payment completed via guest folio'
                            : 'Payment Completed'}
                    </p>
                </div>
            );
        }

        if (isOrderPaidOrSettled) {
            return (
                <div className="text-center p-4">
                    <p className="text-green-600 font-medium">Order Paid</p>
                    <p className="text-sm text-gray-500">Payment Completed</p>
                </div>
            );
        }

        if (postedToGuestBill) {
            return (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-center text-emerald-900 font-medium">
                        Added to Bill
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                        Payment is disabled until this is removed from the guest
                        folio or settled at Front Office.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                        onClick={handleRemoveFromBill}
                    >
                        {isLoading ? 'Working…' : 'Remove from guest bill'}
                    </Button>
                </div>
            );
        }

        if (step === 0) {
            return (
                <Button
                    disabled={
                        !order.paymentMethod || !order.totalAmount || isLoading
                    }
                    className="text-white bg-orion-blue h-12 hover:bg-orion-blue/80"
                    onClick={
                        mode === 'create' ? handleMakePayment : updatePayment
                    }
                >
                    {isLoading ? <LoaderCircle className="animate-spin" /> : ''}
                    {isLoading
                        ? 'Processing...'
                        : mode === 'create'
                            ? 'Make Payment'
                            : 'Update Payment'}
                </Button>
            );
        }
        return null;
    };

    const renderTrigger = () => {
        if (isOrderComplemented || fullyComplimentary) {
            return (
                trigger ?? (
                    <button
                        className="text-green-700 cursor-not-allowed"
                        disabled
                        title="Order is fully complimentary — no payment required"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        Complimentary
                    </button>
                )
            );
        }

        if (isOrderSettled) {
            return (
                trigger ?? (
                    <button
                        className="text-gray-500 cursor-not-allowed"
                        disabled
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        {settledFromFrontDesk
                            ? 'Bill Settled from Front Desk'
                            : 'Settled'}
                    </button>
                )
            );
        }

        if (isOrderPaidOrSettled) {
            return (
                trigger ?? (
                    <button
                        className="text-gray-500 cursor-not-allowed"
                        disabled
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        Paid
                    </button>
                )
            );
        }

        if (postedToGuestBill) {
            return (
                trigger ?? (
                    <button
                        type="button"
                        className="text-emerald-800 font-medium text-sm hover:underline"
                    >
                        Posted to Room
                    </button>
                )
            );
        }

        return (
            trigger ?? (
                <button className="text-blue-600 hover:text-blue-800">
                    View
                </button>
            )
        );
    };

    const handleMakePayment = async () => {
        if (!order.paymentMethod || !order.totalAmount) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={`Please fill in all required payment details`}
                    type="error"
                />
            ));
            return;
        }
        const mappedOrder = {
            guestName: order.guestName,
            guestEmail: order.guestEmail,
            guestPhoneNumber: order.phoneNumber,
            waiterId: order.waiter?.id,
            orderType: order.orderType,
            tableId: order.table?.id,
            roomId: order.room?.id,
            paymentStatus: 'PAID',
            paymentMethod: order.paymentMethod,
            remark: order.orderType === 'DELIVERY' ? order.remark : null,
            scheduledFor:
                order.orderType === 'DELIVERY' ? order.timeExpected : null,
            receivingAccount: order.recievingAccount,
            address: order.address,
            items: order.items.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
            })),
            totalPrice: totalAmountValue,
            subtotal: subtotalValue,
            vatAmount: vatAmountValue,
            vatRateSnapshot: derivedVatRate,
            serviceChargeAmount: serviceChargeAmountValue,
            serviceChargeRateSnapshot: derivedServiceChargeRate,
            tipAmount: includeTip ? tipAmountValue : 0,
            tipRateSnapshot: includeTip ? derivedTipRate : 0,
        };

        setIsLoading(true);
        try {
            const response = await createOrder(mappedOrder);
            if (response.data) {
                const iaPost = await maybePostBillToInternalAccount({
                    paymentMethod: order.paymentMethod,
                    receivingAccount: order.recievingAccount,
                    billAmount: totalAmountValue,
                    sourceModule: resolveSourceModuleFromOrderType(
                        order.orderType,
                    ),
                    guestCustomer: resolveOrderGuestCustomerName(order.guestName),
                    roomTableNo: resolveOrderRoomTableNo(order),
                    postedBy: user?.fullName || 'Restaurant',
                    referenceId: response.data?.id ?? order.requestId,
                });
                if (iaPost.error) {
                    toast.custom(() => (
                        <Toast
                            title="Payment saved"
                            description={`Payment succeeded but Internal Account posting failed: ${iaPost.error}`}
                            type="error"
                        />
                    ));
                }

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Payment successful!`}
                        type="success"
                    />
                ));
                resetStep();
                // setOpenPaymentSheet(false); // Keep sheet open after payment
                setIsLoading(false);
                resetParentStep?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to process payment. Please try again.`}
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
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePayment = async () => {
        const mappedOrder = {
            paymentStatus: 'PAID',
            PaymentMethod: order.paymentMethod,
            recievingAccount: order.recievingAccount,
            items: order.items.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
            })),
            totalPrice: totalAmountValue,
            subtotal: subtotalValue,
            vatAmount: vatAmountValue,
            vatRateSnapshot: derivedVatRate,
            serviceChargeAmount: serviceChargeAmountValue,
            serviceChargeRateSnapshot: derivedServiceChargeRate,
            tipAmount: includeTip ? tipAmountValue : 0,
            tipRateSnapshot: includeTip ? derivedTipRate : 0,
        };

        setIsLoading(true);
        const id = updateId || 0;
        try {
            const response = await updateOrder(Number(id), mappedOrder);
            if (response.data) {
                const iaPost = await maybePostBillToInternalAccount({
                    paymentMethod: order.paymentMethod,
                    receivingAccount: order.recievingAccount,
                    billAmount: totalAmountValue,
                    sourceModule: resolveSourceModuleFromOrderType(
                        order.orderType,
                    ),
                    guestCustomer: resolveOrderGuestCustomerName(order.guestName),
                    roomTableNo: resolveOrderRoomTableNo(order),
                    postedBy: user?.fullName || 'Restaurant',
                    referenceId: id,
                });
                if (iaPost.error) {
                    toast.custom(() => (
                        <Toast
                            title="Payment saved"
                            description={`Payment succeeded but Internal Account posting failed: ${iaPost.error}`}
                            type="error"
                        />
                    ));
                }

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Payment successful!`}
                        type="success"
                    />
                ));
                resetStep();
                // setOpenPaymentSheet(false); // Keep sheet open after payment
                setIsLoading(false);
                resetParentStep?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to process payment. Please try again.`}
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
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CustomSheet
            title="Order Details"
            trigger={renderTrigger()}
            noTitle={true}
            open={openPaymentSheet}
            setOpen={setOpenPaymentSheet}
        >
            <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">
                        Request ID: {`#ORD-${order.id}`}
                    </h1>
                    <OrderDiscountBadge order={order} />
                </div>
                <div className="flex items-center gap-2">
                    <Button className="text-hexbrand" variant={'ghost'}>
                        Print
                    </Button>
                    <PermissionGate
                        permissions={[PERMISSIONS.MARK_ORDERS_COMPLEMENTARY]}
                        blockType="hide"
                    >
                        <NoCharge
                            order={order as any}
                            disabled={isVoided}
                            onSuccess={() => {
                                mutate('/orders/query/all');
                                mutate('/orders/query/running');
                                mutate('/orders/query/ready');
                                mutate('/orders/query/settled');
                            }}
                        />
                    </PermissionGate>
                        <OrderDiscount
                            order={order as any}
                            disabled={isVoided}
                            onSuccess={() => {
                                mutate('/orders/query/all');
                                mutate('/orders/query/running');
                                mutate('/orders/query/ready');
                                mutate('/orders/query/settled');
                            }}
                        />
                        <VoidOrder
                            order={order as any}
                            disabled={isVoided}
                            onSuccess={() => {
                                mutate('/orders/query/all');
                                mutate('/orders/query/running');
                                mutate('/orders/query/ready');
                                mutate('/orders/query/settled');
                            }}
                        />
                </div>
            </div>
            <PostedToInternalAccount
                order={{
                    paymentMethod: order.paymentMethod,
                    receivingAccount: order.recievingAccount,
                }}
                className="mb-4"
            />
            <div className="bg-hexbrand/10 p-4 rounded-lg flex flex-col gap-4 ">
                {fields.map((field) => (
                    <div className="grid grid-cols-2 text-sm" key={field.label}>
                        <span className="text-gray-500 capitalize">
                            {field.label}
                        </span>
                        <span className="text-gray-600">{field.value}</span>
                    </div>
                ))}
                {order.orderType === 'DINE_IN' &&
                    tableFields.map((field) => (
                        <div
                            className="grid grid-cols-2 text-sm"
                            key={field.label}
                        >
                            <span className="text-gray-500 capitalize">
                                {field.label}
                            </span>
                            <span className="text-gray-600">{field.value}</span>
                        </div>
                    ))}
                {order.orderType === 'DELIVERY' &&
                    deliveryFields.map((field) => (
                        <div
                            className="grid grid-cols-2 text-sm"
                            key={field.label}
                        >
                            <span className="text-gray-500 capitalize">
                                {field.label}
                            </span>
                            <span className="text-gray-600">{field.value}</span>
                        </div>
                    ))}
                {order.orderType === 'ROOM' &&
                    roomFields.map((field) => (
                        <div
                            className="grid grid-cols-2 text-sm"
                            key={field.label}
                        >
                            <span className="text-gray-500 capitalize">
                                {field.label}
                            </span>
                            <span className="text-gray-600">{field.value}</span>
                        </div>
                    ))}
            </div>

            {!postedToGuestBill && step === 0 && renderStep0()}
            {!postedToGuestBill && step === 1 && renderStep1()}
            {postedToGuestBill && (
                <p className="text-sm text-muted-foreground mt-4">
                    This order has been posted to the guest account. Use
                    &quot;Remove from guest bill&quot; below if the charge
                    should be reversed.
                </p>
            )}

            <div className="mt-4 flex flex-col gap-4">
                {renderActionButtons()}
            </div>
        </CustomSheet>
    );
};
