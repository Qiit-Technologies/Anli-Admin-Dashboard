'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProductionBatch, batchTotalCost, batchCostPerUnit } from './types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const productionColumns: ColumnDef<ProductionBatch>[] = [
    {
        accessorKey: 'batchNumber',
        header: 'Batch No.',
        cell: ({ row }) => (
            <span className="font-mono text-sm font-medium">
                {row.original.batchNumber || `#${row.original.id}`}
            </span>
        ),
    },
    {
        accessorKey: 'productionDate',
        header: 'Date',
        cell: ({ row }) => {
            const raw = row.original.productionDate || row.original.createdAt;
            if (!raw) return <span className="text-muted-foreground">—</span>;
            return (
                <span className="font-medium">
                    {format(new Date(raw), 'dd MMM yyyy')}
                </span>
            );
        },
    },
    {
        accessorKey: 'recipeName',
        header: 'Recipe',
        cell: ({ row }) => (
            <span className="font-medium">
                {row.original.recipeName || `#${row.original.recipeId}`}
            </span>
        ),
    },
    {
        accessorKey: 'outputQuantity',
        header: 'Output',
        cell: ({ row }) => (
            <span>
                {row.original.outputQuantity}
                {row.original.outputUnit ? ` ${row.original.outputUnit}` : ''}
                {row.original.outputItemName && (
                    <span className="text-muted-foreground">
                        {' '}
                        · {row.original.outputItemName}
                    </span>
                )}
            </span>
        ),
    },
    {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        cell: ({ row }) => (
            <span className="font-medium">
                {formatCurrency(batchTotalCost(row.original))}
            </span>
        ),
    },
    {
        accessorKey: 'costPerUnit',
        header: 'Cost / Unit',
        cell: ({ row }) => (
            <span>{formatCurrency(batchCostPerUnit(row.original))}</span>
        ),
    },
    {
        accessorKey: 'producedBy',
        header: 'Produced By',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.producedBy || '—'}
            </span>
        ),
    },
];
