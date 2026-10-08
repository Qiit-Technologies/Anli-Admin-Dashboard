'use client';

import {
    approveInternalAccountBill,
    getPendingInternalAccountBillApprovals,
    PendingInternalAccountBill,
    rejectInternalAccountBill,
} from '@/app/actions/internal-accounts-ledger';
import { PostedBillStatusBadge } from '@/components/admin/internal-accounts/ledger/LedgerBadges';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

function formatDate(value: string) {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PendingInternalAccountBills() {
    const { data = [], isLoading } = useSWR(
        'pending-ia-bill-approvals',
        getPendingInternalAccountBillApprovals,
    );
    const [busyId, setBusyId] = useState<string | null>(null);

    const refresh = async (accountId?: string) => {
        await mutate('pending-ia-bill-approvals');
        await mutate('/internal-accounts');
        await mutate('/internal-accounts/stats');
        if (accountId) {
            await mutate(`/internal-accounts/${accountId}`);
            await mutate(`/internal-accounts/${accountId}/posted-bills`);
            await mutate(`/internal-accounts/${accountId}/transactions`);
            await mutate(`/internal-accounts/${accountId}/ledger-stats`);
        }
    };

    const handleAction = async (
        bill: PendingInternalAccountBill,
        action: 'approve' | 'reject',
    ) => {
        setBusyId(bill.id);
        const result =
            action === 'approve'
                ? await approveInternalAccountBill(bill.id)
                : await rejectInternalAccountBill(bill.id);
        setBusyId(null);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        toast.custom(() => (
            <Toast
                title={
                    action === 'approve'
                        ? bill.approvalType === 'reversal'
                            ? 'Reversal approved'
                            : 'Bill approved'
                        : bill.approvalType === 'reversal'
                          ? 'Reversal rejected'
                          : 'Bill rejected'
                }
                description={
                    action === 'approve'
                        ? bill.approvalType === 'reversal'
                            ? 'Internal Account balance and guest receivable have been restored.'
                            : 'Internal Account balance has been updated.'
                        : bill.approvalType === 'reversal'
                          ? 'Bill remains approved. No balance change.'
                          : 'Balance was not changed.'
                }
                type="success"
            />
        ));
        await refresh(bill.accountId);
        await mutate('/orders/query/all');
        await mutate('/orders/query/running');
        await mutate('/orders/query/ready');
        await mutate('/orders/query/settled');
        await mutate('list-data');
        await mutate('/checkedInGuests');
    };

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground py-6">
                Loading Internal Account bill approvals…
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">
                    No Internal Account bills or reversals pending approval
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                <span className="col-span-2">Invoice</span>
                <span className="col-span-2">Account</span>
                <span className="col-span-2">Guest</span>
                <span className="col-span-1">Type</span>
                <span className="col-span-1">Amount</span>
                <span className="col-span-2">Posted</span>
                <span className="col-span-2 text-right">Actions</span>
            </div>
            {data.map((bill) => (
                <div
                    key={bill.id}
                    className="grid grid-cols-12 gap-2 items-center px-3 py-3 border-t text-sm"
                >
                    <div className="col-span-2">
                        <p className="font-medium">{bill.invoiceNo}</p>
                        <PostedBillStatusBadge status={bill.status} />
                    </div>
                    <div className="col-span-2">
                        <p className="font-medium">{bill.accountCode}</p>
                        <p className="text-xs text-muted-foreground">
                            {bill.accountName}
                        </p>
                    </div>
                    <div className="col-span-2">
                        <p>{bill.guestCustomer || '—'}</p>
                        <p className="text-xs text-muted-foreground">
                            {bill.roomTableNo || '—'}
                        </p>
                    </div>
                    <div className="col-span-1 text-xs">
                        {bill.approvalType === 'reversal'
                            ? 'Reversal'
                            : bill.sourceModule}
                    </div>
                    <div className="col-span-1 font-medium">
                        {formatCurrency(bill.billAmount)}
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                        <p>{formatDate(bill.postedDate || bill.billDate)}</p>
                        <p>By {bill.postedBy || '—'}</p>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.APPROVE_INTERNAL_ACCOUNT_TRANSACTIONS,
                            ]}
                            blockType="hide"
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === bill.id}
                                onClick={() => handleAction(bill, 'reject')}
                            >
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                className="bg-orion-blue text-white hover:bg-orion-blue/90"
                                disabled={busyId === bill.id}
                                onClick={() => handleAction(bill, 'approve')}
                            >
                                Approve
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
            ))}
        </div>
    );
}
