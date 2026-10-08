'use client';

import { InternalAccountTypeBadge } from '@/components/admin/internal-accounts/InternalAccountBadges';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';
import { InternalAccountFormDraft } from '@/types/internal-accounts';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { formatAccountDate } from '@/lib/internal-accounts/format';
import { ReactNode } from 'react';

function ReviewField({
    label,
    value,
}: Readonly<{
    label: string;
    value: ReactNode;
}>) {
    return (
        <div>
            <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
            <div className="text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}

interface InternalAccountReviewCardProps {
    draft: InternalAccountFormDraft;
    footer?: ReactNode;
    showEdit?: boolean;
}

export default function InternalAccountReviewCard({
    draft,
    footer,
    showEdit = true,
}: Readonly<InternalAccountReviewCardProps>) {
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);

    return (
        <div className="rounded-lg border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
                <div>
                    <h2 className="text-base font-semibold tracking-tight">
                        Review Internal Account details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kindly review all information below
                    </p>
                </div>
                {showEdit && (
                    <Button
                        asChild
                        size="sm"
                        className="h-9 bg-orion-blue text-white hover:bg-orion-blue/90"
                    >
                        <Link href={`${basePath}/new`}>
                            <Pencil className="mr-1.5 size-4" />
                            Edit account
                        </Link>
                    </Button>
                )}
            </div>

            <div className="space-y-4 p-4">
                <div className="rounded-lg border border-border/80 p-4">
                    <h3 className="mb-5 text-sm font-semibold">
                        Account information
                    </h3>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                        <ReviewField
                            label="Account Name"
                            value={draft.accountName}
                        />
                        <ReviewField
                            label="Owner/Responsible"
                            value={draft.owner}
                        />
                        <ReviewField
                            label="Contact Email"
                            value={draft.contactEmail}
                        />
                        <ReviewField
                            label="Account Type"
                            value={
                                <InternalAccountTypeBadge
                                    type={draft.accountType}
                                />
                            }
                        />
                        <ReviewField
                            label="Approval Required"
                            value={draft.approvalRequired ? 'Yes' : 'No'}
                        />
                        <ReviewField label="Status" value="Active" />
                        <ReviewField
                            label="Account Type"
                            value={draft.accountType}
                        />
                        <ReviewField
                            label="Opening Balance"
                            value={formatCurrency(draft.openingBalance)}
                        />
                        <ReviewField
                            label="Contact Phone"
                            value={draft.contactPhone}
                        />
                        <ReviewField
                            label="Date created"
                            value={formatAccountDate(new Date())}
                        />
                        <ReviewField
                            label="Reference Number"
                            value={draft.referenceNumber || '—'}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-border/80 p-4">
                    <h3 className="mb-5 text-sm font-semibold">Description</h3>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <ReviewField
                            label="Description"
                            value={draft.description || '—'}
                        />
                        <ReviewField
                            label="Funding Source Note"
                            value={draft.fundingSourceNote || '—'}
                        />
                    </div>
                </div>
            </div>

            {footer && (
                <div className="flex justify-end border-t p-4">{footer}</div>
            )}
        </div>
    );
}
