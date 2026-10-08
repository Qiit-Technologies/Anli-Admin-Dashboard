import { formatDate } from '@/lib/utils';
import { Member } from '@/types/membership/membership';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, Trash2 } from 'lucide-react';
import Link from 'next/link';

export type MemberTableMeta = {
    onRequestDeleteMember?: (_member: Member) => void;
    canEditMembers?: boolean;
    canDeleteMembers?: boolean;
};

export const MemberStatusBadge = ({ status }: { status: string }) => {
    const baseClasses = 'px-2 py-1 w-fit rounded-full text-xs font-medium';

    const statusColorMap: { [key: string]: string } = {
        active: 'bg-green-100 text-green-800',
        expired: 'bg-red-100 text-red-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-yellow-100 text-yellow-800',
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
export const memberColumn: ColumnDef<Member>[] = [
    {
        accessorKey: 'firstName',
        header: 'Full Name',
        cell: ({ row }) => (
            <span>
                {row.original.firstName} {row.original.lastName}
            </span>
        ),
    },
    // {
    //     accessorKey: 'id',
    //     header: 'Membership ID',
    //     cell: ({ row }) => <span>{`${row.original.id}`}</span>,
    // },
    {
        accessorKey: 'plan',
        header: 'Plan',
        cell: ({ row }) => <span>{row.original.plan?.name || 'No Plan'}</span>,
    },
    {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
            <span>
                {row.original.startDate
                    ? formatDate(row.original.startDate)
                    : 'N/A'}
            </span>
        ),
    },
    {
        accessorKey: 'referrals',
        header: 'Referrals',
        cell: ({ row }) => (
            <span>{row.original.referredMembers?.length || 0}</span>
        ),
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <span>{row.original.phone}</span>,
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
        cell: ({ row, table }) => {
            const meta = table.options.meta as MemberTableMeta | undefined;
            const canEdit = meta?.canEditMembers !== false;
            const canDelete =
                Boolean(meta?.canDeleteMembers) &&
                Boolean(meta?.onRequestDeleteMember);

            return (
                <div className="flex flex-row gap-5 text-[#667085]">
                    <Link
                        href={`/membership/members/${row.original.id}`}
                        className="text-orion-blue hover:underline"
                    >
                        View
                    </Link>
                    {canEdit && (
                        <Link
                            href={`/membership/members/${row.original.id}/edit`}
                            className="text-orion-blue hover:underline"
                        >
                            Edit
                        </Link>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            onClick={() =>
                                meta?.onRequestDeleteMember?.(row.original)
                            }
                            className="inline-flex items-center gap-1 text-red-600 hover:underline"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    )}
                </div>
            );
        },
    },
];
