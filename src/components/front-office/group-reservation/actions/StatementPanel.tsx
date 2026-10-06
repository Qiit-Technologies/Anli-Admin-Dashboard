'use client';

import { getGroupStatement } from '@/app/actions/group-reservation';
import { formatCurrency } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { GroupBooking } from '../types';
import { ActionFooter } from './ActionFooter';

type Statement = {
    groupName?: string;
    totalGuests?: number;
    totalRooms?: number;
    totalAmount?: number;
    totalDeposits?: number;
    totalDiscounts?: number;
    outstandingBalance?: number;
    masterFolio?: {
        totalAmount?: number;
        totalDeposits?: number;
        outstandingBalance?: number;
    };
};

export function StatementPanel({
    booking,
    onClose,
    onGenerate,
}: {
    booking: GroupBooking;
    onClose: () => void;
    onGenerate: () => void;
}) {
    const [statement, setStatement] = useState<Statement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                if (!booking.backendId) return;
                const data = await getGroupStatement(booking.backendId);
                if (active) setStatement(data);
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
                    Loading statement...
                </p>
            ) : (
                <div className="space-y-3 rounded-lg border border-gray-100 p-4 text-sm">
                    <Row
                        label="Group"
                        value={statement?.groupName || booking.name}
                    />
                    <Row
                        label="Stay"
                        value={`${booking.startDate} > ${booking.endDate}`}
                    />
                    <Row
                        label="Total Guests"
                        value={String(statement?.totalGuests ?? 0)}
                    />
                    <Row
                        label="Total Rooms"
                        value={String(statement?.totalRooms ?? 0)}
                    />
                    <Row
                        label="Total Amount"
                        value={formatCurrency(statement?.totalAmount ?? 0)}
                    />
                    <Row
                        label="Total Deposits"
                        value={formatCurrency(statement?.totalDeposits ?? 0)}
                    />
                    <Row
                        label="Total Discounts"
                        value={formatCurrency(statement?.totalDiscounts ?? 0)}
                    />
                    <Row
                        label="Outstanding Balance"
                        value={formatCurrency(
                            statement?.outstandingBalance ?? 0,
                        )}
                        emphasis
                    />
                    {statement?.masterFolio &&
                    (Number(statement.masterFolio.totalAmount) > 0 ||
                        Number(statement.masterFolio.totalDeposits) > 0 ||
                        Number(statement.masterFolio.outstandingBalance) >
                            0) ? (
                        <Row
                            label="Master folio"
                            value={formatCurrency(
                                statement.masterFolio.totalAmount ?? 0,
                            )}
                        />
                    ) : null}
                </div>
            )}
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Generate Statement',
                    icon: <FileText className="size-4" />,
                    onClick: onGenerate,
                }}
            />
        </>
    );
}

function Row({
    label,
    value,
    emphasis,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={
                    emphasis
                        ? 'font-semibold tabular-nums text-emerald-600'
                        : 'font-medium tabular-nums'
                }
            >
                {value}
            </span>
        </div>
    );
}
