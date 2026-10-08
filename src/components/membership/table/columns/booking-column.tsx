import { formatMemberFullName } from '@/lib/membership/member-utils';
import { formatDate, formatTime } from '@/lib/utils';
import { BookingStatus, MemberBooking } from '@/types/membership/membership';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown } from 'lucide-react';
import BookingAction from '../BookingAction';

export const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    const statusColorMap: { [key in BookingStatus]: string } = {
        [BookingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
        [BookingStatus.CONFIRMED]: 'bg-green-100 text-green-800',
        [BookingStatus.CANCELLED]: 'bg-red-100 text-red-800',
        [BookingStatus.COMPLETED]: 'bg-green-100 text-green-800',
    };

    const statusMap: { [key in BookingStatus]: string } = {
        [BookingStatus.PENDING]: 'Pending',
        [BookingStatus.CONFIRMED]: 'Confirmed',
        [BookingStatus.CANCELLED]: 'Cancelled',
        [BookingStatus.COMPLETED]: 'Completed',
    };

    return (
        <span className={`${baseClasses} ${statusColorMap[status]}`}>
            {statusMap[status]}
        </span>
    );
};

export const bookingColumn: ColumnDef<MemberBooking>[] = [
    {
        accessorKey: 'member',
        header: 'Member Name',
        cell: ({ row }) => (
            <span>{formatMemberFullName(row.original.member)}</span>
        ),
    },
    {
        accessorKey: 'facility',
        header: 'Facility',
        cell: ({ row }) => (
            <span>{row.original.facility?.name ?? 'Unknown facility'}</span>
        ),
    },
    {
        accessorKey: 'startTime',
        header: 'Start Time',
        cell: ({ row }) => (
            <span>
                {row.original.startTime
                    ? formatTime(row.original.startTime)
                    : '—'}
            </span>
        ),
    },
    {
        accessorKey: 'endTime',
        header: 'End Time',
        cell: ({ row }) => (
            <span>
                {row.original.endTime
                    ? formatTime(row.original.endTime)
                    : '—'}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: () => (
            <div className="flex items-center">
                Status
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) =>
            row.original.status ? (
                <BookingStatusBadge status={row.original.status} />
            ) : (
                <span>—</span>
            ),
    },
    {
        id: 'bookingDate',
        header: 'Booking Date',
        cell: ({ row }) => (
            <span>
                {row.original.startTime
                    ? formatDate(row.original.startTime)
                    : '—'}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => <BookingAction booking={row.original} />,
    },
];
