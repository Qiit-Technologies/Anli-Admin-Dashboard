'use client';

import {
    editMemberStatus,
    getGuestHistory,
    getMemberById,
    getPurchaseHistory,
    getServiceUsageSummary,
    getVisitLogs,
} from '@/app/actions/membership';
import { PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import CustomTable from '@/components/common/table/CustomTable';
import MemberProfileCard from '@/components/membership/members/MemberProfileCard';
import {
    guestServiceHistoryColumns,
    purchaseHistoryColumns,
    serviceUsageSummaryColumns,
    visitLogsColumns,
} from '@/components/membership/table/columns/guest-history-column';
import Toast from '@/components/toast';
import {
    GuestServiceHistory,
    Member,
    MemberStatusEnum,
    Purchase,
    ServiceUsageSummary,
    VisitLog,
} from '@/types/membership/membership';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

function GuestHistoryContent() {
    const params = useParams();
    const memberId = params.guest_id as string;
    const [loadingSuspend, setLoadingSuspend] = useState(false);

    const { data: memberData } = useSWR(
        memberId ? `/api/member/${memberId}` : null,
        () => getMemberById(memberId),
    );
    const member = memberData?.data.member as Member;

    const { data: guestHistoryData } = useSWR(
        memberId ? `/api/guest-history/${memberId}` : null,
        () => getGuestHistory(memberId, { page: 1, limit: 50 }),
    );
    const guestHistory = (guestHistoryData?.data.data ||
        []) as GuestServiceHistory[];

    const { data: serviceUsageData } = useSWR(
        memberId ? `/api/service-usage/${memberId}` : null,
        () => getServiceUsageSummary(memberId, { page: 1, limit: 50 }),
    );
    const serviceUsage = (serviceUsageData?.data.data ||
        []) as ServiceUsageSummary[];

    const { data: visitLogsData } = useSWR(
        memberId ? `/api/visit-logs/${memberId}` : null,
        () => getVisitLogs(memberId, { page: 1, limit: 50 }),
    );
    const visitLogs = (visitLogsData?.data.data || []) as VisitLog[];

    const { data: purchaseHistoryData } = useSWR(
        memberId ? `/api/purchase-history/${memberId}` : null,
        () => getPurchaseHistory(memberId, { page: 1, limit: 50 }),
    );
    const purchaseHistory = (purchaseHistoryData?.data.data ||
        []) as Purchase[];

    if (!member) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading member details...</div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleEditStatus = async (status: MemberStatusEnum) => {
        try {
            setLoadingSuspend(true);
            const response = await editMemberStatus(member.id, status);
            if (response.success) {
                mutate(`/api/members/${member.id}`);
                toast.custom(
                    <Toast
                        title="Member Status Updated"
                        description="Member status has been updated"
                        type="success"
                    />,
                );
            }
        } catch (error: any) {
            console.log(error);
            toast.custom(
                <Toast
                    title="Error"
                    description="An error occurred while updating member status"
                    type="error"
                />,
            );
        } finally {
            setLoadingSuspend(false);
        }
    };

    return (
        <div className="px-0 md:p-6 bg-gray-50 min-h-screen">
            <div className="my-4">
                <PageHeadertitle hasBack title="Guest History" />
            </div>

            <MemberProfileCard
                member={member}
                member_id={member.id}
                loadingSuspend={loadingSuspend}
                onStatusChange={handleEditStatus}
                formatDate={formatDate}
            />

            <div className="bg-white border border-gray-200 rounded-xl mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Guest Booking History
                    </h2>
                    <CustomTable
                        data={guestHistory}
                        columns={guestServiceHistoryColumns}
                        presetDateFilter={{
                            enabled: true,
                            column: 'date',
                        }}
                        isPaginated={true}
                        pageSize={10}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Service Usage Summary
                    </h2>
                    <CustomTable
                        data={serviceUsage}
                        columns={serviceUsageSummaryColumns}
                        isPaginated={true}
                        pageSize={10}
                        hasFilter={false}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Visit Logs</h2>
                    <CustomTable
                        data={visitLogs}
                        columns={visitLogsColumns}
                        presetDateFilter={{
                            enabled: true,
                            column: 'date',
                        }}
                        isPaginated={true}
                        pageSize={10}
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Purchase History
                    </h2>
                    <CustomTable
                        data={purchaseHistory}
                        columns={purchaseHistoryColumns}
                        presetDateFilter={{
                            enabled: true,
                            column: 'date',
                        }}
                        isPaginated={true}
                        pageSize={10}
                    />
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <PageWrapper className="lg:px-0 lg:py-0" permissions={[PERMISSIONS.VIEW_MEMBERSHIP_GUEST_HISTORY]}>
            <GuestHistoryContent />
        </PageWrapper>
    );
}
