'use client';

import {
    InternalAccountStatusBadge,
    InternalAccountTypeBadge,
} from '@/components/admin/internal-accounts/InternalAccountBadges';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { InternalAccount } from '@/types/internal-accounts';
import { ChevronLeft, Download, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';

interface InternalAccountDetailHeaderProps {
    account: InternalAccount;
    basePath?: string;
    onCloseAccount?: () => void;
    onAddFunds?: () => void;
    onPrint?: () => void;
}

const orangeOutline =
    'h-9 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700';

export default function InternalAccountDetailHeader({
    account,
    basePath = '/admin/internal-accounts',
    onCloseAccount,
    onAddFunds,
    onPrint,
}: Readonly<InternalAccountDetailHeaderProps>) {
    return (
        <div className="mb-6 space-y-4">
            <Link
                href={basePath}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
                <ChevronLeft className="size-4" />
                Back
            </Link>

            <div className="bg-white p-8 rounded-lg border flex flex-col gap-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                                {formatCurrency(account.currentBalance)}
                            </h1>
                            <InternalAccountStatusBadge
                                status={account.status}
                            />
                            <Switch
                                checked={account.status === 'Active'}
                                disabled
                                className="data-[state=checked]:bg-orion-blue"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-medium text-foreground">
                                {account.accountName}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span className="font-mono text-muted-foreground">
                                {account.accountCode}
                            </span>
                            <InternalAccountTypeBadge
                                type={account.accountType}
                            />
                        </div>

                        {account.description && (
                            <p className="text-sm text-muted-foreground">
                                {account.description}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                        <PermissionGate
                            permissions={[PERMISSIONS.VIEW_INTERNAL_ACCOUNT_AUDIT_TRAIL]}
                            blockType="hide"
                        >
                            <Button
                                asChild
                                variant="outline"
                                className={orangeOutline}
                            >
                                <Link
                                    href={`${basePath}/${account.id}/posted-bills`}
                                >
                                    Posted Bills
                                </Link>
                            </Button>
                        </PermissionGate>
                        <PermissionGate
                            permissions={[PERMISSIONS.VIEW_INTERNAL_ACCOUNT_STATEMENT]}
                            blockType="hide"
                        >
                            <Button
                                asChild
                                variant="outline"
                                className={orangeOutline}
                            >
                                <Link
                                    href={`${basePath}/${account.id}/transactions`}
                                >
                                    All Transactions
                                </Link>
                            </Button>
                        </PermissionGate>
                        <PermissionGate
                            permissions={[PERMISSIONS.CLOSE_INTERNAL_ACCOUNT]}
                            blockType="hide"
                        >
                            <Button
                                className="h-9 bg-orange-500 text-white hover:bg-orange-600"
                                onClick={onCloseAccount}
                            >
                                Close Account
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <PermissionGate
                        permissions={[PERMISSIONS.ADD_FUNDS_TO_INTERNAL_ACCOUNT]}
                        blockType="hide"
                    >
                        <Button
                            variant="outline"
                            className={orangeOutline}
                            onClick={onAddFunds}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Add Funds
                        </Button>
                    </PermissionGate>
                    <PermissionGate
                        permissions={[PERMISSIONS.EDIT_INTERNAL_ACCOUNT]}
                        blockType="hide"
                    >
                        <Button asChild variant="outline" className="h-9">
                            <Link href={`${basePath}/${account.id}/edit`}>
                                <Pencil className="mr-1.5 size-4" />
                                Edit Account
                            </Link>
                        </Button>
                    </PermissionGate>
                    <PermissionGate
                        permissions={[
                            PERMISSIONS.EXPORT_INTERNAL_ACCOUNT_STATEMENT,
                        ]}
                        blockType="hide"
                    >
                        <Button
                            variant="outline"
                            className="h-9"
                            onClick={onPrint}
                        >
                            <Download className="mr-1.5 size-4" />
                            Print Detail
                        </Button>
                    </PermissionGate>
                </div>
            </div>
        </div>
    );
}
