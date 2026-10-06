'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { resolveDraftGuestDisplayName } from '@/lib/front-office/draft-guest-name';
import {
    resolveDraftBatchLineLabel,
    resolveDraftInvoiceDisplayNumber,
} from '@/lib/front-office/draft-invoice-display';
import type { DraftInvoice } from '@/types/draft-invoice';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowRightLeft,
    Download,
    Eye,
    History,
    Pencil,
    Printer,
    Trash2,
} from 'lucide-react';

export type DraftInvoiceRowActions = {
    onView: (draft: DraftInvoice) => void;
    onPrint: (draft: DraftInvoice) => void;
    onDownload: (draft: DraftInvoice) => void;
    onAudit: (draft: DraftInvoice) => void;
    onEdit: (draft: DraftInvoice) => void;
    onConvert: (draft: DraftInvoice) => void;
    onDelete: (draft: DraftInvoice) => void;
};

export function useDraftInvoiceColumns(
    actions: DraftInvoiceRowActions,
): ColumnDef<DraftInvoice>[] {
    return [
        {
            accessorKey: 'invoiceNumber',
            header: 'Invoice No.',
            cell: ({ row }) => {
                const displayNumber = resolveDraftInvoiceDisplayNumber(
                    row.original,
                );
                const batchLabel = resolveDraftBatchLineLabel(row.original);
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{displayNumber}</span>
                        {batchLabel ? (
                            <span className="text-xs text-muted-foreground">
                                Line {batchLabel}
                            </span>
                        ) : null}
                    </div>
                );
            },
        },
        {
            id: 'guestName',
            header: 'Guest Name',
            cell: ({ row }) => resolveDraftGuestDisplayName(row.original),
        },
        {
            accessorKey: 'checkInDate',
            header: 'Check-In',
            cell: ({ row }) => {
                const items = row.original.lineItems ?? [];
                if (items.length > 1) {
                    const dates = items
                        .map((item) => item.checkInDate)
                        .filter(Boolean)
                        .sort();
                    if (dates.length > 1) {
                        return `${format(new Date(dates[0]!), 'dd MMM yyyy')} – ${format(new Date(dates.at(-1)!), 'dd MMM yyyy')}`;
                    }
                }
                return row.original.checkInDate
                    ? format(new Date(row.original.checkInDate), 'dd MMM yyyy')
                    : '—';
            },
        },
        {
            accessorKey: 'checkOutDate',
            header: 'Check-Out',
            cell: ({ row }) => {
                const items = row.original.lineItems ?? [];
                if (items.length > 1) {
                    const dates = items
                        .map((item) => item.checkOutDate)
                        .filter(Boolean)
                        .sort();
                    if (dates.length > 1) {
                        return `${format(new Date(dates[0]!), 'dd MMM yyyy')} – ${format(new Date(dates.at(-1)!), 'dd MMM yyyy')}`;
                    }
                }
                return row.original.checkOutDate
                    ? format(new Date(row.original.checkOutDate), 'dd MMM yyyy')
                    : '—';
            },
        },
        {
            accessorKey: 'roomTypeSummary',
            header: 'Room Type',
            cell: ({ row }) => (
                <span className="line-clamp-2 max-w-[180px]">
                    {row.original.roomTypeSummary || '—'}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ row }) => formatCurrency(row.original.amount),
        },
        {
            accessorKey: 'createdAt',
            header: 'Date Created',
            cell: ({ row }) =>
                format(new Date(row.original.createdAt), 'dd MMM yyyy'),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const variant =
                    status === 'converted' ? 'secondary' : 'outline';
                return (
                    <Badge variant={variant} className="capitalize">
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const draft = row.original;
                const isDraft = draft.status === 'draft';

                return (
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="View"
                            onClick={() => actions.onView(draft)}
                        >
                            <Eye className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Print"
                            onClick={() => actions.onPrint(draft)}
                        >
                            <Printer className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Download PDF"
                            onClick={() => actions.onDownload(draft)}
                        >
                            <Download className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Activity log"
                            onClick={() => actions.onAudit(draft)}
                        >
                            <History className="size-4" />
                        </Button>
                        {isDraft && (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title="Edit"
                                    onClick={() => actions.onEdit(draft)}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title="Convert to reservation"
                                    onClick={() => actions.onConvert(draft)}
                                >
                                    <ArrowRightLeft className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title="Delete"
                                    onClick={() => actions.onDelete(draft)}
                                >
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];
}
