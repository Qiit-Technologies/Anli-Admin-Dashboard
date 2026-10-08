'use client';

import MenuPackageThumbnail from '@/components/banquest/menu/MenuPackageThumbnail';
import MenuPackageActions from '@/components/banquest/menu/tables/MenuPackageActions';
import { MenuPackageRow } from '@/components/banquest/menu/types';
import { MENU_CATEGORY_STYLES } from '@/components/banquest/menu/utils/menu-packages';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

export const MenuPackageColumns: ColumnDef<MenuPackageRow>[] = [
    {
        accessorKey: 'name',
        header: 'Menu Package Name',
        cell: ({ row }) => {
            const pkg = row.original;
            return (
                <div className="flex items-center gap-3 min-w-[200px]">
                    <MenuPackageThumbnail
                        category={pkg.category}
                        imageUrl={pkg.imageUrl}
                        size="sm"
                    />
                    <div className="min-w-0">
                        <Link
                            href={`/banquet/menu-details/${encodeURIComponent(pkg.id)}`}
                            className="font-semibold text-gray-900 hover:text-orion-blue"
                        >
                            {pkg.name}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {pkg.description}
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
            const styles = MENU_CATEGORY_STYLES[cat];
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize',
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
        accessorKey: 'mealType',
        header: 'Meal Type',
        cell: ({ row }) => (
            <span className="text-gray-900">{row.original.mealType}</span>
        ),
    },
    {
        accessorKey: 'itemCount',
        header: 'Items',
        cell: ({ row }) => (
            <span className="text-gray-900">
                {row.original.itemCount} Items
            </span>
        ),
    },
    {
        id: 'priceRange',
        header: 'Price Range',
        cell: ({ row }) => {
            const { priceMin, priceMax } = row.original;
            return (
                <div>
                    <p className="font-bold text-gray-900">
                        {formatMoney(priceMin)} - {formatMoney(priceMax)}
                    </p>
                    <p className="text-xs text-muted-foreground">Per Guest</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Menu Status',
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
            const active = row.original.status === 'active';
            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                        active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-orange-50 text-orange-700',
                    )}
                >
                    {active ? 'Active' : 'Un-available'}
                </span>
            );
        },
    },
    {
        id: 'lastUpdated',
        header: 'Last Updated',
        cell: ({ row }) => (
            <div>
                <p className="font-medium text-gray-900 capitalize">
                    {row.original.lastUpdated}
                </p>
                <p className="text-xs text-muted-foreground">
                    {row.original.lastUpdatedTime}
                </p>
            </div>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <MenuPackageActions pkg={row.original} />,
    },
];
