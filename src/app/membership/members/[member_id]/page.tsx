'use client';

import MemberProfile from '@/components/membership/members/memberProfile';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { useParams } from 'next/navigation';

export default function Page() {
    const { member_id } = useParams();

    const memberIdStr = Array.isArray(member_id) ? member_id[0] : member_id;

    if (!memberIdStr) return null;

    return (
        <PageWrapper permissions={[PERMISSIONS.VIEW_MEMBERS]}>
            <div className="min-h-screen flex flex-col sm:flex-row">
                <div className="flex-1 flex flex-col">
                    <main className="px-4 sm:px-8 md:px-12 py-10 space-y-6 ">
                        <MemberProfile member_id={memberIdStr} />
                    </main>
                </div>
            </div>
        </PageWrapper>
    );
}
