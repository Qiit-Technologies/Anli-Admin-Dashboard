'use client';

import { createInternalAccount } from '@/app/actions/internal-accounts';
import InternalAccountReviewCard from '@/components/admin/internal-accounts/InternalAccountReviewCard';
import Toast from '@/components/toast';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import {
    clearInternalAccountDraft,
    loadInternalAccountDraft,
} from '@/lib/internal-accounts/draft';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';
import { InternalAccountFormDraft } from '@/types/internal-accounts';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { PERMISSIONS } from '@/components/permission/data/permissions';

export default function ReviewInternalAccountPage() {
    const router = useRouter();
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const [draft, setDraft] = useState<InternalAccountFormDraft | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const saved = loadInternalAccountDraft();
        if (!saved) {
            router.replace(`${basePath}/new`);
            return;
        }
        setDraft(saved);
    }, [basePath, router]);

    const handleCreate = async () => {
        if (!draft) return;

        setSubmitting(true);
        const result = await createInternalAccount({
            accountName: draft.accountName,
            owner: draft.owner,
            contactEmail: draft.contactEmail,
            contactPhone: draft.contactPhone,
            accountType: draft.accountType,
            approvalRequired: draft.approvalRequired,
            openingBalance: draft.openingBalance,
            description: draft.description,
            fundingSourceNote: draft.fundingSourceNote,
            referenceNumber: draft.referenceNumber,
        });
        setSubmitting(false);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        clearInternalAccountDraft();
        await mutate('/internal-accounts');
        await mutate('/internal-accounts/stats');

        toast.custom(() => (
            <Toast
                title="Success"
                description="Account created successfully"
                type="success"
            />
        ));
        router.push(basePath);
    };

    if (!draft) {
        return null;
    }

    return (
        <PageWrapper permissions={[PERMISSIONS.CREATE_INTERNAL_ACCOUNT]}>
            <PageHeader>
                <PageHeadertitle
                    title="Create Internal Account"
                    subtitle="New internal ledger account registration"
                />
            </PageHeader>

            <InternalAccountReviewCard
                draft={draft}
                footer={
                    <Button
                        className="h-10 min-w-[200px] bg-orion-blue px-8 text-white hover:bg-orion-blue/90"
                        onClick={handleCreate}
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create Account'}
                    </Button>
                }
            />
        </PageWrapper>
    );
}
