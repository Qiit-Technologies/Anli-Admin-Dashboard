'use client';

import { formatAccountDate } from '@/lib/internal-accounts/format';
import { InternalAccount } from '@/types/internal-accounts';
import { ReactNode } from 'react';

function OverviewField({
    label,
    value,
}: Readonly<{
    label: string;
    value: ReactNode;
}>) {
    return (
        <div>
            <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

export default function InternalAccountOverview({
    account,
}: Readonly<{ account: InternalAccount }>) {
    return (
        <div className="rounded-lg border bg-card">
            <div className="border-b p-4">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Account Overview
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
                <div className="space-y-6">
                    <OverviewField
                        label="Account Name"
                        value={account.accountName}
                    />
                    <OverviewField
                        label="Approval Required"
                        value={account.approvalRequired ? 'Yes' : 'No'}
                    />
                    <OverviewField
                        label="Contact Phone"
                        value={account.contactPhone}
                    />
                </div>
                <div className="space-y-6">
                    <OverviewField
                        label="Owner/Responsible"
                        value={account.owner}
                    />
                    <OverviewField label="Status" value={account.status} />
                    <OverviewField
                        label="Date created"
                        value={formatAccountDate(account.dateCreated)}
                    />
                </div>
                <div className="space-y-6">
                    <OverviewField
                        label="Contact Email"
                        value={account.contactEmail}
                    />
                    <OverviewField
                        label="Account Type"
                        value={account.accountType}
                    />
                    <OverviewField
                        label="Reference Number"
                        value={account.referenceNumber ?? '—'}
                    />
                </div>
            </div>
        </div>
    );
}
