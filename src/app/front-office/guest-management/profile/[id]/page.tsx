'use client';
import {
    createGuestServices,
    getGuestBillAudit,
    getGuestHistoryById,
    getGuestInfoById,
    getGuestServices,
    upgradeGuestRoom,
    applyWaiver,
} from '@/app/actions/guest';
import { InputField, SelectField } from '@/components/common/Form';
import { CustomSheet } from '@/components/common/CustomSheet';
import { PageHeader } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import ExtendStayFlow from '@/components/front-office/common/Form/ExtendStay';
import GuestServiceForm, {
    ServiceLogs,
} from '@/components/front-office/common/Form/GuestServiceForm';
import MakePaymentForm from '@/components/front-office/common/Form/MakePayment';
import TransferRoomFlow from '@/components/front-office/common/Form/TransferRoom';
import WakeUpCall from '@/components/front-office/common/Form/WakeUpCall';
import {
    GuestHistoryFilters,
    useGuestHistoryColumns,
} from '@/components/front-office/tables/columns/GuestHistory';
import { Guest } from '@/components/front-office/tables/columns/GuestManagment';
import {
    GuestServiceColumn,
    GuestServiceFilters,
} from '@/components/front-office/tables/columns/GuestService';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChargeSwitch } from '@/components/front-office/common/ChargeSwitch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/auth/usePermission';
import useHotel from '@/hooks/useHotel';
import { useRooms } from '@/hooks/useRooms';
import useRoomTypes from '@/hooks/useRoomTypes';
import { cn, formatCurrency } from '@/lib/utils';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import Image from 'next/image';

import { printGuestPaymentInfo } from '@/components/front-office/tables/columns/printGuestInfo';
import { Printer, LoaderCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

type RoomFolioOrder = NonNullable<Guest['roomServiceOrders']>[number];
type RoomFolioLineItem = RoomFolioOrder['items'][number];

const tabs: { label: string; value: string }[] = [
    {
        label: 'Guest Info',
        value: 'guest-info',
    },
    {
        label: 'Room Services',
        value: 'room-services',
    },
    {
        label: 'Guest History',
        value: 'guest-history',
    },
    // {
    //     label: 'Bill Audit',
    //     value: 'bill-audit',
    // },
];
type PaymentInfoRow = { label: string; value: ReactNode };

function coerceGuestDate(value: unknown): Date | null {
    if (value == null) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function buildGuestProfileRebateRows(
    guestData: Record<string, unknown> | null | undefined,
): PaymentInfoRow[] {
    if (!guestData) return [];
    const raw = guestData.rebateRate;
    if (raw === null || raw === undefined || raw === '') return [];
    const rebated = Number(raw);
    if (!Number.isFinite(rebated)) return [];

    const room = guestData.room as { price?: number | string } | undefined;
    const original = Number(
        (guestData.originalPrice as number | undefined) ??
            Number(room?.price ?? 0),
    );
    const savings = Math.max(0, original - rebated);

    const eff = coerceGuestDate(guestData.rebateEffectiveDate);
    const effStr = eff
        ? eff.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : '—';

    const applied = coerceGuestDate(guestData.rebateAppliedAt);
    const appliedStr = applied
        ? applied.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '—';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isScheduled =
        eff &&
        new Date(eff.getFullYear(), eff.getMonth(), eff.getDate()).getTime() >
            today.getTime();
    const statusLabel = isScheduled ? 'Scheduled' : 'Active';

    const commentRow: PaymentInfoRow | null = guestData.rebateComment
        ? {
              label: 'Rebate note',
              value: (
                  <span className="text-sm text-right max-w-md ml-auto block">
                      {typeof guestData.rebateComment === 'string'
                          ? guestData.rebateComment
                          : String(guestData.rebateComment)}
                  </span>
              ),
          }
        : null;

    return [
        {
            label: 'Room rebate',
            value: (
                <span className="inline-flex items-center justify-end gap-2 flex-wrap">
                    <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-950"
                    >
                        Rebated
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {statusLabel}
                    </span>
                </span>
            ),
        },
        {
            label: 'Original nightly rate',
            value: formatCurrency(original),
        },
        {
            label: 'Rebated nightly rate',
            value: formatCurrency(rebated),
        },
        {
            label: 'Rebate (per night vs published)',
            value: formatCurrency(savings),
        },
        {
            label: 'Rebate effective from',
            value: effStr,
        },
        ...(commentRow ? [commentRow] : []),
        {
            label: 'Rebate recorded',
            value: appliedStr,
        },
    ];
}

const statusStyles = {
    checkedIn: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    reserved: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    checkedOut: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

const StatusBadges = ({ isCheckedIn }: { isCheckedIn: boolean }) => {
    const status = isCheckedIn ? 'checkedIn' : 'reserved';
    return (
        <div
            className={cn(
                statusStyles[status]?.bg || 'bg-gray-100',
                'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
            )}
        >
            <div
                className={cn(
                    statusStyles[status]?.dot || 'bg-gray-500',
                    'w-2 h-2 rounded-full',
                )}
            />
            <span
                className={cn(
                    statusStyles[status]?.text || 'text-gray-600',
                    'text-xs caption-top',
                )}
            >
                {status === 'checkedIn' ? 'In-House' : 'Reserved'}
            </span>
        </div>
    );
};

const UserCard = ({ guestData }: { guestData: Guest }) => {
    const [transferRoomOpen, setTransferRoomOpen] = useState(false);
    const [wakeUpCallOpen, setWakeUpCallOpen] = useState(false);

    // Get initials from full name
    const getInitials = (name: string | undefined | null) => {
        if (!name) return 'G';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    };

    return (
        <div className="border w-full py-6 px-8 text-white bg-black rounded-xl">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-4xl font-bold">
                        {getInitials(guestData?.fullName)}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold">
                            {guestData?.fullName}
                        </h1>
                        <span className="text-sm text-gray-300">
                            {guestData?.email}
                        </span>
                        <span className="text-sm text-amber-500">
                            {guestData?.phoneNumber ?? 'N/A'}
                        </span>
                    </div>
                    {/* Status toggle */}
                    <div className="mt-2 flex flex-col items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadges
                                isCheckedIn={guestData?.isCheckedIn}
                            />
                        </div>
                        {guestData?.rebateRate !== null &&
                            guestData?.rebateRate !== undefined &&
                            guestData?.rebateRate !== '' && (
                                <Badge
                                    variant="outline"
                                    className="border-amber-600 text-amber-900 bg-amber-50"
                                >
                                    Rebated rate
                                </Badge>
                            )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {guestData && guestData.isCheckedIn && (
                        <>
                            <PermissionGate
                                permissions={[PERMISSIONS.CREATE_RESERVATION]}
                                permissionType="any"
                                blockType="hide"
                            >
                                <CustomSheet
                                    title="Tranfer Room"
                                    noTitle
                                    open={transferRoomOpen}
                                    setOpen={setTransferRoomOpen}
                                    trigger={
                                        <Button
                                            variant={'outline'}
                                            className="rounded-lg bg-black shadow-none text-white border-gray-600 hover:bg-gray-800"
                                        >
                                            Transfer room
                                        </Button>
                                    }
                                >
                                    <TransferRoomFlow
                                        onSuccess={() =>
                                            setTransferRoomOpen(false)
                                        }
                                        selectedGuest={{
                                            id: guestData.id,
                                            roomNumber:
                                                guestData?.room?.roomNumber.toString(),
                                            guestName: guestData?.fullName,
                                            roomtype: guestData?.roomType.name,
                                            roomNumberRoman:
                                                guestData?.room?.roomNumberRoman?.toString(),
                                        }}
                                    />
                                </CustomSheet>
                            </PermissionGate>

                            <PermissionGate
                                permissions={[PERMISSIONS.CREATE_RESERVATION]}
                                permissionType="any"
                                blockType="hide"
                            >
                                <CustomSheet
                                    title="Wake Up Call"
                                    noTitle
                                    open={wakeUpCallOpen}
                                    setOpen={setWakeUpCallOpen}
                                    trigger={
                                        <Button
                                            variant={'outline'}
                                            className="rounded-lg bg-black shadow-none text-white border-gray-600 hover:bg-gray-800"
                                        >
                                            Wake up calls
                                        </Button>
                                    }
                                >
                                    <WakeUpCall guestId={guestData.id} />
                                </CustomSheet>
                            </PermissionGate>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const GuestProfile = () => {
    const params = useParams();
    const rawGuestId = params?.id;
    const guestId =
        typeof rawGuestId === 'string'
            ? rawGuestId
            : Array.isArray(rawGuestId)
              ? rawGuestId[0]
              : undefined;
    // const [guest, setGuest] = useState<GuestProps>();
    const [, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [guestStayOpen, setGuestStayOpen] = useState(false);
    const [roomUpgradeOpen, setRoomUpgradeOpen] = useState(false);
    const [makePaymentOpen, setMakePaymentOpen] = useState(false);
    const [guestServiceOpen, setGuestServiceOpen] = useState(false);
    const [isUpgradingRoom, setIsUpgradingRoom] = useState(false);
    const [
        addAdditionalChargeToGuestAccount,
        setAddAdditionalChargeToGuestAccount,
    ] = useState(true);
    const [selectedUpgradeRoomTypeId, setSelectedUpgradeRoomTypeId] =
        useState('');
    const [selectedUpgradeRoomId, setSelectedUpgradeRoomId] = useState('');
    const [waiverOpen, setWaiverOpen] = useState(false);
    const [waiverForm, setWaiverForm] = useState({
        vat: false,
        serviceCharge: false,
        tip: false,
        customCharges: false,
        reason: '',
    });
    const [isApplyingWaiver, setIsApplyingWaiver] = useState(false);
    const { hasPermission } = usePermissions();
    const { organization } = useHotel();
    const { roomTypes } = useRoomTypes();
    const { rooms } = useRooms();
    const showRoman = organization?.id === 10;
    const guestHistoryColumns = useGuestHistoryColumns();
    const { data: guest, isLoading } = useSWR(`/guests/info/${guestId}`, () =>
        getGuestInfoById(guestId ?? ''),
    );
    const profileGuestNumericId =
        guestId !== undefined && guestId !== null && guestId !== ''
            ? Number(guestId)
            : NaN;
    const guestServicesSwrKey =
        Number.isFinite(profileGuestNumericId) && profileGuestNumericId > 0
            ? `/guests/service-for-guest?guestId=${profileGuestNumericId}`
            : null;

    const { data: guestHistory } = useSWR(
        `/guests/history?phoneNumber=${guest?.data?.guest.phoneNumber}`,
        () => getGuestHistoryById(guest?.data.guest.phoneNumber ?? ''),
    );

    const { data: guestServices } = useSWR(guestServicesSwrKey, () =>
        getGuestServices(String(profileGuestNumericId)),
    );
    console.log(guestServices);
    const guestBillAuditSwrKey =
        Number.isFinite(profileGuestNumericId) && profileGuestNumericId > 0
            ? `/guests/bill-audit-for-guest?guestId=${profileGuestNumericId}`
            : null;
    const { data: guestBillAudit } = useSWR(guestBillAuditSwrKey, () =>
        getGuestBillAudit(String(profileGuestNumericId)),
    );

    const isServicePaidStatus = (status: any) => {
        const st = String(status || '').toUpperCase();
        return (
            st === 'PAID' ||
            st === 'COMPLETED' ||
            st === 'BILL_SETTLED_FROM_FRONT_DESK'
        );
    };

    const unpaidServicesTotal =
        guestServices?.data
            ?.filter(
                (service: any) => !isServicePaidStatus(service.paymentStatus),
            )
            ?.reduce(
                (sum: number, service: any) =>
                    sum +
                    Number(
                        service.amount ||
                            service.amountPaid ||
                            service.totalPrice ||
                            service.price ||
                            0,
                    ),
                0,
            ) || 0;

    const paidServicesTotal =
        guestServices?.data
            ?.filter((service: any) =>
                isServicePaidStatus(service.paymentStatus),
            )
            ?.reduce(
                (sum: number, service: any) =>
                    sum +
                    Number(
                        service.amount ||
                            service.amountPaid ||
                            service.totalPrice ||
                            service.price ||
                            0,
                    ),
                0,
            ) || 0;

    const allServicesTotal = unpaidServicesTotal + paidServicesTotal;

    const nonRestaurantUnpaidTotal =
        guestServices?.data
            ?.filter((service: any) => {
                const isPaid = isServicePaidStatus(service.paymentStatus);
                const isRestaurant =
                    String(service.type || '').toLowerCase() === 'restaurant';
                return !isPaid && !isRestaurant;
            })
            ?.reduce(
                (sum: number, service: any) =>
                    sum + Number(service.amount || service.amountPaid || 0),
                0,
            ) || 0;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const guestData = guest?.data?.guest || guest?.data?.stay?.[0];
    const date = new Date(guestData?.startDate ?? 0);
    const time = guestData?.startTime
        ? new Date(`1970-01-01T${guestData?.startTime}`)
        : null;

    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const formattedTime = time?.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Calculate nights stayed
    const calculateNightsStayed = () => {
        if (!guestData?.startDate || !guestData?.endDate) return 0;
        const start = new Date(guestData.startDate);
        const end = new Date(guestData.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(diffDays, 1);
    };
    const nightsStayed = calculateNightsStayed();

    // Format checkout date
    const checkoutDate = guestData?.endDate
        ? new Date(guestData.endDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'N/A';

    // Determine the current nightly room rate for upgrade calculations.
    const getRoomRate = () => {
        if (
            guestData?.rebateRate !== undefined &&
            guestData?.rebateRate !== null &&
            guestData?.rebateRate !== ''
        ) {
            return Number(guestData.rebateRate);
        }
        if (
            guestData?.originalPrice !== undefined &&
            guestData?.originalPrice !== null
        ) {
            return Number(guestData.originalPrice);
        }
        if (
            guestData?.room?.price !== undefined &&
            guestData?.room?.price !== null
        ) {
            return Number(guestData.room.price);
        }
        return 0;
    };
    const finalRoomRate = getRoomRate();
    const originalRoomRate = finalRoomRate;
    const start = new Date(guestData.startDate);
    const originalEnd = new Date(
        guestData.originalEndDate || guestData.endDate,
    );
    const originalNights = Math.max(
        1,
        Math.ceil(
            (originalEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        ),
    );

    // Compute the effective nightly rate after discount so that extended
    // nights are billed at the same discounted rate as the original booking.
    const getEffectiveNightlyRate = () => {
        if (!guestData?.isDiscounted) return originalRoomRate;
        const baseRate = Number(originalRoomRate || 0);
        if (baseRate <= 0) return 0;

        if (guestData.discountType === 'PERCENTAGE') {
            const pct = Number(guestData.discountValue || 0);
            return baseRate * (1 - pct / 100);
        }

        if (guestData.discountType === 'FIXED_AMOUNT') {
            const totalDiscount = Number(guestData.discountAmount || 0);
            const perNightDiscount = totalDiscount / originalNights;
            return Math.max(0, baseRate - perNightDiscount);
        }

        return baseRate;
    };
    const effectiveNightlyRate = getEffectiveNightlyRate();

    // Discount to display in the receipt: based on the ORIGINAL booking
    // nights, not the extended stay length.
    const displayedDiscount =
        guestData?.isDiscounted && Number(guestData?.discountAmount || 0) > 0
            ? (originalRoomRate - effectiveNightlyRate) * (nightsStayed || 1)
            : 0;

    // Total room charges for the ORIGINAL booking only.
    const discountedRoomTotal = effectiveNightlyRate * originalNights;

    const stayInfo = [
        { label: 'Check In Date', value: formattedDate },
        { label: 'Check In Time', value: formattedTime },
        { label: 'Check Out Date', value: checkoutDate },
        {
            label: 'Room Number',
            value: `${guestData?.room?.roomNumber}${showRoman && guestData?.room?.roomNumberRoman ? ` (${guestData?.room?.roomNumberRoman})` : ''}`,
        },
        { label: 'Room Type', value: guestData?.roomType?.name || 'N/A' },
        { label: 'Number Of Guest', value: guestData?.numberOfGuests },
        { label: 'Nights Stayed', value: nightsStayed },
        {
            label: 'Original Room Rate',
            value: formatCurrency(originalRoomRate),
        },
        ...(finalRoomRate !== originalRoomRate
            ? [
                  {
                      label: 'Final Room Rate',
                      value: formatCurrency(finalRoomRate),
                  },
              ]
            : []),
        ...(guestData?.IDNumber
            ? [{ label: 'ID Number', value: guestData?.IDNumber }]
            : []),
        ...(guestData?.IDImage
            ? [{ label: 'ID Image', value: guestData?.IDImage, type: 'img' }]
            : []),
    ];

    // Source of truth for outstanding balance: take maximum of receivableBalance, totalDue, and guestData.outstanding
    // This ensures auto-billed charges on guest.outstanding are never lost
    const recVal =
        guestData?.receivableBalance !== undefined &&
        guestData?.receivableBalance !== null
            ? Number(guestData.receivableBalance)
            : guestData?.totalDue !== undefined && guestData?.totalDue !== null
              ? Number(guestData.totalDue)
              : 0;
    const totalOutstanding = Math.max(
        recVal,
        Number(guestData?.outstanding || 0),
    );

    const backendTotalVal =
        guestData?.totalCost !== undefined &&
        guestData.totalCost !== null &&
        Number(guestData.totalCost) > 0
            ? Number(guestData.totalCost)
            : 0;

    const paidVal =
        guestData?.paidAmount !== undefined && guestData?.paidAmount !== null
            ? Number(guestData.paidAmount)
            : Number(guestData?.amountPaid || 0);

    let totalReservationAmount = 0;
    if (totalOutstanding > 0) {
        totalReservationAmount = Math.max(
            backendTotalVal,
            paidVal + totalOutstanding,
        );
    } else if (backendTotalVal > 0) {
        totalReservationAmount = backendTotalVal;
    } else if (
        guestData?.totalWithCustomCharges !== undefined &&
        guestData.totalWithCustomCharges !== null
    ) {
        totalReservationAmount = Number(guestData.totalWithCustomCharges);
    } else if (
        guestData?.finalPrice !== undefined &&
        guestData.finalPrice !== null
    ) {
        totalReservationAmount =
            Number(guestData.finalPrice) +
            (Number(guestData.vatAmount) || 0) *
                (organization?.frontOfficeVatInclusive ? 0 : 1) +
            (Number(guestData.serviceChargeAmount) || 0) +
            (Number(guestData.tipAmount) || 0) +
            (Number(guestData.totalCustomChargesAmount) || 0);
    } else {
        totalReservationAmount =
            discountedRoomTotal +
            (Number(guestData?.vatAmount) || 0) *
                (organization?.frontOfficeVatInclusive ? 0 : 1) +
            (Number(guestData?.serviceChargeAmount) || 0) +
            (Number(guestData?.tipAmount) || 0) +
            (Number(guestData?.totalCustomChargesAmount) || 0);
    }

    const folioUnpaidFromStay =
        guestData?.roomServiceOrders?.reduce(
            (sum: number, o: RoomFolioOrder) => {
                const st = String(o.paymentStatus || '').toUpperCase();
                if (st === 'PAID' || st === 'BILL_SETTLED_FROM_FRONT_DESK')
                    return sum;
                return sum + Number(o.totalPrice || 0);
            },
            0,
        ) ?? 0;

    const restaurantUnpaidFromServices =
        guestServices?.data
            ?.filter(
                (s: { type?: string; paymentStatus?: string }) =>
                    s.type === 'restaurant' &&
                    !['PAID', 'BILL_SETTLED_FROM_FRONT_DESK'].includes(
                        String(s.paymentStatus || '').toUpperCase(),
                    ),
            )
            ?.reduce(
                (sum: number, s: { amount?: number }) =>
                    sum + Number(s.amount || 0),
                0,
            ) ?? 0;

    const displayFolioUnpaid =
        folioUnpaidFromStay > 0
            ? folioUnpaidFromStay
            : restaurantUnpaidFromServices;

    const getReservationType = () => {
        if (guestData?.isVoid)
            return { type: 'Void', color: 'text-red-600', bg: 'bg-red-50' };
        if (guestData?.isComplimentary)
            return {
                type: 'Complimentary',
                color: 'text-white',
                bg: 'bg-[#007bff]',
            };
        if (guestData?.isDiscounted)
            return {
                type: 'Discounted',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
            };
        return { type: 'Regular', color: 'text-green-600', bg: 'bg-green-50' };
    };

    const reservationType = getReservationType();

    const selectedUpgradeRoom = (rooms ?? []).find((room: any) => {
        const roomTypeId = room?.roomtype?.id ?? room?.roomType?.id;
        return (
            String(roomTypeId ?? '') === selectedUpgradeRoomTypeId &&
            String(room.id) === selectedUpgradeRoomId
        );
    });

    const upgradeRoomRate = Number(selectedUpgradeRoom?.price ?? 0);

    const upgradeAvailableRooms = (rooms ?? []).filter((room: any) => {
        const roomTypeId = room?.roomtype?.id ?? room?.roomType?.id;
        const roomTypeName = room?.roomtype?.name ?? room?.roomType?.name;

        return (
            room?.status === 'AVAIL' &&
            !room?.isBooked &&
            !room?.isOccupied &&
            String(roomTypeId ?? roomTypeName ?? '') ===
                selectedUpgradeRoomTypeId
        );
    });

    const differencePerNight = Math.max(0, upgradeRoomRate - finalRoomRate);
    const additionalCharge = differencePerNight * Math.max(1, nightsStayed);
    const effectiveAdditionalCharge = addAdditionalChargeToGuestAccount
        ? additionalCharge
        : 0;

    const getPaymentInfo = () => {
        const rebateRows = buildGuestProfileRebateRows(
            guestData as unknown as Record<string, unknown>,
        );

        // Build charge breakdown rows
        const chargeBreakdown = [];

        if (
            guestData?.vatAmount !== undefined &&
            guestData.vatAmount !== null &&
            Number(guestData.vatAmount) > 0 &&
            !organization?.frontOfficeVatInclusive
        ) {
            chargeBreakdown.push({
                label: 'VAT',
                value: formatCurrency(Number(guestData.vatAmount)),
            });
        }

        if (
            guestData?.serviceChargeAmount !== undefined &&
            guestData.serviceChargeAmount !== null &&
            Number(guestData.serviceChargeAmount) > 0
        ) {
            chargeBreakdown.push({
                label: 'Service Charge',
                value: formatCurrency(Number(guestData.serviceChargeAmount)),
            });
        }

        if (
            guestData?.tipAmount !== undefined &&
            guestData.tipAmount !== null &&
            Number(guestData.tipAmount) > 0
        ) {
            chargeBreakdown.push({
                label: 'Tip',
                value: formatCurrency(Number(guestData.tipAmount)),
            });
        }

        if (
            guestData?.totalCustomChargesAmount !== undefined &&
            guestData.totalCustomChargesAmount !== null &&
            Number(guestData.totalCustomChargesAmount) > 0
        ) {
            chargeBreakdown.push({
                label: 'Custom Charges',
                value: formatCurrency(
                    Number(guestData.totalCustomChargesAmount),
                ),
            });
        }

        // Calculate explicit Auto-Billed / Overstay Charges breakdown line item
        const baseRoomCharges =
            guestData?.finalPrice !== undefined &&
            guestData?.finalPrice !== null
                ? Number(guestData.finalPrice)
                : discountedRoomTotal;
        const baseVat =
            guestData?.vatAmount !== undefined &&
            !organization?.frontOfficeVatInclusive
                ? Number(guestData.vatAmount)
                : 0;
        const baseSc = Number(guestData?.serviceChargeAmount || 0);
        const baseTip = Number(guestData?.tipAmount || 0);
        const baseCustom = Number(guestData?.totalCustomChargesAmount || 0);

        const knownBaseTotal =
            baseRoomCharges + baseVat + baseSc + baseTip + baseCustom;
        const autoBilledCharges = Math.max(
            0,
            totalReservationAmount - knownBaseTotal,
        );

        if (autoBilledCharges > 0 && totalOutstanding > 0) {
            chargeBreakdown.push({
                label: 'Auto-Billed / Overstay Charges',
                value: formatCurrency(autoBilledCharges),
            });
        }

        if (guestData?.isVoid) {
            return [
                {
                    label: 'Reservation Type',
                    value: (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${reservationType.bg} ${reservationType.color}`}
                        >
                            {reservationType.type}
                        </span>
                    ),
                },
                {
                    label: 'Void Reason',
                    value: guestData?.voidReason || 'No reason provided',
                },
                {
                    label: 'Original Room Price',
                    value: formatCurrency(
                        guestData?.originalPrice || guestData?.room?.price || 0,
                    ),
                },
                ...chargeBreakdown,
                {
                    label: 'Total Reservation Amount',
                    value: formatCurrency(totalReservationAmount),
                },
                {
                    label: 'Amount Paid',
                    value: formatCurrency(0),
                },
                {
                    label: 'Outstanding Balance',
                    value: formatCurrency(0),
                },
            ];
        }

        if (guestData?.isComplimentary) {
            return [
                {
                    label: 'Reservation Type',
                    value: (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${reservationType.bg} ${reservationType.color}`}
                        >
                            {reservationType.type}
                        </span>
                    ),
                },
                ...rebateRows,
                ...(rebateRows.length === 0
                    ? [
                          {
                              label: 'Original Room Price',
                              value: formatCurrency(
                                  guestData?.originalPrice ||
                                      guestData?.room?.price ||
                                      0,
                              ),
                          },
                      ]
                    : []),
                ...chargeBreakdown,
                {
                    label: 'Total Reservation Amount',
                    value: formatCurrency(totalReservationAmount),
                },
                {
                    label: 'Complimentary Discount',
                    value: formatCurrency(
                        guestData?.discountAmount ||
                            guestData?.originalPrice ||
                            guestData?.room?.price ||
                            0,
                    ),
                },
                {
                    label: 'Final Price',
                    value: formatCurrency(0),
                },
                {
                    label: 'Food & Beverage (on guest bill)',
                    value: formatCurrency(displayFolioUnpaid || 0),
                },
                {
                    label: 'Other Services (Unpaid)',
                    value: formatCurrency(unpaidServicesTotal || 0),
                },
                {
                    label: 'Amount Paid',
                    value: formatCurrency(
                        guestData?.paidAmount !== undefined &&
                            guestData?.paidAmount !== null
                            ? Number(guestData.paidAmount)
                            : guestData?.amountPaid || 0,
                    ),
                },
                {
                    label: 'Outstanding Balance',
                    value: formatCurrency(totalOutstanding),
                },
            ];
        }

        if (guestData?.isDiscounted) {
            return [
                {
                    label: 'Reservation Type',
                    value: (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${reservationType.bg} ${reservationType.color}`}
                        >
                            {reservationType.type}
                        </span>
                    ),
                },
                ...rebateRows,
                ...(rebateRows.length === 0
                    ? [
                          {
                              label: 'Original Room Price',
                              value: formatCurrency(
                                  guestData?.originalPrice ||
                                      guestData?.room?.price ||
                                      0,
                              ),
                          },
                      ]
                    : []),
                {
                    label: 'Discount Applied',
                    value:
                        guestData?.discountType === 'PERCENTAGE'
                            ? `${guestData?.discountValue}% (${formatCurrency(displayedDiscount)})`
                            : formatCurrency(displayedDiscount),
                },
                {
                    label: 'Discount Approval Reason',
                    value: guestData?.approvalReason || 'No reason provided',
                },
                {
                    label: 'Discount Request Reason',
                    value: guestData?.discountReason || 'No reason provided',
                },
                {
                    label: 'Final Room Price',
                    value: formatCurrency(guestData?.finalPrice || 0),
                },
                ...chargeBreakdown,
                {
                    label: 'Total Reservation Amount',
                    value: formatCurrency(totalReservationAmount),
                },
                {
                    label: 'Other Services (Unpaid)',
                    value: formatCurrency(unpaidServicesTotal || 0),
                },
                {
                    label: 'Total Paid',
                    value: formatCurrency(
                        guestData?.paidAmount !== undefined &&
                            guestData?.paidAmount !== null
                            ? Number(guestData.paidAmount)
                            : guestData?.amountPaid || 0,
                    ),
                },
                {
                    label: 'Outstanding Balance',
                    value: formatCurrency(totalOutstanding),
                },
            ];
        }

        // Regular reservation
        return [
            {
                label: 'Reservation Type',
                value: (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${reservationType.bg} ${reservationType.color}`}
                    >
                        {reservationType.type}
                    </span>
                ),
            },
            ...rebateRows,
            ...(rebateRows.length === 0
                ? [
                      {
                          label: 'Room Price',
                          value: formatCurrency(guestData?.room?.price || 0),
                      },
                  ]
                : []),
            ...chargeBreakdown,
            {
                label: 'Total Reservation Amount',
                value: formatCurrency(totalReservationAmount),
            },
            {
                label: 'Room Price',
                value: formatCurrency(
                    guestData?.originalPrice ?? guestData?.room?.price ?? 0,
                ),
            },
            {
                label: 'Other Services (Unpaid)',
                value: formatCurrency(unpaidServicesTotal || 0),
            },
            {
                label: 'Total Paid',
                value: formatCurrency(
                    guestData?.paidAmount !== undefined &&
                        guestData?.paidAmount !== null
                        ? Number(guestData.paidAmount)
                        : guestData?.amountPaid || 0,
                ),
            },
            {
                label: 'Outstanding Balance',
                value: formatCurrency(totalOutstanding),
            },
            ...(guestData?.waivedAmount && Number(guestData.waivedAmount) > 0
                ? [
                      {
                          label: 'Waived Amount',
                          value: (
                              <span className="text-green-700 font-medium">
                                  -
                                  {formatCurrency(
                                      Number(guestData.waivedAmount),
                                  )}
                              </span>
                          ),
                      },
                      {
                          label: 'Waived By',
                          value: (
                              <span className="text-gray-700">
                                  {guestData?.waivedCharges?.waivedByName ||
                                      (guestData?.waivedBy
                                          ? `User #${guestData.waivedBy}`
                                          : 'N/A')}
                              </span>
                          ),
                      },
                      {
                          label: 'Waived At',
                          value: (
                              <span className="text-gray-700">
                                  {guestData?.waivedAt
                                      ? new Date(
                                            guestData.waivedAt,
                                        ).toLocaleString()
                                      : 'N/A'}
                              </span>
                          ),
                      },
                      {
                          label: 'Waiver Reason',
                          value: (
                              <span className="text-gray-700">
                                  {guestData?.waiverReason || 'N/A'}
                              </span>
                          ),
                      },
                  ]
                : []),
        ];
    };

    const payementInfo = getPaymentInfo();

    const isCheckedIn = guest && guestData?.isCheckedIn;

    const handleServiceSubmit = async (data: ServiceLogs) => {
        try {
            const response = await createGuestServices(
                data,
                Number(guestData?.id),
            );
            if (response) {
                if (
                    response.message === 'Guest services created successfully!'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                }
                // Get the correct guest ID for mutation keys
                // The SWR key uses guest?.data.guest.id, so use that first
                const currentGuestId = guest?.data?.guest?.id || guestData?.id;

                // Mutate SWR caches to refetch updated data
                mutate('/hotels/other-services');
                mutate(`/guests/info/${guestId}`); // Refetch current guest info
                // Mutate room services table - use the exact key pattern from useSWR hook
                // The key is: `/guests/service-for-guest?guestId=${guest?.data.guest.id}`
                if (currentGuestId) {
                    mutate(
                        `/guests/service-for-guest?guestId=${currentGuestId}`,
                    );
                }
                // Also try with guestData.id to be safe
                if (guestData?.id && guestData.id !== currentGuestId) {
                    mutate(`/guests/service-for-guest?guestId=${guestData.id}`);
                }
                mutate('/hotelGuests'); // Refetch guest list (for useGuest hook)

                // Mutate reservation list data (used by ReservationCard components)
                // useListData uses 'list-data' as the SWR key
                mutate('list-data');

                // Also mutate the guest endpoints that reservation lists fetch from
                // These endpoints return reservations with receivableBalance
                mutate(
                    (key) =>
                        typeof key === 'string' && key.startsWith('/guests'),
                );

                // Trigger a custom event for guest management table to refetch
                window.dispatchEvent(new CustomEvent('guest-data-updated'));

                // Close the service form modal after successful submission
                setGuestServiceOpen(false);
                setLoading(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Something went wrong"
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
            setLoading(false);
        }
    };

    const canViewGuestServices = hasPermission(
        PERMISSIONS.MANAGE_GUEST_SERVICES,
    );
    const canViewGuestHistory = hasPermission(PERMISSIONS.VIEW_GUEST_HISTORY);
    const canViewAuditLogs = hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS);

    const handleRoomUpgradeConfirm = async () => {
        if (!guestData?.id) {
            toast.custom(() => (
                <Toast
                    title="Unable to upgrade room"
                    description="Guest information is not available yet."
                    type="error"
                />
            ));
            return;
        }

        if (!selectedUpgradeRoomId) {
            toast.custom(() => (
                <Toast
                    title="Select a room"
                    description="Choose a new room before confirming the upgrade."
                    type="error"
                />
            ));
            return;
        }

        setIsUpgradingRoom(true);

        const response = await upgradeGuestRoom(Number(guestData.id), {
            newRoomId: Number(selectedUpgradeRoomId),
            addAdditionalChargeToGuestAccount,
            additionalChargeAmount: effectiveAdditionalCharge,
        });

        if (response?.error) {
            toast.custom(() => (
                <Toast
                    title="Upgrade failed"
                    description={response.error}
                    type="error"
                />
            ));
            setIsUpgradingRoom(false);
            return;
        }

        toast.custom(() => (
            <Toast
                title="Room upgrade updated"
                description={
                    addAdditionalChargeToGuestAccount
                        ? 'The additional room charge was added to the guest account.'
                        : 'The additional room charge was treated as complimentary.'
                }
                type="success"
            />
        ));

        mutate(`/guests/info/${guestId}`);
        mutate(`/guests/info/${profileGuestNumericId}`);
        mutate('/hotelGuests');
        mutate('list-data');
        mutate((key) => typeof key === 'string' && key.startsWith('/guests'));
        window.dispatchEvent(new CustomEvent('guest-data-updated'));

        setSelectedUpgradeRoomTypeId('');
        setSelectedUpgradeRoomId('');
        setAddAdditionalChargeToGuestAccount(true);
        setRoomUpgradeOpen(false);
        setIsUpgradingRoom(false);
    };

    const handleApplyWaiverProfile = async () => {
        if (!guestData?.id) return;

        setIsApplyingWaiver(true);
        try {
            const response = await applyWaiver(guestData.id, {
                vat: waiverForm.vat,
                serviceCharge: waiverForm.serviceCharge,
                tip: waiverForm.tip,
                customCharges: waiverForm.customCharges,
                waiverReason: waiverForm.reason,
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

            mutate(`/guests/info/${guestId}`);
            mutate(`/guests/info/${profileGuestNumericId}`);
            mutate('/hotelGuests');
            mutate('list-data');
            mutate(
                (key) => typeof key === 'string' && key.startsWith('/guests'),
            );
            window.dispatchEvent(new CustomEvent('guest-data-updated'));

            setWaiverForm({
                vat: false,
                serviceCharge: false,
                tip: false,
                customCharges: false,
                reason: '',
            });
            setWaiverOpen(false);
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

    const shouldShowMakePaymentButton = () => {
        if (!guestData) return false;

        if (guestData.isVoid) return false;

        // For discounted, only show if approved
        if (guestData.isDiscounted) {
            if (guestData.isApproved !== true) return false;
        }

        // Complimentary room: still allow payment for F&B / extras on folio
        const hasReceivable =
            (guestData.receivableBalance !== undefined &&
                guestData.receivableBalance !== null &&
                Number(guestData.receivableBalance) > 0) ||
            (guestData.totalDue !== undefined &&
                guestData.totalDue !== null &&
                Number(guestData.totalDue) > 0) ||
            (guestData.outstanding !== undefined &&
                guestData.outstanding !== null &&
                Number(guestData.outstanding) > 0);

        return hasReceivable;
    };

    return (
        <div>
            <PageHeader>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/front-office/guest-management"
                    >
                        Guest List
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-base'],
                        }}
                    >
                        {guestData?.fullName}
                    </BreadcrumbItem>
                </Breadcrumbs>
            </PageHeader>
            <PageWrapper>
                {/* Black User Card directly under breadcrumb */}
                <UserCard guestData={guestData as Guest} />

                <div className="mt-4">
                    <Tabs defaultValue="guest-info" className="w-full">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <TabsList className="flex-1 justify-start gap-4 rounded-none bg-transparent p-0">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                        key={tab.value}
                                        value={tab.value}
                                        disabled={
                                            (tab.value === 'guest-history' &&
                                                !canViewGuestHistory) ||
                                            (tab.value === 'room-services' &&
                                                !canViewGuestServices) ||
                                            (tab.value === 'bill-audit' &&
                                                !canViewAuditLogs)
                                        }
                                    >
                                        {tab.label}
                                        {(tab.value === 'guest-history' &&
                                            !canViewGuestHistory) ||
                                        (tab.value === 'room-services' &&
                                            !canViewGuestServices) ||
                                        (tab.value === 'bill-audit' &&
                                            !canViewAuditLogs) ? (
                                            <span className="text-xs text-red-500 ml-2">
                                                No Access
                                            </span>
                                        ) : null}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div className="flex flex-wrap items-center gap-3">
                                <PermissionGate
                                    permissions={[
                                        PERMISSIONS.VIEW_GUEST_MANAGEMENT,
                                    ]}
                                    permissionType="any"
                                    blockType="hide"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            printGuestPaymentInfo(guestData?.id)
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print Payment Info
                                    </Button>
                                </PermissionGate>

                                <PermissionGate
                                    permissions={[PERMISSIONS.SETTLE_BILL]}
                                    permissionType="any"
                                    blockType="hide"
                                >
                                    <CustomSheet
                                        title="Waive Charges"
                                        open={waiverOpen}
                                        setOpen={setWaiverOpen}
                                        trigger={
                                            <Button
                                                variant="outline"
                                                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                            >
                                                Waive Charges
                                            </Button>
                                        }
                                    >
                                        <div className="space-y-6">
                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {guestData?.fullName ||
                                                                'Guest'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Reservation #
                                                            {guestData?.id ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            guestData?.isComplimentary
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }
                                                    >
                                                        {guestData?.isComplimentary
                                                            ? 'Complimentary Reservation'
                                                            : 'Regular Reservation'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Waive Charges
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <label className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={
                                                                waiverForm.vat &&
                                                                waiverForm.serviceCharge &&
                                                                waiverForm.tip &&
                                                                waiverForm.customCharges
                                                            }
                                                            onCheckedChange={(
                                                                v,
                                                            ) => {
                                                                const checked =
                                                                    v === true;
                                                                setWaiverForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        vat: checked,
                                                                        serviceCharge:
                                                                            checked,
                                                                        tip: checked,
                                                                        customCharges:
                                                                            checked,
                                                                    }),
                                                                );
                                                            }}
                                                        />
                                                        <span>
                                                            Waive All Charges
                                                        </span>
                                                    </label>
                                                    <ChargeSwitch
                                                            id="profile-waive-vat"
                                                            compact
                                                            label={`VAT (${Number(guestData?.vatRateSnapshot || 0).toFixed(2)}%)`}
                                                            checked={!waiverForm.vat}
                                                            disabled={
                                                                !guestData?.vatAmount ||
                                                                guestData.vatAmount <=
                                                                    0
                                                            }
                                                            onCheckedChange={(checked) =>
                                                                setWaiverForm((prev) => ({
                                                                    ...prev,
                                                                    vat: !checked,
                                                                }))
                                                            }
                                                        />
                                                    <label className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={
                                                                waiverForm.serviceCharge
                                                            }
                                                            onCheckedChange={(
                                                                v,
                                                            ) =>
                                                                setWaiverForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        serviceCharge:
                                                                            v ===
                                                                            true,
                                                                    }),
                                                                )
                                                            }
                                                            disabled={
                                                                !guestData?.serviceChargeAmount ||
                                                                guestData.serviceChargeAmount <=
                                                                    0
                                                            }
                                                        />
                                                        <span>
                                                            Service Charge (
                                                            {Number(
                                                                guestData?.serviceChargeRateSnapshot ||
                                                                    0,
                                                            ).toFixed(2)}
                                                            %)
                                                        </span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={
                                                                waiverForm.tip
                                                            }
                                                            onCheckedChange={(
                                                                v,
                                                            ) =>
                                                                setWaiverForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        tip:
                                                                            v ===
                                                                            true,
                                                                    }),
                                                                )
                                                            }
                                                            disabled={
                                                                !guestData?.tipAmount ||
                                                                guestData.tipAmount <=
                                                                    0
                                                            }
                                                        />
                                                        <span>
                                                            Tip (
                                                            {Number(
                                                                guestData?.tipRateSnapshot ||
                                                                    0,
                                                            ).toFixed(2)}
                                                            %)
                                                        </span>
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={
                                                                waiverForm.customCharges
                                                            }
                                                            onCheckedChange={(
                                                                v,
                                                            ) =>
                                                                setWaiverForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        customCharges:
                                                                            v ===
                                                                            true,
                                                                    }),
                                                                )
                                                            }
                                                            disabled={
                                                                !guestData?.customCharges ||
                                                                guestData
                                                                    .customCharges
                                                                    .length ===
                                                                    0
                                                            }
                                                        />
                                                        <span>
                                                            Custom Charges
                                                        </span>
                                                    </label>
                                                </div>
                                                <div>
                                                    <InputField
                                                        id="waiverReason"
                                                        name="waiverReason"
                                                        label="Reason"
                                                        type="text"
                                                        placeholder="Enter waiver reason"
                                                        className="bg-white ring-border border shadow-none border-border h-10"
                                                        value={
                                                            waiverForm.reason
                                                        }
                                                        onChange={(e) =>
                                                            setWaiverForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    reason: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={
                                                            handleApplyWaiverProfile
                                                        }
                                                        disabled={
                                                            isApplyingWaiver ||
                                                            (!waiverForm.vat &&
                                                                !waiverForm.serviceCharge &&
                                                                !waiverForm.tip &&
                                                                !waiverForm.customCharges)
                                                        }
                                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
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
                                        </div>
                                    </CustomSheet>
                                </PermissionGate>

                                <PermissionGate
                                    permissions={[
                                        PERMISSIONS.CREATE_RESERVATION,
                                    ]}
                                    permissionType="any"
                                    blockType="hide"
                                >
                                    <CustomSheet
                                        title="Room Upgrade"
                                        open={roomUpgradeOpen}
                                        setOpen={setRoomUpgradeOpen}
                                        trigger={
                                            <Button
                                                variant="outline"
                                                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                            >
                                                Room Upgrade
                                            </Button>
                                        }
                                    >
                                        <div className="space-y-6">
                                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {guestData?.fullName ||
                                                                'Guest'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Reservation #
                                                            {guestData?.id ||
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            guestData?.isComplimentary
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }
                                                    >
                                                        {guestData?.isComplimentary
                                                            ? 'Complimentary Reservation'
                                                            : 'Regular Reservation'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Current Stay
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <InputField
                                                        id="guestName"
                                                        name="guestName"
                                                        label="Guest Name"
                                                        value={
                                                            guestData?.fullName ||
                                                            ''
                                                        }
                                                        readOnly
                                                    />
                                                    <InputField
                                                        id="reservationNumber"
                                                        name="reservationNumber"
                                                        label="Reservation Number"
                                                        value={
                                                            guestData?.id?.toString() ||
                                                            ''
                                                        }
                                                        readOnly
                                                    />
                                                    <InputField
                                                        id="currentRoomType"
                                                        name="currentRoomType"
                                                        label="Current Room Type"
                                                        value={
                                                            guestData?.roomType
                                                                ?.name || ''
                                                        }
                                                        readOnly
                                                    />
                                                    <InputField
                                                        id="currentRoomNumber"
                                                        name="currentRoomNumber"
                                                        label="Current Room Number"
                                                        value={
                                                            guestData?.room
                                                                ?.roomNumber
                                                                ? `${guestData.room.roomNumber}${showRoman && guestData?.room?.roomNumberRoman ? ` (${guestData.room.roomNumberRoman})` : ''}`
                                                                : ''
                                                        }
                                                        readOnly
                                                    />
                                                    <InputField
                                                        id="currentRoomRate"
                                                        name="currentRoomRate"
                                                        label="Current Room Rate"
                                                        value={formatCurrency(
                                                            finalRoomRate,
                                                        )}
                                                        readOnly
                                                    />
                                                    <InputField
                                                        id="remainingNights"
                                                        name="remainingNights"
                                                        label="Remaining Nights"
                                                        value={nightsStayed.toString()}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Upgrade Details
                                                </h3>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <SelectField
                                                        id="newRoomType"
                                                        name="newRoomType"
                                                        label="New Room Type"
                                                        value={
                                                            selectedUpgradeRoomTypeId
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            setSelectedUpgradeRoomTypeId(
                                                                value,
                                                            );
                                                            setSelectedUpgradeRoomId(
                                                                '',
                                                            );
                                                        }}
                                                        options={(roomTypes ?? []).map(
                                                            (roomType: {
                                                                id: number;
                                                                name: string;
                                                            }) => ({
                                                                label: roomType.name,
                                                                value: String(
                                                                    roomType.id,
                                                                ),
                                                            }),
                                                        )}
                                                        placeholder="Select room type"
                                                    />
                                                    <SelectField
                                                        id="newRoomNumber"
                                                        name="newRoomNumber"
                                                        label="New Room Number"
                                                        value={
                                                            selectedUpgradeRoomId
                                                        }
                                                        onValueChange={
                                                            setSelectedUpgradeRoomId
                                                        }
                                                        options={(upgradeAvailableRooms ?? []).map(
                                                            (room: any) => ({
                                                                label: `${room.roomNumber}${showRoman && room.roomNumberRoman ? ` (${room.roomNumberRoman})` : ''}`,
                                                                value: String(
                                                                    room.id,
                                                                ),
                                                            }),
                                                        )}
                                                        placeholder="Select available room"
                                                        disabled={
                                                            !selectedUpgradeRoomTypeId
                                                        }
                                                    />
                                                    <InputField
                                                        id="newRoomRate"
                                                        name="newRoomRate"
                                                        label="New Room Rate"
                                                        value={formatCurrency(
                                                            upgradeRoomRate,
                                                        )}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Upgrade Summary
                                                </h3>
                                                <div className="mt-4 space-y-3 text-sm">
                                                    <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 bg-yellow-50">
                                                        <Checkbox
                                                            id="add-additional-charge"
                                                            checked={
                                                                addAdditionalChargeToGuestAccount
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setAddAdditionalChargeToGuestAccount(
                                                                    checked ===
                                                                        true,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="add-additional-charge"
                                                            className="cursor-pointer text-sm text-gray-800"
                                                        >
                                                            <span className="font-medium">
                                                                Add additional
                                                                charge to guest
                                                                account
                                                            </span>
                                                            <p className="mt-1 text-xs text-gray-600">
                                                                If this is
                                                                unchecked, the
                                                                additional
                                                                charge will be
                                                                treated as
                                                                complimentary.
                                                            </p>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">
                                                            Current Rate
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(
                                                                finalRoomRate,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">
                                                            New Rate
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(
                                                                upgradeRoomRate,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">
                                                            Difference Per Night
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatCurrency(
                                                                differencePerNight,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">
                                                            Remaining Nights
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {nightsStayed}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                                        <span className="font-semibold text-gray-900">
                                                            Additional Charge
                                                        </span>
                                                        <span className="font-semibold text-blue-600">
                                                            {formatCurrency(
                                                                effectiveAdditionalCharge,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full bg-orion-blue hover:bg-orion-blue/90"
                                                onClick={
                                                    handleRoomUpgradeConfirm
                                                }
                                                disabled={
                                                    !selectedUpgradeRoomId ||
                                                    isUpgradingRoom
                                                }
                                            >
                                                {isUpgradingRoom
                                                    ? 'Updating...'
                                                    : 'Confirm Upgrade'}
                                            </Button>
                                        </div>
                                    </CustomSheet>
                                </PermissionGate>

                                {/* <PermissionGate
                                    permissions={[
                                        PERMISSIONS.CREATE_RESERVATION,
                                    ]}
                                    permissionType="any"
                                    blockType="hide"
                                >
                                    <Button
                                        variant="outline"
                                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                    >
                                        Remove Guest
                                    </Button>
                                </PermissionGate> */}

                                {guestData && shouldShowMakePaymentButton() && (
                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.CREATE_RESERVATION,
                                        ]}
                                        permissionType="any"
                                        blockType="hide"
                                    >
                                        <CustomSheet
                                            noTitle
                                            title="Make Payment"
                                            open={makePaymentOpen}
                                            setOpen={setMakePaymentOpen}
                                            trigger={
                                                <Button className="bg-orion-blue hover:bg-orion-blue">
                                                    Make Payment
                                                </Button>
                                            }
                                        >
                                            <MakePaymentForm
                                                guestId={guestData?.id ?? 0}
                                                outstanding={
                                                    totalOutstanding ?? ''
                                                }
                                                onClose={() =>
                                                    setMakePaymentOpen(false)
                                                }
                                            />
                                        </CustomSheet>
                                    </PermissionGate>
                                )}

                                {isCheckedIn && (
                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.CREATE_RESERVATION,
                                        ]}
                                        permissionType="any"
                                        blockType="hide"
                                    >
                                        <CustomSheet
                                            noTitle
                                            title="Extend Guest Stay"
                                            open={guestStayOpen}
                                            setOpen={setGuestStayOpen}
                                            trigger={
                                                <Button className="bg-orion-blue hover:bg-orion-blue/90">
                                                    Extend Guest Stay
                                                </Button>
                                            }
                                        >
                                            <ExtendStayFlow
                                                guest={guestData}
                                                onClose={() =>
                                                    setGuestStayOpen(false)
                                                }
                                            />
                                        </CustomSheet>
                                    </PermissionGate>
                                )}
                            </div>
                        </div>
                        <TabsContent value="guest-info">
                            <div className="flex flex-col gap-6 mt-6">
                                {/* Current Stay Info */}
                                <div className="border border-gray-200 rounded-2xl p-6">
                                    <h3 className="text-xl font-semibold mb-6">
                                        Current Stay Info
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Room Type
                                            </span>
                                            <p className="font-medium">
                                                {guestData?.roomType?.name ||
                                                    'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Room Number
                                            </span>
                                            <p className="font-medium">
                                                {guestData?.room?.roomNumber}
                                                {showRoman &&
                                                guestData?.room?.roomNumberRoman
                                                    ? ` (${guestData?.room?.roomNumberRoman})`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Check In Date
                                            </span>
                                            <p className="font-medium">
                                                {new Date(
                                                    guestData?.startDate ?? 0,
                                                ).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Check In Time
                                            </span>
                                            <p className="font-medium">
                                                {guestData?.startTime
                                                    ? new Date(
                                                          `1970-01-01T${guestData?.startTime}`,
                                                      ).toLocaleTimeString(
                                                          'en-US',
                                                          {
                                                              hour: 'numeric',
                                                              minute: '2-digit',
                                                              hour12: true,
                                                          },
                                                      )
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Number Of Nights
                                            </span>
                                            <p className="font-medium">
                                                {nightsStayed}{' '}
                                                {nightsStayed === 1
                                                    ? 'Night'
                                                    : 'Nights'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Number Of Guest
                                            </span>
                                            <p className="font-medium">
                                                {guestData?.numberOfGuests || 1}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Check Out Date
                                            </span>
                                            <p className="font-medium">
                                                {checkoutDate}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Room Rate
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(finalRoomRate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reservation & Billing Details */}
                                <div className="border border-gray-200 rounded-2xl p-6">
                                    <h3 className="text-xl font-semibold mb-6">
                                        Reservation & Billing Details
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 border-t border-gray-100 pt-4">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Final Room Rate
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(finalRoomRate)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Original Room Rate
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    originalRoomRate,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Reservation Type
                                            </span>
                                            <p className="font-medium">
                                                {reservationType.type}
                                            </p>
                                        </div>
                                        {guestData?.isDiscounted && (
                                            <>
                                                <div>
                                                    <span className="text-sm text-gray-500">
                                                        Discount Applied
                                                    </span>
                                                    <p className="font-medium">
                                                        {guestData?.discountType ===
                                                        'PERCENTAGE'
                                                            ? `${guestData?.discountValue}% (${formatCurrency(displayedDiscount)})`
                                                            : formatCurrency(
                                                                  displayedDiscount,
                                                              )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500">
                                                        Discount Approval Reason
                                                    </span>
                                                    <p className="font-medium">
                                                        {guestData?.approvalReason ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500">
                                                        Discount Request Reason
                                                    </span>
                                                    <p className="font-medium">
                                                        {guestData?.discountReason ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Final Price
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    guestData?.totalCost !==
                                                        undefined &&
                                                        guestData?.totalCost !==
                                                            null &&
                                                        Number(
                                                            guestData.totalCost,
                                                        ) > 0
                                                        ? Number(
                                                              guestData.totalCost,
                                                          )
                                                        : guestData?.finalPrice !==
                                                                undefined &&
                                                            guestData?.finalPrice !==
                                                                null
                                                          ? Number(
                                                                guestData.finalPrice,
                                                            )
                                                          : discountedRoomTotal,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Other Services (Unpaid)
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    unpaidServicesTotal || 0,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Total Paid
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    guestData?.paidAmount !==
                                                        undefined &&
                                                        guestData?.paidAmount !==
                                                            null
                                                        ? Number(
                                                              guestData.paidAmount,
                                                          )
                                                        : guestData?.amountPaid ||
                                                              0,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                Outstanding
                                            </span>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    totalOutstanding || 0,
                                                )}
                                            </p>
                                            {guestData?.receivableBalance !==
                                                undefined &&
                                                guestData?.receivableBalance !==
                                                    null &&
                                                Number(
                                                    guestData.receivableBalance,
                                                ) > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 mt-1">
                                                        Accounts Receivable
                                                    </span>
                                                )}
                                            {guestData?.payableBalance !==
                                                undefined &&
                                                guestData?.payableBalance !==
                                                    null &&
                                                Number(
                                                    guestData.payableBalance,
                                                ) > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 mt-1">
                                                        Accounts Payable
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Section */}
                                <div className="border border-gray-200 rounded-2xl p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Payment Discounts */}
                                        <div>
                                            <h3 className="text-xl font-semibold mb-6">
                                                Payment Discounts
                                            </h3>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        SubTotal
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            originalRoomRate *
                                                                (nightsStayed ||
                                                                    1),
                                                        )}
                                                    </span>
                                                </div>
                                                {allServicesTotal > 0 && (
                                                    <div className="flex flex-col gap-1.5 py-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 font-medium">
                                                                Other Services &
                                                                Orders
                                                            </span>
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    allServicesTotal,
                                                                )}
                                                            </span>
                                                        </div>
                                                        {guestServices?.data &&
                                                            guestServices.data
                                                                .length > 0 && (
                                                                <div className="pl-3 border-l-2 border-gray-100 flex flex-col gap-1 text-xs text-gray-500">
                                                                    {guestServices.data.map(
                                                                        (
                                                                            srv: any,
                                                                            idx: number,
                                                                        ) => {
                                                                            const srvAmount =
                                                                                Number(
                                                                                    srv.amount ||
                                                                                        srv.amountPaid ||
                                                                                        srv.totalPrice ||
                                                                                        srv.price ||
                                                                                        0,
                                                                                );
                                                                            const srvName =
                                                                                srv.notes &&
                                                                                srv.notes !==
                                                                                    'N/A'
                                                                                    ? srv.notes
                                                                                    : String(
                                                                                          srv.type ||
                                                                                              'Service',
                                                                                      ).toUpperCase();
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        srv.id ||
                                                                                        idx
                                                                                    }
                                                                                    className="flex justify-between"
                                                                                >
                                                                                    <span className="truncate max-w-[200px]">
                                                                                        •{' '}
                                                                                        {
                                                                                            srvName
                                                                                        }
                                                                                    </span>
                                                                                    <span>
                                                                                        {formatCurrency(
                                                                                            srvAmount,
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                                {(() => {
                                                    const roomSubTotal =
                                                        originalRoomRate *
                                                        (nightsStayed || 1);
                                                    const upgradeChargeVal =
                                                        Number(
                                                            guestData?.upgradeTotal ||
                                                                0,
                                                        );
                                                    const fullBase =
                                                        roomSubTotal +
                                                        upgradeChargeVal;

                                                    const isVatWaived = Boolean(
                                                        guestData?.waivedCharges
                                                            ?.vat,
                                                    );
                                                    const isScWaived = Boolean(
                                                        guestData?.waivedCharges
                                                            ?.serviceCharge,
                                                    );
                                                    const isCustomWaived =
                                                        Boolean(
                                                            guestData
                                                                ?.waivedCharges
                                                                ?.customCharges,
                                                        );

                                                    const serviceChargeVal =
                                                        isScWaived
                                                            ? 0
                                                            : Math.max(
                                                                  Number(
                                                                      guestData?.serviceChargeAmount ||
                                                                          0,
                                                                  ),
                                                                  (fullBase *
                                                                      Number(
                                                                          guestData?.serviceChargeRateSnapshot ||
                                                                              5,
                                                                      )) /
                                                                      100,
                                                              );
                                                    const vatVal = isVatWaived
                                                        ? 0
                                                        : Math.max(
                                                              Number(
                                                                  guestData?.vatAmount ||
                                                                      0,
                                                              ),
                                                              (fullBase *
                                                                  Number(
                                                                      guestData?.vatRateSnapshot ||
                                                                          7.5,
                                                                  )) /
                                                                  100,
                                                          );
                                                    const customChargesVal =
                                                        isCustomWaived
                                                            ? 0
                                                            : Number(
                                                                  guestData?.totalCustomChargesAmount ||
                                                                      0,
                                                              );

                                                    const isDiscounted =
                                                        guestData?.isDiscounted &&
                                                        (displayedDiscount >
                                                            0 ||
                                                            Number(
                                                                guestData?.discountAmount ||
                                                                    0,
                                                            ) > 0 ||
                                                            Number(
                                                                guestData?.discountValue ||
                                                                    0,
                                                            ) > 0);
                                                    const discountDeduction =
                                                        isDiscounted
                                                            ? Number(
                                                                  displayedDiscount ||
                                                                      0,
                                                              )
                                                            : 0;

                                                    const knownSum =
                                                        roomSubTotal +
                                                        allServicesTotal +
                                                        upgradeChargeVal +
                                                        serviceChargeVal +
                                                        (vatVal &&
                                                        !organization?.frontOfficeVatInclusive
                                                            ? vatVal
                                                            : 0) +
                                                        Number(
                                                            guestData?.tipAmount ||
                                                                0,
                                                        ) +
                                                        customChargesVal -
                                                        discountDeduction;

                                                    const grandTotalVal =
                                                        totalReservationAmount >
                                                        0
                                                            ? totalReservationAmount
                                                            : Math.max(
                                                                  Number(
                                                                      guestData?.totalCost ||
                                                                          0,
                                                                  ),
                                                                  knownSum,
                                                              );
                                                    const autoBilledExtra =
                                                        Math.max(
                                                            0,
                                                            grandTotalVal -
                                                                knownSum,
                                                        );

                                                    return (
                                                        <>
                                                            {upgradeChargeVal >
                                                                0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        Room
                                                                        Upgrade
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {formatCurrency(
                                                                            upgradeChargeVal,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {serviceChargeVal >
                                                                0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        Service
                                                                        Charge (
                                                                        {Number(
                                                                            guestData?.serviceChargeRateSnapshot ||
                                                                                5,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                        %)
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {formatCurrency(
                                                                            serviceChargeVal,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {vatVal > 0 &&
                                                                !organization?.frontOfficeVatInclusive && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">
                                                                            Vat
                                                                            (
                                                                            {Number(
                                                                                guestData?.vatRateSnapshot ||
                                                                                    7.5,
                                                                            ).toFixed(
                                                                                2,
                                                                            )}
                                                                            %)
                                                                        </span>
                                                                        <span className="font-medium">
                                                                            {formatCurrency(
                                                                                vatVal,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            {Number(
                                                                guestData?.tipAmount,
                                                            ) > 0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        Tip
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {formatCurrency(
                                                                            Number(
                                                                                guestData?.tipAmount,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {customChargesVal >
                                                                0 && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        Custom
                                                                        Charges
                                                                    </span>
                                                                    <span className="font-medium">
                                                                        {formatCurrency(
                                                                            customChargesVal,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {autoBilledExtra >
                                                                0 && (
                                                                <div className="flex justify-between text-orange-600 font-medium">
                                                                    <span>
                                                                        Auto-Billed
                                                                        /
                                                                        Overstay
                                                                        Charges
                                                                    </span>
                                                                    <span>
                                                                        +
                                                                        {formatCurrency(
                                                                            autoBilledExtra,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                                {guestData?.isDiscounted &&
                                                    (displayedDiscount > 0 ||
                                                        Number(
                                                            guestData?.discountAmount ||
                                                                0,
                                                        ) > 0 ||
                                                        Number(
                                                            guestData?.discountValue ||
                                                                0,
                                                        ) > 0) && (
                                                        <div className="flex justify-between border-t border-gray-200 pt-3">
                                                            <span className="text-red-600">
                                                                Discounted
                                                            </span>
                                                            <span className="text-red-600 font-medium">
                                                                -{' '}
                                                                {formatCurrency(
                                                                    Number(
                                                                        displayedDiscount,
                                                                    ),
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                {guestData?.waivedAmount &&
                                                    Number(
                                                        guestData.waivedAmount,
                                                    ) > 0 && (
                                                        <>
                                                            {guestData
                                                                .waivedCharges
                                                                ?.vat && (
                                                                <div className="flex justify-between text-green-700">
                                                                    <span>
                                                                        Waived:
                                                                        VAT (
                                                                        {Number(
                                                                            guestData?.vatRateSnapshot ||
                                                                                0,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                        %)
                                                                    </span>
                                                                    <span>
                                                                        -
                                                                        {formatCurrency(
                                                                            Number(
                                                                                guestData
                                                                                    .waivedCharges
                                                                                    .originalVatAmount ||
                                                                                    0,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {guestData
                                                                .waivedCharges
                                                                ?.serviceCharge && (
                                                                <div className="flex justify-between text-green-700">
                                                                    <span>
                                                                        Waived:
                                                                        Service
                                                                        Charge (
                                                                        {Number(
                                                                            guestData?.serviceChargeRateSnapshot ||
                                                                                0,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                        %)
                                                                    </span>
                                                                    <span>
                                                                        -
                                                                        {formatCurrency(
                                                                            Number(
                                                                                guestData
                                                                                    .waivedCharges
                                                                                    .originalServiceChargeAmount ||
                                                                                    0,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {guestData
                                                                .waivedCharges
                                                                ?.tip && (
                                                                <div className="flex justify-between text-green-700">
                                                                    <span>
                                                                        Waived:
                                                                        Tip (
                                                                        {Number(
                                                                            guestData?.tipRateSnapshot ||
                                                                                0,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                        %)
                                                                    </span>
                                                                    <span>
                                                                        -
                                                                        {formatCurrency(
                                                                            Number(
                                                                                guestData
                                                                                    .waivedCharges
                                                                                    .originalTipAmount ||
                                                                                    0,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {guestData
                                                                .waivedCharges
                                                                ?.customCharges && (
                                                                <div className="flex justify-between text-green-700">
                                                                    <span>
                                                                        Waived:
                                                                        Custom
                                                                        Charges
                                                                    </span>
                                                                    <span>
                                                                        -
                                                                        {formatCurrency(
                                                                            Number(
                                                                                guestData
                                                                                    .waivedCharges
                                                                                    .originalCustomChargesAmount ||
                                                                                    0,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                                                                <span>
                                                                    Waived By:
                                                                </span>
                                                                <span>
                                                                    {guestData
                                                                        .waivedCharges
                                                                        ?.waivedByName ||
                                                                        (guestData?.waivedBy
                                                                            ? `User #${guestData.waivedBy}`
                                                                            : 'N/A')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>
                                                                    Waived At:
                                                                </span>
                                                                <span>
                                                                    {guestData?.waivedAt
                                                                        ? new Date(
                                                                              guestData.waivedAt,
                                                                          ).toLocaleString()
                                                                        : 'N/A'}
                                                                </span>
                                                            </div>
                                                            {guestData?.waiverReason && (
                                                                <div className="flex justify-between text-xs text-gray-500">
                                                                    <span>
                                                                        Waiver
                                                                        Reason:
                                                                    </span>
                                                                    <span className="text-right max-w-[200px]">
                                                                        {
                                                                            guestData.waiverReason
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                <div className="flex justify-between bg-green-50 rounded-lg px-4 py-3 mt-2">
                                                    <span className="font-semibold">
                                                        Grand Total Payment
                                                    </span>
                                                    <span className="font-semibold">
                                                        {formatCurrency(
                                                            totalReservationAmount >
                                                                0
                                                                ? totalReservationAmount
                                                                : guestData?.totalCost !==
                                                                        undefined &&
                                                                    guestData?.totalCost !==
                                                                        null &&
                                                                    Number(
                                                                        guestData.totalCost,
                                                                    ) > 0
                                                                  ? Number(
                                                                        guestData.totalCost,
                                                                    )
                                                                  : originalRoomRate *
                                                                        (nightsStayed ||
                                                                            1) +
                                                                    allServicesTotal +
                                                                    Number(
                                                                        guestData?.upgradeTotal ||
                                                                            0,
                                                                    ) +
                                                                    (Number(
                                                                        guestData?.serviceChargeAmount,
                                                                    ) || 0) +
                                                                    (Number(
                                                                        guestData?.vatAmount,
                                                                    ) || 0) +
                                                                    (Number(
                                                                        guestData?.tipAmount,
                                                                    ) || 0) +
                                                                    (Number(
                                                                        guestData?.totalCustomChargesAmount,
                                                                    ) || 0) -
                                                                    (guestData?.isDiscounted
                                                                        ? Number(
                                                                              displayedDiscount ||
                                                                                  0,
                                                                          )
                                                                        : 0),
                                                        )}
                                                    </span>
                                                </div>

                                                {guestData?.payableBalance !==
                                                    undefined &&
                                                    guestData?.payableBalance !==
                                                        null &&
                                                    Number(
                                                        guestData?.payableBalance,
                                                    ) > 0 && (
                                                        <div className="flex justify-between pt-2">
                                                            <span className="text-green-600 font-medium">
                                                                Account Payable
                                                            </span>
                                                            <span className="text-green-600 font-semibold">
                                                                {formatCurrency(
                                                                    Number(
                                                                        guestData?.payableBalance,
                                                                    ),
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Payment Summary */}
                                        <div>
                                            <h3 className="text-xl font-semibold mb-6">
                                                Payment Summary
                                            </h3>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Total Amount
                                                    </span>
                                                    <span className="font-medium">
                                                        {formatCurrency(
                                                            guestData?.totalCost !==
                                                                undefined &&
                                                                guestData?.totalCost !==
                                                                    null &&
                                                                Number(
                                                                    guestData.totalCost,
                                                                ) > 0
                                                                ? Number(
                                                                      guestData.totalCost,
                                                                  )
                                                                : guestData?.totalWithCustomCharges ||
                                                                      discountedRoomTotal +
                                                                          Number(
                                                                              guestData?.vatAmount ||
                                                                                  0,
                                                                          ) *
                                                                              (organization?.frontOfficeVatInclusive
                                                                                  ? 0
                                                                                  : 1) +
                                                                          Number(
                                                                              guestData?.serviceChargeAmount ||
                                                                                  0,
                                                                          ) +
                                                                          Number(
                                                                              guestData?.tipAmount ||
                                                                                  0,
                                                                          ) +
                                                                          Number(
                                                                              guestData?.totalCustomChargesAmount ||
                                                                                  0,
                                                                          ),
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-green-600">
                                                        Amount Paid
                                                    </span>
                                                    <span className="text-green-600 font-semibold">
                                                        {formatCurrency(
                                                            guestData?.paidAmount !==
                                                                undefined &&
                                                                guestData?.paidAmount !==
                                                                    null
                                                                ? Number(
                                                                      guestData.paidAmount,
                                                                  )
                                                                : guestData?.amountPaid ||
                                                                      0,
                                                        )}
                                                    </span>
                                                </div>
                                                {guestData?.payableBalance !==
                                                    undefined &&
                                                    guestData?.payableBalance !==
                                                        null &&
                                                    Number(
                                                        guestData?.payableBalance,
                                                    ) > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-green-600">
                                                                Account Payable
                                                            </span>
                                                            <span className="text-green-600 font-semibold">
                                                                {formatCurrency(
                                                                    Number(
                                                                        guestData?.payableBalance,
                                                                    ),
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                <div className="flex justify-between items-center pt-4">
                                                    <span className="text-orange-600 font-medium">
                                                        Payment Status
                                                    </span>
                                                    {(() => {
                                                        const paid =
                                                            guestData?.paidAmount !==
                                                                undefined &&
                                                            guestData?.paidAmount !==
                                                                null
                                                                ? Number(
                                                                      guestData.paidAmount,
                                                                  )
                                                                : Number(
                                                                      guestData?.amountPaid ||
                                                                          0,
                                                                  );
                                                        const outstanding =
                                                            Number(
                                                                totalOutstanding ||
                                                                    0,
                                                            );

                                                        let statusText =
                                                            'Full payment';
                                                        let statusBg =
                                                            'bg-green-500';

                                                        if (paid <= 0) {
                                                            statusText =
                                                                'No payment';
                                                            statusBg =
                                                                'bg-red-500';
                                                        } else if (
                                                            outstanding > 0
                                                        ) {
                                                            statusText =
                                                                'Partial payment';
                                                            statusBg =
                                                                'bg-orange-500';
                                                        }

                                                        return (
                                                            <span
                                                                className={`inline-block px-4 py-2 ${statusBg} text-white font-medium rounded-lg`}
                                                            >
                                                                {statusText}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="room-services">
                            <div className="flex flex-col gap-8">
                                <div className="border rounded-xl p-4 bg-muted/30">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                        <h2 className="font-semibold text-base">
                                            Food & Beverage (room folio)
                                        </h2>
                                        {guestId ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    mutate(
                                                        `/guests/info/${guestId}`,
                                                    );
                                                    if (
                                                        Number.isFinite(
                                                            profileGuestNumericId,
                                                        ) &&
                                                        profileGuestNumericId >
                                                            0
                                                    ) {
                                                        mutate(
                                                            `/guests/service-for-guest?guestId=${profileGuestNumericId}`,
                                                        );
                                                    }
                                                }}
                                            >
                                                Refresh folio
                                            </Button>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Charges from Restaurant posted to this
                                        guest&apos;s room during the stay. Also
                                        reflected under Account Status and
                                        outstanding balance.
                                    </p>
                                    {(guestData?.roomServiceOrders?.length ??
                                        0) > 0 ? (
                                        <div className="overflow-x-auto rounded-lg border bg-white">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-gray-50 text-left">
                                                        <th className="p-3 font-medium">
                                                            Order
                                                        </th>
                                                        <th className="p-3 font-medium">
                                                            Date
                                                        </th>
                                                        <th className="p-3 font-medium">
                                                            Items
                                                        </th>
                                                        <th className="p-3 font-medium text-right">
                                                            Amount
                                                        </th>
                                                        <th className="p-3 font-medium">
                                                            Payment
                                                        </th>
                                                        <th className="p-3 font-medium">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {guestData?.roomServiceOrders?.map(
                                                        (o: RoomFolioOrder) => {
                                                            const rawStatus =
                                                                String(
                                                                    o.paymentStatus ||
                                                                        '',
                                                                ).toUpperCase();
                                                            let badgeClass =
                                                                'bg-gray-100 text-gray-600';
                                                            if (
                                                                rawStatus ===
                                                                    'ADDED_TO_BILL' ||
                                                                rawStatus ===
                                                                    'BILL_SETTLED_FROM_FRONT_DESK' ||
                                                                rawStatus ===
                                                                    'PAID'
                                                            ) {
                                                                badgeClass =
                                                                    'bg-green-100 text-green-600';
                                                            } else if (
                                                                rawStatus ===
                                                                'PENDING'
                                                            ) {
                                                                badgeClass =
                                                                    'bg-orange-100 text-orange-600';
                                                            } else if (
                                                                rawStatus ===
                                                                'COMPLEMENTED'
                                                            ) {
                                                                badgeClass =
                                                                    'bg-blue-100 text-blue-600';
                                                            } else if (
                                                                rawStatus ===
                                                                'FAILED'
                                                            ) {
                                                                badgeClass =
                                                                    'bg-red-100 text-red-600';
                                                            }

                                                            const paymentLabel =
                                                                rawStatus ===
                                                                'BILL_SETTLED_FROM_FRONT_DESK'
                                                                    ? 'Bill Settled from Front Desk'
                                                                    : rawStatus ===
                                                                        'ADDED_TO_BILL'
                                                                      ? 'Posted to Room'
                                                                      : rawStatus ===
                                                                          'COMPLEMENTED'
                                                                        ? 'Complimentary'
                                                                        : rawStatus.replaceAll(
                                                                              '_',
                                                                              ' ',
                                                                          );

                                                            return (
                                                                <tr
                                                                    key={o.id}
                                                                    className="border-b last:border-0"
                                                                >
                                                                    <td className="p-3">
                                                                        #{o.id}
                                                                    </td>
                                                                    <td className="p-3 whitespace-nowrap">
                                                                        {new Date(
                                                                            o.createdAt,
                                                                        ).toLocaleString(
                                                                            'en-NG',
                                                                            {
                                                                                dateStyle:
                                                                                    'medium',
                                                                                timeStyle:
                                                                                    'short',
                                                                            },
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 max-w-[200px] truncate">
                                                                        {(
                                                                            o.items ||
                                                                            []
                                                                        )
                                                                            .map(
                                                                                (
                                                                                    it: RoomFolioLineItem,
                                                                                ) =>
                                                                                    `${it.menuItemName ?? 'Item'} ×${it.quantity}`,
                                                                            )
                                                                            .join(
                                                                                ', ',
                                                                            ) ||
                                                                            '—'}
                                                                    </td>
                                                                    <td className="p-3 text-right font-medium">
                                                                        {formatCurrency(
                                                                            o.totalPrice,
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3">
                                                                        {
                                                                            paymentLabel
                                                                        }
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <span
                                                                            className={cn(
                                                                                badgeClass,
                                                                                'inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium',
                                                                            )}
                                                                        >
                                                                            {
                                                                                paymentLabel
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t bg-gray-50 font-medium">
                                                        <td
                                                            colSpan={3}
                                                            className="p-3 text-right"
                                                        >
                                                            Subtotal
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {formatCurrency(
                                                                (
                                                                    guestData?.roomServiceOrders ||
                                                                    []
                                                                ).reduce(
                                                                    (
                                                                        sum: number,
                                                                        o: RoomFolioOrder,
                                                                    ) =>
                                                                        sum +
                                                                        Number(
                                                                            o.totalPrice ||
                                                                                0,
                                                                        ),
                                                                    0,
                                                                ),
                                                            )}
                                                        </td>
                                                        <td colSpan={2} />
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No restaurant charges on this room
                                            folio yet.
                                        </p>
                                    )}
                                </div>
                                <CustomTable
                                    filters={GuestServiceFilters}
                                    columns={GuestServiceColumn}
                                    data={guestServices?.data ?? []}
                                    extend={
                                        <CustomSheet
                                            noTitle
                                            title="Add Guest Service"
                                            open={guestServiceOpen}
                                            setOpen={setGuestServiceOpen}
                                            trigger={
                                                <Button className="bg-orion-blue hover:bg-orion-blue">
                                                    Add Guest Service
                                                </Button>
                                            }
                                        >
                                            <GuestServiceForm
                                                onSubmit={handleServiceSubmit}
                                                onClose={() =>
                                                    setGuestServiceOpen(false)
                                                } // ✅ passed here
                                            />
                                        </CustomSheet>
                                    }
                                />
                                {(guestServices?.data?.length ?? 0) > 0 && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border bg-white p-4 mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            {guestServices?.data?.length}{' '}
                                            {guestServices?.data?.length === 1
                                                ? 'service'
                                                : 'services'}{' '}
                                            total
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    Unpaid:{' '}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        unpaidServicesTotal,
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    Paid:{' '}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        paidServicesTotal,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="border-l pl-6">
                                                <span className="text-sm text-muted-foreground">
                                                    Total:{' '}
                                                </span>
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        guestServices?.data?.reduce(
                                                            (
                                                                sum: number,
                                                                s: any,
                                                            ) =>
                                                                sum +
                                                                Number(
                                                                    s.amount ||
                                                                        s.amountPaid ||
                                                                        0,
                                                                ),
                                                            0,
                                                        ) || 0,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="guest-history">
                            <div>
                                <CustomTable
                                    filters={GuestHistoryFilters}
                                    columns={guestHistoryColumns}
                                    data={guestHistory?.data ?? []}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="bill-audit">
                            <div className="border rounded-xl p-4 bg-muted/30">
                                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                    <h2 className="font-semibold text-base">
                                        Bill Audit Trail
                                    </h2>
                                    {guestId ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                mutate(
                                                    `/guests/bill-audit-for-guest?guestId=${profileGuestNumericId}`,
                                                );
                                            }}
                                        >
                                            Refresh audit
                                        </Button>
                                    ) : null}
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Posted/reversed/settled restaurant bill
                                    actions tied to this guest.
                                </p>
                                {(guestBillAudit?.data?.length ?? 0) > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border bg-white">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-gray-50 text-left">
                                                    <th className="p-3 font-medium">
                                                        Time
                                                    </th>
                                                    <th className="p-3 font-medium">
                                                        Action
                                                    </th>
                                                    <th className="p-3 font-medium">
                                                        Order
                                                    </th>
                                                    <th className="p-3 font-medium">
                                                        Room
                                                    </th>
                                                    <th className="p-3 font-medium">
                                                        Staff
                                                    </th>
                                                    <th className="p-3 font-medium text-right">
                                                        Amount
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {guestBillAudit?.data?.map(
                                                    (log: any) => (
                                                        <tr
                                                            key={log.id}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="p-3 whitespace-nowrap">
                                                                {new Date(
                                                                    log.createdAt,
                                                                ).toLocaleString(
                                                                    'en-NG',
                                                                    {
                                                                        dateStyle:
                                                                            'medium',
                                                                        timeStyle:
                                                                            'short',
                                                                    },
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                {String(
                                                                    log.action ||
                                                                        '',
                                                                ).replaceAll(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </td>
                                                            <td className="p-3">
                                                                {log.orderId
                                                                    ? `#${log.orderId}`
                                                                    : '—'}
                                                            </td>
                                                            <td className="p-3">
                                                                {log.roomNumber ??
                                                                    '—'}
                                                            </td>
                                                            <td className="p-3">
                                                                {log.actorName ??
                                                                    'System'}
                                                            </td>
                                                            <td className="p-3 text-right font-medium">
                                                                {formatCurrency(
                                                                    Number(
                                                                        log.amount ||
                                                                            0,
                                                                    ),
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No audit entries yet.
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </PageWrapper>
        </div>
    );
};

export default GuestProfile;
