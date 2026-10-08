'use client';
import { sendReservationConfirmationEmail } from '@/app/actions/guest';
import DeleteModal from '@/app/dashboard/components/FrontOffice/dashboard/DeleteModal';
import { CustomSheet } from '@/components/common/CustomSheet';
import Toast from '@/components/toast';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import { SendReservationConfirmationDialog } from '@/components/front-office/common/SendReservationConfirmationDialog';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GuestCheckoutBalanceModal } from '@/components/front-office/checkout/GuestCheckoutBalanceModal';
import useCheckInOut from '@/hooks/frontoffice/useCheckInOut';
import useHotel from '@/hooks/useHotel';
import { getNights } from '@/lib/helpers';
import {
    downloadReservationConfirmationPdf,
    printReservationConfirmation,
} from '@/lib/front-office/reservation-confirmation-actions';
import {
    getReservationRoomDisplayLabel,
    isReservationAssignedRoomDirty,
} from '@/lib/front-office/reservation-room-dirty';
import { cn, formatCurrency } from '@/lib/utils';
import { Reservation } from '@/types/reservation';
import { TUser } from '@/types/user';
import { Card, CardBody, CardHeader, Divider, Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    BadgePercent,
    Ban,
    Calendar,
    CircleHelp,
    Edit,
    Eye,
    FileDown,
    Gift,
    LogIn,
    LogOut,
    Mail,
    Printer,
    RefreshCw,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuHotel } from 'react-icons/lu';
import { mutate } from 'swr';
import { DirtyRoomCheckInAlert } from '../../common/DirtyRoomCheckInAlert';
import { VoidReservationDialog } from '../../common/Form/VoidReservation';
import ReservationDateModal from '../../stay-view/modals/reservation-date-modal';
import RoomTransferModal from '../../stay-view/modals/room-transfer-modal';

export const ReservationFilters = [
    {
        id: 'status',
        label: 'Reservation Status',
        options: [
            { value: 'checkedIn', label: 'Checked In' },
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

const renderBgColor = (reservation: Reservation) => {
    if (reservation.isVoid) return 'bg-red-500 hover:bg-red-600 text-white';
    if (reservation.isComplimentary)
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    if (reservation.discountType)
        return 'bg-orion-blue hover:bg-orion-blue text-white';
    if (reservation.isCheckedIn)
        return 'bg-green-500 hover:bg-green-600 text-white';
    return 'bg-hexbrand hover:bg-hexbrand text-white';
};

const renderIcon = (reservation: Reservation) => {
    if (reservation.isVoid) return <Ban className="w-5 h-5" />;
    if (reservation.isComplimentary) return <Gift className="w-5 h-5" />;
    if (reservation.discountType) return <BadgePercent className="w-5 h-5" />;
    return <LuHotel className="w-5 h-5" />;
};

const StaffReservationDetailsSheet = ({
    reservation,
    user,
}: {
    reservation: Reservation;
    user: TUser | undefined;
}) => {
    const {
        handleCheckIn,
        handleCheckout,
        balanceCheckoutGuest,
        clearBalanceCheckout,
        completeBalanceCheckout,
    } = useCheckInOut();
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    const [reservationOpen, setReservationOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<
        number | null
    >(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [voidDialogOpen, setVoidDialogOpen] = useState(false);
    const [roomTransferModalOpen, setRoomTransferModalOpen] = useState(false);
    const [reservationDateModalOpen, setReservationDateModalOpen] =
        useState(false);
    const [dirtyRoomCheckInOpen, setDirtyRoomCheckInOpen] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [sendConfirmOpen, setSendConfirmOpen] = useState(false);

    const guestEmailTrimmed = String(reservation.email ?? '').trim();

    const handlePrint = () => {
        printReservationConfirmation(reservation, organization, user?.fullName);
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

    const handleDeleteSuccess = () => {
        mutate('list-data', false);
    };

    const handleVoidClick = () => setVoidDialogOpen(true);

    const handleEdit = () => {
        setSelectedReservationId(reservation.id);
        setReservationOpen(true);
    };

    const renderCheckInOutButtons = () => {
        if (reservation.isVoid) {
            return (
                <div className="text-center p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">
                        This reservation has been voided
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
                        onClick={() => handleCheckout(reservation)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Check Out Guest
                    </Button>
                </PermissionGate>
            );
        }

        if (!reservation.isCheckedIn) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(reservation.startDate);
            startDate.setHours(0, 0, 0, 0);

            const isCheckInDisabled = startDate > today;
            const disabledTitle = isCheckInDisabled
                ? `Check-in is only allowed on or after ${new Date(reservation.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : '';

            return (
                <PermissionGate
                    permissions={[PERMISSIONS.CHECK_IN_GUEST]}
                    blockType="hide"
                >
                    <Button
                        size="lg"
                        onClick={() => {
                            if (isReservationAssignedRoomDirty(reservation)) {
                                setDirtyRoomCheckInOpen(true);
                                return;
                            }
                            handleCheckIn(reservation.id);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={isCheckInDisabled}
                        title={disabledTitle}
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Check In Guest
                    </Button>
                </PermissionGate>
            );
        }

        return (
            <div className="text-center p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                    Guest has completed their stay
                </p>
            </div>
        );
    };

    const renderActionButtons = () => {
        return (
            <div className="grid grid-cols-2 gap-2 mt-4">
                <PermissionGate
                    permissions={[PERMISSIONS.CREATE_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEdit}
                        className="flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                </PermissionGate>

                <PermissionGate
                    permissions={[PERMISSIONS.CREATE_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReservationDateModalOpen(true)}
                        className="flex items-center gap-2 text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                        disabled={reservation.isCheckedOut}
                    >
                        <Calendar className="w-4 h-4" />
                        Modify Dates
                    </Button>
                </PermissionGate>

                <div className="col-span-2 flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrint}
                        className="flex items-center gap-2"
                        disabled={!!reservation.isVoid}
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2"
                        disabled={!!reservation.isVoid || pdfLoading}
                    >
                        <FileDown className="w-4 h-4" />
                        {pdfLoading ? 'PDF…' : 'PDF'}
                    </Button>
                    {!reservation.isCheckedIn && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSendConfirmOpen(true)}
                            className="flex items-center gap-2"
                            disabled={
                                !!reservation.isVoid ||
                                !guestEmailTrimmed ||
                                emailLoading
                            }
                            title={
                                !guestEmailTrimmed
                                    ? 'Add a guest email on the reservation to send a confirmation'
                                    : undefined
                            }
                        >
                            <Mail className="w-4 h-4" />
                            Send confirmation
                        </Button>
                    )}
                </div>

                <PermissionGate
                    permissions={[PERMISSIONS.VOID_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleVoidClick}
                        className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                        disabled={reservation.isVoid}
                    >
                        <Ban className="w-4 h-4" />
                        Void
                    </Button>
                </PermissionGate>

                {reservation.isCheckedIn && !reservation.isCheckedOut && (
                    <>
                        <PermissionGate
                            permissions={[PERMISSIONS.CREATE_RESERVATION]}
                            blockType="hide"
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRoomTransferModalOpen(true)}
                                className="flex items-center gap-2 text-purple-600 border-purple-600 hover:bg-purple-50"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Transfer Room
                            </Button>
                        </PermissionGate>
                    </>
                )}

                <PermissionGate
                    permissions={[PERMISSIONS.DELETE_RESERVATION]}
                    blockType="hide"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setSelectedReservationId(reservation.id);
                            setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
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
                        <Badge variant="outline" className="text-xs">
                            #{reservation.id}
                        </Badge>
                    </div>
                </CardHeader>
                <Divider className="bg-gray-200" />
                <CardBody className="pt-4 space-y-4">
                    {/* Dates and Duration */}
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
                                {reservation?.room?.roomNumber ??
                                    (reservation as any)?.roomNumber ??
                                    'N/A'}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                ID Number
                            </h4>
                            <p className="font-medium text-sm">
                                {reservation?.IDNumber || '-'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                ID Image
                            </h4>
                            <div className="flex items-center gap-1">
                                {reservation?.IDImage ? (
                                    <img
                                        src={reservation?.IDImage}
                                        className="h-24 w-auto"
                                    />
                                ) : (
                                    '-'
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-md">
                        <div>
                            <h4 className="text-xs text-muted-foreground">
                                Total
                            </h4>
                            <p className="font-semibold">
                                {formatCurrency(
                                    (() => {
                                        if (
                                            reservation.isVoid ||
                                            reservation.isComplimentary
                                        ) {
                                            return 0;
                                        }
                                        // Calculate Total: (originalPrice * nights) + all additional charges
                                        const nights = Math.max(
                                            1,
                                            getNights(
                                                reservation.startDate,
                                                reservation.endDate,
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
                                            reservation.serviceChargeAmount ??
                                            0,
                                        );
                                        const tipAmount = Number(
                                            reservation.tipAmount ?? 0,
                                        );
                                        const totalCustomChargesAmount = Number(
                                            reservation.totalCustomChargesAmount ??
                                            0,
                                        );
                                        return Math.max(
                                            0,
                                            basePrice -
                                            discountAmount +
                                            vatAmount +
                                            serviceChargeAmount +
                                            tipAmount +
                                            totalCustomChargesAmount,
                                        );
                                    })(),
                                )}
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

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Guest Status
                        </h4>
                        {renderCheckInOutButtons()}
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

            <SendReservationConfirmationDialog
                open={sendConfirmOpen}
                onOpenChange={setSendConfirmOpen}
                guestEmail={guestEmailTrimmed}
                loading={emailLoading}
                onSend={executeSendReservationConfirmation}
            />

            <RoomTransferModal
                open={roomTransferModalOpen}
                onOpenChange={setRoomTransferModalOpen}
                guest={{
                    id: reservation.id,
                    fullName: reservation.fullName,
                    roomNumber:
                        reservation.roomNumber?.toString() ||
                        reservation.room?.roomNumber?.toString() ||
                        'N/A',
                    roomType: reservation.roomType,
                }}
                onTransferComplete={() => {
                    mutate('list-data', false);
                    setRoomTransferModalOpen(false);
                }}
            />

            <ReservationDateModal
                open={reservationDateModalOpen}
                onOpenChange={setReservationDateModalOpen}
                reservation={{
                    id: reservation.id,
                    fullName: reservation.fullName,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    startTime: reservation.startTime ?? '',
                    endTime: reservation.endTime ?? '',
                    isCheckedIn: reservation.isCheckedIn,
                }}
                onUpdateComplete={() => {
                    mutate('list-data', false);
                    setReservationDateModalOpen(false);
                }}
            />

            <DirtyRoomCheckInAlert
                open={dirtyRoomCheckInOpen}
                onOpenChange={setDirtyRoomCheckInOpen}
                roomLabel={getReservationRoomDisplayLabel(reservation)}
                onConfirm={() => handleCheckIn(reservation.id)}
            />

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
        handleCheckIn,
        handleCheckout,
        balanceCheckoutGuest,
        clearBalanceCheckout,
        completeBalanceCheckout,
        EarlyCheckoutModal,
    } = useCheckInOut();
    const [dirtyRoomCheckInOpen, setDirtyRoomCheckInOpen] = useState(false);

    const startDate = new Date(reservation.startDate);
    const today = new Date();
    const canCheckInToday =
        today.setHours(0, 0, 0, 0) >= startDate.setHours(0, 0, 0, 0);

    const onQuickCheckInOut = () => {
        if (reservation.isCheckedIn) {
            handleCheckout(reservation);
            return;
        }
        if (!canCheckInToday) return;
        if (isReservationAssignedRoomDirty(reservation)) {
            setDirtyRoomCheckInOpen(true);
            return;
        }
        handleCheckIn(reservation.id);
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <CustomSheet
                    trigger={
                        <Button
                            size="sm"
                            variant="outline"
                            className="p-2"
                            title="View details and manage guest"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    }
                    title={`Guest Management - ${reservation.fullName}`}
                    subTitle={`#${reservation.id} • Room ${reservation.roomNumber ?? reservation.room?.roomNumber ?? 'N/A'}`}
                >
                    <StaffReservationDetailsSheet
                        reservation={reservation}
                        user={user}
                    />
                </CustomSheet>

                {!reservation.isVoid && (
                    <Button
                        size="sm"
                        className={cn(
                            'p-2',
                            reservation.isCheckedIn
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-green-600 hover:bg-green-700',
                        )}
                        disabled={!reservation.isCheckedIn && !canCheckInToday}
                        title={
                            reservation.isCheckedIn
                                ? 'Check out guest'
                                : canCheckInToday
                                    ? 'Check in guest'
                                    : 'Check-in is available on or after the start date'
                        }
                        onClick={onQuickCheckInOut}
                    >
                        {reservation.isCheckedIn ? (
                            <LogOut className="w-4 h-4" />
                        ) : (
                            <LogIn className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>
            <DirtyRoomCheckInAlert
                open={dirtyRoomCheckInOpen}
                onOpenChange={setDirtyRoomCheckInOpen}
                roomLabel={getReservationRoomDisplayLabel(reservation)}
                onConfirm={() => handleCheckIn(reservation.id)}
            />

            <GuestCheckoutBalanceModal
                guest={balanceCheckoutGuest}
                onClose={clearBalanceCheckout}
                onCheckout={completeBalanceCheckout}
            />
            <EarlyCheckoutModal />
        </>
    );
};

export const useReservationColumns = (
    user: TUser | undefined,
): ColumnDef<Reservation>[] => {
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    return [
        {
            accessorKey: 'fullName',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Guest's full name and reservation type"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Guest Name <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'w-8 h-8 rounded-sm text-white flex items-center justify-center flex-shrink-0',
                            renderBgColor(row.original),
                        )}
                    >
                        {renderIcon(row.original)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {row.original.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                            #{row.original.id}
                            {row.original.groupReservationId
                                ? ` · ${row.original.groupReservationCode || 'Group'}`
                                : ''}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Contact',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.phoneNumber}</span>
                    {row.original.email && (
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {row.original.email}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'dates',
            header: 'Stay Period',
            cell: ({ row }) => {
                const checkIn = new Date(row.original.startDate);
                const checkOut = new Date(row.original.endDate);
                const nights = Math.ceil(
                    (checkOut.getTime() - checkIn.getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                return (
                    <div className="flex flex-col">
                        <div className="text-sm">
                            {checkIn.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}{' '}
                            -{' '}
                            {checkOut.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}
                        </div>
                        <span className="text-xs text-gray-500">
                            {nights} night{nights !== 1 ? 's' : ''}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'room',
            header: 'Room Details',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        Room{' '}
                        {row.original.room?.roomNumber ??
                            (row.original as any).roomNumber ??
                            'N/A'}
                        {showRoman &&
                            row.original.room?.roomNumberRoman &&
                            ` (${row.original.room.roomNumberRoman})`}
                    </span>
                    <span className="text-xs text-gray-500">
                        {row.original.roomType?.name}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'numberOfGuests',
            header: 'Guests',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{row.original.numberOfGuests}</span>
                </div>
            ),
        },
        {
            accessorKey: 'financial',
            header: 'Financial',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="text-sm">
                        <span className="text-gray-600">Paid: </span>
                        <span className="font-medium text-green-600">
                            {formatCurrency(row.original.amountPaid)}
                        </span>
                    </div>
                    <div className="text-sm">
                        <span className="text-gray-600">Balance: </span>
                        {(() => {
                            // Check for payable balance first (credit/overpayment)
                            const payableBalance =
                                row.original.payableBalance !== undefined &&
                                    row.original.payableBalance !== null
                                    ? Math.max(
                                        0,
                                        Number(row.original.payableBalance),
                                    )
                                    : 0;

                            // Only check receivable if no payable exists
                            const receivableBalance =
                                payableBalance > 0
                                    ? 0
                                    : Number(row.original.outstanding || 0);

                            const balanceType =
                                payableBalance > 0
                                    ? 'payable'
                                    : receivableBalance > 0
                                        ? 'receivable'
                                        : 'zero';

                            const displayBalance =
                                balanceType === 'payable'
                                    ? payableBalance
                                    : balanceType === 'receivable'
                                        ? receivableBalance
                                        : 0;

                            return (
                                <span
                                    className={cn(
                                        'font-medium',
                                        balanceType === 'receivable'
                                            ? 'text-red-500'
                                            : balanceType === 'payable'
                                                ? 'text-green-500'
                                                : 'text-green-500',
                                    )}
                                >
                                    {balanceType === 'receivable'
                                        ? `-${formatCurrency(displayBalance)}`
                                        : formatCurrency(displayBalance)}
                                </span>
                            );
                        })()}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Type',
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
                                    ? `${reservation.discountValue}% Off`
                                    : `${formatCurrency(reservation.discountValue || 0)} Off`}
                            </span>
                        </div>
                    );
                }

                if (reservation.isCheckedIn) {
                    return (
                        <div className="flex items-center gap-2 text-green-600">
                            <LuHotel className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Checked In
                            </span>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-sm">Reserved</span>
                    </div>
                );
            },
        },
        {
            id: 'approval',
            header: 'Approval Status',
            cell: ({ row }) => {
                const reservation = row.original;

                if (!reservation.needsApproval && !reservation.isRejected) {
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

                if (
                    reservation.isApproved === false &&
                    !reservation.isRejected
                ) {
                    return (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Pending Approval
                        </div>
                    );
                }

                if (reservation.isRejected) {
                    return (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Rejected
                        </div>
                    );
                }

                const approvalStatusMap = {
                    VOID: {
                        text: 'Void Pending',
                        icon: <Ban className="w-3 h-3" />,
                        textColor: 'text-red-500',
                    },
                    COMPLIMENTARY: {
                        text: 'Comp Pending',
                        icon: <Gift className="w-3 h-3" />,
                        textColor: 'text-yellow-600',
                    },
                    DISCOUNT: {
                        text: 'Discount Pending',
                        icon: <BadgePercent className="w-3 h-3" />,
                        textColor: 'text-blue-600',
                    },
                };

                const config =
                    approvalStatusMap[
                    reservation.approvalType as keyof typeof approvalStatusMap
                    ];

                if (config) {
                    return (
                        <div
                            className={`${config.textColor} flex text-xs items-center gap-1`}
                        >
                            {config.icon} {config.text}
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-1 text-orange-600 text-xs">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        Pending
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                if (row.original.isRejected) {
                    return (
                        <div className="flex justify-between items-center w-fit bg-red-100 text-red-600 px-2 py-1 rounded-md">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                Rejected
                            </div>
                        </div>
                    );
                }
                return <ActionButtons reservation={row.original} user={user} />;
            },
        },
    ];
};
