import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { useState } from 'react';

export interface Facility {
    id: number;
    name: string;
    image?: string;
    category: string;
    // category: {
    //     id: number;
    //     name: string;
    // };
    isBookable: boolean;
    status: 'active' | 'suspended';
    fee?: number;
    createdAt: string;
    updatedAt: string;
}

export const facilityStatusFilter = [
    {
        label: 'All',
        value: '',
    },
    {
        label: 'Active',
        value: 'active',
    },
    {
        label: 'Suspended',
        value: 'suspended',
    },
];

export const facilityBookableFilter = [
    {
        label: 'All',
        value: '',
    },
    {
        label: 'Bookable',
        value: 'true',
    },
    {
        label: 'Non-Bookable',
        value: 'false',
    },
];

export const FacilityStatusBadge = ({
    status,
}: {
    status: 'active' | 'suspended';
}) => {
    const [isActive, setIsActive] = useState(status === 'active');
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Switch
                checked={isActive}
                className="w-6 h-3 data-[state=checked]:bg-hexbrand"
                onCheckedChange={(checked) => {
                    setIsActive(checked);
                }}
            />
        </div>
    );
};

export const BookableBadge = ({ isBookable }: { isBookable: boolean }) => {
    return (
        <Checkbox
            checked={isBookable}
            // onCheckedChange={(checked) =>
            //     onAccessChange(facilityId, 'principal', !!checked)
            // }
            className="w-5 h-5 place-self-center shadow-none data-[state=unchecked]:bg-[#F4F4F4] data-[state=unchecked]:border-[#D9D9D9] data-[state=checked]:bg-hexbrand data-[state=checked]:border-hexbrand"
        />
    );
};

export const facilityColumn: ColumnDef<Facility>[] = [
    {
        accessorKey: 'name',
        header: 'Facility Name',
        cell: ({ row }) => (
            <div className="flex items-center text-left space-x-3">
                {row.original.image ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                            src={row.original.image}
                            alt={row.original.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">
                            {row.original.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-gray-500 capitalize">
                        {row.original.category}
                    </span>
                </div>
            </div>
        ),
        meta: {
            className: 'text-left',
        },
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
            <span className="text-sm capitalize">{row.original.category}</span>
        ),
    },
    {
        accessorKey: 'isBookable',
        header: 'Bookable',
        cell: ({ row }) => (
            <BookableBadge isBookable={row.original.isBookable} />
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <FacilityStatusBadge status={row.original.status} />,
    },
    {
        accessorKey: 'fee',
        header: 'Fee (per hour)',
        cell: ({ row }) => (
            <span className="font-medium">
                {row.original.fee
                    ? `${formatCurrency(row.original.fee)}`
                    : 'Free'}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
    },
];
