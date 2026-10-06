'use client';

import AmenityThumbnail from '@/components/banquest/amenities/AmenityThumbnail';
import { RentedItemRow } from '@/components/banquest/rented-items/types';
import {
    RENTED_CONDITION_STYLES,
    RENTED_STATUS_STYLES,
} from '@/components/banquest/rented-items/utils/rented-item-styles';
import RentedItemDetailDialog from '@/components/banquest/rented-items/RentedItemDetailDialog';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export const RentedItemTableColumns: ColumnDef<RentedItemRow>[] = [
    {
        accessorKey: 'amenityName',
        header: 'Amenities Name',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex min-w-[200px] items-center gap-3">
                    <AmenityThumbnail
                        src={item.imageUrl}
                        alt={item.amenityName}
                    />
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                            {item.amenityName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {item.amenitySubtitle}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'renterName',
        header: 'Renter',
        cell: ({ row }) => (
            <div>
                <p className="text-xs text-muted-foreground">
                    {row.original.renterPhone}
                </p>
                <p className="font-semibold text-gray-900">
                    {row.original.renterName}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'rentedDate',
        header: 'Rented date',
        cell: ({ row }) => (
            <div>
                <p className="font-medium text-gray-900">
                    {row.original.rentedDate}
                </p>
                <p className="text-xs text-muted-foreground">
                    {row.original.rentedTime}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'eventType',
        header: 'Event Type',
        cell: ({ row }) => (
            <span className="text-gray-700">{row.original.eventType}</span>
        ),
    },
    {
        accessorKey: 'dueDate',
        header: 'Due date',
        cell: ({ row }) => (
            <div>
                <p className="font-medium text-gray-900">
                    {row.original.dueDate}
                </p>
                <p className="text-xs text-muted-foreground">
                    {row.original.dueTime}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'rentedQuantity',
        header: 'Rented',
        cell: ({ row }) => (
            <span className="text-gray-700">
                {row.original.rentedQuantity}
            </span>
        ),
    },
    {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ row }) => {
            const cond = row.original.condition;
            const styles = RENTED_CONDITION_STYLES[cond];
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                        styles.bg,
                        styles.text,
                    )}
                >
                    {styles.label}
                </span>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
            const status = row.original.status;
            const styles = RENTED_STATUS_STYLES[status];
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                        styles.bg,
                        styles.text,
                    )}
                >
                    {styles.label}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <RentedItemDetailDialog item={row.original} />,
    },
];
