import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import {
    bookingStatusLabel,
    eventStatusLabel,
    formatBookingRef,
    formatEventDateCell,
    getEventLifecycleStatus,
    paymentStatusLabel,
} from '../../utils/booking-display';
import { BookingForm } from '../../types';
import BookingActionsMenu from '../BookingActionsMenu';

const paymentStatusStyles = {
    paid: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
    },
    partial: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
    },
    pending: {
        bg: 'bg-red-50',
        text: 'text-red-600',
    },
};

const bookingStatusStyles = {
    confirmed: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
    },
    cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-600',
    },
    tentative: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
    },
};

const eventStatusStyles = {
    upcoming: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
    },
    ongoing: {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
    },
    completed: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
    },
};

function StatusPill({
    label,
    styles,
}: {
    label: string;
    styles: { bg: string; text: string };
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                styles.bg,
                styles.text,
            )}
        >
            {label}
        </span>
    );
}

export const BookingFilters = [
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'paid', label: 'Paid' },
            { value: 'partial', label: 'Partially Paid' },
            { value: 'pending', label: 'Unpaid' },
        ],
    },
    {
        id: 'bookingStatus',
        label: 'Booking Status',
        options: [
            { value: 'confirmed', label: 'Approved' },
            { value: 'cancelled', label: 'Cancelled' },
        ],
    },
    {
        id: 'eventStatus',
        label: 'Event Status',
        options: [
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'ongoing', label: "Today's Event" },
            { value: 'completed', label: 'Completed' },
        ],
    },
    {
        id: 'eventVenue',
        label: 'Booking Venue',
        options: [],
    },
];

export const BookingColumns: ColumnDef<BookingForm>[] = [
    {
        accessorKey: 'id',
        header: 'Booking ID',
        cell: ({ row }) => (
            <span className="font-medium text-gray-900">
                {formatBookingRef(row.original.id)}
            </span>
        ),
    },
    {
        accessorKey: 'eventType',
        header: 'Event Type',
        cell: ({ row }) => (
            <span className="text-gray-900">{row.original.eventType}</span>
        ),
    },
    {
        id: 'client',
        header: 'Client',
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                    {row.original.customerName}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                    {row.original.customerPhoneNumber}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'eventVenue',
        header: 'Venue',
        cell: ({ row }) => (
            <span className="text-gray-900">{row.original.eventVenue}</span>
        ),
    },
    {
        accessorKey: 'eventDate',
        header: 'Event Date',
        cell: ({ row }) => {
            const { dateLine, timeLine, relativeLine } = formatEventDateCell(
                row.original.eventDate,
                row.original.eventTime,
            );
            return (
                <div className="min-w-[140px]">
                    <p className="font-medium text-gray-900 capitalize">
                        {dateLine}
                    </p>
                    {timeLine ? (
                        <p className="text-sm text-gray-700">{timeLine}</p>
                    ) : null}
                    {relativeLine ? (
                        <p className="text-xs text-muted-foreground">
                            {relativeLine}
                        </p>
                    ) : null}
                </div>
            );
        },
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const key =
                (row.original.paymentStatus?.toLowerCase() as keyof typeof paymentStatusStyles) ||
                'pending';
            return (
                <StatusPill
                    label={paymentStatusLabel(row.original.paymentStatus)}
                    styles={paymentStatusStyles[key] ?? paymentStatusStyles.pending}
                />
            );
        },
    },
    {
        accessorKey: 'bookingStatus',
        header: 'Booking Status',
        cell: ({ row }) => {
            const raw = row.original.bookingStatus?.toLowerCase();
            const key =
                raw === 'confirmed' || raw === 'cancelled'
                    ? raw
                    : 'tentative';
            return (
                <StatusPill
                    label={bookingStatusLabel(row.original.bookingStatus)}
                    styles={
                        bookingStatusStyles[key as keyof typeof bookingStatusStyles] ??
                        bookingStatusStyles.tentative
                    }
                />
            );
        },
    },
    {
        id: 'eventStatus',
        header: 'Event Status',
        accessorFn: (row) => getEventLifecycleStatus(row),
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
            const lifecycle = getEventLifecycleStatus(row.original);
            return (
                <StatusPill
                    label={eventStatusLabel(lifecycle)}
                    styles={eventStatusStyles[lifecycle]}
                />
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <BookingActionsMenu booking={row.original} />,
    },
];
