'use client';

import { getDraftInvoiceAuditTrail } from '@/app/actions/draft-invoices';
import type { DraftInvoiceAuditAction } from '@/types/draft-invoice';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import useSWR from 'swr';

const ACTION_LABELS: Record<DraftInvoiceAuditAction, string> = {
    created: 'Invoice created',
    updated: 'Invoice updated',
    viewed: 'Viewed',
    printed: 'Printed',
    downloaded: 'Downloaded as PDF',
    converted: 'Converted to reservation',
    deleted: 'Deleted',
};

interface DraftInvoiceAuditTrailProps {
    draftId: number | null | undefined;
    className?: string;
    compact?: boolean;
}

export function DraftInvoiceAuditTrail({
    draftId,
    className = '',
    compact = false,
}: DraftInvoiceAuditTrailProps) {
    const { data, error, isLoading } = useSWR(
        draftId ? `/draft-invoices/${draftId}/audit` : null,
        async () => {
            const result = await getDraftInvoiceAuditTrail(draftId!);
            if (result.error) throw new Error(result.error);
            return result.data ?? [];
        },
    );

    if (!draftId) return null;

    if (isLoading) {
        return (
            <div
                className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
            >
                <Loader2 className="size-4 animate-spin" />
                Loading activity…
            </div>
        );
    }

    if (error) {
        return (
            <p className={`text-sm text-destructive ${className}`}>
                Could not load activity log.
            </p>
        );
    }

    const entries = data ?? [];

    if (entries.length === 0) {
        return (
            <p className={`text-sm text-muted-foreground ${className}`}>
                No activity recorded yet.
            </p>
        );
    }

    return (
        <ul
            className={`divide-y divide-border rounded-md border bg-background ${className}`}
        >
            {entries.map((entry) => {
                const staffName =
                    entry.performedBy?.fullName?.trim() || 'System';
                const when = format(
                    new Date(entry.createdAt),
                    compact ? 'dd MMM yyyy, HH:mm' : 'dd MMM yyyy · HH:mm',
                );

                return (
                    <li
                        key={entry.id}
                        className={`flex flex-col gap-0.5 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">
                                {ACTION_LABELS[entry.action] ?? entry.action}
                            </span>
                            <time className="text-xs text-muted-foreground">
                                {when}
                            </time>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {staffName}
                            {entry.details ? ` — ${entry.details}` : ''}
                        </p>
                    </li>
                );
            })}
        </ul>
    );
}
