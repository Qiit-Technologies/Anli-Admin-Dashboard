'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Recipe, recipeTotalCost, recipeCostPerUnit } from './types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const recipeColumns: ColumnDef<Recipe>[] = [
    {
        accessorKey: 'name',
        header: 'Recipe',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.name}</div>
                {row.original.description && (
                    <div className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {row.original.description}
                    </div>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'outputItemName',
        header: 'Produces',
        cell: ({ row }) => (
            <span className="font-medium">
                {row.original.outputItemName || `#${row.original.outputItemId}`}{' '}
                <span className="text-muted-foreground">
                    × {row.original.outputQuantity}
                    {row.original.outputUnit ? ` ${row.original.outputUnit}` : ''}
                </span>
            </span>
        ),
    },
    {
        accessorKey: 'ingredientCount',
        header: 'Ingredients',
        cell: ({ row }) => (
            <span>
                {row.original.ingredientCount ??
                    (row.original.ingredients?.length || 0)}
            </span>
        ),
    },
    {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        cell: ({ row }) => (
            <span className="font-medium">
                {formatCurrency(recipeTotalCost(row.original))}
            </span>
        ),
    },
    {
        accessorKey: 'costPerUnit',
        header: 'Cost / Unit',
        cell: ({ row }) => (
            <span>{formatCurrency(recipeCostPerUnit(row.original))}</span>
        ),
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={
                    row.original.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-muted text-muted-foreground'
                }
            >
                {row.original.isActive ? 'Active' : 'Inactive'}
            </Badge>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) =>
            row.original.createdAt ? (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(row.original.createdAt), 'dd MMM yyyy')}
                </span>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/stock/recipes/${row.original.id}`}>
                            View recipe
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={`/stock/production/create?recipe=${row.original.id}`}>
                            Produce batch
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
