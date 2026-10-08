import { MemberTableMeta } from '@/components/membership/table/columns/member-column';
import { Member } from '@/types/membership/membership';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

export const referralsColumn: ColumnDef<Member>[] = [
    {
        accessorKey: 'firstName',
        header: 'Referral Name',
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
        accessorKey: 'id',
        header: 'Referral Code',
        cell: ({ row }) => (
            <span className="rounded bg-blue-50 px-2 py-1 font-mono text-xs font-medium uppercase text-blue-700">
                REF-{row.original.id.slice(0, 8)}
            </span>
        ),
    },
    {
        accessorKey: 'discount',
        header: 'Discount',
        cell: () => (
            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                No discount
            </span>
        ),
    },
    {
        accessorKey: 'planOwner',
        header: 'Principal Member',
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.planOwner
                    ? `${row.original.planOwner.firstName} ${row.original.planOwner.lastName}`
                    : 'N/A'}
            </span>
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
        header: 'Tier',
        cell: ({ row }) => (
            <span className="text-sm capitalize">
                {row.original.membershipTier || 'N/A'}
            </span>
        ),
    },
    {
        accessorKey: 'totalVisits',
        header: 'Total Visits',
        cell: ({ row }) => (
            <span className="text-sm">{row.original.totalVisits || 0}</span>
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
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MemberStatusBadge status={row.original.status} />
            </div>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
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
