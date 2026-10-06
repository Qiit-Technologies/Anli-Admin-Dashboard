import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import { checkOutGuest } from '@/app/actions/checkOut';
import { makeGuestPaymentAction } from '@/app/actions/payment';
import { getGuestTotalDue, getEarlyCheckoutDetails, applyWaiver } from '@/app/actions/guest';
import { getCheckedInGuests } from '@/app/actions/reservation';
import { InputField, SelectField } from '@/components/common/Form';
import SearchInput from '@/components/common/SearchInput';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    EarlyCheckoutModal,
    type EarlyCheckoutDetails,
} from '@/components/front-office/checkout/EarlyCheckoutModal';
import { PaidThroughInternalAccount } from '@/components/front-office/common/PaidThroughInternalAccount';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import { useInternalAccountOptions } from '@/hooks/useInternalAccountOptions';
import { hasInternalAccountSettlement } from '@/lib/internal-accounts/settlement';
import {
    IA_SOURCE_MODULES,
    maybePostBillToInternalAccount,
} from '@/lib/internal-accounts/post-bill';
import {
    formatBankAccountLabel,
    formatCurrency,
    formatDate,
    formatTime,
} from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate as globalMutate } from 'swr';

interface CheckoutGuestFlowProps {
    onClose: () => void;
    /** When the parent sheet/modal is open — refetch guests and reset stale selection. */
    open?: boolean;
}

function notifyGuestListsChanged() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('guest-data-updated'));
    }
    void globalMutate('list-data');
}

function getGuestAmountOwed(
    guest: {
        totalDue?: number;
        outstanding?: number;
        amountPaid?: number;
        totalWithCustomCharges?: number;
        totalWithTip?: number;
        finalPrice?: number;
        paymentMethod?: string | null;
        receivingAccount?: string | null;
        isVoid?: boolean;
        isComplimentary?: boolean;
    } | null,
): number {
    if (!guest) return 0;
    if (guest.isVoid || guest.isComplimentary) return 0;

    // IA-031: original reservation settled via IA is not owed at checkout
    if (hasInternalAccountSettlement(guest)) {
        if (typeof guest.totalDue === 'number' && !Number.isNaN(guest.totalDue)) {
            const roomTotal = Number(
                guest.totalWithCustomCharges ??
                    guest.totalWithTip ??
                    guest.finalPrice ??
                    0,
            );
            const paid = Number(guest.amountPaid ?? 0);
            const roomStillDue = Math.max(0, roomTotal - paid);
            // Strip room portion; keep only extras beyond the IA settlement
            return Math.max(0, guest.totalDue - roomStillDue);
        }
        return 0;
    }

    if (typeof guest.totalDue === 'number' && !Number.isNaN(guest.totalDue)) {
        return Math.max(0, guest.totalDue);
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
    return Math.max(0, Number(guest.outstanding ?? 0) || 0);
}

export function CheckoutGuestFlow({
    onClose,
    open = true,
}: CheckoutGuestFlowProps) {
    const [guestList, setGuestList] = useState<any[]>([]);
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [transferToPmFolio, setTransferToPmFolio] = useState(false);
    const { organization } = useHotel();
    const { user } = useUser();
    const showRoman = organization?.id === 10;
    const [formData, setFormData] = useState<{
        status: 'GOOD' | 'BAD' | '';
        checkOutNote: string;
    }>({
        status: '',
        checkOutNote: '',
    });
    const [paymentData, setPaymentData] = useState({
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
    const [earlyCheckoutDetails, setEarlyCheckoutDetails] =
        useState<EarlyCheckoutDetails | null>(null);
    const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] =
        useState(false);

    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { options: remappedInternalAccounts } = useInternalAccountOptions();
    const remappedBankAccounts = (bankAccounts as Array<any>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );

    const loadCheckedInGuests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getCheckedInGuests();
            if (result && result.data) {
                setGuestList(result.data);
            } else {
                setError('Failed to fetch guests');
            }
        } catch {
            setError('Failed to fetch guests');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetCheckoutForm = useCallback(() => {
        setSelectedGuest(null);
        setSearchQuery('');
        setShowPaymentForm(false);
        setTransferToPmFolio(false);
        setFormData({ status: '', checkOutNote: '' });
    }, []);

    useEffect(() => {
        if (!open) {
            resetCheckoutForm();
            return;
        }
        void loadCheckedInGuests();
    }, [open, loadCheckedInGuests, resetCheckoutForm]);

    const handleCheckoutSuccess = useCallback(
        (guestId: number, successText: string) => {
            setGuestList((prev) => prev.filter((g) => g.id !== guestId));
            resetCheckoutForm();
            notifyGuestListsChanged();
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={successText}
                    type="success"
                />
            ));
            onClose();
        },
        [onClose, resetCheckoutForm],
    );

    // Auto-fill outstanding amount when payment form is shown
    useEffect(() => {
        if (showPaymentForm && selectedGuest && selectedGuest.outstanding > 0) {
            setPaymentData((prev) => ({
                ...prev,
                amountPaid: selectedGuest.outstanding,
            }));
        }
    }, [showPaymentForm, selectedGuest]);

    useEffect(() => {
        setTransferToPmFolio(false);
    }, [selectedGuest?.id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const filteredGuestList = !searchQuery
        ? []
        : guestList.filter((guest) => {
              const query = searchQuery;
              return (
                  guest.fullName.toLowerCase().includes(query) ||
                  guest.phoneNumber.toLowerCase().includes(query) ||
                  guest.email.toLowerCase().includes(query) ||
                  guest?.room?.roomNumber
                      .toString()
                      .toLowerCase()
                      .includes(query)
              );
          });

    const fields = [
        { label: 'Guest Name', value: selectedGuest?.fullName },
        { label: 'Guest email', value: selectedGuest?.email },
        { label: 'Guest phone number', value: selectedGuest?.phoneNumber },
        { label: 'Check-in Date', value: formatDate(selectedGuest?.startDate) },
        { label: 'Check-in Time', value: formatTime(selectedGuest?.startDate) },
        {
            label: 'Room Number',
            value: `${selectedGuest?.room?.roomNumber}${showRoman && selectedGuest?.room?.roomNumberRoman ? ` (${selectedGuest?.room?.roomNumberRoman})` : ''}`,
        },
        {
            label: 'Amount Paid',
            value: formatCurrency(selectedGuest?.amountPaid),
        },
        {
            label: 'Outstanding',
            value: formatCurrency(
                getGuestAmountOwed(selectedGuest) || selectedGuest?.outstanding,
            ),
        },
    ];

    const handlePaymentSettlement = async () => {
        if (
            !selectedGuest ||
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
            const response = await makeGuestPaymentAction(selectedGuest.id, {
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
                        selectedGuest.guestName ||
                        selectedGuest.fullName ||
                        'Guest',
                    roomTableNo: selectedGuest.room?.roomNumber
                        ? `Room ${selectedGuest.room.roomNumber}`
                        : null,
                    postedBy: user?.fullName || 'Front Desk',
                    referenceId: selectedGuest.id,
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
                        description={response.message}
                        type="success"
                    />
                ));

                // Update the guest data with new payment info
                const updatedGuest = {
                    ...selectedGuest,
                    amountPaid: response.amountPaid,
                    outstanding: response.outstanding,
                };

                setSelectedGuest(updatedGuest);
                setGuestList((prev) =>
                    prev.map((guest) =>
                        guest.id === selectedGuest.id ? updatedGuest : guest,
                    ),
                );

                // Reset payment form
                setPaymentData({
                    amountPaid: 0,
                    paymentMethod: '',
                    receivingAccount: '',
                });
                setShowPaymentForm(false);

                // Now check for early checkout
                const details = await getEarlyCheckoutDetails(selectedGuest.id);
                if (details) {
                    setEarlyCheckoutDetails(details);
                    setShowEarlyCheckoutDialog(true);
                    return;
                }

                // If no early checkout, proceed with checkout
                await handleSubmit(selectedGuest.id);
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
        if (!selectedGuest) return;

        setIsApplyingWaiver(true);
        try {
            const response = await applyWaiver(selectedGuest.id, {
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
                ...selectedGuest,
                ...(response.data as any),
            };

            setSelectedGuest(updatedGuest);
            setGuestList((prev) =>
                prev.map((g) => (g.id === selectedGuest.id ? updatedGuest : g)),
            );

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

    const handleSubmit = async (id: number, transferUnusedBalance = false) => {
        setError(null);
        setIsLoading(true);

        try {
            // Only proceed if status is valid
            if (
                !formData.status ||
                (formData.status !== 'GOOD' && formData.status !== 'BAD')
            ) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Please select a valid status (Good or Bad)."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            const amountOwed = getGuestAmountOwed(selectedGuest);
            const hasOwe =
                selectedGuest &&
                !selectedGuest.isComplimentary &&
                !selectedGuest.isVoid &&
                amountOwed > 0;

            // First check for early checkout details if not already checked
            if (!transferUnusedBalance && !earlyCheckoutDetails) {
                const details = await getEarlyCheckoutDetails(id);
                if (details) {
                    setEarlyCheckoutDetails(details);
                    setShowEarlyCheckoutDialog(true);
                    setIsLoading(false);
                    return;
                }
            }

            const response = await checkOutGuest(
                id,
                formData.status,
                formData.checkOutNote,
                transferToPmFolio && hasOwe ? true : undefined,
                transferUnusedBalance,
            );

            if (response.message === 'Check Out successfully!') {
                const successText =
                    transferToPmFolio && hasOwe
                        ? `Checked out. ₦${amountOwed.toLocaleString()} posted to PM folio (Account Receivable). Room released.`
                        : transferUnusedBalance
                          ? `Checked out. Unused balance transferred to Account Payable.`
                          : response.message;
                handleCheckoutSuccess(id, successText);
                setShowEarlyCheckoutDialog(false);
                setEarlyCheckoutDetails(null);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message}
                        type="error"
                    />
                ));
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const amountOwed = getGuestAmountOwed(selectedGuest);
    const hasOutstandingBalance =
        selectedGuest &&
        !selectedGuest.isComplimentary &&
        !selectedGuest.isVoid &&
        amountOwed > 0;
    const settledViaInternalAccount = selectedGuest
        ? hasInternalAccountSettlement(selectedGuest)
        : false;

    return (
        <div>
            <div>
                <h1 className="font-semibold text-lg">Checkout Guest</h1>
                <span className="text-sm text-muted-foreground">
                    Checkout Guest from Room
                </span>
            </div>
            <div className="mt-4">
                <SearchInput
                    aria-label="Search"
                    placeholder="Search by guest name, email, phone number, or booking ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <motion.div layout className="mt-2">
                <div className="mt-3">
                    {filteredGuestList.length > 0 &&
                        filteredGuestList.map((guest) => (
                            <div
                                key={guest.id}
                                className="flex items-center hover:bg-gray-100 justify-between gap-2 p-2 border-b hover:border-b-transparent border-gray-200 cursor-pointer"
                                onClick={async () => {
                                    setSearchQuery('');
                                    setShowPaymentForm(false);
                                    setTransferToPmFolio(false);
                                    const breakdown = await getGuestTotalDue(
                                        guest.id,
                                    );
                                    setSelectedGuest({
                                        ...guest,
                                        totalDue:
                                            breakdown?.totalDue ??
                                            guest.totalDue,
                                    });
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">
                                        {guest.fullName} - {guest.roomNumber}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {guest.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {guest.phoneNumber}
                                    </span>
                                    {getGuestAmountOwed(guest) > 0 &&
                                        !guest.isComplimentary &&
                                        !guest.isVoid && (
                                            <div className="flex items-center gap-1 text-orange-600 text-xs">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>
                                                    ₦
                                                    {getGuestAmountOwed(
                                                        guest,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                </div>
            </motion.div>
            {selectedGuest && (
                <motion.div
                    animate={{
                        opacity: selectedGuest ? 1 : 0,
                        height: selectedGuest ? 'auto' : 0,
                    }}
                    className="bg-gray-100 border mt-4 p-4 rounded-lg flex flex-col gap-4 "
                >
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
                    <PaidThroughInternalAccount reservation={selectedGuest} />
                </motion.div>
            )}
            {selectedGuest &&
                settledViaInternalAccount &&
                !hasOutstandingBalance && (
                    <motion.div
                        className="p-4 border mt-4 rounded-lg bg-slate-50 border-slate-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-sm text-slate-700">
                            Reservation is fully settled through an Internal
                            Account. Outstanding Balance:{' '}
                            <span className="font-semibold">
                                {formatCurrency(0)}
                            </span>
                            . No payment is required to check out.
                        </p>
                    </motion.div>
                )}
            {selectedGuest && hasOutstandingBalance && !showPaymentForm && (
                <motion.div
                    className="p-4 border mt-4 rounded-lg bg-orange-50 border-orange-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-orange-800">
                            {settledViaInternalAccount
                                ? 'Additional Outstanding Charges'
                                : 'Outstanding Balance'}
                        </h3>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                        {settledViaInternalAccount ? (
                            <>
                                Additional charges after Internal Account
                                settlement:{' '}
                                <span className="font-semibold">
                                    ₦{amountOwed.toLocaleString()}
                                </span>
                                . These will not automatically post to the
                                Internal Account unless you select it.
                            </>
                        ) : (
                            <>
                                Guest has an outstanding balance of{' '}
                                <span className="font-semibold">
                                    ₦{amountOwed.toLocaleString()}
                                </span>
                                . Settle at the desk, or transfer to PM folio
                                (Accounts Receivable) below to check out and
                                release the room.
                            </>
                        )}
                    </p>
                    {/* Breakdown */}
                    {((selectedGuest.vatAmount > 0 && !(organization?.frontOfficeVatInclusive)) ||
                        selectedGuest.serviceChargeAmount > 0 ||
                        selectedGuest.tipAmount > 0 ||
                        (selectedGuest.customCharges &&
                            selectedGuest.customCharges.length > 0)) && (
                        <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2 text-sm">
                                Payment Breakdown
                            </h4>
                            <div className="space-y-1 text-xs">
                                {selectedGuest.finalPrice !== undefined &&
                                    selectedGuest.finalPrice !== null && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Subtotal:
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                ₦
                                                {Number(
                                                    selectedGuest.finalPrice,
                                                ).toLocaleString('en-NG', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                                {selectedGuest.vatAmount > 0 && !(organization?.frontOfficeVatInclusive) && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            VAT (
                                            {selectedGuest.vatRateSnapshot?.toFixed(
                                                2,
                                            ) || '0.00'}
                                            %):
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            ₦
                                            {Number(
                                                selectedGuest.vatAmount,
                                            ).toLocaleString('en-NG', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                )}
                                {selectedGuest.serviceChargeAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Service Charge (
                                            {selectedGuest.serviceChargeRateSnapshot?.toFixed(
                                                2,
                                            ) || '0.00'}
                                            %):
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            ₦
                                            {Number(
                                                selectedGuest.serviceChargeAmount,
                                            ).toLocaleString('en-NG', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                )}
                                {selectedGuest.tipAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tip (
                                            {selectedGuest.tipRateSnapshot?.toFixed(
                                                2,
                                            ) || '0.00'}
                                            %):
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            ₦
                                            {Number(
                                                selectedGuest.tipAmount,
                                            ).toLocaleString('en-NG', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                )}
                                {/* Custom Charges */}
                                {selectedGuest.customCharges &&
                                    selectedGuest.customCharges.length > 0 &&
                                    selectedGuest.customCharges.map(
                                        (charge: any) => (
                                            <div
                                                key={charge.id}
                                                className="flex justify-between"
                                            >
                                                <span className="text-gray-600">
                                                    {charge.name} (
                                                    {Number(
                                                        charge.rate,
                                                    ).toFixed(2)}
                                                    %):
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    ₦
                                                    {Number(
                                                        charge.amount,
                                                    ).toLocaleString('en-NG', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                {selectedGuest.waivedCharges?.vat && (
                                    <div className="flex justify-between text-green-700">
                                        <span>
                                            Waived: VAT (
                                            {selectedGuest.vatRateSnapshot?.toFixed(
                                                2,
                                            ) || '0.00'}
                                            %):
                                        </span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                selectedGuest.waivedCharges
                                                    .originalVatAmount || 0,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {selectedGuest.waivedCharges?.serviceCharge && (
                                    <div className="flex justify-between text-green-700">
                                        <span>
                                            Waived: Service Charge (
                                            {selectedGuest.serviceChargeRateSnapshot?.toFixed(
                                                2,
                                            ) || '0.00'}
                                            %):
                                        </span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                selectedGuest.waivedCharges
                                                    .originalServiceChargeAmount || 0,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {selectedGuest.waivedCharges?.tip && (
                                    <div className="flex justify-between text-green-700">
                                        <span>
                                            Waived: Tip (
                                            {selectedGuest.tipRateSnapshot?.toFixed(
                                                2,
                                            ) || '0.00'}
                                            %):
                                        </span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                selectedGuest.waivedCharges
                                                    .originalTipAmount || 0,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {selectedGuest.waivedAmount &&
                                    Number(selectedGuest.waivedAmount) > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm text-gray-700">
                                            <div className="flex justify-between">
                                                <span>Waived By:</span>
                                                <span>
                                                    {selectedGuest.waivedBy
                                                        ? `User #${selectedGuest.waivedBy}`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Waived At:</span>
                                                <span>
                                                    {selectedGuest.waivedAt
                                                        ? formatDate(
                                                              new Date(
                                                                  selectedGuest.waivedAt,
                                                              ),
                                                          )
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            {selectedGuest.waiverReason && (
                                                <div className="flex justify-between">
                                                    <span>Waiver Reason:</span>
                                                    <span className="text-right max-w-[200px]">
                                                        {selectedGuest.waiverReason}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                <div className="flex justify-between pt-2 border-t border-gray-300">
                                    <span className="font-semibold text-gray-900">
                                        Total:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        ₦
                                        {Number(
                                            (selectedGuest as any)
                                                .totalWithCustomCharges ||
                                                selectedGuest.totalWithTip ||
                                                selectedGuest.totalWithServiceCharge ||
                                                selectedGuest.totalWithVat ||
                                                selectedGuest.outstanding +
                                                    (selectedGuest.amountPaid ||
                                                        0),
                                        ).toLocaleString('en-NG', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <PermissionGate
                        blockType="modal"
                        permissions={[PERMISSIONS.SETTLE_BILL]}
                    >
                        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
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
                                            selectedGuest?.vatAmount <= 0 &&
                                            !(organization?.frontOfficeVatInclusive)
                                        }
                                    />
                                    <span>
                                        VAT ({selectedGuest?.vatRateSnapshot?.toFixed(2) || '0.00'}%)
                                    </span>
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
                                            selectedGuest?.serviceChargeAmount <= 0
                                        }
                                    />
                                    <span>
                                        Service Charge ({selectedGuest?.serviceChargeRateSnapshot?.toFixed(2) || '0.00'}%)
                                    </span>
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
                                        disabled={selectedGuest?.tipAmount <= 0}
                                    />
                                    <span>
                                        Tip ({selectedGuest?.tipRateSnapshot?.toFixed(2) || '0.00'}%)
                                    </span>
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
                                            !selectedGuest?.customCharges ||
                                            selectedGuest.customCharges.length === 0
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
                            <div className="flex gap-2 mt-3">
                                <Button
                                    onClick={handleApplyWaiver}
                                    disabled={
                                        isApplyingWaiver ||
                                        (!waiverData.vat &&
                                            !waiverData.serviceCharge &&
                                            !waiverData.tip &&
                                            !waiverData.customCharges)
                                    }
                                    className="flex-1 bg-orange-600 hover:bg-orion-blue text-white"
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
                    </PermissionGate>
                    <PermissionGate
                        blockType="modal"
                        permissions={[PERMISSIONS.SETTLE_BILL]}
                    >
                        <Button
                            onClick={() => setShowPaymentForm(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Settle Payment
                        </Button>
                    </PermissionGate>
                    {!settledViaInternalAccount && (
                        <label className="mt-4 flex items-start gap-3 cursor-pointer rounded-md border border-orange-200 bg-white/80 p-3 text-sm text-orange-900">
                            <Checkbox
                                checked={transferToPmFolio}
                                onCheckedChange={(v) =>
                                    setTransferToPmFolio(v === true)
                                }
                                className="mt-0.5"
                            />
                            <span>
                                <span className="font-medium">
                                    Transfer outstanding to PM folio
                                </span>
                                <span className="block text-xs text-orange-800/90 mt-1">
                                    Posts the full outstanding amount to Accounts
                                    Receivable, then completes checkout and
                                    releases the room. Use when payment cannot be
                                    taken at the desk.
                                </span>
                                <Link
                                    href="/front-office/account-section/pm-folio"
                                    className="inline-block mt-2 text-xs font-medium text-orion-blue hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View PM folio (Account Receivable) →
                                </Link>
                            </span>
                        </label>
                    )}
                </motion.div>
            )}
            {selectedGuest && showPaymentForm && (
                <motion.div
                    className="p-4 border mt-4 rounded-lg bg-blue-50 border-blue-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="font-semibold text-blue-800 mb-3">
                        Payment Settlement
                    </h3>
                    <div className="space-y-3">
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
                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={() => setShowPaymentForm(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePaymentSettlement}
                                disabled={
                                    isPaymentLoading ||
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
                </motion.div>
            )}
            {selectedGuest && (
                <motion.div className="p-4 border mt-4 rounded-lg" layout>
                    <div className="w-full space-y-2">
                        <span className="text-base text-muted-foreground">
                            Status
                        </span>
                        <RadioGroup
                            className="flex w-full items-center"
                            defaultValue="option-one"
                            onValueChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    status: value === 'good' ? 'GOOD' : 'BAD',
                                }));
                            }}
                        >
                            <div className="flex border w-full px-4 p-2 rounded-lg items-center space-x-2">
                                <RadioGroupItem value="good" id="good" />
                                <Label className="m-0" htmlFor="good">
                                    Good
                                </Label>
                            </div>
                            <div className="flex border w-full px-4 p-2 rounded-lg items-center space-x-2">
                                <RadioGroupItem value="bad" id="bad" />
                                <Label className="m-0" htmlFor="bad">
                                    Bad
                                </Label>
                            </div>
                        </RadioGroup>
                        {formData.status === 'BAD' && (
                            <div className="w-full mt-4">
                                <Label
                                    htmlFor="checkOutNote"
                                    className="sr-only text-base text-muted-foreground"
                                >
                                    Checkout Note
                                </Label>
                                <textarea
                                    id="checkOutNote"
                                    className="w-full border rounded-lg p-2 mt-2"
                                    placeholder="Enter checkout note"
                                    value={formData.checkOutNote}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            checkOutNote: e.target.value,
                                        }));
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="w-full mt-4 flex items-center gap-2">
                        <Button
                            onClick={onClose}
                            variant={'outline'}
                            className="border-orion-blue w-full text-orion-blue"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                isLoading ||
                                !formData.status ||
                                (formData.status === 'BAD' &&
                                    !formData.checkOutNote) ||
                                (hasOutstandingBalance && !transferToPmFolio)
                            }
                            onClick={() => handleSubmit(selectedGuest.id)}
                            className="bg-orion-blue w-full hover:bg-orion-blue"
                        >
                            {isLoading ? (
                                <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                            ) : null}
                            {isLoading ? 'Loading...' : 'Checkout'}
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Early Checkout Modal */}
            <EarlyCheckoutModal
                isOpen={showEarlyCheckoutDialog}
                onClose={() => setShowEarlyCheckoutDialog(false)}
                earlyCheckoutDetails={earlyCheckoutDetails}
                onCheckoutWithoutTransfer={() => {
                    setShowEarlyCheckoutDialog(false);
                    handleSubmit(selectedGuest.id, false);
                }}
                onCheckoutWithTransfer={() => {
                    setShowEarlyCheckoutDialog(false);
                    handleSubmit(selectedGuest.id, true);
                }}
                isLoading={isLoading}
            />
        </div>
    );
}

export default CheckoutGuestFlow;
