'use client';
import { generatePrintableNightAudits } from '@/app/actions/guest';
import {
    getAvailableRoomsByHotelId,
    getOneCheckInByHotelId,
    getOneCheckOutByHotelId,
} from '@/app/actions/metrics';
import { toggleRoomStatus } from '@/app/actions/room';
import { CustomSheet } from '@/components/common/CustomSheet';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import AdrTodayWidget from '@/components/front-office/adr-report/AdrTodayWidget';
import ActivityStream from '@/components/front-office/ActivityStreams';
import { FOStatCard } from '@/components/front-office/common/Card/StatsCard';
import CheckInFlow from '@/components/front-office/common/Form/CheckIn';
import CheckOutGuestFlow from '@/components/front-office/common/Form/CheckoutGuest';
import { MultiStepForm } from '@/components/front-office/common/Form/MultiStepFrom';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import TransferRoomSelector from '@/components/front-office/common/Form/TransferRoomSelector';
import ShareBookingModal from '@/components/front-office/common/ShareBookingModal';
import {
    GuestRegistrationPreviewModal,
} from '@/components/front-office/guest-registration/GuestRegistrationPreviewModal';
import DashboardSkeleton from '@/components/front-office/dashboard/DashboardSkeleton';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import { useRooms } from '@/hooks/useRooms';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
    CalendarClock,
    CalendarMinus2,
    Loader2,
    LogIn,
    Move,
    Share2,
    Clock,
    XCircle,
    FileText,
    Printer,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineAudit } from 'react-icons/ai';
import useSWR, { mutate } from 'swr';
import {
    differenceInMinutes,
    differenceInHours,
    differenceInDays,
    differenceInSeconds,
} from 'date-fns';

const MaintenanceCountdown = ({
    expectedResolutionAt,
}: {
    expectedResolutionAt: string;
}) => {
    const [timeLeft, setTimeLeft] = useState('');

    React.useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const end = new Date(expectedResolutionAt);

            if (now >= end) {
                setTimeLeft('Due now');
                return;
            }

            const totalSeconds = differenceInSeconds(end, now);
            const days = Math.floor(totalSeconds / (24 * 3600));
            const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            let display = '';
            if (days > 0) display += `${days}d `;
            if (hours > 0) display += `${hours}h `;
            if (minutes > 0 || hours > 0 || days > 0) display += `${minutes}m `;
            display += `${seconds}s`;

            setTimeLeft(display);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000); // Update every second
        return () => clearInterval(interval);
    }, [expectedResolutionAt]);

    return (
        <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3 h-3 text-yellow-600" />
            <span className="text-[10px] font-medium text-yellow-700 bg-yellow-100 px-1 py-0.5 rounded-full font-mono whitespace-nowrap">
                {timeLeft}
            </span>
        </div>
    );
};

const cardStyles = [
    {
        icon: CalendarClock,
        title: 'New Reservations',
        cardColor: 'bg-red-50',
        iconBgColor: 'bg-red-100',
        iconClassname: 'text-red-600',
        textColor: 'text-red-900',
    },
    {
        icon: LogIn,
        title: 'Check In',
        cardColor: 'bg-gray-100',
        iconBgColor: 'bg-gray-200',
        iconClassname: 'text-black',
        textColor: 'text-black-900',
    },
    {
        icon: Move,
        title: 'Transfer Room',
        cardColor: 'bg-orion-blue/10',
        iconBgColor: 'bg-orion-blue/10',
        iconClassname: 'text-orion-blue',
        textColor: 'text-orion-blue',
    },
    {
        icon: CalendarMinus2,
        title: 'Check Out',
        cardColor: 'bg-[#BACFCE]',
        iconBgColor: 'bg-[#E3F6F5]',
        iconClassname: 'text-[#1D6360]',
        textColor: 'text-[#1D6360]',
    },
    {
        icon: XCircle,
        title: 'Cancel Reservation',
        cardColor: 'bg-[#FCE7BA]',
        iconBgColor: 'bg-[#FFF9E5]',
        iconClassname: 'text-[#945312]',
    },
    //     iconBgColor: 'bg-[#FFF9E5]',
    //     iconClassname: 'text-[#945312]',
    //     textColor: 'text-[#945312]',
    // },
];

export interface QuickActionLinkCardsProps {
    icon: React.ElementType;
    title: string;
    cardColor?: string;
    iconBgColor?: string;
    iconClassname?: string;
    textColor?: string;
    onClick?: () => void;
}

const ActionButton = ({
    icon,
    title,
    cardColor,
    iconClassname,
    textColor,
    iconBgColor,
    onClick,
}: QuickActionLinkCardsProps) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className={cn(
                cardColor ?? 'bg-white',
                'border group hover:border-brand w-full rounded-lg p-4 flex items-center gap-3 justify-start',
            )}
        >
            <div
                className={cn(iconBgColor ?? 'bg-brand/20', 'rounded-full p-3')}
            >
                {React.createElement(icon, {
                    className: cn(iconClassname ?? 'text-brand', 'w-4 h-4'),
                })}
            </div>
            <div>
                <h3
                    className={cn(
                        textColor ?? 'text-gray-800',
                        'text-base font-semibold capitalize',
                    )}
                >
                    {title}
                </h3>
            </div>
        </button>
    );
};

const Dashboard = () => {
    const { user } = useUser();
    const [reservationOpen, setReservationOpen] = useState(false);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [transferRoomOpen, setTransferRoomOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [guestRegOpen, setGuestRegOpen] = useState(false);
    const router = useRouter();
    // const [cancelReservationOpen, setCancelReservationOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { rooms = [] } = useRooms() || {};
    const { organization } = useHotel();

    // SWR for dashboard stats with caching
    const {
        data: statsData,
        error,
        isLoading: loading,
    } = useSWR(
        'dashboard-stats',
        async () => {
            try {
                const [checkInsResponse, checkOutsResponse, availableResponse] =
                    await Promise.all([
                        getOneCheckInByHotelId(),
                        getOneCheckOutByHotelId(),
                        getAvailableRoomsByHotelId(),
                    ]);

                return {
                    checkIns: Number(
                        checkInsResponse?.data?.charts?.checkedin ?? 0,
                    ),
                    checkOuts: Number(
                        checkOutsResponse?.data?.charts?.checkedout ?? 0,
                    ),
                    available: Number(
                        availableResponse?.data?.charts?.available ?? 0,
                    ),
                };
            } catch {
                return { checkIns: 0, checkOuts: 0, available: 0 };
            }
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        },
    );

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="p-4 flex justify-center items-center min-h-screen text-red-500">
                {error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred. Please try again.'}
            </div>
        );
    }

    const handleStatusToggle = async (
        e: React.MouseEvent<HTMLButtonElement>,
        id: number,
        status: string,
    ): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setIsUpdating(true);
            const response = await toggleRoomStatus(id, status);

            setIsUpdating(false);

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.error}
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Room status updated successfully`}
                        type="success"
                    />
                ));
                // Mutate to refresh room data without page refresh
                mutate('/hotelRooms');
            }
        } catch (error: any) {
            setIsUpdating(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        error instanceof Error
                            ? error.message
                            : 'An error occurred'
                    }
                    type="error"
                />
            ));
        }
    };

    const handlePrintNightAudits = async () => {
        setIsPrinting(true);

        const win = window.open('', '_blank');
        if (!win) {
            setIsPrinting(false);
            return;
        }

        try {
            const result = await generatePrintableNightAudits();
            if ('error' in result) {
                console.error(result.error);
                win.document.write(
                    `<p style="color: red;">${result.error}</p>`,
                );
                win.document.close();
                win.focus();
                return;
            }

            win.document.write(result.data);
            win.document.close();
            win.focus();
            win.print();
        } catch (error: any) {
            console.error('Unexpected print error:', error);
            win.document.write(
                '<p style="color: red;">Something went wrong while printing.</p>',
            );
            win.document.close();
            win.focus();
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Dashboard"
                    subtitle={`Welcome, ${user?.fullName || 'User'}`}
                />
                <div className="ml-auto flex items-center gap-2 shrink-0">
                    <PermissionGate
                        permissions={[PERMISSIONS.PRINT_NIGHT_AUDIT]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Button
                            onClick={handlePrintNightAudits}
                            disabled={isPrinting}
                            className="print:hidden flex items-center gap-2 px-4 py-2 bg-hexbrand text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 h-10"
                        >
                            <AiOutlineAudit className="text-white" />
                            Print Night Audit
                        </Button>
                    </PermissionGate>
                    <PermissionGate
                        permissions={[PERMISSIONS.CREATE_RESERVATION]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Button
                            onClick={() => setShareModalOpen(true)}
                            variant="outline"
                            className="flex items-center gap-2 px-4 py-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-10"
                        >
                            <Share2 className="w-4 h-4 text-orion-blue" />
                            Customer Booking Link
                        </Button>
                    </PermissionGate>
                    <NotificationsPopover />
                </div>
            </PageHeader>
            <PageWrapper>
                <div>
                    <h1>Quick Links</h1>
                    <div className="w-full mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <PermissionGate
                            permissions={[PERMISSIONS.CREATE_RESERVATION]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <StepperDialog
                                open={reservationOpen}
                                onOpenChange={setReservationOpen}
                                trigger={
                                    <ActionButton
                                        onClick={() => setReservationOpen(true)}
                                        {...cardStyles[0]}
                                    />
                                }
                                title="Reservation"
                                content={
                                    <MultiStepForm
                                        onClose={() =>
                                            setReservationOpen(false)
                                        }
                                        onGroupCreated={(groupCode) => {
                                            setReservationOpen(false);
                                            const params = new URLSearchParams({
                                                kind: 'group',
                                            });
                                            if (groupCode) {
                                                params.set('recordId', groupCode);
                                            }
                                            router.push(
                                                `/front-office/reservations?${params.toString()}`,
                                            );
                                        }}
                                    />
                                }
                            />
                        </PermissionGate>

                        <PermissionGate
                            permissions={[
                                PERMISSIONS.CHECK_IN_GUEST,
                                PERMISSIONS.CREATE_RESERVATION,
                            ]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <CustomSheet
                                noTitle
                                title="Check In"
                                open={checkInOpen}
                                setOpen={setCheckInOpen}
                                trigger={<ActionButton {...cardStyles[1]} />}
                            >
                                <CheckInFlow
                                    onClose={() => setCheckInOpen(false)}
                                />
                            </CustomSheet>
                        </PermissionGate>

                        <PermissionGate
                            permissions={[PERMISSIONS.CREATE_RESERVATION]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <CustomSheet
                                noTitle
                                title="Transfer Room"
                                open={transferRoomOpen}
                                setOpen={setTransferRoomOpen}
                                trigger={<ActionButton {...cardStyles[2]} />}
                            >
                                <TransferRoomSelector
                                    onClose={() => setTransferRoomOpen(false)}
                                />
                            </CustomSheet>
                        </PermissionGate>

                        <PermissionGate
                            permissions={[PERMISSIONS.CREATE_RESERVATION]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <CustomSheet
                                noTitle
                                title="CheckOut Guest"
                                open={checkOutOpen}
                                setOpen={setCheckOutOpen}
                                trigger={<ActionButton {...cardStyles[3]} />}
                            >
                                <CheckOutGuestFlow
                                    open={checkOutOpen}
                                    onClose={() => setCheckOutOpen(false)}
                                />
                            </CustomSheet>
                        </PermissionGate>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h1>Guest Registration</h1>
                            <PermissionGate
                                permissions={[PERMISSIONS.CREATE_RESERVATION]}
                                permissionType="any"
                                blockType="modal"
                            >
                                <div className="w-full mt-3">
                                    <ActionButton
                                        icon={FileText}
                                        title="Guest Registration Form"
                                        onClick={() => setGuestRegOpen(true)}
                                    />
                                </div>
                            </PermissionGate>
                        </div>
                        <div>
                            <h1>Invoice</h1>
                            <PermissionGate
                                permissions={[PERMISSIONS.CREATE_RESERVATION]}
                                permissionType="any"
                                blockType="modal"
                            >
                                <div className="w-full mt-3">
                                    <ActionButton
                                        icon={Printer}
                                        title="Generate Invoice"
                                        onClick={() =>
                                            router.push(
                                                '/front-office/account-section/draft-invoices/new',
                                            )
                                        }
                                    />
                                </div>
                            </PermissionGate>
                        </div>
                    </div>
                </div>
                <ShareBookingModal
                    open={shareModalOpen}
                    onOpenChange={setShareModalOpen}
                    hotelName={user?.hotel?.name || ''}
                    hotelId={user?.hotel?.id || ''}
                />
                <GuestRegistrationPreviewModal
                    open={guestRegOpen}
                    onOpenChange={setGuestRegOpen}
                />
                <div className="w-full my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <FOStatCard
                        title="Total Number of Check-Ins"
                        currentValue={statsData?.checkIns ?? 0}
                        percentageChange={-20}
                        previousValue={20}
                    />
                    <FOStatCard
                        title="Total Number of Check-Outs"
                        currentValue={statsData?.checkOuts ?? 0}
                        percentageChange={-20}
                        previousValue={20}
                    />
                    <FOStatCard
                        title="Number of Available Rooms"
                        currentValue={statsData?.available ?? 0}
                        percentageChange={-20}
                        previousValue={20}
                    />
                    <AdrTodayWidget />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-4">
                    <ActivityStream />
                    <div className="bg-gray-200 p-4 rounded-lg">
                        <h1 className="font-semibold text-lg">Room Status</h1>

                        <div className="w-full mt-3">
                            {/* Headers */}
                            <div className="p-4 bg-white rounded-xl grid grid-cols-3 gap-4 font-medium">
                                <div className="whitespace-nowrap">
                                    Room Type
                                </div>
                                <div className="whitespace-nowrap">
                                    Room Status
                                </div>
                                <div className="whitespace-nowrap">Action</div>
                            </div>

                            <ScrollArea className="max-h-52 mt-2 overflow-y-auto hide-scrollbar">
                                {rooms && rooms.length > 0 ? (
                                    rooms.map((room) => {
                                        let statusColor = '';
                                        let statusText = '';

                                        // Determine room status based on both status and occupancy
                                        if (room.status === 'BOOKED') {
                                            statusColor =
                                                'bg-orange-400 text-orange-400';
                                            statusText = 'Reserved (RS)';
                                        } else if (
                                            room.status === 'AVAIL' &&
                                            !room.isOccupied
                                        ) {
                                            statusColor =
                                                'bg-green-600 text-green-600';
                                            statusText = 'Vacant Clean (VC)';
                                        } else if (
                                            room.status === 'DIRTY' &&
                                            !room.isOccupied
                                        ) {
                                            statusColor =
                                                'bg-red-600 text-red-600';
                                            statusText = 'Vacant Dirty (VD)';
                                        } else if (
                                            room.isOccupied &&
                                            room.status === 'AVAIL'
                                        ) {
                                            statusColor =
                                                'bg-orion-blue text-orion-blue';
                                            statusText = 'Occupied Clean (OC)';
                                        } else if (
                                            room.isOccupied &&
                                            room.status === 'DIRTY'
                                        ) {
                                            statusColor =
                                                'bg-red-500 text-red-500';
                                            statusText = 'Occupied Dirty (OD)';
                                        } else if (
                                            room.status === 'MAINTENANCE'
                                        ) {
                                            statusColor =
                                                'bg-yellow-600 text-yellow-600';
                                            statusText = 'Under Maintenance (UM)';
                                        } else if (
                                            room.status === 'IN_REVIEW'
                                        ) {
                                            statusColor =
                                                'bg-yellow-600 text-yellow-600';
                                            statusText = 'In Review';
                                        } else {
                                            statusColor =
                                                'bg-gray-600 text-gray-600';
                                            statusText = 'Unknown';
                                        }

                                        return (
                                            <div
                                                key={
                                                    room.id ||
                                                    `room-${Math.random()}`
                                                }
                                                className="p-4 grid grid-cols-3 gap-4 items-center border-b border-gray-300"
                                            >
                                                {/* Room Type */}
                                                <div className="">
                                                    {room?.roomtype?.name ||
                                                        'Unknown'}{' '}
                                                    {room?.roomNumber ?? 'N/A'}
                                                    {organization?.id ===
                                                        10 &&
                                                        room?.roomNumberRoman &&
                                                        ` (${room.roomNumberRoman})`}
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${
                                                                statusColor.split(
                                                                    ' ',
                                                                )[0]
                                                            }`}
                                                        />
                                                        <span
                                                            className={`text-xs ${statusColor.split(' ')[1]} whitespace-nowrap`}
                                                        >
                                                            {statusText}
                                                        </span>
                                                    </div>
                                                    {room.status ===
                                                        'MAINTENANCE' &&
                                                        room.maintenanceHistory &&
                                                        room.maintenanceHistory
                                                            .length > 0 &&
                                                        room
                                                            .maintenanceHistory[0]
                                                            .expectedResolutionAt && (
                                                            <MaintenanceCountdown
                                                                expectedResolutionAt={
                                                                    room
                                                                        .maintenanceHistory[0]
                                                                        .expectedResolutionAt
                                                                }
                                                            />
                                                        )}
                                                </div>

                                                {/* Check if this hotel is the special hotel (ID 10)Westbury */}
                                                {organization?.id ===
                                                10 ? (
                                                    <>
                                                        {/* Show Review button for Vacant Dirty (VD) rooms */}
                                                        {room.status ===
                                                            'DIRTY' &&
                                                            !room.isOccupied && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        handleStatusToggle(
                                                                            e,
                                                                            room.id,
                                                                            'IN_REVIEW',
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isUpdating
                                                                    }
                                                                    className="text-white flex items-center justify-center gap-1 bg-orion-blue px-3 py-1 rounded-md disabled:opacity-40 disabled:bg-gray-300 w-[100px]"
                                                                >
                                                                    {isUpdating ? (
                                                                        <div className="flex items-center gap-2 justify-center">
                                                                            <Loader2 className="animate-spin w-4 h-4" />
                                                                            <span>
                                                                                Review...
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span>
                                                                            Review
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            )}

                                                        {/* Show Clean button for IN_REVIEW rooms */}
                                                        {room.status ===
                                                            'IN_REVIEW' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    handleStatusToggle(
                                                                        e,
                                                                        room.id,
                                                                        'AVAIL',
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                                className="text-white flex items-center justify-center gap-1 bg-orange-400 px-3 py-1 rounded-md disabled:opacity-40 disabled:bg-gray-300 w-[100px]"
                                                            >
                                                                {isUpdating ? (
                                                                    <div className="flex items-center gap-2 justify-center">
                                                                        <Loader2 className="animate-spin w-4 h-4" />
                                                                        <span>
                                                                            Cleaning...
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span>
                                                                        Clean
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    /* Default case for other hotels: switch directly from Vacant Dirty (VD) to Vacant Clean (VC) */
                                                    room.status === 'DIRTY' &&
                                                    !room.isOccupied && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) =>
                                                                handleStatusToggle(
                                                                    e,
                                                                    room.id,
                                                                    'AVAIL',
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            className="text-white flex items-center justify-center gap-1 bg-orion-blue px-3 py-1 rounded-md disabled:opacity-40 disabled:bg-gray-300 w-[100px]"
                                                        >
                                                            {isUpdating ? (
                                                                <div className="flex items-center gap-2 justify-center">
                                                                    <Loader2 className="animate-spin w-4 h-4" />
                                                                    <span>
                                                                        Updating...
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span>
                                                                    Clean
                                                                </span>
                                                            )}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No rooms available
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default Dashboard;
