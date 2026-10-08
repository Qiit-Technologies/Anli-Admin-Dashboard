'use client';

import { getCheckedInMembers } from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import CustomTable from '@/components/common/table/CustomTable';
import CheckInModal from '@/components/membership/check-in/checkInModal';
import Header from '@/components/membership/layout/header';
import { checkinColumn } from '@/components/membership/table/columns/checkin-column';
import { Member } from '@/types/membership/membership';
import { UserCheck } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

const EmptyState = ({ onStartCheckIn }: { onStartCheckIn: () => void }) => {
    return (
        <div className="flex items-center justify-center h-[80vh] w-full">
            <div className="sm:w-[700px] p-10 bg-[#F7F7F7] rounded-xl">
                <div className="items-center justify-center flex flex-col gap-4">
                    <Image
                        src={'/checkin.png'}
                        width={400}
                        height={250}
                        alt="check-in"
                    />
                    <p className="font-medium text-md text-[#031127] mt-4">
                        Easy way to check-in guest to the system
                    </p>
                    <BrandButton
                        icon={<UserCheck />}
                        className="shadow-none p-3"
                        onClick={onStartCheckIn}
                    >
                        Start Check-In
                    </BrandButton>
                </div>
            </div>
        </div>
    );
};

function CheckInContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: membersData, error, isLoading } = useSWR('/api/checked-in-members', () =>
        getCheckedInMembers({ page: 1, limit: 100 }),
    );

    const members = useMemo(
        () => (membersData?.data.data || []) as Member[],
        [membersData?.data.data],
    );
    const hasMembers = members && members.length > 0;
    const handleStartCheckIn = () => {
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="py-6 px-4 lg:px-8">
                <PageHeader>
                    <PageHeadertitle
                        title="Quick Check-In"
                        subtitle="Manage All Checked-In Guest"
                    />
                    <div className="ml-auto flex items-center">
                        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
                    </div>
                </PageHeader>

                <div className="mt-8">
                    <SkeletonLoader type="table" rows={8} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <>
                <div className="py-6 px-4 lg:px-8">
                    <div className="text-center text-red-600">
                        Error loading members: {error.message}
                    </div>
                </div>
                <CheckInModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </>
        );
    }

    if (!hasMembers) {
        return (
            <>
                <EmptyState onStartCheckIn={handleStartCheckIn} />
                <CheckInModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </>
        );
    }

    return (
        <div className="py-6 px-4 lg:px-8">
            <PageHeader>
                <PageHeadertitle
                    title="Quick Check-In"
                    subtitle="Manage All Checked-In Guest"
                />
                <div className="ml-auto flex items-center">
                    <BrandButton
                        className="shadow-none p-3"
                        onClick={handleStartCheckIn}
                    >
                        Quick Check-In
                    </BrandButton>
                </div>
            </PageHeader>

            {hasMembers && (
                <div className="mt-8">
                    <CustomTable data={members} columns={checkinColumn} />
                </div>
            )}

            <CheckInModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default function CheckInPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <PageWrapper className="lg:px-0 lg:py-0" permissions={[PERMISSIONS.CHECK_IN_MEMBERS]}>
            <Header isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <CheckInContent />
        </PageWrapper>
    );
}
