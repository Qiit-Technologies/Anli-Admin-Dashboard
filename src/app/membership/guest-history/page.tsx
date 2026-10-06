'use client';

import { getAllMembersForBooking } from '@/app/actions/membership';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import CustomTable from '@/components/common/table/CustomTable';
import Header from '@/components/membership/layout/header';
import { RegisterMemberButton } from '@/components/membership/members/RegisterMemberButton';
import { guestHistoryMemberColumns } from '@/components/membership/table/columns/guest-history-column';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Member } from '@/types/membership/membership';
import Image from 'next/image';
import { useState } from 'react';
import useSWR from 'swr';

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
                        Once there is a guest registered on the platform you
                        will see their name and other details here.
                    </p>
                    <RegisterMemberButton />
                </div>
            </div>
        </div>
    );
};

function GuestHistoryContent() {
    const { data: membersData, isLoading } = useSWR('/api/guest-history', () =>
        getAllMembersForBooking({ page: 1, limit: 100 }),
    );
    const members = (membersData?.data.members || []) as Member[];
    const hasMembers = members && members.length > 0;

    if (isLoading) {
        return (
            <SkeletonLoader type="table" rows={8}>
                <div className="py-6 px-4 lg:px-8">
                    <div className="flex justify-between items-start mb-8">
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-64"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-40"></div>
                    </div>

                    <div className="mt-12 space-y-3">
                        <div className="flex gap-4 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>

                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex gap-4 py-3 border-b border-gray-100"
                            >
                                <div className="h-4 bg-gray-200 rounded w-8"></div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-28"></div>
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </SkeletonLoader>
        );
    }

    if (!hasMembers) {
        return <EmptyState />;
    }

    return (
        <div className="py-6 px-4 lg:px-8">
            <PageHeader>
                <PageHeadertitle
                    title="Guest History"
                    subtitle="View and manage all guest history"
                />
                <div className="ml-auto flex items-center">
                    <RegisterMemberButton />
                </div>
            </PageHeader>
            <div className="mt-12">
                <CustomTable
                    data={members}
                    presetDateFilter={{
                        enabled: true,
                        column: 'lastVisitDate',
                    }}
                    columns={guestHistoryMemberColumns}
                />
            </div>
        </div>
    );
}

export default function Page() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageWrapper className="lg:px-0 lg:py-0" permissions={[PERMISSIONS.VIEW_MEMBERSHIP_GUEST_HISTORY]}>
            <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <GuestHistoryContent />
        </PageWrapper>
    );
}
