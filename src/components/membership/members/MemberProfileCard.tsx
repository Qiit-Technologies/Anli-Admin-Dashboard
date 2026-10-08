import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import { Member, MemberStatusEnum } from '@/types/membership/membership';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import FileUploader from '../fileUploader';
import MemberQRCodeManager from '../qr-code/MemberQRCodeManager';

interface MemberProfileCardProps {
    member: Member;
    member_id: string;
    loadingSuspend: boolean;
    onStatusChange: (status: MemberStatusEnum) => void;
    formatDate: (dateString: string) => string;
    lastVisitText?: string;
    showEditButton?: boolean;
    showSuspendButton?: boolean;
    onPhotoChange?: (file: File) => void;
}

const MemberProfileCard: React.FC<MemberProfileCardProps> = ({
    member,
    member_id,
    loadingSuspend,
    onStatusChange,
    formatDate,
    lastVisitText = 'Last visited : 25 July, 3:30pm',
    showEditButton = true,
    showSuspendButton = true,
    onPhotoChange,
}) => {
    const handleStatusToggle = () => {
        const newStatus =
            member.status === MemberStatusEnum.ACTIVE
                ? MemberStatusEnum.SUSPENDED
                : MemberStatusEnum.ACTIVE;
        onStatusChange(newStatus);
    };

    return (
        <div className="bg-[#FAF6F5] border mb-6 border-gray-200 rounded-xl h-fit shadow-none overflow-hidden">
            <div className="p-8 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center justify-center h-full space-y-4 border-b md:border-b-0 pb-8 md:pb-0 md:border-r">
                        <div className="relative w-60 h-40">
                            {member.photoUrl ? (
                                <Image
                                    src={member.photoUrl || '/placeholder.svg'}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    fill
                                    className="rounded-lg object-cover border shadow-sm"
                                    sizes="160px"
                                />
                            ) : (
                                <div className="w-full h-full border-gray-300 rounded-lg flex items-center justify-center">
                                    <FileUploader
                                        label="Upload photo"
                                        hideLabel={true}
                                        labelClassName="w-60 h-40"
                                        onFileChange={(file) =>
                                            file &&
                                            onPhotoChange &&
                                            onPhotoChange(file)
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 text-center">
                            {lastVisitText}
                        </p>
                        <div className="flex flex-row gap-2 sm:gap-3">
                            {showSuspendButton && (
                                <BrandButton
                                    disabled={loadingSuspend}
                                    loading={loadingSuspend}
                                    onClick={handleStatusToggle}
                                    className="w-full"
                                >
                                    {member.status === MemberStatusEnum.ACTIVE
                                        ? 'Suspend'
                                        : 'Activate'}
                                </BrandButton>
                            )}
                            {showEditButton && (
                                <Link
                                    href={`/membership/members/${member_id}/edit`}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full border border-orion-blue text-orion-blue"
                                    >
                                        Edit Info
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Name
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {member.firstName || 'N/A'}{' '}
                                    {member.lastName || ''}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Email
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {member.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Phone
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {member.phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Membership ID
                                </label>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                    {member.id || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Date of Birth
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formatDate(member.dateOfBirth)}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Start Date
                                </label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {formatDate(member.startDate || '')}
                                </p>
                            </div>
                            {member.planOwner && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Principal
                                    </label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {member.planOwner?.firstName || 'N/A'}{' '}
                                        {member.planOwner?.lastName || 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <MemberQRCodeManager member={member} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberProfileCard;
