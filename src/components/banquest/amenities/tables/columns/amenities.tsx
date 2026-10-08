'use client';

import AmenityThumbnail from '@/components/banquest/amenities/AmenityThumbnail';
import { AmenityRow } from '@/components/banquest/amenities/types';
import {
    AMENITY_CATEGORY_STYLES,
    AMENITY_CONDITION_STYLES,
    AMENITY_STATUS_STYLES,
} from '@/components/banquest/amenities/utils/amenity-category';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export const AmenityTableColumns: ColumnDef<AmenityRow>[] = [
    {
        accessorKey: 'name',
        header: 'Amenities Name',
        cell: ({ row }) => {
            const amenity = row.original;
            const img = amenity.images[0];
            return (
                <div className="flex min-w-[220px] items-center gap-3">
                    {img ? (
                        <AmenityThumbnail src={img} alt={amenity.name} />
                    ) : null}
                    <div className="min-w-0">
                        <Link
                            href={`/banquet/amenities/${encodeURIComponent(amenity.id)}`}
                            className="font-semibold text-gray-900 hover:text-orion-blue"
                        >
                            {amenity.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            {amenity.subtitle}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'category',
        header: 'Category',
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
            const cat = row.original.category;
            const styles = AMENITY_CATEGORY_STYLES[cat];
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                        styles.bg,
                        styles.text,
                    )}
                >
                    {row.original.categoryLabel}
                </span>
            );
        },
    },
    {
        accessorKey: 'totalQuantity',
        header: 'Total Quantity',
        cell: ({ row }) => (
            <span className="text-gray-700">{row.original.totalQuantity}</span>
        ),
    },
    {
        accessorKey: 'availability',
        header: 'Availability',
        cell: ({ row }) => (
            <span className="text-gray-700">{row.original.availability}</span>
        ),
    },
    {
        accessorKey: 'rented',
        header: 'Rented',
        cell: ({ row }) => (
            <span className="text-gray-700">{row.original.rented}</span>
        ),
    },
    {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ row }) => {
            const cond = row.original.condition;
            const styles = AMENITY_CONDITION_STYLES[cond];
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
            const styles = AMENITY_STATUS_STYLES[status];
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
        accessorKey: 'dailyRate',
        header: 'Daily Rate',
        cell: ({ row }) => (
            <span className="font-medium text-gray-900">
                {formatMoney(row.original.dailyRate)}
            </span>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <Link
                href={`/banquet/amenities/${encodeURIComponent(row.original.id)}`}
                className="text-sm font-medium text-gray-600 hover:text-orion-blue"
            >
                View
            </Link>
        ),
    },
];
