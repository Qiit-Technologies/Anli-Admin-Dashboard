'use client';

import {
    DateTimeCell,
    EmptyCell,
    LedgerAmountCell,
} from '@/components/admin/internal-accounts/ledger/LedgerCells';
import { PostedBillStatusBadge } from '@/components/admin/internal-accounts/ledger/LedgerBadges';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { canRequestBillReversal } from '@/lib/internal-accounts/posted-bills';
import { PostedBill } from '@/types/internal-accounts-ledger';
import { ColumnDef } from '@tanstack/react-table';
import { RefreshCw } from 'lucide-react';

export function createPostedBillColumns(
    onRequestReversal: (bill: PostedBill) => void,
    reversalPermission: PERMISSIONS = PERMISSIONS.REVERSE_INTERNAL_ACCOUNT_TRANSACTIONS,
): ColumnDef<PostedBill>[] {
    return [
        {
            accessorKey: 'invoiceNo',
            header: 'Invoice No',
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.invoiceNo}
                </span>
            ),
        },
        {
            accessorKey: 'sourceModule',
            header: 'Source Module',
            cell: ({ row }) => <span>{row.original.sourceModule}</span>,
        },
        {
            accessorKey: 'guestCustomer',
            header: 'Guest / Customer',
            cell: ({ row }) => (
                <EmptyCell value={row.original.guestCustomer} />
            ),
        },
        {
            accessorKey: 'roomTableNo',
            header: 'Room / Table No',
            cell: ({ row }) => <EmptyCell value={row.original.roomTableNo} />,
        },
        {
            accessorKey: 'billDate',
            header: 'Bill Date',
            cell: ({ row }) => <DateTimeCell value={row.original.billDate} />,
        },
        {
            accessorKey: 'postedDate',
            header: 'Posted Date',
            cell: ({ row }) => (
                <DateTimeCell value={row.original.postedDate} />
            ),
        },
        {
            accessorKey: 'billAmount',
            header: 'Bill Amount',
            cell: ({ row }) => (
                <LedgerAmountCell amount={row.original.billAmount} />
            ),
        },
        {
            accessorKey: 'postedBy',
            header: 'Posted By',
            cell: ({ row }) => <span>{row.original.postedBy}</span>,
        },
        {
            accessorKey: 'approvedBy',
            header: 'Approved By',
            cell: ({ row }) => <span>{row.original.approvedBy}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <PostedBillStatusBadge status={row.original.status} />
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const bill = row.original;
                const canReverse = canRequestBillReversal(bill);

                if (!canReverse) {
                    return (
                        <span className="text-xs text-muted-foreground">—</span>
                    );
                }

                return (
                    <PermissionGate
                        permissions={[reversalPermission]}
                        blockType="hide"
                    >
                        <TooltipProvider delayDuration={150}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => onRequestReversal(bill)}
                                        aria-label="Request reversal"
                                    >
                                        <RefreshCw className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-none"
                                >
                                    Request Reversal
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </PermissionGate>
                );
            },
        },
    ];
}
