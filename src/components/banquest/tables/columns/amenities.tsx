import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import AmenityAction from '../AmenityAction';
import { AmenitiesExtended } from '../../types';

const amenityStatusStyles = {
    available: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    'not available': {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const AmenityFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'available', label: 'Available' },
            { value: 'not available', label: 'Not Available' },
        ],
    },
];

export const AmenityColumns: ColumnDef<AmenitiesExtended>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
        accessorKey: 'type',
        header: 'Amenity Type',
        cell: ({ row }) => <span>{row.original.type}</span>,
    },
    {
        accessorKey: 'quantity',
        header: 'Total Quantity',
        cell: ({ row }) => <span>{row.original.quantity}</span>,
    },
    {
        accessorKey: 'remaining',
        header: 'Remaining',
        cell: ({ row }) => <span>{row.original.remaining}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original?.status?.toLowerCase();
            return (
                <div
                    className={cn(
                        amenityStatusStyles[
                            status as keyof typeof amenityStatusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            amenityStatusStyles[
                                status as keyof typeof amenityStatusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            amenityStatusStyles[
                                status as keyof typeof amenityStatusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs capitalize',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => <AmenityAction amenity={row.original} />,
    },
];
