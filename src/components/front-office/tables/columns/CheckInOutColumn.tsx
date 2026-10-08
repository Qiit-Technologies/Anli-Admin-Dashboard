'use client';
import DeleteModal from '@/app/dashboard/components/FrontOffice/dashboard/DeleteModal';
import { getGuestServices } from '@/app/actions/guest';
import { CustomSheet } from '@/components/common/CustomSheet';
import ExtendStayFlow from '@/components/front-office/common/Form/ExtendStay';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import {
    getStayShellCategory,
    stayShellAvatarClass,
} from '@/lib/front-office/stay-status';
import { cn, formatCurrency } from '@/lib/utils';
import { Reservation } from '@/types/reservation';
import { TUser } from '@/types/user';
import { Card, CardBody, CardHeader } from '@heroui/react';

import { GuestCheckoutBalanceModal } from '@/components/front-office/checkout/GuestCheckoutBalanceModal';
import { PaidThroughInternalAccount } from '@/components/front-office/common/PaidThroughInternalAccount';
import useCheckInOut from '@/hooks/frontoffice/useCheckInOut';
import useHotel from '@/hooks/useHotel';
import { printReservationConfirmation } from '@/lib/front-office/reservation-confirmation-actions';
import { ColumnDef } from '@tanstack/react-table';
import {
    BadgePercent,
    Ban,
    Calendar,
    Clock,
    ConciergeBell,
    Edit,
    Eye,
    Gift,
    LogOut,
    Printer,
    ShoppingBag,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LuHotel } from 'react-icons/lu';
import { mutate } from 'swr';
import { VoidReservationDialog } from '../../common/Form/VoidReservation';

export const CheckInOutFilters = [
    {
        id: 'status',
        label: 'Reservation Status',
        options: [
            { value: 'checkedIn', label: 'In-House' },
            { value: 'reserved', label: 'Reserved' },
            { value: 'void', label: 'Void' },
            { value: 'complimentary', label: 'Complimentary' },
            { value: 'discount', label: 'Discount' },
        ],
    },
    {
        id: 'needsApproval',
        label: 'Approval Status',
        options: [
            { value: 'pending', label: 'Pending Approval' },
            { value: 'approved', label: 'Approved' },
            { value: 'none', label: 'No Approval Needed' },
        ],
    },
];

const renderBgColor = (reservation: Reservation) =>
    stayShellAvatarClass[getStayShellCategory(reservation)];

const renderIcon = (reservation: Reservation) => {
    const cat = getStayShellCategory(reservation);
    switch (cat) {
        case 'void':
            return <Ban className="w-4 h-4" />;
        case 'complimentary':
            return <Gift className="w-4 h-4" />;
        case 'discount':
            return <BadgePercent className="w-4 h-4" />;
        case 'checkedOut':
            return <LogOut className="w-4 h-4" />;
        case 'dueOut':
            return <Clock className="w-4 h-4" />;
        case 'inHouse':
            return <LuHotel className="w-4 h-4" />;
        default:
            return <Calendar className="w-4 h-4" />;
    }
};

const CheckoutReservationDetailsSheet = ({
    reservation,
    user,
}: {
    reservation: Reservation;
    user: TUser | undefined;
    onCheckOut?: (reservation: Reservation) => void;
}) => {
    const [activityDetails, setActivityDetails] = useState<any[]>([]);
    const [activityLoading, setActivityLoading] = useState(false);
    const [reservationOpen, setReservationOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<
        number | null
    >(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [voidDialogOpen, setVoidDialogOpen] = useState(false);
    const [extendStayOpen, setExtendStayOpen] = useState(false);
    const {
        handleCheckout,
        isCheckingOut,
        balanceCheckoutGuest,
        clearBalanceCheckout,
        completeBalanceCheckout,
    } = useCheckInOut();
    const { organization } = useHotel();

    useEffect(() => {
        if (!reservation.hasRoomActivity) return;

        let active = true;
        setActivityLoading(true);
        getGuestServices(String(reservation.id))
            .then((result) => {
                if (active) setActivityDetails(result.data ?? []);
            })
            .finally(() => {
                if (active) setActivityLoading(false);
            });

        return () => {
            active = false;
        };
    }, [reservation.id, reservation.hasRoomActivity]);

    const handlePrint = () => {
        printReservationConfirmation(reservation, organization, user?.fullName);
    };

    const handleDeleteSuccess = () => {
        mutate('list-data', false);
    };

    const handleVoidClick = () => setVoidDialogOpen(true);

    const handleEdit = () => {
        setSelectedReservationId(reservation.id);
        setReservationOpen(true);
    };

    const handleExtendStay = () => setExtendStayOpen(true);

    const renderCheckOutButton = () => {
        if (reservation.isVoid) {
            return (
                <div className="text-center p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">
                        This reservation has been voided
                    </p>
                </div>
            );
        }

        if (reservation.isCheckedOut) {
            return (
                <div className="text-center p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                        Guest has been checked out
                    </p>
                </div>
            );
        }

        if (reservation.isCheckedIn && !reservation.isCheckedOut) {
            return (
                <PermissionGate
                    blockType="modal"
                    permissions={[PERMISSIONS.CHECK_OUT_GUEST]}
                    permissionType="all"
                >
                    <Button
                        size="lg"
                        className="w-full bg-danger hover:bg-danger text-white"
                        onClick={() => handleCheckout(reservation)}
                        disabled={isCheckingOut.has(reservation.id)}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isCheckingOut.has(reservation.id)
                            ? 'Checking Out...'
                            : 'Check Out Guest'}
                    </Button>
                </PermissionGate>
            );
        }

        return (
            <div className="text-center p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                    Guest needs to be checked in first
                </p>
            </div>
        );
    };

    const renderActionButtons = () => {
        if (reservation.isVoid) return null;

        return (
            <div className="grid grid-cols-2 gap-2 mt-4">
                <PermissionGate
                    permissions={[PERMISSIONS.CREATE_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEdit}
                        className="flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                </PermissionGate>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="flex items-center gap-2"
                >
                    <Printer className="w-4 h-4" />
                    Print
                </Button>

                <PermissionGate
                    permissions={[PERMISSIONS.EXTEND_GUEST_STAY]}
                    blockType="hide"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExtendStay}
                        className="flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        Extend Stay
                    </Button>
                </PermissionGate>

                <PermissionGate
                    permissions={[PERMISSIONS.VOID_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVoidClick}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                        <Ban className="w-4 h-4" />
                        Void
                    </Button>
                </PermissionGate>

                <PermissionGate
                    permissions={[PERMISSIONS.DELETE_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedReservationId(reservation.id);
                            setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>
                </PermissionGate>
            </div>
        );
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
                                    renderBgColor(reservation),
                                )}
                            >
                                {renderIcon(reservation)}
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
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                Reservation #{reservation.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(
                                    reservation.startDate,
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(
                                    reservation.endDate,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Room Details
                            </h4>
                            <p className="text-sm font-semibold">
                                Room {reservation.roomNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {reservation.roomType.name}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Guest Count
                            </h4>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                    {reservation.numberOfGuests}{' '}
                                    {reservation.numberOfGuests === 1
                                        ? 'Guest'
                                        : 'Guests'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {reservation.hasRoomActivity && (
                        <div className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                            <div className="flex items-center gap-2 text-amber-900">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Room activity recorded
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-amber-800">
                                {Number(reservation.orderCount) > 0 && (
                                    <span className="flex items-center gap-1">
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                        {reservation.orderCount} order
                                        {reservation.orderCount !== 1
                                            ? 's'
                                            : ''}
                                    </span>
                                )}
                                {Number(reservation.serviceCount) > 0 && (
                                    <span className="flex items-center gap-1">
                                        <ConciergeBell className="h-3.5 w-3.5" />
                                        {reservation.serviceCount} service
                                        {reservation.serviceCount !== 1
                                            ? 's'
                                            : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {reservation.hasRoomActivity && (
                        <div className="space-y-3 rounded-md border border-slate-200 p-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-900">
                                    Orders and hotel services
                                </h4>
                                {activityLoading && (
                                    <span className="text-xs text-muted-foreground">
                                        Loading...
                                    </span>
                                )}
                            </div>
                            {!activityLoading &&
                                activityDetails.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No activity details are available.
                                    </p>
                                )}
                            {!activityLoading && activityDetails.length > 0 && (
                                <div className="space-y-2">
                                    {activityDetails.map((activity) => (
                                        <div
                                            key={`${activity.type}-${activity.id}`}
                                            className="rounded border border-slate-100 bg-slate-50 px-2.5 py-2"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium capitalize">
                                                        {activity.type ===
                                                        'restaurant'
                                                            ? 'Restaurant order'
                                                            : activity.type}
                                                    </p>
                                                    {activity.orderItems
                                                        ?.length > 0 ? (
                                                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                                            {activity.orderItems.map(
                                                                (item: any) => (
                                                                    <li
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        {
                                                                            item.quantity
                                                                        }{' '}
                                                                        x{' '}
                                                                        {
                                                                            item.name
                                                                        }
                                                                        {item.notes
                                                                            ? ` (${item.notes})`
                                                                            : ''}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    ) : activity.notes &&
                                                      activity.notes !==
                                                          'N/A' ? (
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
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md">
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Total Amount
                            </h4>
                            {(() => {
                                // Calculate total cost
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
                                                  ? Number(reservation.totalDue)
                                                  : Math.max(
                                                        0,
                                                        reservation.outstanding ||
                                                            0,
                                                    )) || 0;

                                // Total should always show what the guest has actually used/spent (all services)
                                // This is the totalCost - the actual amount used in the hotel
                                const displayTotal = totalCost;

                                return (
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(displayTotal)}
                                    </p>
                                );
                            })()}
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Amount Paid
                            </h4>
                            <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(
                                    reservation.paidAmount !== undefined &&
                                        reservation.paidAmount !== null
                                        ? Number(reservation.paidAmount)
                                        : reservation.amountPaid || 0,
                                )}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Balance
                            </h4>
                            {(() => {
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
                                        className={cn(
                                            'text-sm font-semibold',
                                            balance < 0
                                                ? 'text-red-600'
                                                : balance > 0
                                                  ? 'text-green-600'
                                                  : 'text-gray-600',
                                        )}
                                    >
                                        {balance < 0
                                            ? `-${formatCurrency(Math.abs(balance))}`
                                            : balance > 0
                                              ? formatCurrency(balance)
                                              : formatCurrency(0)}
                                    </p>
                                );
                            })()}
                        </div>
                    </div>

                    <PaidThroughInternalAccount reservation={reservation} />

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Checkout Status
                        </h4>
                        {renderCheckOutButton()}
                    </div>

                    {renderActionButtons()}
                </CardBody>
            </Card>

            {selectedReservationId && (
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
            )}

            {showDeleteModal && selectedReservationId && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    reservationId={selectedReservationId}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            )}

            <VoidReservationDialog
                open={voidDialogOpen}
                onOpenChange={setVoidDialogOpen}
                reservation={reservation}
            />

            {extendStayOpen && (
                <ExtendStayFlow onClose={() => setExtendStayOpen(false)} />
            )}

            <GuestCheckoutBalanceModal
                guest={balanceCheckoutGuest}
                onClose={clearBalanceCheckout}
                onCheckout={completeBalanceCheckout}
            />
        </div>
    );
};

const ActionButtons = ({
    reservation,
    user,
}: {
    reservation: Reservation;
    user: TUser | undefined;
}) => {
    const {
        handleCheckout,
        balanceCheckoutGuest,
        clearBalanceCheckout,
        completeBalanceCheckout,
        EarlyCheckoutModal,
    } = useCheckInOut();
    return (
        <div className="flex items-center gap-2">
            <CustomSheet
                trigger={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={reservation.isVoid}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                }
                title={`Checkout Management - ${reservation.fullName}`}
                subTitle={`#${reservation.id} • Room ${reservation.roomNumber}`}
            >
                <CheckoutReservationDetailsSheet
                    reservation={reservation}
                    user={user}
                />
            </CustomSheet>

            {reservation.isCheckedIn &&
                !reservation.isCheckedOut &&
                !reservation.isVoid && (
                    <PermissionGate
                        blockType="hide"
                        permissions={[PERMISSIONS.CHECK_OUT_GUEST]}
                        permissionType="all"
                    >
                        <Button
                            size="sm"
                            className="bg-danger-500 hover:bg-danger-500 text-white p-2"
                            title="Check Out Guest"
                            onClick={() => handleCheckout(reservation)}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </PermissionGate>
                )}
            <GuestCheckoutBalanceModal
                guest={balanceCheckoutGuest}
                onClose={clearBalanceCheckout}
                onCheckout={completeBalanceCheckout}
            />
            <EarlyCheckoutModal />
        </div>
    );
};

export const createCheckInOutColumns = (
    user: TUser | undefined,
): ColumnDef<Reservation>[] => [
    {
        id: 'guest',
        header: () => (
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guest Information
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
        id: 'room',
        header: 'Room Details',
        cell: ({ row }) => {
            const reservation = row.original;
            return (
                <div className="text-sm">
                    <div className="font-medium">{reservation.roomNumber}</div>
                    <div className="text-xs text-muted-foreground">
                        {reservation.roomType?.name || 'Unknown'}
                    </div>
                    {reservation.hasRoomActivity && (
                        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {Number(reservation.orderCount) +
                                Number(reservation.serviceCount)}{' '}
                            activity item
                            {Number(reservation.orderCount) +
                                Number(reservation.serviceCount) !==
                            1
                                ? 's'
                                : ''}
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: 'guests',
        header: 'Guests',
        cell: ({ row }) => {
            const reservation = row.original;
            return (
                <div className="text-sm">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">
                            {reservation.numberOfGuests} guest
                            {reservation.numberOfGuests !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            );
        },
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
        id: 'financial',
        header: 'Financial',
        cell: ({ row }) => {
            const reservation = row.original;
            const total =
                reservation.totalCost !== undefined &&
                reservation.totalCost !== null &&
                Number(reservation.totalCost) > 0
                    ? Number(reservation.totalCost)
                    : (reservation.paidAmount || reservation.amountPaid || 0) +
                          (reservation.totalDue !== undefined &&
                          reservation.totalDue !== null
                              ? Number(reservation.totalDue)
                              : Math.max(0, reservation.outstanding || 0)) || 0;

            return (
                <div className="text-sm">
                    <div className="font-medium">{formatCurrency(total)}</div>
                    <div className="text-xs text-muted-foreground">
                        Paid:{' '}
                        {formatCurrency(
                            reservation.paidAmount !== undefined &&
                                reservation.paidAmount !== null
                                ? Number(reservation.paidAmount)
                                : reservation.amountPaid || 0,
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const reservation = row.original;
            const cat = getStayShellCategory(reservation);

            switch (cat) {
                case 'void':
                    return (
                        <div className="flex items-center gap-2 text-red-600">
                            <Ban className="w-4 h-4" />
                            <span className="text-sm font-medium">Void</span>
                        </div>
                    );
                case 'complimentary':
                    return (
                        <div className="flex items-center gap-2 text-yellow-600">
                            <Gift className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Complimentary
                            </span>
                        </div>
                    );
                case 'discount':
                    return (
                        <div className="flex items-center gap-2 text-blue-600">
                            <BadgePercent className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {reservation.discountType === 'PERCENTAGE'
                                    ? `${reservation.discountValue}% Off`
                                    : `${formatCurrency(
                                          reservation.discountValue || 0,
                                      )} Off`}
                            </span>
                        </div>
                    );
                case 'checkedOut':
                    return (
                        <div className="flex items-center gap-2 text-slate-600">
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Checked out
                            </span>
                        </div>
                    );
                case 'dueOut':
                    return (
                        <div className="flex items-center gap-2 text-[#6e0d1e]">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Due Out</span>
                        </div>
                    );
                case 'inHouse':
                    return (
                        <div className="flex items-center gap-2 text-green-600">
                            <LuHotel className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                In-House
                            </span>
                        </div>
                    );
                case 'reserved':
                default:
                    return (
                        <div className="flex items-center gap-2 text-red-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Reserved
                            </span>
                        </div>
                    );
            }
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="min-w-[120px]">
                <ActionButtons reservation={row.original} user={user} />
            </div>
        ),
    },
];
