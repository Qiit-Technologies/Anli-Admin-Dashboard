'use client';

import { deleteMember, getMembers } from '@/app/actions/membership';
import PageWrapper from '@/components/common/PageWrapper';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import CustomTable from '@/components/common/table/CustomTable';
import MembershipExportButton from '@/components/membership/export/MembershipExportButton';
import Header from '@/components/membership/layout/header';
import MembershipFilterBar from '@/components/membership/filters/MembershipFilterBar';
import DeleteMemberDialog from '@/components/membership/members/DeleteMemberDialog';
import { RegisterMemberButton } from '@/components/membership/members/RegisterMemberButton';
import { memberColumn } from '@/components/membership/table/columns/member-column';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { usePermissions } from '@/hooks/auth/usePermission';
import { Member } from '@/types/membership/membership';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

type MemberListStatus =
    | 'all'
    | 'active'
    | 'expired'
    | 'expiring-soon'
    | 'inactive'
    | 'suspended'
    | 'pending';

type MemberListType = 'all' | 'new' | 'old' | 'prospective';

const statusTabs: { label: string; value: MemberListStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
    { label: 'Expiring soon', value: 'expiring-soon' },
    { label: 'Inactive', value: 'inactive' },
];

const typeTabs: { label: string; value: MemberListType }[] = [
    { label: 'All members', value: 'all' },
    { label: 'New members', value: 'new' },
    { label: 'Old members', value: 'old' },
    { label: 'Prospective', value: 'prospective' },
];

const getMemberType = (member: Member): MemberListType => {
    if (member.status === 'pending') return 'prospective';
    const createdAt = new Date(member.createdAt).getTime();
    if (Number.isNaN(createdAt)) return 'old';
    const daysSinceCreated = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 30 ? 'new' : 'old';
};

const getExportRows = (members: Member[]) =>
    members.map((member) => ({
        'Membership ID': member.membershipId || member.id,
        'First Name': member.firstName,
        'Last Name': member.lastName,
        Email: member.email,
        Phone: member.phone,
        Plan: member.plan?.name || 'No plan',
        Status: member.status,
        'Member Type': getMemberType(member),
        'Start Date': member.startDate || '',
        'End Date': member.endDate || '',
        'Total Visits': member.totalVisits || 0,
        'Total Spend': member.totalSpend || 0,
        'Last Visit': member.lastVisitDate || '',
        'Created At': member.createdAt || '',
    }));

const EmptyState = () => {
    return (
        <div className="flex items-center justify-center h-[80vh] w-full">
            <div className="sm:w-[700px] p-10 bg-[#F7F7F7] rounded-xl">
                <div className="items-center justify-center flex flex-col gap-4">
                    <Image
                        src={'/team.svg'}
                        width={400}
                        height={250}
                        alt="team"
                    />
                    <p className="font-medium text-md text-[#031127] mt-4">
                        You can now add user to the system
                    </p>
                    <RegisterMemberButton />
                </div>
            </div>
        </div>
    );
};

function MembersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hasPermission } = usePermissions();
    const canDeleteMembers = hasPermission(PERMISSIONS.DELETE_MEMBERS);
    const selectedStatus =
        (searchParams.get('status') as MemberListStatus) || 'all';
    const selectedType = (searchParams.get('type') as MemberListType) || 'all';
    const {
        data: membersData,
        isLoading,
        mutate,
    } = useSWR(
        ['/api/members', selectedStatus, selectedType],
        () =>
            getMembers({
                page: 1,
                limit: 500,
                statusFilter: selectedStatus,
                memberType: selectedType === 'all' ? undefined : selectedType,
                expiringWithinDays:
                    selectedStatus === 'expiring-soon' ? 30 : undefined,
            }),
    );
    const members = useMemo(
        () => (membersData?.data.members || []) as Member[],
        [membersData?.data.members],
    );
    const totalMembers = membersData?.data?.total ?? members.length;
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredMembers = members;
    const noFiltersApplied =
        selectedStatus === 'all' && selectedType === 'all';
    const hasMembers = totalMembers > 0;

    const updateQuery = (key: 'status' | 'type', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;

        setIsDeleting(true);
        const result = await deleteMember(memberToDelete.id);
        setIsDeleting(false);

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        toast.success('Member deleted successfully');
        setMemberToDelete(null);
        mutate();
    };

    if (isLoading) {
        return <SkeletonLoader type="table" rows={5} />;
    }

    if (!isLoading && !hasMembers && noFiltersApplied) {
        return <EmptyState />;
    }

    return (
        <div className="py-6 px-4 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="flex flex-col gap-1">
                    <p>Manage Existing Members</p>
                    <span className="font-sm font-normal text-muted-foreground">
                        {hasMembers
                            ? 'Search to manage profiles of all registered members.'
                            : 'Add new members to the system.'}
                    </span>
                </div>
                <RegisterMemberButton
                    fullWidth
                    className="shadow-none w-full p-3"
                />
            </div>
            <div className="mt-8">
                <MembershipFilterBar
                    groups={[
                        {
                            id: 'status',
                            label: 'Status',
                            value: selectedStatus,
                            onChange: (value) => updateQuery('status', value),
                            options: statusTabs,
                        },
                        {
                            id: 'type',
                            label: 'Member type',
                            value: selectedType,
                            onChange: (value) => updateQuery('type', value),
                            options: typeTabs,
                        },
                    ]}
                    showing={filteredMembers.length}
                    total={totalMembers}
                    itemLabel="members"
                    actions={
                        <MembershipExportButton
                            data={getExportRows(filteredMembers)}
                            filename={`membership-members-${selectedStatus}-${selectedType}`}
                            reportTitle="Members register"
                            subtitle={`Status: ${selectedStatus} · Type: ${selectedType}`}
                            sheetName="Members"
                        />
                    }
                />
                {selectedStatus === 'inactive' && (
                    <p className="mt-3 text-sm text-muted-foreground">
                        Inactive members have been manually deactivated by staff.
                        This is separate from expired memberships.
                    </p>
                )}
            </div>
            
            <DeleteMemberDialog
                member={memberToDelete}
                open={Boolean(memberToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setMemberToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
            <div className="mt-8">
                {!isLoading && filteredMembers.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                        No members match the selected filters.
                    </div>
                ) : (
                    <CustomTable
                        data={filteredMembers}
                        presetDateFilter={{
                            enabled: true,
                            column: 'startDate',
                        }}
                        columns={memberColumn}
                        meta={{
                            onRequestDeleteMember: canDeleteMembers
                                ? setMemberToDelete
                                : undefined,
                            canEditMembers: hasPermission(
                                PERMISSIONS.EDIT_MEMBERS,
                            ),
                            canDeleteMembers,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default function Page() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageWrapper
            className="lg:px-0 lg:py-0"
            permissions={[PERMISSIONS.VIEW_MEMBERS]}
        >
            <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <MembersContent />
        </PageWrapper>
    );
}
