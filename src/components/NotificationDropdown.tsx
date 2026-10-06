'use client';
import { getReservationsNeedingApproval } from '@/app/actions/guest';
import { getActivityLogsByHotelId } from '@/app/actions/hotel';
import { approveSpecialReservation } from '@/app/actions/reservation';
import {
    fetchAnnouncementInbox,
    markAnnouncementRead,
} from '@/app/actions/system-announcements';
import { ActionTypeEnum } from '@/app/dashboard/components/FrontOffice/dashboard/ActivityStream';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/context/useUser';
import { formatCurrency } from '@/lib/utils';
import { Reservation } from '@/types/reservation';
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { AlertCircle, Clock, Gift, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaBell, FaClock } from 'react-icons/fa';
import useSWR, { mutate } from 'swr';

import { Bed, Calendar, Info, LogIn, LogOut, RotateCcw } from 'lucide-react';

export const getBookingIcon = (action: ActionTypeEnum) => {
    switch (action) {
        case ActionTypeEnum.CHECK_IN:
            return <LogIn className="w-4 h-4" />;
        case ActionTypeEnum.CHECK_OUT:
            return <LogOut className="w-4 h-4" />;
        case ActionTypeEnum.ROOMS_REQUESTED:
            return <Bed className="w-4 h-4" />;
        case ActionTypeEnum.GUEST_UPDATED:
            return <RotateCcw className="w-4 h-4" />;
        case ActionTypeEnum.EXTEND_STAY:
            return <Calendar className="w-4 h-4" />;
        default:
            return <Info className="w-4 h-4" />;
    }
};

const getApprovalIcon = (reservation: Reservation) => {
    if (reservation.isComplimentary)
        return <Gift className="w-4 h-4 text-yellow-600" />;
    if (reservation.isVoid) return <XCircle className="w-4 h-4 text-red-600" />;
    if (reservation.discountType)
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    return <Clock className="w-4 h-4 text-orange-600" />;
};

const getApprovalMessage = (reservation: Reservation) => {
    if (reservation.isComplimentary) {
        return `Complimentary reservation for ${reservation.fullName} (Room ${reservation.roomNumber})`;
    }
    if (reservation.isVoid) {
        return `Void request for ${reservation.fullName} (Room ${reservation.roomNumber})`;
    }
    if (reservation.discountType) {
        const discountText =
            reservation.discountType === 'PERCENTAGE'
                ? `${reservation.discountValue}%`
                : formatCurrency(reservation.discountValue || 0);
        return `${discountText} discount request for ${reservation.fullName} (Room ${reservation.roomNumber})`;
    }
    return `Special approval needed for ${reservation.fullName} (Room ${reservation.roomNumber})`;
};

export default function NotificationsPopup() {
    const { user } = useUser();
    const [isApproving, setIsApproving] = useState<{ [key: number]: boolean }>(
        {},
    );
    const [rejectionReasons, setRejectionReasons] = useState<{
        [key: number]: string;
    }>({});
    const [approvalReasons, setApprovalReasons] = useState<{
        [key: number]: string;
    }>({});
    const [showRejectionInput, setShowRejectionInput] = useState<{
        [key: number]: boolean;
    }>({});
    const [showApprovalInput, setShowApprovalInput] = useState<{
        [key: number]: boolean;
    }>({});

    const adminRoles = ['administrator', 'manager', 'general manager', 'supervisor'];
    const isAdmin = adminRoles.includes(user?.roles?.name || '');

    // SWR for activity logs with caching
    const { data: activitiesData, isLoading: activitiesLoading } = useSWR(
        'notification-activities',
        async () => {
            const result = await getActivityLogsByHotelId();
            return result?.data || [];
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        },
    );

    // SWR for pending approvals (only for admins) with caching
    const { data: approvalsData, isLoading: approvalsLoading } = useSWR(
        isAdmin ? 'pending-approvals' : null,
        async () => {
            const result = await getReservationsNeedingApproval();
            return result?.data || [];
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        },
    );

    const { data: updatesData } = useSWR(
        'system-announcement-inbox',
        async () => {
            const result = await fetchAnnouncementInbox();
            return result?.data || [];
        },
        {
            revalidateOnFocus: true,
            dedupingInterval: 30000,
        },
    );

    const activities = activitiesData || [];
    const pendingApprovals = approvalsData || [];
    const systemUpdates = updatesData || [];
    const unreadUpdates = systemUpdates.filter((item) => !item.read);
    const loading = activitiesLoading || approvalsLoading;

    const totalNotifications =
        activities.length + pendingApprovals.length + unreadUpdates.length;

    const handleApproval = async (
        id: number,
        action: 'approve' | 'reject',
        rejectionReason?: string,
        approvalReason?: string,
    ) => {
        setIsApproving((prev) => ({ ...prev, [id]: true }));

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

                // Optimistically update the cache by filtering out the approved/rejected item
                mutate(
                    'pending-approvals',
                    (current: Reservation[] | undefined) =>
                        current?.filter((r) => r.id !== id) || [],
                    { revalidate: true },
                );

                setShowRejectionInput((prev) => ({
                    ...prev,
                    [id]: false,
                }));
                setShowApprovalInput((prev) => ({
                    ...prev,
                    [id]: false,
                }));
                setRejectionReasons((prev) => ({
                    ...prev,
                    [id]: '',
                }));
                setApprovalReasons((prev) => ({
                    ...prev,
                    [id]: '',
                }));
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
            setIsApproving((prev) => ({ ...prev, [id]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-24 p-4">
                <p className="text-sm text-gray-500">
                    Loading notifications...
                </p>
            </div>
        );
    }

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <button
                    aria-label="Notifications"
                    className="p-2 w-10 h-10 rounded-full border-[1px] hover:bg-gray-100 relative"
                >
                    <FaBell className="w-5 h-5 text-gray-700" />
                    {totalNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {totalNotifications > 99
                                ? '99+'
                                : totalNotifications}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border rounded-md shadow-lg">
                <div className="flex w-full items-center justify-between p-4 border-b">
                    <h3 className="font-medium">Notifications</h3>
                    {totalNotifications > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {totalNotifications}
                        </Badge>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {systemUpdates.length > 0 && (
                        <div className="border-b">
                            <div className="p-3 bg-sky-50 border-b">
                                <h4 className="text-sm font-medium text-sky-800">
                                    System updates ({systemUpdates.length})
                                </h4>
                            </div>
                            {systemUpdates.map((update) => (
                                <button
                                    key={update.id}
                                    type="button"
                                    className="w-full p-4 text-left hover:bg-gray-50 border-b last:border-b-0"
                                    onClick={() => {
                                        if (!update.read) {
                                            void markAnnouncementRead(update.id);
                                            mutate(
                                                'system-announcement-inbox',
                                                systemUpdates.map((item) =>
                                                    item.id === update.id
                                                        ? { ...item, read: true }
                                                        : item,
                                                ),
                                                { revalidate: true },
                                            );
                                        }
                                    }}
                                >
                                    <p className="text-sm font-medium">
                                        {update.status === 'completed'
                                            ? `Completed: ${update.title}`
                                            : update.title}
                                        {!update.read ? (
                                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-orion-blue" />
                                        ) : null}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600">
                                        {update.body}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                    {isAdmin && pendingApprovals.length > 0 && (
                        <div className="border-b">
                            <div className="p-3 bg-orange-50 border-b">
                                <h4 className="text-sm font-medium text-orange-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Pending Approvals ({pendingApprovals.length}
                                    )
                                </h4>
                            </div>
                            {pendingApprovals.map(
                                (reservation: Reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="p-4 hover:bg-gray-50 transition-colors bg-white border-b last:border-b-0"
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {getApprovalIcon(reservation)}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <p className="text-sm font-medium">
                                                        {getApprovalMessage(
                                                            reservation,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <span>
                                                        Amount:{' '}
                                                        {reservation.discountType ===
                                                            'PERCENTAGE' &&
                                                        reservation.discountValue
                                                            ? (() => {
                                                                  const roomPrice =
                                                                      Number(
                                                                          reservation
                                                                              .room
                                                                              ?.price ||
                                                                              0,
                                                                      );
                                                                  const startDate =
                                                                      new Date(
                                                                          reservation.startDate,
                                                                      );
                                                                  const endDate =
                                                                      new Date(
                                                                          reservation.endDate,
                                                                      );
                                                                  const nights =
                                                                      Math.max(
                                                                          1,
                                                                          Math.ceil(
                                                                              (endDate.getTime() -
                                                                                  startDate.getTime()) /
                                                                                  (1000 *
                                                                                      60 *
                                                                                      60 *
                                                                                      24),
                                                                          ),
                                                                      );
                                                                  const originalTotal =
                                                                      roomPrice *
                                                                      nights;
                                                                  const discountAmount =
                                                                      (originalTotal *
                                                                          Number(
                                                                              reservation.discountValue,
                                                                          )) /
                                                                      100;
                                                                  const finalAmount =
                                                                      originalTotal -
                                                                      discountAmount;
                                                                  return formatCurrency(
                                                                      finalAmount,
                                                                  );
                                                              })()
                                                            : formatCurrency(
                                                                  reservation.amountPaid,
                                                              )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        Discount:{' '}
                                                        {reservation.discountType ===
                                                        'PERCENTAGE'
                                                            ? `${Number(reservation.discountValue || 0)}%`
                                                            : formatCurrency(
                                                                  reservation.discountValue ||
                                                                      0,
                                                              )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(
                                                            reservation.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Show discount breakdown for percentage discounts */}
                                                {reservation.discountType ===
                                                    'PERCENTAGE' &&
                                                    reservation.discountValue && (
                                                        <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Original
                                                                    Total:
                                                                </span>
                                                                <span>
                                                                    {(() => {
                                                                        const roomPrice =
                                                                            Number(
                                                                                reservation
                                                                                    .room
                                                                                    ?.price ||
                                                                                    0,
                                                                            );
                                                                        const startDate =
                                                                            new Date(
                                                                                reservation.startDate,
                                                                            );
                                                                        const endDate =
                                                                            new Date(
                                                                                reservation.endDate,
                                                                            );
                                                                        const nights =
                                                                            Math.max(
                                                                                1,
                                                                                Math.ceil(
                                                                                    (endDate.getTime() -
                                                                                        startDate.getTime()) /
                                                                                        (1000 *
                                                                                            60 *
                                                                                            60 *
                                                                                            24),
                                                                                ),
                                                                            );
                                                                        const originalTotal =
                                                                            roomPrice *
                                                                            nights;
                                                                        return formatCurrency(
                                                                            originalTotal,
                                                                        );
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-red-600">
                                                                <span>
                                                                    Discount (
                                                                    {Number(
                                                                        reservation.discountValue,
                                                                    )}
                                                                    %):
                                                                </span>
                                                                <span>
                                                                    -
                                                                    {(() => {
                                                                        const roomPrice =
                                                                            Number(
                                                                                reservation
                                                                                    .room
                                                                                    ?.price ||
                                                                                    0,
                                                                            );
                                                                        const startDate =
                                                                            new Date(
                                                                                reservation.startDate,
                                                                            );
                                                                        const endDate =
                                                                            new Date(
                                                                                reservation.endDate,
                                                                            );
                                                                        const nights =
                                                                            Math.max(
                                                                                1,
                                                                                Math.ceil(
                                                                                    (endDate.getTime() -
                                                                                        startDate.getTime()) /
                                                                                        (1000 *
                                                                                            60 *
                                                                                            60 *
                                                                                            24),
                                                                                ),
                                                                            );
                                                                        const originalTotal =
                                                                            roomPrice *
                                                                            nights;
                                                                        const discountAmount =
                                                                            (originalTotal *
                                                                                Number(
                                                                                    reservation.discountValue,
                                                                                )) /
                                                                            100;
                                                                        return formatCurrency(
                                                                            discountAmount,
                                                                        );
                                                                    })()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between font-semibold text-green-600 border-t pt-1 mt-1">
                                                                <span>
                                                                    Final
                                                                    Amount:
                                                                </span>
                                                                <span>
                                                                    {(() => {
                                                                        const roomPrice =
                                                                            Number(
                                                                                reservation
                                                                                    .room
                                                                                    ?.price ||
                                                                                    0,
                                                                            );
                                                                        const startDate =
                                                                            new Date(
                                                                                reservation.startDate,
                                                                            );
                                                                        const endDate =
                                                                            new Date(
                                                                                reservation.endDate,
                                                                            );
                                                                        const nights =
                                                                            Math.max(
                                                                                1,
                                                                                Math.ceil(
                                                                                    (endDate.getTime() -
                                                                                        startDate.getTime()) /
                                                                                        (1000 *
                                                                                            60 *
                                                                                            60 *
                                                                                            24),
                                                                                ),
                                                                            );
                                                                        const originalTotal =
                                                                            roomPrice *
                                                                            nights;
                                                                        const discountAmount =
                                                                            (originalTotal *
                                                                                Number(
                                                                                    reservation.discountValue,
                                                                                )) /
                                                                            100;
                                                                        const finalAmount =
                                                                            originalTotal -
                                                                            discountAmount;
                                                                        return formatCurrency(
                                                                            finalAmount,
                                                                        );
                                                                    })()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                <div className="flex flex-col gap-2 mt-3">
                                                    <div className="flex gap-2">
                                                        <BrandButton
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 flex-1 text-xs py-1"
                                                            onClick={() => {
                                                                setShowApprovalInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [reservation.id]:
                                                                            !prev[
                                                                                reservation
                                                                                    .id
                                                                            ],
                                                                    }),
                                                                );
                                                                setShowRejectionInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [reservation.id]: false,
                                                                    }),
                                                                );
                                                            }}
                                                        >
                                                            Approve
                                                        </BrandButton>
                                                        <BrandButton
                                                            size="sm"
                                                            className="border-red-600 border bg-transparent text-red-600 hover:bg-red-50 flex-1 text-xs py-1"
                                                            onClick={() => {
                                                                setShowRejectionInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [reservation.id]:
                                                                            !prev[
                                                                                reservation
                                                                                    .id
                                                                            ],
                                                                    }),
                                                                );
                                                                setShowApprovalInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [reservation.id]: false,
                                                                    }),
                                                                );
                                                            }}
                                                        >
                                                            Reject
                                                        </BrandButton>
                                                    </div>

                                                    {showApprovalInput[
                                                        reservation.id
                                                    ] && (
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                value={
                                                                    approvalReasons[
                                                                        reservation
                                                                            .id
                                                                    ] || ''
                                                                }
                                                                onChange={(e) =>
                                                                    setApprovalReasons(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [reservation.id]:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                placeholder="Enter approval reason (optional)"
                                                                className="text-xs"
                                                                rows={2}
                                                            />
                                                            <div className="flex gap-2">
                                                                <BrandButton
                                                                    loading={
                                                                        isApproving[
                                                                            reservation
                                                                                .id
                                                                        ]
                                                                    }
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 flex-1 text-xs py-1"
                                                                    onClick={() =>
                                                                        handleApproval(
                                                                            reservation.id,
                                                                            'approve',
                                                                            undefined,
                                                                            approvalReasons[
                                                                                reservation
                                                                                    .id
                                                                            ],
                                                                        )
                                                                    }
                                                                >
                                                                    Confirm
                                                                    Approval
                                                                </BrandButton>
                                                                <BrandButton
                                                                    size="sm"
                                                                    className="border-gray-400 border bg-transparent text-gray-600 hover:bg-gray-50 flex-1 text-xs py-1"
                                                                    onClick={() =>
                                                                        setShowApprovalInput(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [reservation.id]: false,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    Cancel
                                                                </BrandButton>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {showRejectionInput[
                                                        reservation.id
                                                    ] && (
                                                        <div className="space-y-2">
                                                            <Textarea
                                                                value={
                                                                    rejectionReasons[
                                                                        reservation
                                                                            .id
                                                                    ] || ''
                                                                }
                                                                onChange={(e) =>
                                                                    setRejectionReasons(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [reservation.id]:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                placeholder="Enter rejection reason"
                                                                className="text-xs"
                                                                rows={2}
                                                            />
                                                            <div className="flex gap-2">
                                                                <BrandButton
                                                                    loading={
                                                                        isApproving[
                                                                            reservation
                                                                                .id
                                                                        ]
                                                                    }
                                                                    size="sm"
                                                                    disabled={
                                                                        !rejectionReasons[
                                                                            reservation
                                                                                .id
                                                                        ]?.trim()
                                                                    }
                                                                    className="bg-red-600 hover:bg-red-700 flex-1 text-xs py-1"
                                                                    onClick={() =>
                                                                        handleApproval(
                                                                            reservation.id,
                                                                            'reject',
                                                                            rejectionReasons[
                                                                                reservation
                                                                                    .id
                                                                            ],
                                                                        )
                                                                    }
                                                                >
                                                                    Confirm
                                                                    Rejection
                                                                </BrandButton>
                                                                <BrandButton
                                                                    size="sm"
                                                                    className="border-gray-400 border bg-transparent text-gray-600 hover:bg-gray-50 flex-1 text-xs py-1"
                                                                    onClick={() =>
                                                                        setShowRejectionInput(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [reservation.id]: false,
                                                                            }),
                                                                        )
                                                                    }
                                                                >
                                                                    Cancel
                                                                </BrandButton>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    )}

                    {/* Activity Notifications Section */}
                    {activities.length > 0 && (
                        <div>
                            {pendingApprovals.length > 0 && (
                                <div className="p-3 bg-blue-50 border-b">
                                    <h4 className="text-sm font-medium text-blue-800">
                                        Recent Activity ({activities.length})
                                    </h4>
                                </div>
                            )}
                            {activities.map((booking: any, index: number) => (
                                <div
                                    key={booking.id || index}
                                    className="p-4 hover:bg-gray-50 transition-colors bg-white border-b last:border-b-0"
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {getBookingIcon(
                                                booking?.action as ActionTypeEnum,
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <p className="text-sm font-medium">
                                                    {booking.guestName} -{' '}
                                                    {booking.action
                                                        ?.replace('_', ' ')
                                                        .toLowerCase()}
                                                </p>
                                                <span className="text-xs text-gray-500 flex items-center whitespace-nowrap ml-2">
                                                    <FaClock className="h-3 w-3 mr-1 inline" />
                                                    {booking.timestamp
                                                        ? new Date(
                                                              booking.timestamp,
                                                          ).toLocaleString()
                                                        : 'Unknown time'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                {booking?.adminName || 'System'}{' '}
                                                managed room{' '}
                                                {booking?.roomNumber || 'N/A'}
                                                {booking?.roomType
                                                    ? ` ${booking.roomType}`
                                                    : ''}
                                                .
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {totalNotifications === 0 && (
                        <div className="flex flex-col items-center justify-center h-24 p-4">
                            <FaBell className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">
                                No notifications
                            </p>
                        </div>
                    )}
                </div>

                {totalNotifications > 0 && (
                    <div className="p-2 border-t w-full">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                                // Navigate to approvals page or show all notifications
                                window.location.href = '/admin/approvals';
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
