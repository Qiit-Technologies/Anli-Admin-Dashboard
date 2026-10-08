import { formatCurrency, formatDate } from '@/lib/utils';
import { TUser } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown } from 'lucide-react';
import PlanTableAction from '../plan-table-action';

export interface MembershipPlan {
    id: number;
    name: string;
    price: number;
    numberOfReferrals: number;
    maxDurationMonths: number;
    createdBy: TUser;
    createdAt: string;
    updatedAt: string;
    referralTiers?: ReferralTier[];
}

export interface ReferralTier {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export const planStatusFilter = [
    {
        label: 'All',
        value: '',
    },
    {
        label: 'Active',
        value: 'true',
    },
    {
        label: 'Inactive',
        value: 'false',
    },
];

export const PlanStatusBadge = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    return (
        <span
            className={`${baseClasses} ${
                isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export const planColumn: ColumnDef<MembershipPlan>[] = [
    {
        accessorKey: 'name',
        header: 'Plan Name',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-gray-500">
                    {row.original.referralTiers?.length || 0} tiers
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
            <span className="font-medium">
                {formatCurrency(row.original.price)}
            </span>
        ),
    },
    {
        accessorKey: 'numberOfReferrals',
        header: 'Max Referrals',
        cell: ({ row }) => <span>{row.original.numberOfReferrals}</span>,
    },
    {
        accessorKey: 'maxDurationMonths',
        header: 'Duration',
        cell: ({ row }) => <span>{row.original.maxDurationMonths} months</span>,
    },
    {
        accessorKey: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => (
            <span className="text-sm text-gray-600 lowercase">
                {row.original.createdBy.fullName ??
                    row.original.createdBy.email}
            </span>
        ),
    },
    {
        accessorKey: 'updatedAt',
        header: () => (
            <div className="flex items-center">
                Last Updated
                <ArrowDown size={16} color="#667085" className="ml-1" />
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-gray-600">
                {formatDate(row.original.updatedAt)}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <PlanTableAction row={row} />,
    },
];
