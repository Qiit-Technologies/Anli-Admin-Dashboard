import { formatDate } from '@/lib/utils';
import { Member } from '@/types/membership/membership';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';

export const MemberStatusBadge = ({ status }: { status: string }) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    const statusColorMap: { [key: string]: string } = {
        active: 'bg-green-100 text-green-800',
        expired: 'bg-red-100 text-red-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-yellow-100 text-yellow-800',
        pending: 'bg-blue-100 text-blue-800',
    };

    const statusMap: { [key: string]: string } = {
        active: 'Active',
        expired: 'Expired',
        inactive: 'Inactive',
        pending: 'Pending',
        suspended: 'Suspended',
    };

    return (
        <span className={`${baseClasses} ${statusColorMap[status]}`}>
            {statusMap[status] || status}
        </span>
    );
};

export const checkinColumn: ColumnDef<Member>[] = [
    {
        accessorKey: 'firstName',
        header: 'Guest Name',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {row.original.photoUrl ? (
                        <Image
                            src={row.original.photoUrl}
                            alt={`${row.original.firstName} ${row.original.lastName}`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                            {row.original.firstName.charAt(0)}
                            {row.original.lastName.charAt(0)}
                        </div>
                    )}
                </div>
                <span className="font-medium">
                    {row.original.firstName} {row.original.lastName}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.plan?.name || 'No Plan'}
            </span>
        ),
    },
    {
        accessorKey: 'membershipTier',
        header: 'Membership Tier',
        cell: ({ row }) => (
            <span className="text-sm capitalize">
                {row.original.membershipTier || 'N/A'}
            </span>
        ),
    },
    {
        accessorKey: 'lastVisitDate',
        header: 'Last Visited',
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.lastVisitDate
                    ? formatDate(row.original.lastVisitDate)
                    : 'Never'}
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
        cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
    },
];
