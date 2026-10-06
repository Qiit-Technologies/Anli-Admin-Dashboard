import { formatDate } from '@/lib/helpers';
import { formatCurrency } from '@/lib/utils';
import {
    GuestServiceHistory,
    Member,
    Purchase,
    ServiceUsageSummary,
    VisitLog,
} from '@/types/membership/membership';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { MemberStatusBadge } from './member-column';

const AccessResultBadge = ({ result }: { result: string }) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    const colorMap: { [key: string]: string } = {
        granted: 'bg-green-100 text-green-800',
        denied: 'bg-red-100 text-red-800',
    };

    return (
        <span
            className={`${baseClasses} ${colorMap[result] || 'bg-gray-100 text-gray-800'}`}
        >
            {result.charAt(0).toUpperCase() + result.slice(1)}
        </span>
    );
};

const formatVisitTime = (time?: string) => {
    if (!time) return 'N/A';

    const [hour = '0', minute = '0'] = time.split(':');
    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const guestServiceHistoryColumns: ColumnDef<GuestServiceHistory>[] = [
    {
        accessorKey: 'date',
        header: 'Time',
        cell: ({ row }) => <span>{formatDate(row.original.date)}</span>,
    },
    {
        accessorKey: 'facility',
        header: 'Service/Area',
        cell: ({ row }) => <span>{row.original.facility?.name}</span>,
    },
    {
        accessorKey: 'bookedBy',
        header: 'Booked By',
        cell: ({ row }) => (
            <span className="lowercase">
                {row.original.bookedBy?.fullName ||
                    row.original.bookedBy?.email}
            </span>
        ),
    },
];

export const serviceUsageSummaryColumns: ColumnDef<ServiceUsageSummary>[] = [
    {
        accessorKey: 'service',
        header: 'Service',
        cell: ({ row }) => <span>{row.original.service.name}</span>,
    },
    {
        accessorKey: 'lastUsed',
        header: 'Last Used',
        cell: ({ row }) => <span>{formatDate(row.original.lastUsed)}</span>,
    },
    {
        accessorKey: 'totalVisits',
        header: 'Total Visits',
        cell: ({ row }) => (
            <span>{row.original.totalVisits.toLocaleString()}</span>
        ),
    },
];

export const visitLogsColumns: ColumnDef<VisitLog>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.original.date;
            return <span>{formatDate(date)}</span>;
        },
    },
    {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => <span>{formatVisitTime(row.original.time)}</span>,
    },
    {
        accessorKey: 'checkInType',
        header: () => (
            <div className="flex items-center">
                Check-in Type
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => (
            <span>{row.original.checkInType.replace('_', ' ')}</span>
        ),
    },
    {
        accessorKey: 'facility',
        header: () => (
            <div className="flex items-center">
                Facility
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => <span>{row.original.facility}</span>,
    },
    {
        accessorKey: 'accessResult',
        header: () => (
            <div className="flex items-center">
                Access Result
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => (
            <AccessResultBadge result={row.original.accessResult} />
        ),
    },
    {
        accessorKey: 'notes',
        header: 'Details',
        cell: ({ row }) => (
            <span className="block max-w-[260px] whitespace-normal text-sm text-gray-700">
                {row.original.notes || 'N/A'}
            </span>
        ),
    },
];

export const purchaseHistoryColumns: ColumnDef<Purchase>[] = [
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => <span>{formatDate(row.original.date)}</span>,
    },
    {
        accessorKey: 'facility',
        header: 'Item',
        cell: ({ row }) => <span>{row.original.facility.name}</span>,
    },
    {
        accessorKey: 'amount',
        header: () => (
            <div className="flex items-center">
                Amount
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => <span>{formatCurrency(row.original.amount)}</span>,
    },
];

export const guestHistoryMemberColumns: ColumnDef<Member>[] = [
    {
        accessorKey: 'firstName',
        header: 'Full Name',
        cell: ({ row }) => (
            <span>
                {row.original.firstName} {row.original.lastName}
            </span>
        ),
    },
    {
        accessorKey: 'membershipTier',
        header: 'Role',
        cell: ({ row }) => (
            <span className="capitalize">{row.original.membershipTier}</span>
        ),
    },
    {
        accessorKey: 'plan',
        header: () => (
            <div className="flex items-center">
                Plan
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => <span>{row.original.plan?.name || 'N/A'}</span>,
    },
    {
        accessorKey: 'lastVisitDate',
        header: () => (
            <div className="flex items-center">
                Last Visit
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => (
            <span>
                {row.original.lastVisitDate
                    ? formatDate(row.original.lastVisitDate)
                    : 'No visits yet'}
            </span>
        ),
    },
    {
        accessorKey: 'totalSpend',
        header: () => (
            <div className="flex items-center">
                Total Spend
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => (
            <span>{formatCurrency(row.original.totalSpend || 0)}</span>
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
        cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <div className="text-[#667085] cursor-pointer">
                <Link
                    href={`/membership/guest-history/${row.original.id}`}
                    className="hover:underline text-orion-blue"
                >
                    View History
                </Link>
            </div>
        ),
    },
];
