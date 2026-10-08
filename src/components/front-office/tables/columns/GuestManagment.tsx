import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import useHotel from '@/hooks/useHotel';
import { cn, formatCurrency } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp, CreditCard, Phone, Printer } from 'lucide-react';
import Link from 'next/link';
import { Room } from '../../stay-view copy/types';
import { printGuestPaymentInfo } from './printGuestInfo';
type RoomType = {
    id: number;
    createdAt: string;
    name: string;
    description: string;
};

export type Guest = {
    id: number;
    fullName: string;
    email: string;
    address: string | null;
    createdAt: string;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    phoneNumber: string;
    property: string | null;
    startTime: string | null;
    endTime: string | null;
    startDate: string;
    endDate: string;
    numberOfGuests: number;
    secondGuestFullName: string;
    secondGuestPhoneNumber: string | null;
    secondGuestType: 'child' | 'adult';
    paymentMethod: 'debit' | string;
    amountPaid: number;
    outstanding: number;
    roomNumber: number;
    status: string;
    checkOutNote: string | null;
    deletedAt: string | null;
    roomType: RoomType;
    room: Room;
    roomNumberRoman?: string;
    isComplimentary?: boolean;
    isDiscounted?: boolean;
    isVoid?: boolean;
    voidReason?: string;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue?: number;
    discountReason?: string;
    originalPrice?: number;
    finalPrice?: number;
    discountAmount?: number;
    paidAmount?: number; // Comprehensive paid amount (includes services/orders)
    totalDue?: number; // Total due including services/orders/overstay fees (equals receivableBalance)
    receivableBalance?: number; // Receivable balance for this stay/reservation
    totalCost?: number; // Comprehensive total cost (room + services + orders + overstay - everything)
    vatAmount?: number;
    serviceChargeAmount?: number;
    tipAmount?: number;
    totalCustomChargesAmount?: number;
    /** Restaurant / F&B orders posted to this stay’s room (from guest info API). */
    roomServiceOrders?: Array<{
        id: number;
        requestId?: string | null;
        createdAt: string;
        totalPrice: number;
        paymentStatus: string;
        orderStatus: string;
        orderType: string;
        guestName?: string | null;
        items: Array<{
            id: number;
            menuItemName?: string;
            quantity: number;
            price: number;
        }>;
    }>;
    rebateRate?: number | string | null;
    rebateEffectiveDate?: string | null;
    rebateComment?: string | null;
    rebateAppliedAt?: string | null;
    waivedAmount?: number;
    waivedBy?: number;
    waivedAt?: string;
    waiverReason?: string;
    waivedCharges?: {
        vat?: boolean;
        serviceCharge?: boolean;
        tip?: boolean;
        customCharges?: boolean;
        waivedByName?: string;
    };
};

export type GuestContact = Guest & {
    contactStatus?: 'Checked In' | 'Upcoming' | 'Past';
};

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

export const GuestManagementFilters = [
    {
        id: 'isCheckedIn',
        label: 'Status',
        options: [
            { value: 'checkedIn', label: 'In-House' },
            { value: 'reserved', label: 'Reserved' },
        ],
    },
    {
        id: 'roomType',
        label: 'Room Type',
        options: [
            { value: 'standard', label: 'Standard' },
            { value: 'deluxe', label: 'Deluxe' },
            { value: 'suite', label: 'Suite' },
        ],
    },
];

const getPaymentBadge = (paidAmount: number, outstandingAmount: number) => {
    const paid = Number(paidAmount || 0);
    const outstanding = Number(outstandingAmount || 0);

    if (paid <= 0) {
        return {
            label: 'No Payment',
            bg: 'bg-red-100',
            text: 'text-red-700',
        };
    }
    if (outstanding > 0) {
        return {
            label: 'Partial Payment',
            bg: 'bg-amber-100',
            text: 'text-amber-800',
        };
    }
    return {
        label: 'Full Payment',
        bg: 'bg-green-100',
        text: 'text-green-700',
    };
};

export const useGuestManagementColumns = (): ColumnDef<Guest>[] => {
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    const getReservationType = (guest: Guest) => {
        if (guest.isVoid)
            return { type: 'Void', color: 'text-red-600', bg: 'bg-red-50' };
        if (guest.isComplimentary)
            return {
                type: 'Complimentary',
                color: 'text-white',
                bg: 'bg-[#007bff78]',
            };
        if (guest.isDiscounted)
            return {
                type: 'Discounted',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
            };
        return { type: 'Regular', color: 'text-green-600', bg: 'bg-green-50' };
    };

    return [
        {
            accessorKey: 'id',
            header: 'Guest ID',
            cell: ({ row }) => <span>{'#GUEST-' + row.original.id}</span>,
        },
        {
            accessorKey: 'fullName',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Full name of the guest"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Guest Name <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => (
                <span className="truncate w-40">{row.original.fullName}</span>
            ),
        },
        {
            accessorKey: 'startDate',
            header: 'CheckIn Date',
            cell: ({ row }) => {
                const date = new Date(row.original.startDate);
                const time = row.original.startTime
                    ? new Date(`1970-01-01T${row.original.startTime}`)
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

                return (
                    <div className="flex flex-col">
                        <span>{formattedDate}</span>
                        {formattedTime && (
                            <span className="text-sm text-gray-500">
                                {formattedTime}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'roomType',
            accessorFn: (row) => row.roomType?.name || '',
            header: 'Room Type / Number',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.roomType.name} </span>
                    <span>
                        {' '}
                        Room-
                        {row?.original?.room?.roomNumber}
                        {showRoman && row?.original?.room?.roomNumberRoman
                            ? ` (${row?.original?.room?.roomNumberRoman})`
                            : ''}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'reservationType',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Type of reservation (Regular, Discounted, Complimentary, Void)"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Reservation Type <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const reservationType = getReservationType(row.original);
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${reservationType.bg} ${reservationType.color}`}
                    >
                        {reservationType.type} -{' '}
                        {row.original.discountValue
                            ? row.original.discountType === 'PERCENTAGE'
                                ? ` ${row.original.discountValue}%`
                                : ` ${formatCurrency(row.original.discountValue)}`
                            : ''}
                    </span>
                );
            },
        },
        {
            accessorKey: 'paymentInfo',
            header: () => (
                <div>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Payment information including total, paid amount, and outstanding balance"
                        showArrow={true}
                    >
                        <span className="flex items-center gap-2">
                            Payment Info <CircleHelp className="w-4 h-4" />
                        </span>
                    </Tooltip>
                </div>
            ),
            cell: ({ row }) => {
                const guest = row.original;
                // Calculate comprehensive total: Use totalCost (includes everything), fallback to paidAmount + totalDue
                // Priority: totalCost > paidAmount + totalDue > calculated fallback
                // Use comprehensive paidAmount if available (includes services/orders), otherwise fallback to amountPaid
                const paid =
                    guest.paidAmount !== undefined && guest.paidAmount !== null
                        ? Number(guest.paidAmount)
                        : Number(guest.amountPaid || 0);

                // Source of truth for outstanding: take the maximum of receivableBalance, totalDue, and guest.outstanding
                // This ensures auto-billed nights on guest.outstanding are never lost
                const recVal =
                    guest.receivableBalance !== undefined &&
                    guest.receivableBalance !== null
                        ? Number(guest.receivableBalance)
                        : guest.totalDue !== undefined &&
                            guest.totalDue !== null
                          ? Number(guest.totalDue)
                          : 0;
                const outstanding = Math.max(recVal, Number(guest.outstanding || 0));

                // Calculate comprehensive total:
                // - When guest owes money (outstanding > 0): Total must be at least paid + outstanding
                // - When settled/surplus: use totalCost from backend or paid
                const backendTotal =
                    guest.totalCost !== undefined &&
                    guest.totalCost !== null &&
                    Number(guest.totalCost) > 0
                        ? Number(guest.totalCost)
                        : 0;

                const total =
                    outstanding > 0
                        ? Math.max(backendTotal, paid + outstanding)
                        : backendTotal > 0
                          ? backendTotal
                          : paid;


                const badge = getPaymentBadge(paid, outstanding);

                const baseRoomCost = Number(guest.finalPrice || guest.originalPrice || guest.room?.price || 0);
                const baseVat = Number(guest.vatAmount || 0);
                const baseSc = Number(guest.serviceChargeAmount || 0);
                const baseTip = Number(guest.tipAmount || 0);
                const baseCustom = Number(guest.totalCustomChargesAmount || 0);
                const baseDiscount = guest.isDiscounted ? Number(guest.discountAmount || 0) : 0;
                const baseTotal = Math.max(0, baseRoomCost - baseDiscount + baseVat + baseSc + baseTip + baseCustom);
                const autoBilledExtra = Math.max(0, total - baseTotal);

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-2 flex items-center gap-2 hover:bg-gray-50"
                            >
                                <CreditCard className="w-4 h-4 text-gray-500" />
                                <div className="flex flex-col items-start text-xs gap-0.5">
                                    <span className="font-medium">
                                        {formatCurrency(total)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                            <div className="space-y-3">
                                <div className="font-medium text-sm border-b pb-2">
                                    Payment Details
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Total Amount:
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                    
                                    {/* Charge Breakdown */}
                                    {guest.vatAmount !== undefined && guest.vatAmount !== null && Number(guest.vatAmount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                VAT:
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(Number(guest.vatAmount))}
                                            </span>
                                        </div>
                                    )}
                                    {guest.serviceChargeAmount !== undefined && guest.serviceChargeAmount !== null && Number(guest.serviceChargeAmount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Service Charge:
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(Number(guest.serviceChargeAmount))}
                                            </span>
                                        </div>
                                    )}
                                    {guest.tipAmount !== undefined && guest.tipAmount !== null && Number(guest.tipAmount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Tip:
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(Number(guest.tipAmount))}
                                            </span>
                                        </div>
                                    )}
                                    {guest.totalCustomChargesAmount !== undefined && guest.totalCustomChargesAmount !== null && Number(guest.totalCustomChargesAmount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Custom Charges:
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(Number(guest.totalCustomChargesAmount))}
                                            </span>
                                        </div>
                                    )}
                                    {autoBilledExtra > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Auto-Billed / Overstay:
                                            </span>
                                            <span className="font-medium text-orange-600">
                                                +{formatCurrency(autoBilledExtra)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Amount Paid:
                                        </span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(paid)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Outstanding:
                                        </span>
                                        <span
                                            className={`font-medium ${outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}
                                        >
                                            {formatCurrency(outstanding)}
                                        </span>
                                    </div>
                                    {guest.isDiscounted &&
                                        guest.discountAmount && (
                                            <>
                                                <div className="border-t pt-2 space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            Original Price:
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatCurrency(
                                                                guest.originalPrice ||
                                                                    0,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            Discount:
                                                        </span>
                                                        <span className="font-medium text-orange-600">
                                                            -
                                                            {formatCurrency(
                                                                guest.discountAmount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {autoBilledExtra > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                Auto-Billed / Overstay:
                                                            </span>
                                                            <span className="font-medium text-orange-600">
                                                                +
                                                                {formatCurrency(
                                                                    autoBilledExtra,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                </div>
                            </div>

                        </PopoverContent>
                    </Popover>
                );
            },
        },
        {
            accessorKey: 'isCheckedIn',
            header: 'Stay Info',
            filterFn: (row, columnId, filterValue) => {
                // Accepts 'checkedIn' | 'reserved' | ''
                const isChecked = Boolean(row.getValue(columnId));
                if (!filterValue) return true;
                if (filterValue === 'checkedIn') return isChecked === true;
                if (filterValue === 'reserved') return isChecked === false;
                return true;
            },
            cell: ({ row }) => {
                const status = row.original.isCheckedIn
                    ? 'checkedIn'
                    : 'reserved';
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
            },
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                const guest = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <PermissionGate
                            permissions={[PERMISSIONS.VIEW_GUEST_MANAGEMENT]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <Link
                                href={`/front-office/guest-management/profile/${guest.id}`}
                            >
                                <span className="text-orion-blue underline underline-offset-1 hover:text-orion-blue-600">
                                    View
                                </span>
                            </Link>
                        </PermissionGate>
                        <PermissionGate
                            permissions={[PERMISSIONS.VIEW_GUEST_MANAGEMENT]}
                            permissionType="any"
                            blockType="hide"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => printGuestPaymentInfo(guest.id)}
                                className="h-8 px-2"
                                title="Print Guest Payment Info"
                            >
                                <Printer className="w-4 h-4 text-gray-600" />
                            </Button>
                        </PermissionGate>
                    </div>
                );
            },
        },
        {
            accessorKey: 'waivedAmount',
            header: 'Waiver',
            cell: ({ row }) => {
                const waivedAmount = Number(row.original.waivedAmount || 0);
                if (waivedAmount <= 0) return <span className="text-gray-400">—</span>;
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-green-700 font-medium">
                            -{formatCurrency(waivedAmount)}
                        </span>
                        <span className="text-gray-500">
                            {row.original.waivedCharges?.waivedByName ||
                                (row.original.waivedBy ? `User #${row.original.waivedBy}` : '')}
                        </span>
                    </div>
                );
            },
        },
    ];
};

export const useGuestContactColumns = (): ColumnDef<GuestContact>[] => {
    return [
        {
            accessorKey: 'fullName',
            header: 'Guest Name',
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">
                    {row.original.fullName || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email Address',
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {row.original.email || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: () => (
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>Phone Number</span>
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {row.original.phoneNumber || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'contactStatus',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.contactStatus ?? 'Upcoming';
                const styles =
                    status === 'Checked In'
                        ? 'bg-green-50 text-green-600'
                        : status === 'Past'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-50 text-blue-600';
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${styles}`}
                    >
                        {status === 'Past' ? 'Past Guest' : status}
                    </span>
                );
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Last Stay',
            cell: ({ row }) => {
                const endDate = row.original.endDate
                    ? new Date(row.original.endDate)
                    : null;
                if (!endDate || Number.isNaN(endDate.getTime())) {
                    return <span className="text-gray-500">—</span>;
                }
                return (
                    <span className="text-gray-700">
                        {endDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                );
            },
        },
    ];
};
