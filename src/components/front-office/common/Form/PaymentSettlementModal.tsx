import { makeGuestPaymentAction } from '@/app/actions/payment';
import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import { getAuthToken } from '@/app/actions/auth/auth-token';
import { applyWaiver } from '@/app/actions/guest';
import { BASE_URL } from '@/constants/api';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, formatBankAccountLabel } from '@/lib/utils';
import { getNights } from '@/lib/helpers';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import { useInternalAccountOptions } from '@/hooks/useInternalAccountOptions';
import {
    IA_SOURCE_MODULES,
    maybePostBillToInternalAccount,
} from '@/lib/internal-accounts/post-bill';
import {
    getAdditionalChargesAfterInternalAccountSettlement,
    getInternalAccountSettlementCode,
    hasInternalAccountSettlement,
    isInternalAccountSettlementApproved,
    isInternalAccountSettlementPending,
    isInternalAccountSettlementRejected,
} from '@/lib/internal-accounts/settlement';
import { getGuestInternalAccountBillStatus } from '@/app/actions/internal-accounts-ledger';
import useSWR from 'swr';
import { LoaderCircle, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

export type CheckoutOptions = {
    transferOutstandingToPmFolio?: boolean;
};

interface PaymentSettlementModalProps {
    guest: any;
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (updatedGuest: any) => void;
    onCheckout?: (options?: CheckoutOptions) => void | Promise<void>;
}

const PaymentSettlementModal = ({
    guest,
    isOpen,
    onClose,
    onPaymentSuccess,
    onCheckout,
}: PaymentSettlementModalProps) => {
    const { organization } = useHotel();
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [isPmFolioLoading, setIsPmFolioLoading] = useState(false);
    const [transferToPmFolio, setTransferToPmFolio] = useState(false);
    const [totalDue, setTotalDue] = useState<number | null>(null);
    const [isLoadingTotalDue, setIsLoadingTotalDue] = useState(false);
    const [breakdown, setBreakdown] = useState<{
        totalDue: number;
        reservationBalance: number;
        unpaidServices: Array<{
            id: number;
            amountPaid: number;
            hotelService: { id: number; type: string } | null;
            notes?: string;
        }>;
        unpaidOrders: Array<{
            id: number;
            totalPrice: number;
            items: any[];
            createdAt: string;
        }>;
        roomChargesBreakdown: {
            basePrice: number;
            discountAmount: number;
            vatAmount: number;
            serviceChargeAmount: number;
            tipAmount: number;
            totalCustomChargesAmount: number;
            totalRoomCharges: number;
            amountPaid: number;
        };
    } | null>(null);
    const [paymentData, setPaymentData] = useState<{
        amountPaid: number;
        paymentMethod: string;
        receivingAccount: string;
    }>({
        amountPaid: 0,
        paymentMethod: '',
        receivingAccount: '',
    });
    const [waiverData, setWaiverData] = useState({
        vat: false,
        serviceCharge: false,
        tip: false,
        customCharges: false,
        reason: '',
    });
    const [isApplyingWaiver, setIsApplyingWaiver] = useState(false);

    const { user } = useUser();
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { options: remappedInternalAccounts, formatPaidThrough } =
        useInternalAccountOptions();
    const remappedBankAccounts = bankAccounts
        ? (bankAccounts as Array<any>)?.map((account) => ({
              label: formatBankAccountLabel(account),
              value: account.accountNumber?.toString() || '',
          }))
        : [];

    const hasIaMarkers = useMemo(
        () => hasInternalAccountSettlement(guest ?? {}),
        [guest],
    );
    const { data: iaBillStatus } = useSWR(
        isOpen && guest?.id && hasIaMarkers
            ? `ia-guest-bill-status-${guest.id}`
            : null,
        () => getGuestInternalAccountBillStatus(guest!.id),
        { refreshInterval: 10000 },
    );
    const iaApproved = isInternalAccountSettlementApproved(iaBillStatus?.status);
    const iaPending = isInternalAccountSettlementPending(iaBillStatus?.status);
    const iaRejected = isInternalAccountSettlementRejected(iaBillStatus?.status);
    // Only treat as settled after approval. Rejected/pending use normal payment UI.
    const settledViaInternalAccount = hasIaMarkers && iaApproved;
    const internalAccountLabel = useMemo(() => {
        const code = getInternalAccountSettlementCode(guest ?? {});
        return formatPaidThrough(code) ?? code;
    }, [guest, formatPaidThrough]);

    // Fetch total due breakdown from backend (includes all breakdown data)
    useEffect(() => {
        if (isOpen && guest?.id) {
            setIsLoadingTotalDue(true);
            getAuthToken()
                .then((authToken) => {
                    if (!authToken) {
                        const roomTotal = Number(
                            guest.totalWithCustomCharges ??
                                guest.totalWithTip ??
                                guest.finalPrice ??
                                0,
                        );
                        const paid = Number(guest.amountPaid ?? 0);
                        const estimatedDue =
                            roomTotal > 0 && paid >= roomTotal - 0.01
                                ? 0
                                : Math.max(
                                      0,
                                      roomTotal > 0
                                          ? roomTotal - paid
                                          : Number(guest.outstanding || 0),
                                  );
                        setTotalDue(estimatedDue);
                        setBreakdown(null);
                        setIsLoadingTotalDue(false);
                        return;
                    }
                    const apiUrl = new URL(
                        `/guests/${guest.id}/total-due`,
                        BASE_URL,
                    ).toString();
                    return fetch(apiUrl, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                    });
                })
                .then((res) => {
                    if (res && res.ok) {
                        return res.json();
                    }
                    // Prefer amountPaid-aware estimate over stale outstanding
                    const roomTotal = Number(
                        guest.totalWithCustomCharges ??
                            guest.totalWithTip ??
                            guest.finalPrice ??
                            0,
                    );
                    const paid = Number(guest.amountPaid ?? 0);
                    const estimatedDue =
                        roomTotal > 0 && paid >= roomTotal - 0.01
                            ? 0
                            : Math.max(
                                  0,
                                  roomTotal > 0
                                      ? roomTotal - paid
                                      : Number(guest.outstanding || 0),
                              );
                    return {
                        totalDue: estimatedDue,
                        reservationBalance: estimatedDue,
                        unpaidServices: [],
                        unpaidOrders: [],
                        roomChargesBreakdown: {
                            basePrice: 0,
                            discountAmount: 0,
                            vatAmount: 0,
                            serviceChargeAmount: 0,
                            tipAmount: 0,
                            totalCustomChargesAmount: 0,
                            totalRoomCharges: roomTotal,
                            amountPaid: paid,
                        },
                    };
                })
                .then((data) => {
                    setTotalDue(data.totalDue || 0);
                    setBreakdown(data);
                    setIsLoadingTotalDue(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch total due breakdown:', err);
                    const roomTotal = Number(
                        guest.totalWithCustomCharges ??
                            guest.totalWithTip ??
                            guest.finalPrice ??
                            0,
                    );
                    const paid = Number(guest.amountPaid ?? 0);
                    const estimatedDue =
                        roomTotal > 0 && paid >= roomTotal - 0.01
                            ? 0
                            : Math.max(
                                  0,
                                  roomTotal > 0
                                      ? roomTotal - paid
                                      : Number(guest.outstanding || 0),
                              );
                    setTotalDue(estimatedDue);
                    setBreakdown(null);
                    setIsLoadingTotalDue(false);
                });
        } else {
            setTotalDue(null);
            setBreakdown(null);
        }
    }, [
        isOpen,
        guest?.id,
        guest?.outstanding,
        guest?.amountPaid,
        guest?.totalWithCustomCharges,
        guest?.totalWithTip,
        guest?.finalPrice,
    ]);

    useEffect(() => {
        if (!isOpen) {
            setTransferToPmFolio(false);
        }
    }, [isOpen, guest?.id]);

    const handlePmFolioCheckout = async () => {
        if (!onCheckout) return;
        setIsPmFolioLoading(true);
        try {
            await onCheckout({ transferOutstandingToPmFolio: true });
            onClose();
        } finally {
            setIsPmFolioLoading(false);
        }
    };

    // Trust live totalDue (room − amountPaid + unpaid services/orders).
    // IA-031: when reservation was settled via Internal Account, never treat the
    // original reservation balance as outstanding — only post-settlement extras.
    const calculateOutstanding = () => {
        if (!guest) return 0;

        const guestOutstanding = Number(guest.outstanding || 0);
        const isVoid = !!guest.isVoid;
        const isComplimentary = !!guest.isComplimentary;
        const showBalance = !(isVoid || isComplimentary);

        if (!showBalance) return 0;

        if (settledViaInternalAccount) {
            if (breakdown) {
                return getAdditionalChargesAfterInternalAccountSettlement(
                    breakdown,
                );
            }
            // No breakdown yet — do not fall back to full reservation outstanding
            if (totalDue !== null && !Number.isNaN(totalDue)) {
                const roomTotal = Number(
                    guest.totalWithCustomCharges ??
                        guest.totalWithTip ??
                        guest.finalPrice ??
                        0,
                );
                const paid = Number(guest.amountPaid ?? 0);
                // Prefer stripping room if we can estimate it was the IA settlement
                if (roomTotal > 0 && paid >= roomTotal - 0.01) {
                    return Math.max(0, totalDue);
                }
                // IA marker present: exclude estimated room balance from due
                const roomStillShowing = Math.max(0, roomTotal - paid);
                return Math.max(0, totalDue - roomStillShowing);
            }
            return 0;
        }

        if (totalDue !== null && !Number.isNaN(totalDue)) {
            return Math.max(0, totalDue);
        }

        const roomTotal = Number(
            guest.totalWithCustomCharges ??
                guest.totalWithTip ??
                guest.finalPrice ??
                0,
        );
        const amountPaid = Number(guest.amountPaid ?? 0);
        if (roomTotal > 0 && amountPaid >= roomTotal - 0.01) {
            return 0;
        }

        if (guestOutstanding > 0) {
            return guestOutstanding;
        }

        // Fallback to computed balance if backend outstanding is not available
        const nights = Math.max(1, getNights(guest.startDate, guest.endDate));
        const ratePerNight = Number(guest.room?.price ?? 0);
        const originalTotal = ratePerNight * nights;
        const discountType = guest.discountType;
        const discountValue = Number(guest.discountValue ?? 0);
        const discountAmount =
            discountType === 'PERCENTAGE'
                ? (originalTotal * discountValue) / 100
                : discountType === 'FIXED_AMOUNT'
                  ? discountValue
                  : 0;

        const finalTotal = Math.max(originalTotal - discountAmount, 0);
        const paidAmount = Number(guest.amountPaid ?? 0);
        const computedBalance = Math.max(finalTotal - paidAmount, 0);

        return computedBalance;
    };

    const computedOutstanding = calculateOutstanding();

    // Auto-fill outstanding amount when modal opens
    useEffect(() => {
        if (isOpen && guest && computedOutstanding > 0) {
            setPaymentData((prev) => ({
                ...prev,
                amountPaid: computedOutstanding,
            }));
        }
    }, [isOpen, guest, computedOutstanding]);

    const handlePaymentSettlement = async () => {
        if (
            !guest ||
            paymentData.amountPaid <= 0 ||
            !paymentData.paymentMethod
        ) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please enter a valid payment amount and select a payment method."
                    type="error"
                />
            ));
            return;
        }

        setIsPaymentLoading(true);
        try {
            const response = await makeGuestPaymentAction(guest.id, {
                amountPaid: paymentData.amountPaid,
                paymentMethod: paymentData.paymentMethod,
                receivingAccount: paymentData.receivingAccount,
            });

            if (response.success) {
                const iaPost = await maybePostBillToInternalAccount({
                    paymentMethod: paymentData.paymentMethod,
                    receivingAccount: paymentData.receivingAccount,
                    billAmount: paymentData.amountPaid,
                    sourceModule: IA_SOURCE_MODULES.GUEST_BILLING,
                    guestCustomer:
                        guest.guestName || guest.fullName || 'Guest',
                    roomTableNo: guest.room?.roomNumber
                        ? `Room ${guest.room.roomNumber}`
                        : null,
                    postedBy: user?.fullName || 'Front Desk',
                    referenceId: guest.id,
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

                // Update the guest data with new payment info
                const updatedGuest = {
                    ...guest,
                    amountPaid: response.amountPaid,
                    outstanding: response.outstanding,
                    totalDue: response.totalDue, // Update totalDue from payment response
                };

                onPaymentSuccess(updatedGuest);

                // Trigger checkout after successful payment
                // The checkout handler will show the success toast
                if (onCheckout) {
                    onCheckout();
                }

                onClose();

                // Reset form
                setPaymentData({
                    amountPaid: 0,
                    paymentMethod: '',
                    receivingAccount: '',
                });
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.error ||
                            'Payment failed. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (err: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        err.message || 'Payment failed. Please try again.'
                    }
                    type="error"
                />
            ));
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const handleApplyWaiver = async () => {
        if (!guest) return;

        setIsApplyingWaiver(true);
        try {
            const response = await applyWaiver(guest.id, {
                vat: waiverData.vat,
                serviceCharge: waiverData.serviceCharge,
                tip: waiverData.tip,
                customCharges: waiverData.customCharges,
                waiverReason: waiverData.reason,
            });

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.error}
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Success!"
                    description="Waiver applied successfully."
                    type="success"
                />
            ));

            const updatedGuest = {
                ...guest,
                ...(response.data as any),
            };

            onPaymentSuccess(updatedGuest);
            setWaiverData({
                vat: false,
                serviceCharge: false,
                tip: false,
                customCharges: false,
                reason: '',
            });
        } catch (err: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={err.message || 'Failed to apply waiver.'}
                    type="error"
                />
            ));
        } finally {
            setIsApplyingWaiver(false);
        }
    };

    if (!isOpen) return null;

    // Show loading state if totalDue is being fetched
    if (isLoadingTotalDue) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div className="flex items-center justify-center gap-2">
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                        <span>Loading payment information...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!guest) return null;

    const hasOutstandingBalance = computedOutstanding > 0;
    // IA-031: "Additional" only for real post-settlement extras, never the original bill
    const showAsAdditionalIaCharges =
        settledViaInternalAccount && hasOutstandingBalance;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 pb-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Payment Settlement
                    </h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {hasIaMarkers && iaPending ? (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-amber-700" />
                                <span className="font-medium text-amber-900">
                                    Awaiting Internal Account Approval
                                </span>
                            </div>
                            <p className="text-sm text-amber-800">
                                Posted to{' '}
                                <span className="font-semibold">
                                    {internalAccountLabel || 'Internal Account'}
                                </span>
                                . Check-out is available after approval. If
                                rejected, settle payment here normally.
                            </p>
                        </div>
                    ) : null}

                    {settledViaInternalAccount && internalAccountLabel ? (
                        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-slate-700" />
                                <span className="font-medium text-slate-800">
                                    Reservation Paid Through Internal Account
                                </span>
                            </div>
                            <p className="text-sm text-slate-700">
                                Paid Through:{' '}
                                <span className="font-semibold">
                                    {internalAccountLabel}
                                </span>
                            </p>
                            {!hasOutstandingBalance && (
                                <p className="mt-2 text-xs text-slate-600">
                                    Outstanding Balance:{' '}
                                    <span className="font-semibold">
                                        {formatCurrency(0)}
                                    </span>
                                    . No additional payment is required.
                                </p>
                            )}
                        </div>
                    ) : null}

                    {settledViaInternalAccount &&
                    !hasOutstandingBalance &&
                    breakdown?.roomChargesBreakdown ? (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">
                                Payment Breakdown
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total Reservation Amount:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(
                                            breakdown.roomChargesBreakdown
                                                .totalRoomCharges,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Amount Paid:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(
                                            breakdown.roomChargesBreakdown
                                                .amountPaid,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                    <span className="font-medium text-gray-800">
                                        Outstanding:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {formatCurrency(0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {iaPending ? (
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1"
                            >
                                Close
                            </Button>
                        </div>
                    ) : hasOutstandingBalance ? (
                        <>
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                    <span className="font-medium text-orange-800">
                                        {showAsAdditionalIaCharges
                                            ? 'Additional Outstanding Charges'
                                            : 'Outstanding Balance'}
                                    </span>
                                </div>
                                <p className="text-sm text-orange-700">
                                    {showAsAdditionalIaCharges
                                        ? 'Additional charges after Internal Account settlement: '
                                        : 'Guest has an outstanding balance of '}
                                    <span className="font-semibold">
                                        {formatCurrency(computedOutstanding)}
                                    </span>
                                </p>
                                {showAsAdditionalIaCharges && (
                                    <p className="mt-2 text-xs text-orange-800/90">
                                        These charges will not automatically
                                        post to the Internal Account unless you
                                        select Internal Account as the payment
                                        method.
                                    </p>
                                )}
                            </div>

                            {/* Breakdown */}
                            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <h3 className="font-medium text-gray-800 mb-2">
                                    Payment Breakdown
                                </h3>
                                <div className="space-y-1 text-sm">
                                    {breakdown ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Subtotal (Reservation
                                                    Balance):
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {formatCurrency(
                                                        settledViaInternalAccount
                                                            ? 0
                                                            : breakdown.reservationBalance,
                                                    )}
                                                </span>
                                            </div>

                                            {/* Services */}
                                            {breakdown.unpaidServices?.length >
                                                0 &&
                                                breakdown.unpaidServices.map(
                                                    (service) => (
                                                        <div
                                                            key={service.id}
                                                            className="flex justify-between"
                                                        >
                                                            <span className="text-gray-600">
                                                                {service
                                                                    .hotelService
                                                                    ?.type ||
                                                                    'Service'}
                                                                :
                                                            </span>
                                                            <span className="font-medium text-gray-900">
                                                                {formatCurrency(
                                                                    service.amountPaid,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}

                                            {/* Orders */}
                                            {breakdown.unpaidOrders?.length >
                                                0 &&
                                                breakdown.unpaidOrders.map(
                                                    (order) => (
                                                        <div
                                                            key={order.id}
                                                            className="flex justify-between"
                                                        >
                                                            <span className="text-gray-600">
                                                                Order #
                                                                {order.id}:
                                                            </span>
                                                            <span className="font-medium text-gray-900">
                                                                {formatCurrency(
                                                                    order.totalPrice,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}

                                            {/* Room Charges Breakdown */}
                                            {breakdown.roomChargesBreakdown && (
                                                <>
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .basePrice > 0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">
                                                                Base Price:
                                                            </span>
                                                            <span className="text-gray-700">
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .basePrice,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .discountAmount > 0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">
                                                                Discount:
                                                            </span>
                                                            <span className="text-orange-600">
                                                                -
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .discountAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .vatAmount > 0 &&
                                                        !(organization?.frontOfficeVatInclusive) && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">
                                                                VAT:
                                                            </span>
                                                            <span className="text-gray-700">
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .vatAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .serviceChargeAmount >
                                                        0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">
                                                                Service Charge:
                                                            </span>
                                                            <span className="text-gray-700">
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .serviceChargeAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .tipAmount > 0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">
                                                                Tip:
                                                            </span>
                                                            <span className="text-gray-700">
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .tipAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .totalCustomChargesAmount >
                                                        0 && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">
                                                                Custom Charges:
                                                            </span>
                                                            <span className="text-gray-700">
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .totalCustomChargesAmount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-xs font-medium pt-1 border-t border-gray-200 mt-1">
                                                        <span className="text-gray-700">
                                                            Room Charges Total:
                                                        </span>
                                                        <span className="text-gray-900">
                                                            {formatCurrency(
                                                                breakdown
                                                                    .roomChargesBreakdown
                                                                    .totalRoomCharges,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {breakdown
                                                        .roomChargesBreakdown
                                                        .amountPaid > 0 && (
                                                        <div className="flex justify-between text-xs text-green-600">
                                                            <span>
                                                                Amount Paid:
                                                            </span>
                                                            <span>
                                                                {formatCurrency(
                                                                    breakdown
                                                                        .roomChargesBreakdown
                                                                        .amountPaid,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {guest.waivedCharges?.vat && (
                                                        <div className="flex justify-between text-xs text-green-700">
                                                            <span>
                                                                Waived: VAT (
                                                                 {Number(guest.vatRateSnapshot ?? 0).toFixed(
                                                                     2,
                                                                 )}
                                                                %):
                                                            </span>
                                                            <span>
                                                                -
                                                                {formatCurrency(
                                                                    guest.waivedCharges
                                                                        .originalVatAmount || 0,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {guest.waivedCharges?.serviceCharge && (
                                                        <div className="flex justify-between text-xs text-green-700">
                                                            <span>
                                                                Waived: Service Charge (
                                                                 {Number(guest.serviceChargeRateSnapshot ?? 0).toFixed(
                                                                     2,
                                                                 )}
                                                                %):
                                                            </span>
                                                            <span>
                                                                -
                                                                {formatCurrency(
                                                                    guest.waivedCharges
                                                                        .originalServiceChargeAmount || 0,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {guest.waivedCharges?.tip && (
                                                        <div className="flex justify-between text-xs text-green-700">
                                                            <span>
                                                                Waived: Tip (
                                                                 {Number(guest.tipRateSnapshot ?? 0).toFixed(
                                                                     2,
                                                                 )}
                                                                %):
                                                            </span>
                                                            <span>
                                                                -
                                                                {formatCurrency(
                                                                    guest.waivedCharges
                                                                        .originalTipAmount || 0,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {guest.waivedAmount &&
                                                        Number(guest.waivedAmount) > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-700">
                                                                <div className="flex justify-between">
                                                                    <span>Waived By:</span>
                                                                    <span>
                                                                        {guest.waivedBy
                                                                            ? `User #${guest.waivedBy}`
                                                                            : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Waived At:</span>
                                                                    <span>
                                                                        {guest.waivedAt
                                                                            ? new Date(guest.waivedAt).toLocaleString()
                                                                            : 'N/A'}
                                                                    </span>
                                                                </div>
                                                                {guest.waiverReason && (
                                                                    <div className="flex justify-between">
                                                                        <span>Waiver Reason:</span>
                                                                        <span className="text-right max-w-[200px]">
                                                                            {guest.waiverReason}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                </>
                                            )}

                                            <div className="flex justify-between pt-2 border-t border-gray-300">
                                                <span className="font-semibold text-gray-900">
                                                    Total:
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        breakdown.totalDue || 0,
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            Loading breakdown...
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className="p-3 bg-white border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2 text-sm">
                                Waive Charges
                            </h4>
                            <div className="space-y-2 text-sm">
                                <label className="flex items-center gap-2">
                                    <Checkbox
                                        checked={
                                            waiverData.vat &&
                                            waiverData.serviceCharge &&
                                            waiverData.tip &&
                                            waiverData.customCharges
                                        }
                                        onCheckedChange={(v) => {
                                            const checked = v === true;
                                            setWaiverData((prev) => ({
                                                ...prev,
                                                vat: checked,
                                                serviceCharge: checked,
                                                tip: checked,
                                                customCharges: checked,
                                            }));
                                        }}
                                    />
                                    <span>Waive All Charges</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox
                                        checked={waiverData.vat}
                                        onCheckedChange={(v) =>
                                            setWaiverData((prev) => ({
                                                ...prev,
                                                vat: v === true,
                                            }))
                                        }
                                        disabled={
                                            !breakdown?.roomChargesBreakdown
                                                .vatAmount ||
                                            breakdown.roomChargesBreakdown.vatAmount <=
                                                0
                                        }
                                    />
                                    <span>VAT</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox
                                        checked={waiverData.serviceCharge}
                                        onCheckedChange={(v) =>
                                            setWaiverData((prev) => ({
                                                ...prev,
                                                serviceCharge: v === true,
                                            }))
                                        }
                                        disabled={
                                            !breakdown?.roomChargesBreakdown
                                                .serviceChargeAmount ||
                                            breakdown.roomChargesBreakdown
                                                .serviceChargeAmount <= 0
                                        }
                                    />
                                    <span>Service Charge</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox
                                        checked={waiverData.tip}
                                        onCheckedChange={(v) =>
                                            setWaiverData((prev) => ({
                                                ...prev,
                                                tip: v === true,
                                            }))
                                        }
                                        disabled={
                                            !breakdown?.roomChargesBreakdown
                                                .tipAmount ||
                                            breakdown.roomChargesBreakdown.tipAmount <=
                                                0
                                        }
                                    />
                                    <span>Tip</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox
                                        checked={waiverData.customCharges}
                                        onCheckedChange={(v) =>
                                            setWaiverData((prev) => ({
                                                ...prev,
                                                customCharges: v === true,
                                            }))
                                        }
                                        disabled={
                                            !breakdown?.roomChargesBreakdown
                                                .totalCustomChargesAmount ||
                                            breakdown.roomChargesBreakdown
                                                .totalCustomChargesAmount <= 0
                                        }
                                    />
                                    <span>Custom Charges</span>
                                </label>
                            </div>
                            <div className="mt-3">
                                <InputField
                                    id="waiverReason"
                                    name="waiverReason"
                                    label="Reason"
                                    type="text"
                                    placeholder="Enter waiver reason"
                                    className="bg-white ring-border border shadow-none border-border h-10"
                                    value={waiverData.reason}
                                    onChange={(e) =>
                                        setWaiverData((prev) => ({
                                            ...prev,
                                            reason: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="mt-3">
                                <Button
                                    onClick={handleApplyWaiver}
                                    disabled={
                                        isApplyingWaiver ||
                                        (!waiverData.vat &&
                                            !waiverData.serviceCharge &&
                                            !waiverData.tip &&
                                            !waiverData.customCharges)
                                    }
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {isApplyingWaiver ? (
                                        <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    {isApplyingWaiver
                                        ? 'Applying...'
                                        : 'Apply Waiver'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                                <div>
                                    <InputField
                                        id="amountPaid"
                                        name="amountPaid"
                                        label="Payment Amount (₦)"
                                        type="text"
                                        placeholder="Enter payment amount"
                                        className="bg-white ring-border border shadow-none border-border h-10"
                                        value={
                                            paymentData.amountPaid
                                                ? `₦ ${Number(paymentData.amountPaid).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                                : '₦ 0'
                                        }
                                        onChange={(e) =>
                                            setPaymentData((prev) => ({
                                                ...prev,
                                                amountPaid: Number(
                                                    e.target.value.replace(
                                                        /[^0-9]/g,
                                                        '',
                                                    ),
                                                ),
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <SelectField
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        label="Payment Method"
                                        className="bg-white ring-border border shadow-none border-border h-10"
                                        value={paymentData.paymentMethod}
                                        onValueChange={(value) =>
                                            setPaymentData((prev) => ({
                                                ...prev,
                                                paymentMethod: value,
                                                receivingAccount: '',
                                            }))
                                        }
                                        options={[
                                            {
                                                value: 'credit',
                                                label: 'Credit Card',
                                            },
                                            {
                                                value: 'debit',
                                                label: 'Debit Card',
                                            },
                                            {
                                                value: 'cash',
                                                label: 'Cash',
                                            },
                                            {
                                                value: 'bank',
                                                label: 'Bank Transfer',
                                            },
                                            {
                                                value: 'internal_account',
                                                label: 'Internal Account',
                                            },
                                        ]}
                                        placeholder="Select payment method"
                                    />
                                </div>

                                <div>
                                    <SelectField
                                        id="receivingAccount"
                                        name="receivingAccount"
                                        label={
                                            paymentData.paymentMethod ===
                                            'internal_account'
                                                ? 'Internal Account'
                                                : 'Receiving Account'
                                        }
                                        className="bg-white ring-border border shadow-none border-border h-10"
                                        value={paymentData.receivingAccount}
                                        onValueChange={(value) =>
                                            setPaymentData((prev) => ({
                                                ...prev,
                                                receivingAccount: value,
                                            }))
                                        }
                                        options={
                                            paymentData.paymentMethod ===
                                            'internal_account'
                                                ? remappedInternalAccounts
                                                : remappedBankAccounts
                                        }
                                        placeholder={
                                            paymentData.paymentMethod ===
                                            'internal_account'
                                                ? 'Select internal account'
                                                : 'Select receiving account'
                                        }
                                    />
                                </div>

                                {onCheckout && !settledViaInternalAccount && (
                                    <div className="mt-4 space-y-3 rounded-lg border border-orange-200 bg-orange-50/80 p-3">
                                        <label className="flex cursor-pointer items-start gap-3 text-sm text-orange-900">
                                            <Checkbox
                                                checked={transferToPmFolio}
                                                onCheckedChange={(v) =>
                                                    setTransferToPmFolio(
                                                        v === true,
                                                    )
                                                }
                                                className="mt-0.5"
                                            />
                                            <span>
                                                <span className="font-medium">
                                                    Transfer outstanding to PM
                                                    folio
                                                </span>
                                                <span className="mt-1 block text-xs text-orange-800/90">
                                                    Post the full balance to
                                                    Account Receivable and
                                                    complete checkout without
                                                    taking payment now.
                                                </span>
                                            </span>
                                        </label>
                                        <Link
                                            href="/front-office/account-section/pm-folio"
                                            className="inline-block text-xs font-medium text-orion-blue hover:underline"
                                        >
                                            View PM folio (Account Receivable)
                                            →
                                        </Link>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-orange-300 text-orange-900 hover:bg-orange-100"
                                            disabled={
                                                !transferToPmFolio ||
                                                isPmFolioLoading ||
                                                isPaymentLoading
                                            }
                                            onClick={handlePmFolioCheckout}
                                        >
                                            {isPmFolioLoading ? (
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            {isPmFolioLoading
                                                ? 'Checking out...'
                                                : 'Check out with PM folio'}
                                        </Button>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={onClose}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlePaymentSettlement}
                                        disabled={
                                            isPaymentLoading ||
                                            isPmFolioLoading ||
                                            paymentData.amountPaid <= 0 ||
                                            !paymentData.paymentMethod
                                        }
                                        className={`flex-1 ${
                                            isPaymentLoading
                                                ? 'bg-orion-blue hover:bg-orion-blue/80 cursor-not-allowed'
                                                : 'bg-orion-blue hover:bg-orion-blue/80'
                                        }`}
                                    >
                                        {isPaymentLoading ? (
                                            <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                        ) : null}
                                        {isPaymentLoading
                                            ? 'Processing...'
                                            : 'Process Payment'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : settledViaInternalAccount ? (
                        <>
                            <div className="space-y-4 opacity-80">
                                <div>
                                    <InputField
                                        id="amountPaid-settled"
                                        name="amountPaid"
                                        label="Payment Amount (₦)"
                                        type="text"
                                        className="bg-muted ring-border border shadow-none border-border h-10 cursor-not-allowed"
                                        value="₦ 0"
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <SelectField
                                        id="paymentMethod-settled"
                                        name="paymentMethod"
                                        label="Payment Method"
                                        className="bg-muted ring-border border shadow-none border-border h-10 cursor-not-allowed"
                                        value={
                                            guest?.paymentMethod ===
                                            'internal_account'
                                                ? 'internal_account'
                                                : guest?.paymentMethod || ''
                                        }
                                        onValueChange={() => undefined}
                                        disabled
                                        options={[
                                            {
                                                value: 'internal_account',
                                                label: 'Internal Account',
                                            },
                                            {
                                                value: 'cash',
                                                label: 'Cash',
                                            },
                                            {
                                                value: 'bank',
                                                label: 'Bank Transfer',
                                            },
                                        ]}
                                        placeholder="Select payment method"
                                    />
                                </div>
                                <div>
                                    <SelectField
                                        id="receivingAccount-settled"
                                        name="receivingAccount"
                                        label="Internal Account"
                                        className="bg-muted ring-border border shadow-none border-border h-10 cursor-not-allowed"
                                        value={
                                            getInternalAccountSettlementCode(
                                                guest ?? {},
                                            ) ?? ''
                                        }
                                        onValueChange={() => undefined}
                                        disabled
                                        options={
                                            internalAccountLabel
                                                ? [
                                                      {
                                                          value:
                                                              getInternalAccountSettlementCode(
                                                                  guest ?? {},
                                                              ) ?? '',
                                                          label:
                                                              internalAccountLabel,
                                                      },
                                                  ]
                                                : []
                                        }
                                        placeholder="Select internal account"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                {onCheckout ? (
                                    <Button
                                        onClick={async () => {
                                            await onCheckout();
                                            onClose();
                                        }}
                                        className="flex-1 bg-orion-blue hover:bg-orion-blue/80"
                                    >
                                        Proceed to Check-Out
                                    </Button>
                                ) : null}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PaymentSettlementModal;
