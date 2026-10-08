'use client';

import AddFundsModal from '@/components/admin/internal-accounts/modals/AddFundsModal';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InternalAccount } from '@/types/internal-accounts';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';

interface InternalAccountActionsMenuProps {
    account: InternalAccount;
    accountId: string;
    trigger?: ReactNode;
    basePath?: string;
}

export default function InternalAccountActionsMenu({
    account,
    accountId,
    trigger,
    basePath = '/admin/internal-accounts',
}: Readonly<InternalAccountActionsMenuProps>) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [addFundsOpen, setAddFundsOpen] = useState(false);

    const detailHref = `${basePath}/${accountId}`;
    const statementHref = `${basePath}/${accountId}/transactions`;

    const handleAddFunding = () => {
        setMenuOpen(false);

        if (account.status !== 'Active') {
            toast.custom(() => (
                <Toast
                    title="Account inactive"
                    description="Funds can only be added to active accounts."
                    type="error"
                />
            ));
            return;
        }

        setAddFundsOpen(true);
    };

    const handleFundingSuccess = () => {
        toast.custom(() => (
            <Toast
                title="Funds added"
                description="Funds have been deposited into the account successfully."
                type="success"
            />
        ));
    };

    return (
        <>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                    {trigger ?? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground"
                            aria-label="Account actions"
                        >
                            <MoreVertical className="size-4" />
                        </Button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer text-sm">
                        <Link href={detailHref} onClick={() => setMenuOpen(false)}>
                            View
                        </Link>
                    </DropdownMenuItem>
                    <PermissionGate
                        permissions={[PERMISSIONS.ADD_FUNDS_TO_INTERNAL_ACCOUNT]}
                        blockType="hide"
                    >
                        <DropdownMenuItem
                            className="cursor-pointer text-sm"
                            onSelect={(event) => {
                                event.preventDefault();
                                handleAddFunding();
                            }}
                        >
                            Add Funding
                        </DropdownMenuItem>
                    </PermissionGate>
                    <PermissionGate
                        permissions={[PERMISSIONS.VIEW_INTERNAL_ACCOUNT_STATEMENT]}
                        blockType="hide"
                    >
                        <DropdownMenuItem
                            asChild
                            className="cursor-pointer text-sm"
                        >
                            <Link
                                href={statementHref}
                                onClick={() => setMenuOpen(false)}
                            >
                                Statement
                            </Link>
                        </DropdownMenuItem>
                    </PermissionGate>
                </DropdownMenuContent>
            </DropdownMenu>

            <AddFundsModal
                open={addFundsOpen}
                onOpenChange={setAddFundsOpen}
                account={account}
                onSuccess={handleFundingSuccess}
            />
        </>
    );
}
