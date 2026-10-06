'use client';

import {
    closeInternalAccount,
    getInternalAccountById,
} from '@/app/actions/internal-accounts';
import { createLedgerTransaction } from '@/app/actions/internal-accounts-ledger';
import { buildFundingTransactionPayload } from '@/lib/internal-accounts/funding';
import { printInternalAccountDetail } from '@/lib/internal-accounts/print';
import { AddFundsFormValues } from '@/types/internal-accounts';
import { useUser } from '@/context/useUser';
import InternalAccountDetailHeader from '@/components/admin/internal-accounts/InternalAccountDetailHeader';
import InternalAccountOverview from '@/components/admin/internal-accounts/InternalAccountOverview';
import InternalAccountStatCards from '@/components/admin/internal-accounts/InternalAccountStatCards';
import CloseAccountModal from '@/components/admin/internal-accounts/modals/CloseAccountModal';
import AddFundsModal from '@/components/admin/internal-accounts/modals/AddFundsModal';
import Toast from '@/components/toast';
import PageWrapper from '@/components/common/PageWrapper';
import DashboardLoader from '@/components/DashboardLoader';
import { Button } from '@/components/ui/button';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { PERMISSIONS } from '@/components/permission/data/permissions';

export default function InternalAccountDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const { user } = useUser();
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [addFundsModalOpen, setAddFundsModalOpen] = useState(false);
    const [submittingFunds, setSubmittingFunds] = useState(false);

    const { data: account, isLoading } = useSWR(
        params?.id ? `/internal-accounts/${params.id}` : null,
        () => getInternalAccountById(params.id),
    );

    const handleCloseAccount = async () => {
        if (!account) return;

        const result = await closeInternalAccount(account.id);
        if (result.error) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={result.error ?? 'Failed to close account.'}
                    type="error"
                />
            ));
            return;
        }

        await mutate(`/internal-accounts/${account.id}`);
        await mutate('/internal-accounts');
        await mutate('/internal-accounts/stats');

        toast.custom(() => (
            <Toast
                title="Account closed"
                description="This internal account has been closed successfully."
                type="success"
            />
        ));
    };

    const handleViewStatement = () => {
        if (!account) return;
        router.push(`${basePath}/${account.id}/transactions`);
    };

    const handleProceedToRefund = () => {
        toast.custom(() => (
            <Toast
                title="Coming soon"
                description="Refund flow will be available in a future update."
                type="success"
            />
        ));
    };

    const handleAddFundsSubmit = async (values: AddFundsFormValues) => {
        if (!account) return;
        setSubmittingFunds(true);

        const initiatedBy =
            user?.fullName || account.responsiblePerson || 'Admin';
        const payload = buildFundingTransactionPayload(
            account,
            values,
            initiatedBy,
        );

        const result = await createLedgerTransaction(account.id, payload);

        setSubmittingFunds(false);

        if (result.error) {
            throw new Error(result.error);
        }

        await mutate(`/internal-accounts/${account.id}`);
        await mutate('/internal-accounts');
        await mutate('/internal-accounts/stats');
        await mutate(`/internal-accounts/${account.id}/ledger-stats`);
        await mutate(`/internal-accounts/${account.id}/transactions`);

        toast.custom(() => (
            <Toast
                title="Funds added"
                description="Funds have been deposited into the account successfully."
                type="success"
            />
        ));
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (!account) {
        return (
            <PageWrapper>
                <p className="text-muted-foreground">Account not found.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href={basePath}>Back to list</Link>
                </Button>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper permissions={[PERMISSIONS.VIEW_INTERNAL_ACCOUNTS]}>
            <InternalAccountDetailHeader
                account={account}
                basePath={basePath}
                onCloseAccount={() => setCloseModalOpen(true)}
                onAddFunds={() => setAddFundsModalOpen(true)}
                onPrint={() => printInternalAccountDetail(account)}
            />
            <InternalAccountStatCards account={account} />
            <InternalAccountOverview account={account} />

            <CloseAccountModal
                open={closeModalOpen}
                onOpenChange={setCloseModalOpen}
                balance={account.currentBalance}
                onCloseAccount={handleCloseAccount}
                onViewStatement={handleViewStatement}
                onProceedToRefund={handleProceedToRefund}
            />

            <AddFundsModal
                open={addFundsModalOpen}
                onOpenChange={setAddFundsModalOpen}
                account={account}
                onSubmit={handleAddFundsSubmit}
                submitting={submittingFunds}
            />
        </PageWrapper>
    );
}
