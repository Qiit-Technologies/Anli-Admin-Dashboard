'use client';

import { editMemberStatus, getMemberById } from '@/app/actions/membership';
import { PageHeadertitle } from '@/components/common/layout/Header';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { usePermissions } from '@/hooks/auth/usePermission';
import { Member, MemberStatusEnum } from '@/types/membership/membership';
import Link from 'next/link';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import MemberProfileCard from './MemberProfileCard';
import ReferralTable from './referralTable';
import RenewalModal from './renewal-modal';
import { MemberProfileProps } from './types';

const MemberProfile: React.FC<MemberProfileProps> = ({ member_id }) => {
    const [loadingSuspend, setLoadingSuspend] = useState(false);
    const { hasPermission } = usePermissions();
    const canEditMembers = hasPermission(PERMISSIONS.EDIT_MEMBERS);
    const { data } = useSWR(`/api/members/${member_id}`, () =>
        getMemberById(member_id),
    );

    const member: Member = data?.data.member || {};

    const [showModal, setShowModal] = useState(false);

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
            const response = await editMemberStatus(member_id, status);
            if (response.success) {
                mutate(`/api/members/${member_id}`);
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
        <div className="flex-1 ">
            <div className="my-4">
                <PageHeadertitle hasBack title="Member Profile" />
            </div>
            <MemberProfileCard
                member={member}
                member_id={member_id}
                loadingSuspend={loadingSuspend}
                onStatusChange={handleEditStatus}
                formatDate={formatDate}
                showEditButton={canEditMembers}
                showSuspendButton={canEditMembers}
            />

            <div className="bg-white border border-[#D6D6D6] rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center mb-5">
                    <h3 className="text-lg font-semibold">
                        Membership Details
                    </h3>
                    <div className="flex gap-3">
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.VIEW_MEMBERSHIP_GUEST_HISTORY,
                            ]}
                            blockType="hide"
                        >
                            <Link
                                href={`/membership/guest-history/${member_id}`}
                            >
                                <button className="bg-[#407BFF] text-white text-sm px-4 py-1 rounded">
                                    View Activity log
                                </button>
                            </Link>
                        </PermissionGate>
                        <PermissionGate
                            permissions={[PERMISSIONS.EDIT_MEMBERS]}
                            blockType="hide"
                        >
                            <button
                                onClick={() => setShowModal(!showModal)}
                                className="border border-gray-300 text-sm px-4 py-1 rounded cursor-pointer"
                            >
                                Renew Membership
                            </button>
                        </PermissionGate>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm text-gray-700">
                    <div>
                        <strong>Membership Plan:</strong>
                        <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {member.plan?.name || 'No Plan'}
                        </span>
                    </div>
                    <div>
                        <strong>Start Date:</strong>{' '}
                        {formatDate(member.startDate || '')}
                    </div>
                    <div>
                        <strong>End Date:</strong>{' '}
                        {formatDate(member.endDate || '')}
                    </div>
                    <div>
                        <strong>Nationality:</strong>{' '}
                        {member.nationality || 'N/A'}
                    </div>
                    <div>
                        <strong>Occupation:</strong>{' '}
                        {member.occupation || 'N/A'}
                    </div>
                    <div>
                        <strong>Work Address:</strong>{' '}
                        {member.workAddress || 'N/A'}
                    </div>
                    <div className="col-span-full">
                        <strong>Work Email:</strong> {member.workEmail || 'N/A'}
                    </div>
                </div>
            </div>

            {member.membershipTier === 'principal' && (
                <div className="bg-white border border-[#D6D6D6] rounded-xl px-6  mb-6">
                    {member.referredMembers.length > 0 ? (
                        <ReferralTable
                            referrals={
                                (member.referredMembers ||
                                    []) as Member['referredMembers']
                            }
                        />
                    ) : (
                        <div className="text-center p-4">No referrals</div>
                    )}
                </div>
            )}

            {showModal ? (
                <RenewalModal
                    open={showModal}
                    onClose={() => setShowModal(!showModal)}
                    member={member}
                />
            ) : null}
        </div>
    );
};

export default MemberProfile;
