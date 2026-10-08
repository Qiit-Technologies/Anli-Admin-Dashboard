'use client';

import InternalAccountForm from '@/components/admin/internal-accounts/InternalAccountForm';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import {
    loadInternalAccountDraft,
    saveInternalAccountDraft,
} from '@/lib/internal-accounts/draft';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';
import { InternalAccountFormDraft } from '@/types/internal-accounts';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PERMISSIONS } from '@/components/permission/data/permissions';

export default function NewInternalAccountPage() {
    const router = useRouter();
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const [draft, setDraft] = useState<InternalAccountFormDraft | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setDraft(loadInternalAccountDraft());
        setReady(true);
    }, []);

    const handleContinue = (formDraft: InternalAccountFormDraft) => {
        saveInternalAccountDraft(formDraft);
        router.push(`${basePath}/new/review`);
    };

    if (!ready) {
        return null;
    }

    return (
        <PageWrapper permissions={[PERMISSIONS.CREATE_INTERNAL_ACCOUNT]}>
            <PageHeader>
                <PageHeadertitle
                    title="Create Internal Account"
                    subtitle="New internal ledger account registration"
                    hasBack
                    onBack={() => router.push(basePath)}
                />
            </PageHeader>

            <InternalAccountForm
                defaultValues={draft ?? undefined}
                onSubmit={handleContinue}
            />
        </PageWrapper>
    );
}
