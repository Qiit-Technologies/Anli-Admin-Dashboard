'use client';
import {
    sendReservationConfirmationEmail,
    getEarlyCheckoutDetails,
    getGuestServices,
} from '@/app/actions/guest';
import {
    approveSpecialReservation,
    approveProofOfPaymentAction,
} from '@/app/actions/reservation';
import DeleteModal from '@/app/dashboard/components/FrontOffice/dashboard/DeleteModal';
import BrandButton from '@/components/common/Button';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import PaymentSettlementModal from '@/components/front-office/common/Form/PaymentSettlementModal';
import { EarlyCheckoutModal } from '@/components/front-office/checkout/EarlyCheckoutModal';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import useHotel from '@/hooks/useHotel';
import {
    downloadReservationConfirmationPdf,
    printReservationConfirmation,
} from '@/lib/front-office/reservation-confirmation-actions';
import {
    getReservationRoomDisplayLabel,
    isReservationAssignedRoomDirty,
} from '@/lib/front-office/reservation-room-dirty';
import { getNights } from '@/lib/helpers';
import {
    hasInternalAccountSettlement,
    isInternalAccountSettlementApproved,
    isInternalAccountSettlementPending,
    isInternalAccountSettlementRejected,
    isInternalAccountSettlementReversed,
} from '@/lib/internal-accounts/settlement';
import { getGuestInternalAccountBillStatus } from '@/app/actions/internal-accounts-ledger';
import { cn, formatCurrency } from '@/lib/utils';
import { Reservation } from '@/types/reservation';
import { TUser } from '@/types/user';
import { Card, CardBody, CardFooter, CardHeader, Divider } from '@heroui/react';
import {
    Baby,
    BadgePercent,
    Ban,
    Calendar,
    Check,
    Edit,
    Eye,
    FileDown,
    FileText,
    Gift,
    Info,
    Mail,
    MoreVertical,
    Printer,
    ShoppingBag,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuHotel } from 'react-icons/lu';
import useSWR, { mutate } from 'swr';
import ReservationDateModal from '../../stay-view/modals/reservation-date-modal';
import { DirtyRoomCheckInAlert } from '../DirtyRoomCheckInAlert';
import { VoidReservationDialog } from '../Form/VoidReservation';
import { PaidThroughInternalAccount } from '../PaidThroughInternalAccount';
import { SendReservationConfirmationDialog } from '../SendReservationConfirmationDialog';
import { ManagerPinDialog } from '@/components/stock/common/modal/ManagerPinDialog';
import {
    GroupInHouseStay,
    type GroupStayContext,
} from '@/components/front-office/check-in-out/GroupInHouseStay';

interface ReservationCardProps {
    reservation: Reservation;
    handleSubmit: (
        id: number,
        options?: { transferOutstandingToPmFolio?: boolean },
        transferUnusedBalanceToPayable?: boolean,
        skipEarlyCheckout?: boolean,
    ) => void | Promise<void>;
    onDeleteSuccess?: (id: number) => void;
    mode: 'add' | 'edit';
    user: TUser | undefined;
    appearance?: 'default' | 'group';
    groupStay?: GroupStayContext;
}

export default function ReservationCard({
    reservation,
    handleSubmit,
    mode = 'add',
    onDeleteSuccess,
    user,
    appearance = 'default',
    groupStay,
}: Readonly<ReservationCardProps>) {
    const formatAmount = (value: number | undefined | null) =>
        new Intl.NumberFormat('en-NG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(value || 0));
    const adminRoles = [
        'administrator',
        'manager',
        'general manager',
        'supervisor',
    ];
    const isAdmin = adminRoles.includes(user?.roles?.name || '');
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;
    const [reservationOpen, setReservationOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<
        number | null
    >(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [voidDialogOpen, setVoidDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [editDatesOpen, setEditDatesOpen] = useState(false);
    const [dirtyRoomCheckInOpen, setDirtyRoomCheckInOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
    const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] =
        useState(false);
    const [earlyCheckoutDetails, setEarlyCheckoutDetails] = useState<any>(null);
    const [pendingCheckoutOptions, setPendingCheckoutOptions] = useState<{
        transferOutstandingToPmFolio?: boolean;
        transferUnusedBalanceToPayable?: boolean;
    } | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [askMasterCheckout, setAskMasterCheckout] = useState(false);
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);
    const [activityOpen, setActivityOpen] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityDetails, setActivityDetails] = useState<any[]>([]);

    const guestEmailTrimmed = String(reservation.email ?? '').trim();
    const settledViaInternalAccount = hasInternalAccountSettlement(reservation);
    const { data: iaBillStatus } = useSWR(
        settledViaInternalAccount
            ? `ia-guest-bill-status-${reservation.id}`
            : null,
        () => getGuestInternalAccountBillStatus(reservation.id),
        { refreshInterval: 15000 },
    );
    const iaPending = isInternalAccountSettlementPending(iaBillStatus?.status);
    const iaApproved = isInternalAccountSettlementApproved(
        iaBillStatus?.status,
    );
    const iaRejected = isInternalAccountSettlementRejected(
        iaBillStatus?.status,
    );
    const iaReversed = isInternalAccountSettlementReversed(
        iaBillStatus?.status,
    );

    // Financial calculations based on nights and nightly rate.
    // Use originalEndDate if available so the card shows the original
    // booking length, not the extended stay length.
    const originalEndDate =
        (reservation as any).originalEndDate || reservation.endDate;
    const currentNights = Math.max(
        1,
        getNights(reservation.startDate, reservation.endDate),
    );
    const originalNights = Math.max(
        1,
        getNights(reservation.startDate, originalEndDate),
    );
    const nights = currentNights;
    const ratePerNight = Number(reservation.room?.price ?? 0);
    const originalTotal = ratePerNight * nights;
    const discountType = reservation.discountType;
    const discountValue = Number(reservation.discountValue ?? 0);

    // Compute the effective nightly rate after discount so that extended
    // nights are billed at the same discounted rate as the original booking.
    const getEffectiveNightlyRate = () => {
        if (!reservation.isDiscounted) return ratePerNight;
        const baseRate = Number(reservation.originalPrice ?? ratePerNight ?? 0);
        if (baseRate <= 0) return 0;

        if (discountType === 'PERCENTAGE') {
            const pct = discountValue;
            return baseRate * (1 - pct / 100);
        }

        if (discountType === 'FIXED_AMOUNT') {
            const start = new Date(reservation.startDate);
            const originalEnd = new Date(
                (reservation as any).originalEndDate || reservation.endDate,
            );
            const originalNights = Math.max(
                1,
                Math.ceil(
                    (originalEnd.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24),
                ),
            );
            const totalDiscount = Number(reservation.discountAmount || 0);
            const perNightDiscount = totalDiscount / originalNights;
            return Math.max(0, baseRate - perNightDiscount);
        }

        return baseRate;
    };
    const effectiveNightlyRate = getEffectiveNightlyRate();

    // Discount to display: scales with the current number of nights so
    // that extended stays show the correct total discount.
    const displayedDiscount =
        reservation.isDiscounted &&
        (Number(reservation.discountAmount || 0) > 0 ||
            Number(reservation.discountValue || 0) > 0)
            ? (ratePerNight - effectiveNightlyRate) * nights
            : 0;

    const discountAmount =
        discountType === 'PERCENTAGE'
            ? displayedDiscount
            : discountType === 'FIXED_AMOUNT'
              ? displayedDiscount
              : 0;
    const isVoid = !!reservation.isVoid;
    const activityCount =
        Number(reservation.orderCount || 0) +
        Number(reservation.serviceCount || 0);
    const paidActivityCount = Number(reservation.paidActivityCount || 0);
    const activityTone =
        paidActivityCount === activityCount
            ? {
                  border: 'border-emerald-200',
                  background: 'bg-emerald-50',
                  text: 'text-emerald-900',
                  hover: 'hover:bg-emerald-100',
              }
            : paidActivityCount > 0
              ? {
                    border: 'border-amber-200',
                    background: 'bg-amber-50',
                    text: 'text-amber-900',
                    hover: 'hover:bg-amber-100',
                }
              : {
                    border: 'border-red-200',
                    background: 'bg-red-50',
                    text: 'text-red-900',
                    hover: 'hover:bg-red-100',
                };
    // const isComplimentary = !!reservation.isComplimentary;
    const showBalance = !isVoid;

    // Use comprehensive paidAmount if available (includes services/orders), otherwise fallback to amountPaid
    const paidAmount =
        reservation.paidAmount !== undefined && reservation.paidAmount !== null
            ? Number(reservation.paidAmount)
            : Number(reservation.amountPaid ?? 0);

    const payableBalance =
        reservation.payableBalance !== undefined &&
        reservation.payableBalance !== null
            ? Number(reservation.payableBalance)
            : 0;

    const receivableBalance =
        reservation.receivableBalance !== undefined &&
        reservation.receivableBalance !== null
            ? Number(reservation.receivableBalance)
            : 0;

    const stayOutstanding = Math.max(0, Number(reservation.outstanding || 0));
    // What check-out will ask for: room folio plus unpaid services and orders.
    const stayFolioDue = Math.max(
        stayOutstanding,
        Number(reservation.totalDue || 0),
    );
    const effectiveReceivable = Math.max(receivableBalance, stayOutstanding);

    // Calculate Total:
    // - When guest owes money (receivable > 0): Total must be at least paidAmount + outstanding
    //   to ensure auto-billed nights not reflected in totalCost are counted.
    // - When guest has surplus (payable > 0): Total = room cost only (backendTotal or paid).
    //   We do NOT inflate using paidAmount here, as the deposit surplus should appear in Balance, not Total.
    const backendTotal =
        reservation.totalCost !== undefined &&
        reservation.totalCost !== null &&
        Number(reservation.totalCost) > 0
            ? Number(reservation.totalCost)
            : 0;

    const computedTotal = showBalance
        ? effectiveReceivable > 0
            ? // Guest owes: stretch total to cover all charges including auto-billed nights
              Math.max(backendTotal, paidAmount + effectiveReceivable)
            : // Guest settled/surplus: use backend total or what they paid toward this stay
              backendTotal > 0
              ? backendTotal
              : paidAmount
        : 0;

    let balance: number;
    if (payableBalance > 0) {
        // Guest has wallet credit / deposit surplus (displayed as positive green balance)
        balance = payableBalance;
    } else if (effectiveReceivable > 0) {
        // Guest owes money (displayed as negative red balance matching DB outstanding)
        balance = -effectiveReceivable;
    } else {
        balance = paidAmount - computedTotal;
    }

    const displayTotal = computedTotal;

    const handleDeleteSuccess = (deletedId: number) => {
        onDeleteSuccess?.(deletedId);
    };

    const handleVoidClick = () => setVoidDialogOpen(true);

    const handlePrint = () => {
        printReservationConfirmation(reservation, organization, user?.fullName);
    };

    const openActivityDetails = async () => {
        setActivityOpen(true);
        setActivityLoading(true);
        try {
            const result = await getGuestServices(String(reservation.id));
            setActivityDetails(result.data ?? []);
        } finally {
            setActivityLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (reservation.isVoid || pdfLoading) return;
        setPdfLoading(true);
        try {
            await downloadReservationConfirmationPdf(
                reservation,
                organization,
                user?.fullName,
            );
        } catch (e) {
            const msg =
                e instanceof Error ? e.message : 'Could not create PDF.';
            toast.custom(() => (
                <Toast title="PDF error" description={msg} type="error" />
            ));
        } finally {
            setPdfLoading(false);
        }
    };

    const openSendConfirmationModal = () => setSendConfirmOpen(true);

    const executeSendReservationConfirmation = async () => {
        if (
            reservation.isVoid ||
            emailLoading ||
            !guestEmailTrimmed ||
            reservation.isCheckedIn
        ) {
            return;
        }
        setEmailLoading(true);
        try {
            const result = await sendReservationConfirmationEmail(
                reservation.id,
            );
            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Email not sent"
                        description={result.error}
                        type="error"
                    />
                ));
            } else {
                setSendConfirmOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Confirmation sent"
                        description={
                            result.data?.message ??
                            `Reservation confirmation was emailed to ${guestEmailTrimmed}.`
                        }
                        type="success"
                    />
                ));
            }
        } finally {
            setEmailLoading(false);
        }
    };

    const isCheckInBeforeStartDate = (() => {
        if (!reservation.startDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(reservation.startDate);
        start.setHours(0, 0, 0, 0);
        return start > today;
    })();

    // IA pending only blocks check-out — check-in must remain available.
    const isIaCheckoutBlocked =
        settledViaInternalAccount &&
        (iaPending ||
            (!iaApproved &&
                !iaRejected &&
                !iaReversed &&
                iaBillStatus === undefined));

    const runCheckInOrOut = async () => {
        // Check-in: never blocked by Internal Account approval status.
        if (mode === 'add') {
            if (
                reservation.proofOfPayment &&
                !reservation.isProofOfPaymentApproved
            ) {
                toast.custom(() => (
                    <Toast
                        title="Check-in Blocked"
                        description="Proof of payment must be approved before checking in."
                        type="error"
                    />
                ));
                return;
            }
            handleSubmit(reservation.id);
            return;
        }

        const isComplimentary = !!reservation.isComplimentary;
        const isVoid = !!reservation.isVoid;

        const hasOutstanding =
            balance < 0 ||
            (appearance === 'group' && Number(reservation.extrasDue || 0) > 0);

        // Void and complimentary stays waive the room, but posted extras still
        // have to be settled before the room can be released.
        if (isComplimentary || isVoid) {
            if (hasOutstanding || stayFolioDue > 0) {
                setPaymentModalOpen(true);
                return;
            }
            handleSubmit(reservation.id);
            return;
        }

        if (isIaCheckoutBlocked) {
            toast.custom(() => (
                <Toast
                    title="Awaiting Approval"
                    description="Internal Account payment is still pending approval. Check-out unlocks after approval. If rejected, use normal payment checkout."
                    type="error"
                />
            ));
            return;
        }

        if (
            hasOutstanding ||
            (settledViaInternalAccount && iaApproved) ||
            iaRejected ||
            iaReversed
        ) {
            setPaymentModalOpen(true);
            return;
        }

        // Check for early checkout only if no outstanding balance
        const details = await getEarlyCheckoutDetails(reservation.id);
        if (details) {
            setEarlyCheckoutDetails(details);
            setShowEarlyCheckoutDialog(true);
            return;
        }

        handleSubmit(reservation.id);
    };

    const continueCheckout = () => {
        if (mode === 'add' && isReservationAssignedRoomDirty(reservation)) {
            setDirtyRoomCheckInOpen(true);
            return;
        }
        runCheckInOrOut();
    };

    const handleCheckoutClick = () => {
        if (
            mode === 'edit' &&
            appearance === 'group' &&
            groupStay?.isMaster &&
            groupStay.otherInHouseCount > 0
        ) {
            setAskMasterCheckout(true);
            return;
        }
        continueCheckout();
    };

    const handlePaymentSuccess = (updatedReservation: any) => {
        Object.assign(reservation, updatedReservation);
        setPaymentModalOpen(false);
    };

    const handleEarlyCheckoutConfirm = async (
        transferUnusedBalance: boolean,
    ) => {
        // Store the transfer choice for later
        setPendingCheckoutOptions({
            transferUnusedBalanceToPayable: transferUnusedBalance,
        });

        // Now check if there's still an outstanding balance
        const hasOutstanding = balance < 0;

        if (hasOutstanding) {
            setShowEarlyCheckoutDialog(false);
            setPaymentModalOpen(true);
            return;
        }

        // If no outstanding balance, go straight to checkout with the transfer option
        setIsCheckingOut(true);
        try {
            await handleSubmit(reservation.id, {
                transferOutstandingToPmFolio: transferUnusedBalance,
            }); // skip early checkout check
            // Only close modal on success
            setShowEarlyCheckoutDialog(false);
            setEarlyCheckoutDetails(null);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const renderBgColor = () => {
        if (reservation.isVoid) return 'bg-red-500 hover:bg-red-600 text-white';
        if (reservation.isComplimentary)
            return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        if (reservation.discountType)
            return 'bg-orion-blue hover:bg-orion-blue text-white';
        if (reservation.isCheckedIn)
            return 'bg-green-500 hover:bg-green-600 text-white';
        return 'bg-hexbrand hover:bg-hexbrand text-white';
    };

    const renderIcon = () => {
        if (reservation.isVoid) return <Ban className="w-5 h-5" />;
        if (reservation.isComplimentary) return <Gift className="w-5 h-5" />;
        if (reservation.discountType)
            return <BadgePercent className="w-5 h-5" />;
        return <LuHotel className="w-5 h-5" />;
    };

    const handleApproval = async (
        id: number,
        action: 'approve' | 'reject',
        rejectionReason?: string,
        managerPin?: string,
    ) => {
        try {
            const response = await approveSpecialReservation({
                reservationId: id,
                action,
                rejectionReason,
                managerPin,
            });

            if (
                response?.message === 'Check In successfully!' ||
                response?.message?.toLowerCase().includes('success')
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('list-data', false);
            } else {
                const errorMsg = response?.message || 'Action failed';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred during approval';
            console.error('Approval error:', err);
            toast.custom(() => (
                <Toast title="Error!" description={errorMessage} type="error" />
            ));
        }
    };

    const handleApproveProofOfPayment = async (id: number) => {
        try {
            const response = await approveProofOfPaymentAction(id);
            if (response.success) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Proof of payment approved successfully!"
                        type="success"
                    />
                ));
                mutate('list-data', false);
            } else {
                const errorMsg =
                    response.error || 'Failed to approve proof of payment';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred during approval';
            console.error('Approve proof of payment error:', err);
            toast.custom(() => (
                <Toast title="Error!" description={errorMessage} type="error" />
            ));
        }
    };

    const renderApprovalSection = () => {
        if (
            !reservation.needsApproval ||
            reservation.isApproved === true ||
            !isAdmin
        ) {
            return null;
        }

        return (
            <div className="flex w-full gap-2">
                <Dialog
                    open={approveDialogOpen}
                    onOpenChange={setApproveDialogOpen}
                >
                    <DialogTrigger asChild>
                        <BrandButton
                            className={cn(
                                'shadow-none rounded-md px-3 h-7 text-sm',
                                renderBgColor(),
                            )}
                        >
                            Approve
                        </BrandButton>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Reservation</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to approve this
                                reservation?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setApproveDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <BrandButton
                                onClick={() => {
                                    handleApproval(reservation.id, 'approve');
                                    setApproveDialogOpen(false);
                                }}
                            >
                                Confirm Approval
                            </BrandButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={rejectDialogOpen}
                    onOpenChange={setRejectDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="shadow-none rounded-md px-3 h-7 text-sm"
                            disabled={reservation.isVoid}
                        >
                            Reject
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Reservation</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this
                                reservation.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRejectDialogOpen(false);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    handleApproval(
                                        reservation.id,
                                        'reject',
                                        rejectionReason,
                                    );
                                    setRejectDialogOpen(false);
                                    setRejectionReason('');
                                }}
                                disabled={!rejectionReason.trim()}
                            >
                                Confirm Rejection
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    };

    const renderStayActionButton = () => {
        const isInHouse =
            !!reservation.isCheckedIn && !reservation.isCheckedOut;
        // A void reservation can never be checked in, but a void stay that is
        // already in-house still needs a way out of the room.
        const visible = mode === 'add' ? !reservation.isVoid : isInHouse;
        if (!visible) return null;

        const needsSettlement =
            (appearance === 'group' &&
                Number(reservation.extrasDue || 0) > 0) ||
            (!!reservation.isVoid && stayFolioDue > 0);

        return (
            <PermissionGate
                blockType="modal"
                permissions={
                    mode === 'add'
                        ? [
                              PERMISSIONS.CHECK_IN_GUEST,
                              PERMISSIONS.CREATE_RESERVATION,
                          ]
                        : [
                              PERMISSIONS.CHECK_OUT_GUEST,
                              PERMISSIONS.CREATE_RESERVATION,
                          ]
                }
                permissionType="any"
            >
                <Button
                    disabled={
                        mode === 'add'
                            ? !!reservation.isVoid || isCheckInBeforeStartDate
                            : isIaCheckoutBlocked
                    }
                    className={cn(
                        'shadow-none rounded-md px-3 text-sm',
                        appearance === 'group'
                            ? 'h-8 bg-emerald-700 text-white hover:bg-emerald-800'
                            : cn('h-7', renderBgColor()),
                        mode === 'edit' &&
                            isIaCheckoutBlocked &&
                            'opacity-50 cursor-not-allowed',
                    )}
                    onClick={handleCheckoutClick}
                    title={
                        mode === 'add' && isCheckInBeforeStartDate
                            ? `Check-in is only allowed on or after ${new Date(reservation.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : mode === 'edit' && isIaCheckoutBlocked
                              ? 'Check-out is disabled until Internal Account posting is approved'
                              : undefined
                    }
                >
                    {mode === 'add'
                        ? 'Check In'
                        : needsSettlement
                          ? 'Settle & Check Out'
                          : 'Check Out'}
                </Button>
            </PermissionGate>
        );
    };

    const renderActionButtons = () => {
        if (reservation.isVoid) {
            return (
                <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            title="Administrator Only"
                            className="h-7 w-7"
                            disabled={!isAdmin}
                            onClick={() => {
                                setSelectedReservationId(reservation.id);
                                setShowDeleteModal(true);
                            }}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 text-muted-foreground hover:bg-transparent"
                                >
                                    <Info className="w-3 h-3" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                align="start"
                                className="w-64"
                            >
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">
                                        Void Reason
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {reservation.voidReason}
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {renderStayActionButton()}
                </div>
            );
        }

        const approvalStatusMap = {
            VOID: {
                text: 'Void Approval Pending',
                icon: <Ban className="w-4 h-4" />,
                textColor: 'text-red-500',
            },
            COMPLIMENTARY: {
                text: 'Complimentary Approval Pending',
                icon: <Gift className="w-4 h-4" />,
                textColor: 'text-red-500',
            },
            DISCOUNT: {
                text: 'Discount Approval Pending',
                icon: <BadgePercent className="w-4 h-4" />,
                textColor: 'text-red-500',
            },
        };

        if (reservation.needsApproval && reservation.isApproved !== true) {
            const approvalType = reservation.approvalType;
            const config = approvalType
                ? approvalStatusMap[
                      approvalType as keyof typeof approvalStatusMap
                  ]
                : null;

            if (config && !isAdmin) {
                return (
                    <div className="flex flex-wrap items-center gap-2">
                        <div
                            className={`${config.textColor} flex text-xs items-center gap-2`}
                        >
                            {config.icon} {config.text}
                        </div>
                        {mode === 'add' && !reservation.isVoid && (
                            <Button
                                disabled={isCheckInBeforeStartDate}
                                className={cn(
                                    'shadow-none rounded-md px-3 h-7 text-sm',
                                    renderBgColor(),
                                )}
                                onClick={handleCheckoutClick}
                                title={
                                    isCheckInBeforeStartDate
                                        ? `Check-in is only allowed on or after ${new Date(reservation.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                        : 'Check in while approval is pending'
                                }
                            >
                                Check In
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            className="h-7 px-3 text-sm"
                            onClick={() => setPinDialogOpen(true)}
                        >
                            Add PIN
                        </Button>
                    </div>
                );
            }
        }

        return (
            <>
                <div className="flex items-center gap-2">
                    <PermissionGate
                        blockType="modal"
                        permissions={[PERMISSIONS.CREATE_RESERVATION]}
                        permissionType="all"
                    >
                        <StepperDialog
                            open={reservationOpen}
                            onOpenChange={setReservationOpen}
                            trigger={
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setReservationOpen(true)}
                                >
                                    <Edit className="w-3 h-3" />
                                </Button>
                            }
                            title="Edit Reservation"
                            content={
                                <MultiStepForm
                                    mode="update"
                                    guestDetails={reservation}
                                    onClose={() => setReservationOpen(false)}
                                />
                            }
                        />
                    </PermissionGate>

                    <PermissionGate
                        blockType="modal"
                        permissions={[PERMISSIONS.CREATE_RESERVATION]}
                        permissionType="all"
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                >
                                    <MoreVertical className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-52">
                                {!reservation.isCheckedOut && (
                                    <DropdownMenuItem
                                        onClick={() => setEditDatesOpen(true)}
                                    >
                                        <Calendar className="mr-1 h-3.5 w-3.5" />
                                        Edit Dates
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    disabled={!isAdmin}
                                    title="Administrator Only"
                                    onClick={() => {
                                        setSelectedReservationId(
                                            reservation.id,
                                        );
                                        setShowDeleteModal(true);
                                    }}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handlePrint}
                                    disabled={!!reservation.isVoid}
                                >
                                    <Printer className="mr-1 h-3.5 w-3.5" />
                                    Print
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDownloadPdf}
                                    disabled={
                                        !!reservation.isVoid || pdfLoading
                                    }
                                >
                                    <FileDown className="mr-1 h-3.5 w-3.5" />
                                    {pdfLoading
                                        ? 'Preparing PDF…'
                                        : 'Download PDF'}
                                </DropdownMenuItem>
                                {!reservation.isVoid &&
                                    !reservation.isCheckedIn && (
                                        <DropdownMenuItem
                                            onClick={openSendConfirmationModal}
                                            disabled={
                                                !guestEmailTrimmed ||
                                                emailLoading
                                            }
                                            title={
                                                !guestEmailTrimmed
                                                    ? 'Add a guest email on the reservation to send a confirmation'
                                                    : undefined
                                            }
                                        >
                                            <Mail className="mr-1 h-3.5 w-3.5" />
                                            Send confirmation
                                        </DropdownMenuItem>
                                    )}
                                <DropdownMenuItem
                                    onClick={() => handleVoidClick()}
                                    disabled={!isAdmin}
                                    title={!isAdmin ? 'Administrator Only' : ''}
                                >
                                    <Ban className="mr-1 h-3.5 w-3.5" />
                                    {isAdmin ? 'Void' : 'Request Void'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </PermissionGate>
                </div>

                {renderStayActionButton()}
            </>
        );
    };

    const stayFace =
        appearance === 'group' && groupStay ? (
            <GroupInHouseStay
                reservation={reservation}
                groupStay={groupStay}
                actions={
                    reservation.isRejected ? null : renderActionButtons()
                }
            />
        ) : (
            <Card
                key={reservation.id}
                data-reservation-id={reservation.id}
                className="w-full p-1 shadow-none relative border rounded-md text-sm"
            >
                <CardHeader className="py-2 px-2 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <div
                            className={cn(
                                'w-8 h-8 rounded-sm text-white flex items-center justify-center',
                                renderBgColor(),
                            )}
                        >
                            {renderIcon()}
                        </div>
                        <div>
                            <div className="font-bold text-sm leading-none line-clamp-1">
                                {reservation.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                                {reservation.phoneNumber}
                            </div>
                            {reservation.groupReservationId ? (
                                <Badge
                                    variant="outline"
                                    className="mt-1 px-1.5 py-0 text-[10px] font-medium"
                                >
                                    {reservation.groupReservationCode || 'Group'}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>{reservation.numberOfGuests}</span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            <Baby className="w-3.5 h-3.5" />
                            <span>0</span>
                        </Badge>
                    </div>
                </CardHeader>

                <CardBody className="py-1 px-2 flex flex-col gap-1 relative">
                    <div className="flex w-full bg-slate-50 rounded-md mb-2 overflow-hidden border">
                        <div className="flex-1 flex flex-col items-center justify-center py-2">
                            <span className="text-xs text-muted-foreground">
                                Check-in
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    reservation.startDate,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="text-xs">
                                {reservation.startTime}
                            </span>
                        </div>

                        <div className="bg-slate-100 px-3 flex flex-col items-center justify-center">
                            <span className="font-bold text-lg">
                                {getNights(
                                    reservation.startDate,
                                    reservation.endDate,
                                )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                nights
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-2">
                            <span className="text-xs text-muted-foreground">
                                Check-out
                            </span>
                            <span className="font-medium">
                                {new Date(
                                    reservation.endDate,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                            <span className="text-xs">
                                {reservation.endTime}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Room / Type
                            </h4>
                            <p
                                className="font-medium text-sm line-clamp-1 cursor-pointer"
                                title={`${reservation?.room?.roomNumber}${showRoman && reservation?.room?.roomNumberRoman ? ` (${reservation?.room?.roomNumberRoman})` : ''} / ${reservation?.roomType?.name}`}
                            >
                                {reservation?.room?.roomNumber}
                                {showRoman && reservation?.room?.roomNumberRoman
                                    ? ` (${reservation?.room?.roomNumberRoman})`
                                    : ''}{' '}
                                / {reservation?.roomType?.name}
                            </p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Booked on
                            </h4>
                            <p className="font-medium text-sm">
                                {new Date(
                                    reservation.createdAt,
                                ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    {reservation.hasRoomActivity && (
                        <div
                            className={`flex w-full items-center gap-1 rounded-md border px-2.5 py-2 text-xs font-medium ${activityTone.border} ${activityTone.background} ${activityTone.text}`}
                        >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span className="min-w-0 flex-1">
                                {Number(reservation.orderCount || 0)} order
                                {Number(reservation.orderCount || 0) !== 1
                                    ? 's'
                                    : ''}
                                {' / '}
                                {Number(reservation.serviceCount || 0)} service
                                {Number(reservation.serviceCount || 0) !== 1
                                    ? 's'
                                    : ''}
                                {' posted '}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={openActivityDetails}
                                className={`h-6 shrink-0 gap-1 px-1 text-xs ${activityTone.text}`}
                            >
                                <Eye className="h-1 w-1" />
                                View
                            </Button>
                        </div>
                    )}

                    <div
                        className={`grid ${showBalance ? 'grid-cols-3' : 'grid-cols-2'} gap-2 bg-slate-50 p-2 rounded-md`}
                    >
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Total
                            </h4>
                            <p className="font-semibold">
                                ₦ {formatAmount(displayTotal)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Paid
                            </h4>
                            <p className="font-semibold">
                                ₦ {formatAmount(paidAmount)}
                            </p>
                        </div>
                        {showBalance && (
                            <div>
                                <h4 className="text-xs text-muted-foreground">
                                    Balance
                                </h4>
                                <div className="flex items-center gap-1">
                                    <p
                                        className={`font-semibold ${
                                            balance < 0
                                                ? 'text-red-500'
                                                : balance > 0
                                                  ? 'text-green-500'
                                                  : 'text-orion-blue'
                                        }`}
                                    >
                                        {balance < 0
                                            ? `-₦ ${formatAmount(Math.abs(balance))}`
                                            : balance > 0
                                              ? `₦ ${formatAmount(balance)}`
                                              : '₦ 0.00'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <PaidThroughInternalAccount reservation={reservation} />

                    {reservation.proofOfPayment && (
                        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700 flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                    Proof of Payment
                                </span>
                                {reservation.isProofOfPaymentApproved ? (
                                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                                        <Check className="w-3.5 h-3.5" />{' '}
                                        Approved
                                    </span>
                                ) : (
                                    <span className="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                        Pending Approval
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <a
                                    href={reservation.proofOfPayment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orion-blue hover:underline flex items-center gap-1 font-medium"
                                >
                                    <Eye className="w-3.5 h-3.5" /> View Receipt
                                </a>
                                {!reservation.isProofOfPaymentApproved &&
                                    [
                                        'administrator',
                                        'manager',
                                        'general manager',
                                        'frontoffice',
                                    ].includes(user?.roles?.name || '') && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleApproveProofOfPayment(
                                                    reservation.id,
                                                )
                                            }
                                            className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                                        >
                                            Approve Receipt
                                        </button>
                                    )}
                            </div>
                        </div>
                    )}
                </CardBody>
                <Divider className="bg-gray-300" />
                <CardFooter className="p-3 flex flex-col gap-2">
                    {reservation.isRejected ? (
                        <div className="flex w-full items-center justify-between">
                            <div className="flex justify-between items-center w-fit bg-red-100 text-red-600 px-2 py-1 rounded-md">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    Rejected
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                title="Administrator Only"
                                className="h-7 w-7"
                                disabled={!isAdmin}
                                onClick={() => {
                                    setSelectedReservationId(reservation.id);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center w-full">
                            {renderApprovalSection()}
                            {renderActionButtons()}
                        </div>
                    )}
                </CardFooter>
            </Card>
        );

    return (
        <div
            className={cn(
                'flex flex-col',
                appearance === 'group' && 'h-full w-full min-w-0',
            )}
        >
            {stayFace}

            <Dialog open={askMasterCheckout} onOpenChange={setAskMasterCheckout}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Other rooms are still in-house</DialogTitle>
                        <DialogDescription>
                            {groupStay?.otherInHouseCount || 0} group room
                            {(groupStay?.otherInHouseCount || 0) === 1
                                ? ' is'
                                : 's are'}{' '}
                            still checked in. Checking out the master room does
                            not close the group master bill.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAskMasterCheckout(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-emerald-700 text-white hover:bg-emerald-800"
                            onClick={() => {
                                setAskMasterCheckout(false);
                                continueCheckout();
                            }}
                        >
                            Check out master
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {showDeleteModal && selectedReservationId && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    reservationId={selectedReservationId}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}
            <SendReservationConfirmationDialog
                open={sendConfirmOpen}
                onOpenChange={setSendConfirmOpen}
                guestEmail={guestEmailTrimmed}
                loading={emailLoading}
                onSend={executeSendReservationConfirmation}
            />

            <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Room activity for {reservation.fullName}
                        </DialogTitle>
                        <DialogDescription>
                            Orders and hotel services posted to Room{' '}
                            {reservation.roomNumber}.
                        </DialogDescription>
                    </DialogHeader>
                    {activityLoading ? (
                        <p className="py-4 text-sm text-muted-foreground">
                            Loading activity details...
                        </p>
                    ) : activityDetails.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">
                            No activity details are available.
                        </p>
                    ) : (
                        <div className="max-h-[55vh] space-y-2 overflow-y-auto">
                            {activityDetails.map((activity) => (
                                <div
                                    key={`${activity.type}-${activity.id}`}
                                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium capitalize">
                                                {activity.type === 'restaurant'
                                                    ? 'Restaurant order'
                                                    : activity.type}
                                            </p>
                                            {activity.orderItems?.length > 0 ? (
                                                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                                    {activity.orderItems.map(
                                                        (item: any) => (
                                                            <li key={item.id}>
                                                                {item.quantity}{' '}
                                                                x {item.name}
                                                                {item.notes
                                                                    ? ` (${item.notes})`
                                                                    : ''}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            ) : activity.notes &&
                                              activity.notes !== 'N/A' ? (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {activity.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold">
                                                {formatCurrency(
                                                    activity.amount,
                                                )}
                                            </p>
                                            <p className="text-[11px] uppercase text-muted-foreground">
                                                {String(
                                                    activity.paymentStatus,
                                                ).replaceAll('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <VoidReservationDialog
                open={voidDialogOpen}
                onOpenChange={setVoidDialogOpen}
                reservation={reservation}
            />

            <DirtyRoomCheckInAlert
                open={dirtyRoomCheckInOpen}
                onOpenChange={setDirtyRoomCheckInOpen}
                roomLabel={getReservationRoomDisplayLabel(reservation)}
                onConfirm={() => runCheckInOrOut()}
            />

            <PaymentSettlementModal
                guest={reservation}
                isOpen={paymentModalOpen}
                onClose={() => {
                    setPaymentModalOpen(false);
                    setPendingCheckoutOptions(null);
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onCheckout={async (opts) => {
                    await handleSubmit(
                        reservation.id,
                        opts,
                        pendingCheckoutOptions?.transferUnusedBalanceToPayable,
                        true, // skip early checkout check
                    );
                    setPendingCheckoutOptions(null);
                }}
            />

            <ReservationDateModal
                open={editDatesOpen}
                onOpenChange={setEditDatesOpen}
                reservation={reservation}
                onSuccess={() => {
                    setEditDatesOpen(false);
                    mutate('list-data', false);
                }}
            />

            <EarlyCheckoutModal
                isOpen={showEarlyCheckoutDialog}
                onClose={() => {
                    setShowEarlyCheckoutDialog(false);
                    setEarlyCheckoutDetails(null);
                }}
                earlyCheckoutDetails={earlyCheckoutDetails}
                onCheckoutWithoutTransfer={() =>
                    handleEarlyCheckoutConfirm(false)
                }
                onCheckoutWithTransfer={() => handleEarlyCheckoutConfirm(true)}
                isLoading={isCheckingOut}
            />

            <ManagerPinDialog
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                title="Approve with manager PIN"
                description="Enter a valid 4-digit Manager/Admin PIN. The PIN is not stored or shown after entry."
                confirmLabel="Approve"
                isLoading={pinLoading}
                onConfirm={async (pin) => {
                    setPinLoading(true);
                    try {
                        await handleApproval(
                            reservation.id,
                            'approve',
                            undefined,
                            pin,
                        );
                        setPinDialogOpen(false);
                    } finally {
                        setPinLoading(false);
                    }
                }}
            />
        </div>
    );
}
