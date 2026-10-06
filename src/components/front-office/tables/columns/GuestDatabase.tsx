import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import Link from 'next/link';

export type GuestDatabase = {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    nationality: string | null;
    customerType: string | null;
    loyaltyTier: string | null;
    visits: number;
    lastVisit: string | null;
    outstanding: number;
    guestId?: string;
};

const getCustomerTypeStyle = (type: string | null) => {
    if (!type) return { bg: 'bg-gray-100', text: 'text-gray-600' };

    const normalizedType = type.toLowerCase();
    if (normalizedType === 'both') {
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    } else if (normalizedType === 'restaurant') {
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
    } else if (normalizedType === 'hotel') {
        return { bg: 'bg-orange-50', text: 'text-orange-600' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600' };
};

const getLoyaltyTierStyle = (tier: string | null) => {
    if (!tier) return { bg: 'bg-gray-100', text: 'text-gray-600' };

    const normalizedTier = tier.toLowerCase();
    if (normalizedTier === 'platinum') {
        return { bg: 'bg-purple-100', text: 'text-purple-700' };
    } else if (normalizedTier === 'gold') {
        return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    } else if (normalizedTier === 'silver') {
        return { bg: 'bg-gray-200', text: 'text-gray-700' };
    } else if (normalizedTier === 'bronze') {
        return { bg: 'bg-orange-100', text: 'text-orange-700' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600' };
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return 'N/A';
    }
};

export const useGuestDatabaseColumns = (): ColumnDef<GuestDatabase>[] => {
    return [
        {
            accessorKey: 'guestId',
            header: 'Guest ID',
            cell: ({ row }) => {
                const guestId = row.original.guestId || `Goo${row.original.id}`;
                return <span className="font-medium">{guestId}</span>;
            },
        },
        {
            accessorKey: 'fullName',
            header: 'Full Name',
            cell: ({ row }) => (
                <span className="truncate max-w-[150px] block">
                    {row.original.fullName || 'N/A'}
                </span>
            ),
        },
        {
            accessorKey: 'customerType',
            header: 'Customer Type',
            cell: ({ row }) => {
                const type = row.original.customerType || 'N/A';
                const style = getCustomerTypeStyle(row.original.customerType);
                return (
                    <span
                        className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            style.bg,
                            style.text,
                        )}
                    >
                        {type}
                    </span>
                );
            },
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone Num',
            cell: ({ row }) => (
                <span className="truncate max-w-[120px] block">
                    {row.original.phoneNumber || 'N/A'}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <span className="truncate max-w-[180px] block">
                    {row.original.email || 'N/A'}
                </span>
            ),
        },
        {
            accessorKey: 'nationality',
            header: 'Nationality',
            cell: ({ row }) => (
                <span className="truncate max-w-[120px] block">
                    {row.original.nationality || 'N/A'}
                </span>
            ),
        },
        {
            accessorKey: 'loyaltyTier',
            header: 'Loyalty Tier',
            cell: ({ row }) => {
                const tier = row.original.loyaltyTier || 'N/A';
                const style = getLoyaltyTierStyle(row.original.loyaltyTier);
                return (
                    <span
                        className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            style.bg,
                            style.text,
                        )}
                    >
                        {tier}
                    </span>
                );
            },
        },
        {
            accessorKey: 'visits',
            header: 'Visits',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.visits || 0}</span>
            ),
        },
        {
            accessorKey: 'lastVisit',
            header: 'Last Visit',
            cell: ({ row }) => (
                <span>{formatDate(row.original.lastVisit)}</span>
            ),
        },
        {
            accessorKey: 'outstanding',
            header: 'Outstanding Balance',
            cell: ({ row }) => {
                const outstanding = row.original.outstanding || 0;
                return (
                    <span
                        className={cn(
                            'font-medium',
                            outstanding > 0 ? 'text-red-500' : 'text-gray-600',
                        )}
                    >
                        {outstanding > 0
                            ? formatCurrency(outstanding)
                            : formatCurrency(0)}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => {
                return (
                    <Link
                        href={`/front-office/guest-database/${row.original.id}`}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-auto px-3"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </Button>
                    </Link>
                );
            },
        },
    ];
};
