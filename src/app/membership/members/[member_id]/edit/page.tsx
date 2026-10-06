'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import ComprehensiveEditForm from '@/components/membership/members/ComprehensiveEditForm';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { useRouter } from 'nextjs-toploader/app';

export default function EditMemberPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/membership/members');
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <PageWrapper permissions={[PERMISSIONS.EDIT_MEMBERS]}>
            <PageHeader>
                <PageHeadertitle
                    hasBack
                    title="Edit Member"
                    subtitle="Update member information"
                />
            </PageHeader>
            <ComprehensiveEditForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </PageWrapper>
    );
}
