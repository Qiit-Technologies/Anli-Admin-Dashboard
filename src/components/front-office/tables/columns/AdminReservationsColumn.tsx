'use client';
import { approveSpecialReservation } from '@/app/actions/reservation';
import BrandButton from '@/components/common/Button';
import { CustomSheet } from '@/components/common/CustomSheet';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency } from '@/lib/utils';
import { Reservation } from '@/types/reservation';
import { TUser } from '@/types/user';
import { Card, CardBody, CardHeader, Divider, Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    BadgePercent,
    Ban,
    CircleHelp,
    Eye,
    Gift,
    MoreVertical,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuHotel } from 'react-icons/lu';
import { mutate } from 'swr';

const renderBgColor = (reservation: Reservation) => {
    if (reservation.isVoid) {
        return 'bg-red-500 hover:bg-red-600 text-white';
    }
    if (reservation.isComplimentary) {
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    }
    if (reservation.discountType) {
        return 'bg-orion-blue hover:bg-orion-blue text-white';
    }
    if (reservation.isCheckedIn) {
        return 'bg-green-500 hover:bg-green-600 text-white';
    }
    return 'bg-hexbrand hover:bg-hexbrand text-white';
};

const renderIcon = (reservation: Reservation) => {
    if (reservation.isVoid) {
        return <Ban className="w-4 h-4" />;
    }
    if (reservation.isComplimentary) {
        return <Gift className="w-4 h-4" />;
    }
    if (reservation.discountType) {
        return <BadgePercent className="w-4 h-4" />;
    }
    return <LuHotel className="w-4 h-4" />;
};

const ReservationDetailsSheet = ({
    reservation,
    user,
    onClose,
    showRoman,
}: {
    reservation: Reservation;
    user: TUser | undefined;
    onClose: () => void;
    showRoman: boolean;
}) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isApproving, setIsApproving] = useState(false);
    const [isApprovingWithReason, setIsApprovingWithReason] = useState(false);
    const [approvalReason, setApprovalReason] = useState('');

    const adminRoles = ['administrator', 'manager', 'general manager'];
    const isAdmin = adminRoles.includes(user?.roles?.name || '');

    const handleApproval = async (
        id: number,
        action: 'approve' | 'reject',
        rejectionReason?: string,
        approvalReason?: string,
    ) => {
        setIsApproving(true);
        try {
            const response = await approveSpecialReservation({
                reservationId: id,
                action,
                rejectionReason,
                approvalReason,
            });

            if (
                response?.message === 'Check In successfully!' ||
                response?.message?.toLowerCase().includes('success')
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            action === 'approve'
                                ? 'Reservation Approved Successfully'
                                : 'Reservation Rejected Successfully'
                        }
                        type="success"
                    />
                ));
                mutate('pending-approvals', false);
                onClose();
                setIsApproving(false);
                setIsApprovingWithReason(false);
                setApprovalReason('');
                setRejectionReason('');
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
        } finally {
            setIsApproving(false);
            setIsApprovingWithReason(false);
        }
    };

    const shouldShowApprovalButtons =
        reservation.needsApproval && reservation.isApproved !== true && isAdmin;

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

    const renderApprovalSection = () => {
        if (!reservation.needsApproval) {
            return (
                <span className="text-gray-500 text-xs">
                    No approval needed
                </span>
            );
        }

        if (reservation.isApproved === true) {
            return (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Approved
                </div>
            );
        }

        if (shouldShowApprovalButtons) {
            return (
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                        <BrandButton
                            size="sm"
                            className="border-green-600 border bg-transparent text-green-600 hover:bg-green-50 flex-1"
                            onClick={() => {
                                setIsApprovingWithReason(
                                    !isApprovingWithReason,
                                );
                                setIsRejecting(false);
                            }}
                        >
                            Approve
                        </BrandButton>
                        <BrandButton
                            size="sm"
                            className="border-red-600 border bg-transparent text-red-600 hover:bg-red-50 flex-1"
                            onClick={() => {
                                setIsRejecting(!isRejecting);
                                setIsApprovingWithReason(false);
                            }}
                        >
                            Reject
                        </BrandButton>
                    </div>
                    {isApprovingWithReason && (
                        <>
                            <Textarea
                                value={approvalReason}
                                onChange={(e) =>
                                    setApprovalReason(e.target.value)
                                }
                                placeholder="Enter approval reason (optional)"
                            />
                            <BrandButton
                                loading={isApproving && isApprovingWithReason}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-10 shadow-none"
                                onClick={() =>
                                    handleApproval(
                                        reservation.id,
                                        'approve',
                                        undefined,
                                        approvalReason,
                                    )
                                }
                            >
                                Submit Approval
                            </BrandButton>
                        </>
                    )}
                    {isRejecting && (
                        <>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                placeholder="Enter rejection reason"
                            />
                            <BrandButton
                                loading={isApproving}
                                size="sm"
                                disabled={rejectionReason.length === 0}
                                className="border-red-600 border h-10 shadow-none bg-transparent text-red-600 hover:bg-red-50"
                                onClick={() =>
                                    handleApproval(
                                        reservation.id,
                                        'reject',
                                        rejectionReason,
                                    )
                                }
                            >
                                Submit Rejection
                            </BrandButton>
                        </>
                    )}
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1 text-orange-600 text-xs">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                Pending
            </div>
        );
    };

    const getStatusText = () => {
        if (reservation.isApproved === true) {
            return 'Approved';
        }
        if (reservation.isApproved === false) {
            return 'Pending Approval';
        }

        if (reservation.isRejected) {
            return 'Rejected';
        }
        return 'Pending';
    };

    const renderApprovalType = () => {
        switch (reservation.approvalType) {
            case 'VOID':
                return (
                    <>
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Void Reservation Request
                        </div>
                        {reservation.voidReason && (
                            <p className="text-sm mt-2 text-muted-foreground">
                                Reason : {reservation.voidReason}
                            </p>
                        )}
                    </>
                );
            case 'COMPLIMENTARY':
                return (
                    <div className="flex items-center gap-1 text-yellow-600 text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Complimentary Reservation Request
                    </div>
                );
            case 'DISCOUNT':
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-orange-600 text-xs">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            Discount Reservation Request
                        </div>
                        {reservation.discountType && (
                            <p className="text-sm text-muted-foreground">
                                {reservation.discountType}
                            </p>
                        )}
                        {reservation.discountValue && (
                            <>
                                {reservation.discountType === 'PERCENTAGE' ? (
                                    <p className="text-sm text-muted-foreground">
                                        {Number(
                                            reservation.discountValue,
                                        ).toFixed(0)}
                                        % Off
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        NGN {reservation.discountValue} Off
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="space-y-4">
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'p-2 rounded-lg',
                                    renderBgColor(),
                                )}
                            >
                                {renderIcon()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {reservation.fullName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {reservation.phoneNumber}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            #{reservation.id}
                        </Badge>
                    </div>
                </CardHeader>
                <Divider className="bg-gray-200" />
                <CardBody className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Check-in
                            </h4>
                            <p className="font-medium">
                                {new Date(
                                    reservation.startDate,
                                ).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                            <span className="text-xs text-muted-foreground">
                                {reservation.startTime}
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Check-out
                            </h4>
                            <p className="font-medium">
                                {new Date(
                                    reservation.endDate,
                                ).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                            <span className="text-xs text-muted-foreground">
                                {reservation.endTime}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Room / Type
                            </h4>
                            <p className="font-medium text-sm">
                                {reservation?.room?.roomNumber}
                                {showRoman && reservation?.room?.roomNumberRoman
                                    ? ` (${reservation?.room?.roomNumberRoman})`
                                    : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {reservation?.roomType?.name}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Guests
                            </h4>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">
                                    {reservation.numberOfGuests} guest
                                    {reservation.numberOfGuests !== 1
                                        ? 's'
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md">
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Total
                            </h4>
                            <p className="font-semibold">
                                {(() => {
                                    if (
                                        reservation.isVoid ||
                                        reservation.isComplimentary
                                    ) {
                                        return formatCurrency(0);
                                    }

                                    // Calculate Total: (originalPrice * nights) + all additional charges
                                    const startDate = new Date(
                                        reservation.startDate,
                                    );
                                    const endDate = new Date(
                                        reservation.endDate,
                                    );
                                    const nights = Math.max(
                                        1,
                                        Math.ceil(
                                            (endDate.getTime() -
                                                startDate.getTime()) /
                                            (1000 * 60 * 60 * 24),
                                        ),
                                    );
                                    const basePrice =
                                        Number(
                                            reservation.originalPrice ??
                                            reservation.room?.price ??
                                            0,
                                        ) * nights;
                                    const discountAmount = Number(
                                        reservation.discountAmount ?? 0,
                                    );
                                    const vatAmount = Number(
                                        reservation.vatAmount ?? 0,
                                    );
                                    const serviceChargeAmount = Number(
                                        reservation.serviceChargeAmount ?? 0,
                                    );
                                    const tipAmount = Number(
                                        reservation.tipAmount ?? 0,
                                    );
                                    const totalCustomChargesAmount = Number(
                                        reservation.totalCustomChargesAmount ??
                                        0,
                                    );
                                    // Total = base price - discount + VAT + service charges + tips + custom charges
                                    return formatCurrency(
                                        Math.max(
                                            0,
                                            basePrice -
                                            discountAmount +
                                            vatAmount +
                                            serviceChargeAmount +
                                            tipAmount +
                                            totalCustomChargesAmount,
                                        ),
                                    );
                                })()}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Paid
                            </h4>
                            <p className="font-semibold">
                                {formatCurrency(
                                    reservation.paidAmount !== undefined &&
                                        reservation.paidAmount !== null
                                        ? reservation.paidAmount
                                        : reservation.amountPaid,
                                )}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Balance
                            </h4>
                            {(() => {
                                if (
                                    reservation.isVoid ||
                                    reservation.isComplimentary
                                ) {
                                    return (
                                        <p className="font-semibold text-gray-600">
                                            {formatCurrency(0)}
                                        </p>
                                    );
                                }

                                // Use actual payable/receivable values (allow negatives)
                                const payableBalance =
                                    reservation.payableBalance !== undefined &&
                                        reservation.payableBalance !== null
                                        ? Number(reservation.payableBalance)
                                        : 0;

                                const receivableBalance =
                                    reservation.receivableBalance !==
                                        undefined &&
                                        reservation.receivableBalance !== null
                                        ? Number(reservation.receivableBalance)
                                        : 0;

                                let balance: number;
                                if (payableBalance !== 0) {
                                    balance = payableBalance;
                                } else if (receivableBalance !== 0) {
                                    balance = receivableBalance;
                                } else {
                                    // Fallback to calculating from other values
                                    const totalCost =
                                        reservation.totalCost !== undefined &&
                                            reservation.totalCost !== null
                                            ? Number(reservation.totalCost)
                                            : (reservation.paidAmount ||
                                                reservation.amountPaid ||
                                                0) +
                                            (reservation.totalDue !==
                                                undefined &&
                                                reservation.totalDue !== null
                                                ? Number(
                                                    reservation.totalDue,
                                                )
                                                : Math.max(
                                                    0,
                                                    reservation.outstanding ||
                                                    0,
                                                )) || 0;
                                    const paidAmount =
                                        reservation.paidAmount !== undefined &&
                                            reservation.paidAmount !== null
                                            ? Number(reservation.paidAmount)
                                            : reservation.amountPaid || 0;
                                    balance = paidAmount - totalCost;
                                }

                                return (
                                    <p
                                        className={`font-semibold ${balance < 0
                                                ? 'text-red-500'
                                                : balance > 0
                                                    ? 'text-green-500'
                                                    : 'text-gray-600'
                                            }`}
                                    >
                                        {balance < 0
                                            ? `-${formatCurrency(Math.abs(balance))}`
                                            : formatCurrency(balance)}
                                    </p>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Enhanced reservation details section */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md">
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Nights
                            </h4>
                            <p className="font-semibold">
                                {(() => {
                                    const startDate = new Date(
                                        reservation.startDate,
                                    );
                                    const endDate = new Date(
                                        reservation.endDate,
                                    );
                                    const nights = Math.max(
                                        1,
                                        Math.ceil(
                                            (endDate.getTime() -
                                                startDate.getTime()) /
                                            (1000 * 60 * 60 * 24),
                                        ),
                                    );
                                    return `${nights} night${nights !== 1 ? 's' : ''}`;
                                })()}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Rate per Night
                            </h4>
                            <p className="font-semibold">
                                {formatCurrency(reservation.room?.price || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Discount information - show for all reservations with enhanced details */}
                    {reservation.discountType && reservation.discountValue ? (
                        <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-1">
                                <BadgePercent className="w-4 h-4" />
                                Discount Applied
                            </h4>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <h5 className="text-xs text-muted-foreground">
                                        Original Total
                                    </h5>
                                    <p className="font-semibold">
                                        {(() => {
                                            const roomPrice = Number(
                                                reservation.room?.price || 0,
                                            );
                                            const startDate = new Date(
                                                reservation.startDate,
                                            );
                                            const endDate = new Date(
                                                reservation.endDate,
                                            );
                                            const nights = Math.max(
                                                1,
                                                Math.ceil(
                                                    (endDate.getTime() -
                                                        startDate.getTime()) /
                                                    (1000 * 60 * 60 * 24),
                                                ),
                                            );
                                            return formatCurrency(
                                                roomPrice * nights,
                                            );
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <h5 className="text-xs text-muted-foreground">
                                        Discount Type
                                    </h5>
                                    <p className="font-semibold">
                                        {reservation.discountType ===
                                            'PERCENTAGE'
                                            ? 'Percentage'
                                            : 'Fixed Amount'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <h5 className="text-xs text-muted-foreground">
                                        Discount Value
                                    </h5>
                                    <p className="font-semibold text-red-600">
                                        {reservation.discountType ===
                                            'PERCENTAGE'
                                            ? `${Number(reservation.discountValue).toFixed(0)}%`
                                            : formatCurrency(
                                                reservation.discountValue ||
                                                0,
                                            )}
                                    </p>
                                </div>
                                <div>
                                    <h5 className="text-xs text-muted-foreground">
                                        Discount Amount
                                    </h5>
                                    <p className="font-semibold text-red-600">
                                        -
                                        {(() => {
                                            const roomPrice = Number(
                                                reservation.room?.price || 0,
                                            );
                                            const startDate = new Date(
                                                reservation.startDate,
                                            );
                                            const endDate = new Date(
                                                reservation.endDate,
                                            );
                                            const nights = Math.max(
                                                1,
                                                Math.ceil(
                                                    (endDate.getTime() -
                                                        startDate.getTime()) /
                                                    (1000 * 60 * 60 * 24),
                                                ),
                                            );
                                            const originalTotal =
                                                roomPrice * nights;

                                            let discountAmount = 0;
                                            if (
                                                reservation.discountType ===
                                                'PERCENTAGE'
                                            ) {
                                                discountAmount =
                                                    (originalTotal *
                                                        Number(
                                                            reservation.discountValue,
                                                        )) /
                                                    100;
                                            } else if (
                                                reservation.discountType ===
                                                'FIXED_AMOUNT'
                                            ) {
                                                discountAmount = Number(
                                                    reservation.discountValue,
                                                );
                                            }
                                            return formatCurrency(
                                                discountAmount,
                                            );
                                        })()}
                                    </p>
                                </div>
                            </div>
                            {reservation.discountReason && (
                                <div className="mt-2 pt-2 border-t border-orange-200">
                                    <h5 className="text-xs text-muted-foreground">
                                        Discount Reason
                                    </h5>
                                    <p className="text-sm text-gray-700">
                                        {reservation.discountReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : reservation.isComplimentary ? (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                                <Gift className="w-4 h-4" />
                                Complimentary Reservation
                            </h4>
                            <p className="text-sm text-green-700">
                                This reservation is complimentary - no payment
                                required.
                            </p>
                        </div>
                    ) : reservation.isVoid ? (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
                                <Ban className="w-4 h-4" />
                                Voided Reservation
                            </h4>
                            <p className="text-sm text-red-700">
                                This reservation has been voided.
                            </p>
                            {reservation.voidReason && (
                                <div className="mt-2 pt-2 border-t border-red-200">
                                    <h5 className="text-xs text-muted-foreground">
                                        Void Reason
                                    </h5>
                                    <p className="text-sm text-red-700">
                                        {reservation.voidReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">
                                Standard Reservation
                            </h4>
                            <p className="text-sm text-blue-700">
                                Regular reservation with no special pricing
                                adjustments.
                            </p>
                        </div>
                    )}

                    {/* Payment method and additional details */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md">
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Payment Method
                            </h4>
                            <p className="font-semibold capitalize">
                                {reservation.paymentMethod || 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Reservation Status
                            </h4>
                            <p className="font-semibold">
                                <Badge
                                    className={cn(
                                        'text-xs',
                                        reservation.status === 'GOOD'
                                            ? 'bg-green-100 text-green-800'
                                            : reservation.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : reservation.status ===
                                                    'CANCELLED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800',
                                    )}
                                >
                                    {reservation.status}
                                </Badge>
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Approval Status
                        </h4>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-orange-600 text-xs">
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                {getStatusText()}
                            </div>
                            {reservation.isApproved === true &&
                                reservation.approvalReason && (
                                    <div className="bg-green-50 border border-green-200 p-2 rounded-md">
                                        <h5 className="text-xs text-muted-foreground mb-1">
                                            Approval Reason
                                        </h5>
                                        <p className="text-sm text-green-700">
                                            {reservation.approvalReason}
                                        </p>
                                    </div>
                                )}
                            {reservation.isRejected &&
                                reservation.rejectionReason && (
                                    <div className="bg-red-50 border border-red-200 p-2 rounded-md">
                                        <h5 className="text-xs text-muted-foreground mb-1">
                                            Rejection Reason
                                        </h5>
                                        <p className="text-sm text-red-700">
                                            {reservation.rejectionReason}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Approval Type
                        </h4>
                        {renderApprovalType()}
                    </div>

                    <hr />
                    {renderApprovalSection()}
                </CardBody>
            </Card>
        </div>
    );
};

const ActionButtons = ({
    reservation,
    user,
    showRoman,
}: {
    reservation: Reservation;
    user: TUser | undefined;
    showRoman: boolean;
}) => {
    const [handleSheetOpen, setHandleSheetOpen] = useState(false);
    const shouldShowApprovalButtons = () => {
        const adminRoles = ['administrator', 'manager', 'general manager'];
        const isAdmin = adminRoles.includes(user?.roles?.name || '');
        return (
            reservation.needsApproval &&
            reservation.isApproved !== true &&
            isAdmin
        );
    };

    const getStatusText = () => {
        if (!reservation.needsApproval) {
            return 'No approval needed';
        }
        if (reservation.isApproved === true) {
            return 'Approved';
        }
        if (reservation.isApproved === false) {
            return 'Rejected';
        }
        return 'Pending';
    };

    return (
        <div className="flex items-center gap-2">
            <CustomSheet
                open={handleSheetOpen}
                setOpen={setHandleSheetOpen}
                trigger={
                    <Button
                        size="sm"
                        variant="outline"
                        className="p-2"
                        title="View details"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                }
                title={`Reservation Details - ${reservation.fullName}`}
                subTitle={`#${reservation.id} • ${reservation.roomNumber}`}
            >
                <ReservationDetailsSheet
                    reservation={reservation}
                    user={user}
                    onClose={() => setHandleSheetOpen(false)}
                    showRoman={showRoman}
                />
            </CustomSheet>

            {shouldShowApprovalButtons() ? (
                <CustomSheet
                    trigger={
                        <Button
                            size="sm"
                            variant="outline"
                            className="p-2"
                            title="More actions"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    }
                    title="Approval Actions"
                    subTitle={`${reservation.approvalType} request for ${reservation.fullName}`}
                >
                    <ReservationDetailsSheet
                        reservation={reservation}
                        user={user}
                        onClose={() => setHandleSheetOpen(false)}
                        showRoman={showRoman}
                    />
                </CustomSheet>
            ) : (
                <span className="text-xs text-muted-foreground px-2">
                    {getStatusText()}
                </span>
            )}
        </div>
    );
};

export const AdminReservationColumns = (
    user: TUser | undefined,
    showRoman: boolean,
): ColumnDef<Reservation>[] => {
    return [
        {
            accessorKey: 'fullName',
            header: () => (
                <div className="flex items-center gap-2">
                    <span>Guest</span>
                    <Tooltip content="Guest name and contact information">
                        <CircleHelp className="w-3 h-3 text-muted-foreground" />
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const reservation = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'w-8 h-8 rounded-sm text-white flex items-center justify-center',
                                renderBgColor(reservation),
                            )}
                        >
                            {renderIcon(reservation)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-sm leading-none line-clamp-1">
                                {reservation.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {reservation.phoneNumber}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'email',
            header: 'Contact',
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium">
                        {row.original.phoneNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.email}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'startDate',
            header: 'Stay Period',
            cell: ({ row }) => {
                const reservation = row.original;
                const startDate = new Date(reservation.startDate);
                const endDate = new Date(reservation.endDate);
                const nights = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                return (
                    <div className="text-sm">
                        <div className="font-medium">
                            {startDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}{' '}
                            -{' '}
                            {endDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {nights} night{nights !== 1 ? 's' : ''}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'roomNumber',
            header: 'Room Details',
            cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium">{row.original.roomNumber}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.roomType?.name}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'amountPaid',
            header: 'Financial',
            cell: ({ row }) => {
                const reservation = row.original;
                return (
                    <div className="text-sm">
                        <div className="font-medium">
                            {formatCurrency(reservation.amountPaid || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Paid: {formatCurrency(reservation.amountPaid || 0)}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'approvalType',
            header: 'Request Type',
            cell: ({ row }) => {
                const reservation = row.original;

                if (reservation.isVoid) {
                    return (
                        <div className="flex items-center gap-2 text-red-600">
                            <Ban className="w-4 h-4" />
                            <span className="text-sm font-medium">Void</span>
                        </div>
                    );
                }

                if (reservation.isComplimentary) {
                    return (
                        <div className="flex items-center gap-2 text-yellow-600">
                            <Gift className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Complimentary
                            </span>
                        </div>
                    );
                }

                if (reservation.discountType) {
                    return (
                        <div className="flex items-center gap-2 text-blue-600">
                            <BadgePercent className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {reservation.discountType === 'PERCENTAGE'
                                    ? `${Number(
                                        reservation.discountValue,
                                    ).toFixed(0)}% Off`
                                    : `${formatCurrency(
                                        reservation.discountValue || 0,
                                    )} Off`}
                            </span>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm">Standard</span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="min-w-[120px]">
                    <ActionButtons
                        reservation={row.original}
                        user={user}
                        showRoman={showRoman}
                    />
                </div>
            ),
        },
    ];
};
