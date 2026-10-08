'use client';

import {
    getInternalAccountById,
    updateInternalAccount,
} from '@/app/actions/internal-accounts';
import EditAccountForm from '@/components/admin/internal-accounts/EditAccountForm';
import Toast from '@/components/toast';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
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

export default function EditInternalAccountPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const [submitting, setSubmitting] = useState(false);

    const { data: account, isLoading } = useSWR(
        params?.id ? `/internal-accounts/${params.id}` : null,
        () => getInternalAccountById(params.id),
    );

    const handleSubmit = async (payload: Parameters<
        typeof updateInternalAccount
    >[1]) => {
        if (!account) return;

        setSubmitting(true);
        const result = await updateInternalAccount(account.id, payload);
        setSubmitting(false);

        if (result.error) {
            throw new Error(result.error);
        }

        await mutate(`/internal-accounts/${account.id}`);
        await mutate('/internal-accounts');

        toast.custom(() => (
            <Toast
                title="Success"
                description="Account details updated successfully."
                type="success"
            />
        ));

        router.push(`${basePath}/${account.id}`);
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
        <PageWrapper permissions={[PERMISSIONS.EDIT_INTERNAL_ACCOUNT]}>
            <PageHeader>
                <PageHeadertitle
                    title="Edit Internal Account"
                    subtitle={account.accountName}
                    hasBack
                    onBack={() => router.push(`${basePath}/${account.id}`)}
                />
            </PageHeader>

            <EditAccountForm
                account={account}
                basePath={basePath}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </PageWrapper>
    );
}
