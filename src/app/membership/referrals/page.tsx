'use client';

import { deleteMember, getReferredMembers } from '@/app/actions/membership';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import CustomTable from '@/components/common/table/CustomTable';
import MembershipExportButton from '@/components/membership/export/MembershipExportButton';
import Header from '@/components/membership/layout/header';
import DeleteMemberDialog from '@/components/membership/members/DeleteMemberDialog';
import { RegisterMemberButton } from '@/components/membership/members/RegisterMemberButton';
import { referralsColumn } from '@/components/membership/table/columns/referrals-column';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { usePermissions } from '@/hooks/auth/usePermission';
import { Member } from '@/types/membership/membership';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const EmptyState = () => {
    return (
        <div className="flex items-center justify-center h-[80vh] w-full">
            <div className="sm:w-[700px] p-10 bg-[#F7F7F7] rounded-xl">
                <div className="items-center justify-center flex flex-col gap-4">
                    <Image
                        src={'/referrals.png'}
                        width={400}
                        height={250}
                        alt="referrals"
                    />
                    <p className="font-medium text-md text-[#031127] mt-4">
                        Manage all referred members in the system
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        View and manage members who were referred by principal
                        members
                    </p>
                </div>
            </div>
        </div>
    );
};

function ReferralsContent() {
    const [referralToDelete, setReferralToDelete] = useState<Member | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { hasPermission } = usePermissions();
    const canDeleteMembers = hasPermission(PERMISSIONS.DELETE_MEMBERS);

    const {
        data: referralsData,
        error,
        isLoading,
        mutate,
    } = useSWR('/api/referred-members', () =>
        getReferredMembers({ page: 1, limit: 100 }),
    );

    const referredMembers = useMemo(
        () => (referralsData?.data.data.referredMembers || []) as Member[],
        [referralsData?.data.data.referredMembers],
    );

    const hasReferrals = referredMembers && referredMembers.length > 0;

    const exportRows = useMemo(
        () =>
            referredMembers.map((member) => ({
                'Referral Code': `REF-${member.id.slice(0, 8)}`,
                'First Name': member.firstName,
                'Last Name': member.lastName,
                Email: member.email,
                Phone: member.phone,
                'Principal Member': member.planOwner
                    ? `${member.planOwner.firstName} ${member.planOwner.lastName}`
                    : 'N/A',
                Plan: member.plan?.name || 'No Plan',
                Tier: member.membershipTier || 'N/A',
                Status: member.status,
                Discount: 'No discount',
                'Total Visits': member.totalVisits || 0,
                'Created At': member.createdAt || '',
            })),
        [referredMembers],
    );

    const handleConfirmDelete = async () => {
        if (!referralToDelete) return;

        setIsDeleting(true);
        const result = await deleteMember(referralToDelete.id);
        setIsDeleting(false);

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        toast.success('Referral deleted successfully');
        setReferralToDelete(null);
        mutate();
    };

    if (isLoading) {
        return <SkeletonLoader type="table" rows={5} />;
    }

    if (error) {
        return (
            <div className="py-6 px-4 lg:px-8">
                <div className="text-center text-red-600">
                    Error loading referred members: {error.message}
                </div>
            </div>
        );
    }

    if (!hasReferrals) {
        return <EmptyState />;
    }

    return (
        <div className="py-6 px-4 lg:px-8">
            <PageHeader>
                <PageHeadertitle
                    title="Referrals Management"
                    subtitle="Manage All Referred Members"
                />
                <div className="ml-auto flex items-center gap-2">
                    <MembershipExportButton
                        data={exportRows}
                        filename="membership-referrals"
                        reportTitle="Referred members"
                        subtitle={`${referredMembers.length} referrals on file`}
                        sheetName="Referrals"
                    />
                    <RegisterMemberButton />
                </div>
            </PageHeader>

            {hasReferrals && (
                <>
                    <DeleteMemberDialog
                        member={referralToDelete}
                        open={Boolean(referralToDelete)}
                        variant="referral"
                        onOpenChange={(open) => {
                            if (!open && !isDeleting) setReferralToDelete(null);
                        }}
                        onConfirm={handleConfirmDelete}
                        isDeleting={isDeleting}
                    />
                    <div className="mt-8">
                        <CustomTable
                            data={referredMembers}
                            columns={referralsColumn}
                            meta={{
                                onRequestDeleteMember: canDeleteMembers
                                    ? setReferralToDelete
                                    : undefined,
                                canEditMembers: hasPermission(
                                    PERMISSIONS.EDIT_MEMBERS,
                                ),
                                canDeleteMembers,
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default function ReferralsPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageWrapper className="lg:px-0 lg:py-0" permissions={[PERMISSIONS.VIEW_MEMBERS]}>
            <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <ReferralsContent />
        </PageWrapper>
    );
}
