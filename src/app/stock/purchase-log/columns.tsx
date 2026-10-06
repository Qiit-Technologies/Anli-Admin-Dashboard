'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PurchaseLog } from './types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const purchaseLogColumns = (router: any): ColumnDef<PurchaseLog>[] => [
    {
        accessorKey: 'purchaseDate',
        header: 'Date',
        cell: ({ row }) => {
            const date = new Date(
                row.original.purchaseDate || row.original.createdAt,
            );
            return (
                <div className="flex flex-col">
                    <span className="font-medium">
                        {format(date, 'dd/MM/yy')}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'logId',
        header: 'Log ID',
    },
    {
        accessorKey: 'totalItems',
        header: 'Total Items',
    },
    {
        accessorKey: 'totalCost',
        header: 'Total Cost (₦)',
        cell: ({ row }) => formatCurrency(Number(row.original.totalCost || 0)),
    },
    {
        accessorKey: 'receivedBy',
        header: 'Received By',
        cell: ({ row }: any) =>
            row.original.receivedBy?.fullName ||
            row.original.receivedBy ||
            '---',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                            className="font-medium py-3 cursor-pointer"
                            onClick={() =>
                                router.push(
                                    `/stock/purchase-log/${row.original.id}`,
                                )
                            }
                        >
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="font-medium py-3 cursor-pointer"
                            onClick={() =>
                                router.push(
                                    `/stock/purchase-log/${row.original.id}/manage`,
                                )
                            }
                        >
                            Manage Items
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
