import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { Reservation } from '@/types/reservation';
import useHotel from '@/hooks/useHotel';
import { ColumnDef } from '@tanstack/react-table';
import {
    BadgePercent,
    Ban,
    CircleHelp,
    Gift,
    MoreVertical,
    Users,
} from 'lucide-react';
import { LuHotel } from 'react-icons/lu';

export const ReservationFilters = [
    {
        id: 'status',
        label: 'Reservation Status',
        options: [
            { value: 'GOOD', label: 'Good' },
            { value: 'BAD', label: 'Bad' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'CANCELLED', label: 'Cancelled' },
        ],
    },
    {
        id: 'discountType',
        label: 'Discount Type',
        options: [
            { value: 'PERCENTAGE', label: 'Percentage' },
            { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
        ],
    },
];

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
        return <Ban className="w-5 h-5" />;
    }
    if (reservation.isComplimentary) {
        return <Gift className="w-5 h-5" />;
    }
    if (reservation.discountType) {
        return <BadgePercent className="w-5 h-5" />;
    }
    return <LuHotel className="w-5 h-5" />;
};

export const useReservationColumns = (): ColumnDef<Reservation>[] => {
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    return [
        {
            accessorKey: 'fullName',
            header: () => (
                <div>
                    <span className="flex items-center gap-2">
                        {"Guest's Full Name"} <CircleHelp className="w-4 h-4" />
                    </span>
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {' '}
                    <div
                        className={cn(
                            'w-8 h-8 rounded-sm text-white flex items-center justify-center',
                            renderBgColor(row.original),
                        )}
                    >
                        {renderIcon(row.original)}
                    </div>
                    <span>{row.original.fullName}</span>
                </div>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone Number',
            cell: ({ row }) => <span>{row.original.phoneNumber}</span>,
        },
        {
            accessorKey: 'startDate',
            header: 'Check-In',
            cell: ({ row }) => {
                const date = new Date(row.original.startDate);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            },
        },
        {
            accessorKey: 'endDate',
            header: 'Check-Out',
            cell: ({ row }) => {
                const date = new Date(row.original.endDate);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            },
        },
        {
            accessorKey: 'roomNumber',
            header: 'Room',
            cell: ({ row }) => (
                <span>
                    {row.original.room?.roomNumber}
                    {showRoman && row.original.room?.roomNumberRoman
                        ? ` (${row.original.room?.roomNumberRoman})`
                        : ''}{' '}
                    / {row.original.roomType?.name}
                </span>
            ),
        },
        {
            accessorKey: 'numberOfGuests',
            header: 'Guests',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {row.original.numberOfGuests}
                </div>
            ),
        },
        {
            accessorKey: 'amountPaid',
            header: 'Paid',
            cell: ({ row }) => (
                <span>{formatCurrency(row.original.amountPaid)}</span>
            ),
        },
        {
            accessorKey: 'outstanding',
            header: 'Balance',
            cell: ({ row }) => {
                // Check for payable balance first (credit/overpayment)
                const payableBalance =
                    row.original.payableBalance !== undefined &&
                    row.original.payableBalance !== null
                        ? Math.max(0, Number(row.original.payableBalance))
                        : 0;

                // Only check receivable if no payable exists
                const receivableBalance =
                    payableBalance > 0
                        ? 0
                        : row.original.totalDue !== undefined &&
                            row.original.totalDue !== null
                          ? Number(row.original.totalDue)
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
            },
        },
        {
            accessorKey: 'isVoid',
            header: 'Status',
            cell: ({ row }) => {
                if (row.original.isVoid)
                    return (
                        <div className="flex items-center gap-1 text-red-500">
                            <Ban className="w-4 h-4" /> Void
                        </div>
                    );
                if (row.original.isComplimentary)
                    return (
                        <div className="flex items-center gap-1 text-yellow-600">
                            <Gift className="w-4 h-4" /> Complimentary
                        </div>
                    );
                if (row.original.discountType)
                    return (
                        <div className="flex items-center gap-1 text-blue-600">
                            <BadgePercent className="w-4 h-4" /> Discount
                        </div>
                    );
                if (row.original.isCheckedIn)
                    return (
                        <div className="flex items-center gap-1 text-green-600">
                            <LuHotel className="w-4 h-4" /> Checked In
                        </div>
                    );
                return <div className="text-muted-foreground">Reserved</div>;
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Booked On',
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            },
        },
        {
            id: 'actions',
            header: '',
            cell: () => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            ),
        },
    ];
};
