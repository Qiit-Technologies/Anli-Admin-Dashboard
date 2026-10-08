'use client';

import { BankAccount, getAllBankAccounts } from '@/app/actions/bank-accounts';
import {
    addOrderToBill,
    removeOrderFromBill,
    updateOrder,
} from '@/app/actions/order';
import { getInHouseRoomsForGuestCharges } from '@/app/actions/room';
import { InputField, SelectField } from '@/components/common/Form';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import RoomComp from '@/components/front-of-house/tables/RoomComp';
import { usePermissions } from '@/hooks/auth/usePermission';
import { useInternalAccountOptions } from '@/hooks/useInternalAccountOptions';
import useHotel from '@/hooks/useHotel';
import { useUser } from '@/context/useUser';
import {
    maybePostSplitBillsToInternalAccount,
    resolveOrderGuestCustomerName,
    resolveOrderRoomTableNo,
    resolveSourceModuleFromOrderType,
    savePendingIaPaymentRequest,
    loadPendingIaPaymentRequest,
    clearPendingIaPaymentRequest,
    type PendingIaPaymentRequest,
} from '@/lib/internal-accounts/post-bill';
import { isInternalAccountPaymentMethod } from '@/lib/internal-accounts/settlement';
import { getPostedBillStatus } from '@/app/actions/internal-accounts-ledger';
import { formatBankAccountLabel } from '@/lib/utils';
import { LoaderCircle, X } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import Toast from '../toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
    deriveOrderTotals,
    isPaymentStatusAddedToBill,
    isPaymentStatusBillSettledFromFrontDesk,
    isPaymentStatusPaidOrSettled,
} from './utils';
import {
    getComplimentaryAmounts,
    isFullyComplimentaryOrder,
} from './utils/complimentary';

interface PaymentFormProps {
    order: {
        id: number;
        paymentStatus: string;
        paymentMethod: string;
        roomNumber?: number;
        receivingAccount: string;
        totalAmount: string;
        guestName?: string | null;
        subtotal?: string | number;
        vatAmount?: string | number;
        vatRate?: number;
        vatRateSnapshot?: number;
        serviceChargeAmount?: number;
        serviceChargeRateSnapshot?: number;
        serviceChargeRate?: number;
        tipAmount?: number;
        tipRateSnapshot?: number;
        tipRate?: number;
        orderType?: string;
        complimentaryStatus?: 'NONE' | 'FULL' | 'PARTIAL';
        complimentaryAmount?: number | string;
        remainingBalance?: number | string;
        isComplimented?: boolean;
        waivedCharges?: {
            vat?: boolean;
            serviceCharge?: boolean;
            tip?: boolean;
            customCharges?: boolean;
            waivedByName?: string | null;
        } | null;
        waivedAmount?: number;
        waiverReason?: string | null;
        room?: { id?: number; roomNumber?: string | number };
        table?: { number?: string | number | null } | null;
        hotel?: any;
        items?: Array<{
            id?: number;
            price?: string | number;
            quantity?: number;
            isNewlyAdded?: boolean;
            previousQuantity?: number;
        }>;
        payments?: Array<{
            id: number;
            paymentMethod: string;
            receivingAccount: string;
            roomNumber?: string;
            amount: string;
            transactionReference?: string;
        }>;
    };
    onSuccess?: () => void;
    /** Refresh order data without closing the payment form (e.g. IA reject). */
    onRefresh?: () => void;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
    order,
    onSuccess,
    onRefresh,
    isOpen,
    onToggle,
}) => {
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [complimentaryRoomId, setComplimentaryRoomId] = useState('');
    const [roomCompEnabled, setRoomCompEnabled] = useState(false);
    const sectionRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            sectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [isOpen]);
    const { data: inHouseRoomOpts = [], isLoading: loadingInHouseRooms } =
        useSWR('rooms-in-house-for-charges', async () => {
            const res = await getInHouseRoomsForGuestCharges();
            if (res.error || !res.data) return [];
            return res.data;
        });
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { options: remappedInternalAccounts } = useInternalAccountOptions();
    const { user } = useUser();
    const { organization } = useHotel();

    const restaurantVatInclusive =
        organization?.restaurantVatInclusive ?? false;
    const restaurantServiceChargeInclusive =
        organization?.restaurantServiceChargeInclusive ?? false;
    const restaurantTipInclusive =
        organization?.restaurantTipInclusive ?? false;
    const restaurantCustomChargesInclusive =
        organization?.restaurantCustomChargesInclusive ?? false;
    const remappedBankAccounts = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );

    const pricingTotals = deriveOrderTotals({
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        vatAmount: order.vatAmount,
        vatRateSnapshot: order.vatRateSnapshot ?? order.vatRate,
        vatRate: order.vatRate,
        serviceChargeAmount: order.serviceChargeAmount,
        serviceChargeRateSnapshot:
            order.serviceChargeRateSnapshot ?? order.serviceChargeRate,
        serviceChargeRate: order.serviceChargeRate,
        tipAmount: order.tipAmount,
        tipRateSnapshot: order.tipRateSnapshot ?? order.tipRate,
        tipRate: order.tipRate,
        orderType: order.orderType,
        hotel: order.hotel,
    });

    const complimentaryAmounts = getComplimentaryAmounts(order as any);
    const fullyComplimentary = isFullyComplimentaryOrder(order as any);
    const existingPaidAmount = (order.payments ?? []).reduce(
        (sum, payment) => sum + Number(payment.amount ?? 0),
        0,
    );
    // Charge outstanding only — for complementary use remainingBalance; otherwise total − paid.
    const totalOrderAmount = complimentaryAmounts
        ? Math.max(complimentaryAmounts.balance, 0)
        : Math.max(pricingTotals.total - existingPaidAmount, 0);

    const paymentAmountSyncKey = [
        order.complimentaryStatus,
        order.complimentaryAmount,
        order.remainingBalance,
        order.totalAmount,
        totalOrderAmount,
    ].join('|');
    const subtotalAmount = pricingTotals.subtotal;
    const vatAmount = pricingTotals.vatAmount;
    const vatRate = pricingTotals.vatRate;
    const serviceChargeAmount = pricingTotals.serviceChargeAmount;
    const serviceChargeRate = pricingTotals.serviceChargeRate;
    const tipAmount = pricingTotals.tipAmount;
    const tipRate = pricingTotals.tipRate;

    const formatAmount = (value: number) =>
        `₦${value.toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const [payments, setPayments] = useState([
        {
            id: Date.now(),
            paymentMethod: order.paymentMethod || '',
            receivingAccount: order.receivingAccount || '',
            roomNumber: order.roomNumber?.toString() || '',
            amount: totalOrderAmount.toString(),
            reference: '',
            remarks: '',
        },
    ]);
    const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);
    const [iaPendingRequest, setIaPendingRequest] =
        useState<PendingIaPaymentRequest | null>(null);
    const [iaPaymentLocked, setIaPaymentLocked] = useState(false);

    const { hasPermission } = usePermissions();
    const canPostIaBills = hasPermission(
        PERMISSIONS.POST_BILLS_TO_INTERNAL_ACCOUNT,
    );
    const usesInternalAccountPayment = payments.some((payment) =>
        isInternalAccountPaymentMethod(payment.paymentMethod),
    );
    const primaryActionLabel =
        usesInternalAccountPayment && !canPostIaBills
            ? 'Request Approval'
            : 'Make Payment';

    React.useEffect(() => {
        setPayments([
            {
                id: Date.now(),
                paymentMethod: order.paymentMethod || '',
                receivingAccount: order.receivingAccount || '',
                roomNumber: order.roomNumber?.toString() || '',
                amount: totalOrderAmount.toString(),
                reference: '',
                remarks: '',
            },
        ]);
        setSelectedPaymentIndex(0);
    }, [paymentAmountSyncKey]);

    React.useEffect(() => {
        const existing = loadPendingIaPaymentRequest(order.id);
        if (existing) {
            setIaPendingRequest(existing);
            setIaPaymentLocked(true);
        }
    }, [order.id]);

    React.useEffect(() => {
        if (!iaPendingRequest) return;

        let cancelled = false;
        const poll = async () => {
            const bill = await getPostedBillStatus(iaPendingRequest.billId);
            if (!bill || cancelled) return;

            if (
                bill.status === 'Pending' ||
                bill.status === 'Reversal Requested'
            ) {
                return;
            }

            if (bill.status === 'Approved') {
                clearPendingIaPaymentRequest(order.id);
                setIaPendingRequest(null);
                setIaPaymentLocked(false);
                mutate('order-payment');
                mutate('/orders/query/all');
                mutate('/orders/query/running');
                mutate('/orders/query/ready');
                mutate('/orders/query/settled');
                mutate('pending-ia-bill-approvals');
                toast.custom(() => (
                    <Toast
                        title="Payment approved"
                        description="Internal Account payment has been approved and applied."
                        type="success"
                    />
                ));
                onSuccess?.();
                return;
            }

            if (bill.status === 'Rejected' || bill.status === 'Reversed') {
                const reversed = bill.status === 'Reversed';
                clearPendingIaPaymentRequest(order.id);
                setIaPendingRequest(null);
                setIaPaymentLocked(false);
                setStep(0);
                setPayments([
                    {
                        id: Date.now(),
                        paymentMethod: '',
                        receivingAccount: '',
                        roomNumber: '',
                        amount: totalOrderAmount.toString(),
                        reference: '',
                        remarks: '',
                    },
                ]);
                setSelectedPaymentIndex(0);
                mutate('order-payment');
                mutate('/orders/query/all');
                mutate('/orders/query/running');
                mutate('/orders/query/ready');
                mutate('pending-ia-bill-approvals');
                toast.custom(() => (
                    <Toast
                        title={reversed ? 'Payment reversed' : 'Request rejected'}
                        description={
                            reversed
                                ? 'Internal Account reversal was approved. The order is unpaid again — collect payment as usual.'
                                : 'Internal Account posting was rejected. Payment form is open — choose another method or try again.'
                        }
                        type={reversed ? 'success' : 'error'}
                    />
                ));
                onRefresh?.();
                onToggle?.(true);
            }
        };

        void poll();
        const timer = window.setInterval(() => {
            void poll();
        }, 8000);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [
        iaPendingRequest,
        order.id,
        onSuccess,
        onRefresh,
        onToggle,
        totalOrderAmount,
    ]);

    const totalPaidAmount = payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
    );
    const remainingAmount = totalOrderAmount - totalPaidAmount;

    const resetStep = () => {
        setStep(0);
    };

    const addNewPayment = () => {
        if (remainingAmount <= 0) return;
        const newPayment = {
            id: Date.now(),
            paymentMethod: '',
            receivingAccount: '',
            roomNumber: '',
            amount: remainingAmount > 0 ? remainingAmount.toString() : '0',
            reference: '',
            remarks: '',
        };
        setPayments([...payments, newPayment]);
        setSelectedPaymentIndex(payments.length);
    };

    const removePayment = (index: number) => {
        if (payments.length > 1) {
            const updatedPayments = payments.filter((_, i) => i !== index);
            setPayments(updatedPayments);
            setSelectedPaymentIndex(Math.max(0, index - 1));
        }
    };

    const updatePayment = (index: number, field: string, value: string) => {
        setPayments((prevPayments) =>
            prevPayments.map((payment, i) =>
                i === index ? { ...payment, [field]: value } : payment,
            ),
        );
    };

    const currentPayment = payments[selectedPaymentIndex];

    const renderPaymentTabs = () => (
        <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                    Payment Methods ({payments.length})
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewPayment}
                    className="text-xs"
                    disabled={remainingAmount <= 0}
                >
                    + Add Another Payment
                </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
                {payments.map((payment, index) => (
                    <div
                        key={payment.id}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer min-w-fit ${
                            selectedPaymentIndex === index
                                ? 'border-orion-blue bg-orion-blue/10'
                                : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPaymentIndex(index)}
                    >
                        <span className="text-xs">
                            {payment.paymentMethod || 'New'} #{index + 1}
                        </span>
                        {payment.amount && (
                            <span className="text-xs text-gray-600">
                                ₦
                                {Number(payment.amount).toLocaleString('en-NG')}
                            </span>
                        )}
                        {payments.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removePayment(index);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs ml-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPaymentSummary = () => (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
            {complimentaryAmounts ? (
                <>
                    <div className="flex justify-between text-sm">
                        <span>Order value:</span>
                        <span>
                            {formatAmount(complimentaryAmounts.orderValue)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm text-orange-700">
                        <span>Complimentary:</span>
                        <span>
                            -{formatAmount(complimentaryAmounts.complimentary)}
                        </span>
                    </div>
                    {complimentaryAmounts.customerPayment > 0 ? (
                        <div className="flex justify-between text-sm text-emerald-700">
                            <span>Already paid:</span>
                            <span>
                                {formatAmount(
                                    complimentaryAmounts.customerPayment,
                                )}
                            </span>
                        </div>
                    ) : null}
                    <div className="flex justify-between text-sm font-semibold border-t border-gray-200 mt-2 pt-2">
                        <span>Balance due:</span>
                        <span>{formatAmount(totalOrderAmount)}</span>
                    </div>
                </>
            ) : (
                <div className="flex justify-between text-sm">
                    <span>Total Order Amount:</span>
                    <span>{formatAmount(totalOrderAmount)}</span>
                </div>
            )}
            {!complimentaryAmounts &&
                subtotalAmount !== null &&
                subtotalAmount > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>Subtotal (before VAT):</span>
                        <span>{formatAmount(subtotalAmount)}</span>
                    </div>
                )}
            {!complimentaryAmounts &&
                !restaurantVatInclusive &&
                vatAmount > 0 &&
                vatRate > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>{`VAT (${vatRate.toFixed(2)}%)`}</span>
                        <span>{formatAmount(vatAmount)}</span>
                    </div>
                )}
            {!complimentaryAmounts &&
                !restaurantServiceChargeInclusive &&
                serviceChargeAmount > 0 &&
                serviceChargeRate > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>{`Service Charge (${serviceChargeRate.toFixed(2)}%)`}</span>
                        <span>{formatAmount(serviceChargeAmount)}</span>
                    </div>
                )}
            {!complimentaryAmounts &&
                !restaurantTipInclusive &&
                tipAmount > 0 &&
                tipRate > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>{`Tip (${tipRate.toFixed(2)}%)`}</span>
                        <span>{formatAmount(tipAmount)}</span>
                    </div>
                )}
            <div className="flex justify-between text-sm">
                <span>Total Allocated:</span>
                <span
                    className={
                        totalPaidAmount > totalOrderAmount ? 'text-red-500' : ''
                    }
                >
                    {formatAmount(totalPaidAmount)}
                </span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                <span>Remaining:</span>
                <span
                    className={
                        remainingAmount < 0
                            ? 'text-red-500'
                            : remainingAmount === 0
                              ? 'text-green-500'
                              : ''
                    }
                >
                    {`${remainingAmount < 0 ? '-' : ''}${formatAmount(Math.abs(remainingAmount))}`}
                </span>
            </div>
        </div>
    );

    const renderStep0 = () => (
        <div className="flex flex-col gap-4 mt-4">
            {renderPaymentTabs()}
            {renderPaymentSummary()}
            {currentPayment?.paymentMethod === 'added to bill' && (
                <RoomComp
                    checked={roomCompEnabled}
                    onCheckedChange={setRoomCompEnabled}
                />
            )}

            <div className="border p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-3">
                    Payment #{selectedPaymentIndex + 1} Details
                </h4>

                <div className="flex flex-col gap-4">
                    <SelectField
                        id={`paymentMethod-${selectedPaymentIndex}`}
                        name="paymentMethod"
                        label="Payment Method"
                        options={[
                            { value: 'cash', label: 'Cash Payment' },
                            { value: 'card', label: 'Card Payment' },
                            { value: 'transfer', label: 'Bank Transfer' },
                            {
                                value: 'internal_account',
                                label: 'Internal Account',
                            },
                            { value: 'added to bill', label: 'Add to Bill' },
                        ]}
                        value={currentPayment?.paymentMethod || ''}
                        onValueChange={(value) => {
                            updatePayment(
                                selectedPaymentIndex,
                                'paymentMethod',
                                value,
                            );
                            updatePayment(
                                selectedPaymentIndex,
                                'receivingAccount',
                                '',
                            );
                        }}
                    />

                    {currentPayment?.paymentMethod !== 'added to bill' && (
                        <SelectField
                            name="receivingAccount"
                            id={`receivingAccount-${selectedPaymentIndex}`}
                            label={
                                currentPayment?.paymentMethod ===
                                'internal_account'
                                    ? 'Internal Account'
                                    : 'Account to pay into'
                            }
                            options={
                                currentPayment?.paymentMethod ===
                                'internal_account'
                                    ? remappedInternalAccounts
                                    : remappedBankAccounts
                            }
                            value={currentPayment?.receivingAccount || ''}
                            onValueChange={(value) =>
                                updatePayment(
                                    selectedPaymentIndex,
                                    'receivingAccount',
                                    value,
                                )
                            }
                            placeholder={
                                currentPayment?.paymentMethod ===
                                'internal_account'
                                    ? 'Select internal account'
                                    : 'Select account'
                            }
                        />
                    )}

                    {currentPayment?.paymentMethod === 'added to bill' &&
                        loadingInHouseRooms === false && (
                            <SelectField
                                id={`roomNumber-${selectedPaymentIndex}`}
                                name="roomNumber"
                                label="Room – guest (in-house)"
                                value={currentPayment?.roomNumber || ''}
                                onValueChange={(value) =>
                                    updatePayment(
                                        selectedPaymentIndex,
                                        'roomNumber',
                                        value,
                                    )
                                }
                                options={inHouseRoomOpts.map((opt) => ({
                                    value: String(opt.room.id),
                                    label: opt.displayLabel,
                                }))}
                                placeholder="Select room – guest"
                                required
                                className="w-full"
                            />
                        )}

                    <InputField
                        id={`amount-${selectedPaymentIndex}`}
                        name="amount"
                        label="Payment Amount"
                        type="text"
                        value={
                            currentPayment?.amount
                                ? `₦${Number(currentPayment.amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                : '₦0'
                        }
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(
                                /[^0-9]/g,
                                '',
                            );
                            updatePayment(
                                selectedPaymentIndex,
                                'amount',
                                rawValue || '0',
                            );
                        }}
                    />

                    {currentPayment?.paymentMethod &&
                        currentPayment.paymentMethod !== 'cash' &&
                        currentPayment.paymentMethod !== 'added to bill' && (
                            <InputField
                                id={`reference-${selectedPaymentIndex}`}
                                name="reference"
                                label="Reference (optional)"
                                type="text"
                                value={currentPayment?.reference || ''}
                                onChange={(e) =>
                                    updatePayment(
                                        selectedPaymentIndex,
                                        'reference',
                                        e.target.value,
                                    )
                                }
                                placeholder="Transfer/POS reference"
                            />
                        )}

                    <InputField
                        id={`remarks-${selectedPaymentIndex}`}
                        name="remarks"
                        label="Remarks (optional)"
                        type="text"
                        value={currentPayment?.remarks || ''}
                        onChange={(e) =>
                            updatePayment(
                                selectedPaymentIndex,
                                'remarks',
                                e.target.value,
                            )
                        }
                        placeholder="Note for this allocation"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="flex flex-col gap-4">
            <div className="text-sm text-gray-600 mb-2">
                Processing{' '}
                {
                    payments.filter((p) => p.paymentMethod === 'added to bill')
                        .length
                }{' '}
                bill payment(s)
            </div>
            {roomCompEnabled && (
                <p className="text-sm text-emerald-700">
                    This order will be posted to the room without a charge.
                </p>
            )}
            <Button
                className="text-white bg-orion-blue h-12 hover:bg-orion-blue/80"
                onClick={handleAddToBill}
            >
                Continue to Add to Bill
            </Button>
        </div>
    );

    const renderActionButtons = () => {
        if (step === 0) {
            const billPayments = payments.filter(
                (p) => p.paymentMethod === 'added to bill',
            );
            const otherPayments = payments.filter(
                (p) => p.paymentMethod !== 'added to bill',
            );

            if (billPayments.length > 0 && otherPayments.length === 0) {
                return (
                    <Button
                        className="text-white w-full bg-orion-blue h-12 hover:bg-orion-blue/80"
                        onClick={() => setStep(1)}
                        disabled={
                            (remainingAmount !== 0 && !roomCompEnabled) ||
                            !billPayments[0]?.roomNumber ||
                            loadingInHouseRooms
                        }
                    >
                        Continue to Add to Bill
                    </Button>
                );
            }

            const isFormValid =
                payments.every(
                    (payment) =>
                        payment.paymentMethod &&
                        payment.amount !== undefined &&
                        payment.amount !== null &&
                        Number(payment.amount) > 0 &&
                        (payment.paymentMethod === 'added to bill'
                            ? payment.roomNumber
                            : payment.paymentMethod === 'cash'
                              ? true
                              : Boolean(payment.receivingAccount)),
                ) && remainingAmount === 0;

            return (
                <Button
                    disabled={!isFormValid || isLoading || iaPaymentLocked}
                    className="text-white bg-orion-blue h-10 w-full hover:bg-orion-blue/80"
                    onClick={updatePaymentSplit}
                >
                    {isLoading ? <LoaderCircle className="animate-spin" /> : ''}
                    {isLoading ? 'Processing...' : primaryActionLabel}
                </Button>
            );
        }
        return null;
    };

    const handleAddToBill = async () => {
        try {
            setIsLoading(true);
            const billPayments = payments.filter(
                (p) => p.paymentMethod === 'added to bill',
            );
            const roomIdRaw = billPayments[0]?.roomNumber;
            const roomIdNum =
                roomIdRaw !== undefined &&
                roomIdRaw !== '' &&
                !Number.isNaN(Number(roomIdRaw))
                    ? Number(roomIdRaw)
                    : undefined;
            if (!roomIdNum) {
                toast.custom(() => (
                    <Toast
                        title="Room required"
                        description="Select an in-house room / guest before adding to bill."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }
            const patch = await updateOrder(order.id, {
                roomId: roomIdNum,
            });
            if (patch.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            patch.error ||
                            'Could not attach room to order before posting.'
                        }
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }
            const response = await addOrderToBill(
                order.id,
                roomIdNum,
                roomCompEnabled,
            );
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            roomCompEnabled
                                ? 'Order posted to the room as complimentary.'
                                : 'Order added to bill successfully!'
                        }
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
                mutate(
                    (key) =>
                        typeof key === 'string' && key.startsWith('/guests'),
                );
                resetStep();
                setRoomCompEnabled(false);
                onSuccess?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.error ||
                            `Failed to add order to bill. Please try again.`
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
                    description={`Failed to add order to bill. Please try again.`}
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostComplimentaryToRoom = async () => {
        const roomId = Number(complimentaryRoomId);
        if (!roomId) return;
        setIsLoading(true);
        try {
            const response = await addOrderToBill(order.id, roomId);
            if (!response.data) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.error ||
                            'Could not post complimentary order to room.'
                        }
                        type="error"
                    />
                ));
                return;
            }
            toast.custom(() => (
                <Toast
                    title="Posted to room"
                    description="Complimentary order recorded on the room bill with no charge."
                    type="success"
                />
            ));
            mutate('/orders/query/all');
            mutate('/orders/query/running');
            mutate('/orders/query/ready');
            mutate('/orders/query/settled');
            mutate('/checkedInGuests');
            onSuccess?.();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromBill = async () => {
        if (!confirm('Are you sure you want to remove this from guest bill?')) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await removeOrderFromBill(order.id);
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Removed from bill"
                        description="You can take payment for this order again."
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
                onSuccess?.();
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

    const updatePaymentSplit = async () => {
        if (remainingAmount !== 0) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={`Payment amounts must equal the outstanding balance`}
                    type="error"
                />
            ));
            return;
        }

        const mappedPayments = payments.map((payment) => ({
            paymentMethod: payment.paymentMethod,
            receivingAccount: payment.receivingAccount || '',
            amount: Number(payment.amount),
            roomId: payment.roomNumber ? Number(payment.roomNumber) : undefined,
            transactionReference: payment.reference?.trim() || undefined,
            remarks: payment.remarks?.trim() || undefined,
        }));

        const priorPayments = (order.payments ?? []).map((payment) => ({
            paymentMethod: payment.paymentMethod,
            receivingAccount: payment.receivingAccount || '',
            amount: Number(payment.amount),
            transactionReference:
                (payment as { transactionReference?: string })
                    .transactionReference || undefined,
            remarks: (payment as { remarks?: string }).remarks || undefined,
        }));

        const iaPayments = mappedPayments.filter((payment) =>
            isInternalAccountPaymentMethod(payment.paymentMethod),
        );
        const guestCustomer = resolveOrderGuestCustomerName(order.guestName);
        const roomTableNo = resolveOrderRoomTableNo(order);
        const sourceModule = resolveSourceModuleFromOrderType(order.orderType);
        const postedBy = user?.fullName || 'Restaurant';

        setIsLoading(true);
        try {
            // All restaurant IA payments require approval before the order is
            // marked paid. Staff without Post Bills see "Request Approval";
            // others see "Make Payment" — same pending lock flow either way.
            if (iaPayments.length > 0) {
                const iaPost = await maybePostSplitBillsToInternalAccount({
                    payments: iaPayments,
                    sourceModule,
                    guestCustomer,
                    roomTableNo,
                    postedBy,
                    referenceId: order.id,
                });
                if (iaPost.error || !iaPost.bills?.[0]?.billId) {
                    toast.custom(() => (
                        <Toast
                            title="Request failed"
                            description={
                                iaPost.error ||
                                'Could not submit Internal Account approval request.'
                            }
                            type="error"
                        />
                    ));
                    return;
                }

                const firstBill = iaPost.bills[0];
                const pendingPayload: PendingIaPaymentRequest = {
                    orderId: order.id,
                    billId: String(firstBill.billId),
                    accountId: String(firstBill.accountId),
                    invoiceNo: String(firstBill.invoiceNo ?? ''),
                    receivingAccount: iaPayments[0]?.receivingAccount || '',
                    payments: mappedPayments.map((payment) => ({
                        paymentMethod: payment.paymentMethod,
                        receivingAccount: payment.receivingAccount || '',
                        amount: payment.amount,
                    })),
                };
                savePendingIaPaymentRequest(pendingPayload);
                setIaPendingRequest(pendingPayload);
                setIaPaymentLocked(true);

                // Persist method selection so order details show Pending IA context.
                // Do NOT mark PAID until the bill is approved.
                await updateOrder(order.id, {
                    paymentMethod: 'internal_account',
                    receivingAccount: pendingPayload.receivingAccount,
                });

                toast.custom(() => (
                    <Toast
                        title="Approval requested"
                        description="Payment is locked until an Internal Account approver reviews this request."
                        type="success"
                    />
                ));
                mutate('pending-ia-bill-approvals');
                onRefresh?.();
                return;
            }

            const orderUpdate = {
                paymentStatus: 'PAID',
                payments: [...priorPayments, ...mappedPayments],
            };

            const response = await updateOrder(order.id, orderUpdate);
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Payment processed successfully"
                        type="success"
                    />
                ));
                mutate('order-payment');
                mutate('/orders/query/all');
                mutate('/orders/query/running');
                mutate('/orders/query/ready');
                mutate('/orders/query/settled');
                onSuccess?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.error || 'Could not process payment.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error) {
            console.error(error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={`Failed to process split payment. Please try again.`}
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const canProcessPayment = hasPermission(
        PERMISSIONS.VIEW_OR_INITIATE_ORDER_PAYMENT,
    );

    const onGuestBill = isPaymentStatusAddedToBill(order.paymentStatus);
    const settledFromFrontDesk = isPaymentStatusBillSettledFromFrontDesk(
        order.paymentStatus,
    );
    const isOrderPaidOrSettled = isPaymentStatusPaidOrSettled(
        order.paymentStatus,
    );
    const newlyAddedItemsAmount = (order.items || []).reduce((sum, item) => {
        if (!item?.isNewlyAdded) return sum;
        const price = Number(item.price || 0);
        const quantity = Number(item.quantity || 0);
        const previousQuantity = Number(item.previousQuantity || 0);
        const payableQty =
            previousQuantity > 0
                ? Math.max(0, quantity - previousQuantity)
                : quantity;
        return sum + price * payableQty;
    }, 0);

    const handleSettleNewItems = async () => {
        if (newlyAddedItemsAmount <= 0) return;
        setIsLoading(true);
        try {
            const response = await updateOrder(order.id, {
                newItemsOnlyPaymentAmount: Number(
                    newlyAddedItemsAmount.toFixed(2),
                ),
            });
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Newly added items settled successfully."
                        type="success"
                    />
                ));
                mutate('order-payment');
                mutate('/orders/query/all');
                mutate('/orders/query/running');
                mutate('/orders/query/ready');
                mutate('/orders/query/settled');
                mutate('/checkedInGuests');
                mutate('list-data');
                mutate('/hotelGuests');
                mutate(
                    (key) =>
                        typeof key === 'string' && key.startsWith('/guests'),
                );
                onSuccess?.();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.error ||
                            'Could not settle newly added items.'
                        }
                        type="error"
                    />
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {fullyComplimentary ? (
                <div className="text-center py-4 border rounded-lg">
                    <p className="text-green-600 font-medium">Complimentary</p>
                    <p className="text-sm text-gray-500">
                        No payment required — all items are complimentary.
                    </p>
                    {!onGuestBill && canProcessPayment && (
                        <div className="mt-4 flex flex-col gap-3 text-left">
                            <SelectField
                                id="complimentaryRoom"
                                name="complimentaryRoom"
                                label="Room – guest (in-house)"
                                value={complimentaryRoomId}
                                onValueChange={setComplimentaryRoomId}
                                options={inHouseRoomOpts.map((opt) => ({
                                    value: String(opt.room.id),
                                    label: opt.displayLabel,
                                }))}
                                placeholder="Select room – guest"
                                required
                            />
                            <Button
                                type="button"
                                className="w-full bg-orion-blue text-white"
                                disabled={
                                    !complimentaryRoomId ||
                                    isLoading ||
                                    loadingInHouseRooms
                                }
                                onClick={handlePostComplimentaryToRoom}
                            >
                                {isLoading ? 'Posting…' : 'Post Comp to Room'}
                            </Button>
                        </div>
                    )}
                </div>
            ) : canProcessPayment ? (
                <Button
                    variant={'outline'}
                    className="h-12 border-orion-blue text-orion-blue"
                    onClick={() => onToggle?.(!isOpen)}
                    disabled={
                        onGuestBill ||
                        settledFromFrontDesk ||
                        isOrderPaidOrSettled
                    }
                >
                    {isOpen
                        ? 'Hide Payment Form'
                        : settledFromFrontDesk
                          ? 'Bill Settled from Front Desk'
                          : onGuestBill
                            ? 'Posted to Room'
                            : primaryActionLabel}
                </Button>
            ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    You do not have permission to process payments. Please
                    contact a cashier or manager.
                </div>
            )}
            <AnimatePresence>
                {isOpen && canProcessPayment && !fullyComplimentary && (
                    <motion.div
                        ref={sectionRef}
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border p-4 rounded-lg"
                    >
                        {settledFromFrontDesk ? (
                            <div className="space-y-4 py-2">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-900">
                                        Bill Settled from Front Desk
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This order was placed on the guest folio
                                        and settled at the Front Office during
                                        checkout or guest payment.
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
                            </div>
                        ) : onGuestBill ? (
                            <div className="space-y-4 py-2">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-900">
                                        Posted to Room
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This order is on the guest folio.
                                        Collect payment here only after removing
                                        it from the bill or once Front Office
                                        has settled it.
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={isLoading}
                                    onClick={handleRemoveFromBill}
                                >
                                    {isLoading
                                        ? 'Working…'
                                        : 'Remove from guest bill'}
                                </Button>
                                {newlyAddedItemsAmount > 0 && (
                                    <Button
                                        type="button"
                                        className="w-full bg-orion-blue text-white hover:bg-orion-blue/80"
                                        disabled={isLoading}
                                        onClick={handleSettleNewItems}
                                    >
                                        {isLoading
                                            ? 'Working…'
                                            : `Settle newly added items (${formatAmount(newlyAddedItemsAmount)})`}
                                    </Button>
                                )}
                            </div>
                        ) : iaPaymentLocked ? (
                            <div className="space-y-3 py-2">
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-sm font-semibold text-amber-900">
                                        Waiting for Internal Account approval
                                    </p>
                                    <p className="mt-1 text-sm text-amber-800">
                                        Payment options are disabled until an
                                        approver accepts or rejects this
                                        request.
                                    </p>
                                    {iaPendingRequest?.invoiceNo ? (
                                        <p className="mt-2 text-xs text-amber-700">
                                            Invoice:{' '}
                                            {iaPendingRequest.invoiceNo}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ) : (
                            <>
                                {step === 0 && renderStep0()}
                                {step === 1 && renderStep1()}
                                <div className="mt-4">
                                    {renderActionButtons()}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentForm;
