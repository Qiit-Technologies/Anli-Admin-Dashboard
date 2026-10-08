'use client';

import { getGroupInvoices } from '@/app/actions/group-reservation';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

type Invoice = {
    reservationId: string | number;
    guestName?: string;
    roomNumber?: string;
    totalAmount?: number;
    outstanding?: number;
};

export function InvoicesPanel({
    booking,
    onClose,
}: {
    booking: GroupBooking;
    onClose: () => void;
}) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                if (!booking.backendId) return;
                const data = await getGroupInvoices(booking.backendId);
                if (active) setInvoices(data?.invoices || []);
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, [booking.backendId]);

    return (
        <>
            {loading ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    Loading invoices...
                </p>
            ) : invoices.length === 0 ? (
                <p className="rounded-lg border border-gray-100 p-4 text-sm text-muted-foreground">
                    No invoices for this group yet.
                </p>
            ) : (
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {invoices.map((invoice) => (
                        <div
                            key={String(invoice.reservationId)}
                            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-medium">
                                    {invoice.guestName || 'Guest'}
                                </p>
                                <p className="font-mono text-xs text-muted-foreground">
                                    {invoice.reservationId}
                                    {invoice.roomNumber
                                        ? ` · room ${invoice.roomNumber}`
                                        : ''}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="font-semibold tabular-nums text-emerald-600">
                                    {formatCurrency(invoice.totalAmount ?? 0)}
                                </p>
                                <p className="text-xs tabular-nums text-muted-foreground">
                                    {formatCurrency(invoice.outstanding ?? 0)}{' '}
                                    outstanding
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ActionFooter onCancel={onClose} />
        </>
    );
}
