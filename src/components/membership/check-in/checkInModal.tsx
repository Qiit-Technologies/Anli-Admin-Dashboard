import {
    checkInMember,
    getAllMembersForBooking,
    getFacilities,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import {
    formatMemberFullName,
    memberMatchesQuery,
} from '@/lib/membership/member-utils';
import { Facility, Member } from '@/types/membership/membership';
import { UserCheck, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import SearchWithIcon from '../searchWithIcon';

interface CheckInModalProps {
    open: boolean;
    onClose: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ onClose, open }) => {
    useIdleLogoutExemption(open);

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
    const [purposeOfVisit, setPurposeOfVisit] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState('');

    const { data: membersData } = useSWR('/api/members/all', () =>
        getAllMembersForBooking({ page: 1, limit: 100 }),
    );

    const { data: facilitiesData } = useSWR('/api/facilities', getFacilities);

    const members = useMemo(() => {
        const list = membersData?.data?.members;
        return Array.isArray(list) ? (list as Member[]) : [];
    }, [membersData]);

    const facilities = useMemo(() => {
        return (facilitiesData?.data.facilities || []) as Facility[];
    }, [facilitiesData?.data.facilities]);

    const facilityOptions = useMemo(() => {
        return facilities.map((facility) => ({
            label: facility.name,
            value: facility.id.toString(),
        }));
    }, [facilities]);

    useEffect(() => {
        if (selectedMember) {
            setQuery(formatMemberFullName(selectedMember));
        }
    }, [selectedMember]);

    const filteredMembers = useMemo(() => {
        if (!query.trim()) return [];
        return members.filter((member) => memberMatchesQuery(member, query));
    }, [members, query]);

    const selectedMemberLabel = selectedMember
        ? formatMemberFullName(selectedMember)
        : '';
    const showDropdown =
        query.trim().length > 0 && query.trim() !== selectedMemberLabel;

    const handleMemberSelect = (selectedMemberItem: Member) => {
        setSelectedMember(selectedMemberItem);
        setQuery(formatMemberFullName(selectedMemberItem));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value === '') {
            setSelectedMember(null);
        }
    };

    const handleClose = () => {
        setQuery('');
        setSelectedMember(null);
        setSelectedFacilityId('');
        setPurposeOfVisit('');
        setNotes('');
        onClose();
    };

    const handleCheckIn = async () => {
        if (!selectedMember || !purposeOfVisit.trim()) {
            toast.custom(() => (
                <Toast
                    title="Check-In Failed"
                    description="Please select a member and provide purpose of visit"
                    type="error"
                />
            ));
            return;
        }

        setIsLoading(true);

        try {
            const result = await checkInMember({
                memberId: selectedMember.id,
                facilityId: selectedFacilityId
                    ? parseInt(selectedFacilityId)
                    : 1,
                checkInType: 'manual_search',
                purposeOfVisit: purposeOfVisit.trim(),
                notes: notes.trim() || undefined,
            });

            if (result.success && result.data?.success) {
                toast.custom(() => (
                    <Toast
                        title="Check-In Successful"
                        description={`${selectedMember.firstName} ${selectedMember.lastName} has been checked in successfully`}
                        type="success"
                    />
                ));

                mutate('/membership/search-members');
                handleClose();
            } else {
                const errorData = result.data;
                let errorTitle = 'Check-In Failed';
                let errorDescription =
                    result.message || 'Failed to check in member';

                if (errorData && errorData.accessResult === 'denied') {
                    errorTitle = 'Access Denied';
                    if (errorData.facility && errorData.member) {
                        errorDescription = `${errorData.member.name} does not have access to ${errorData.facility.name}. ${errorData.message || ''}`;
                    } else {
                        errorDescription =
                            errorData.message ||
                            'Member does not have access to this facility';
                    }
                } else if (errorData && errorData.message) {
                    errorDescription = errorData.message;
                }

                toast.custom(() => (
                    <Toast
                        title={errorTitle}
                        description={errorDescription}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Check-in error:', error);
            toast.custom(() => (
                <Toast
                    title="Check-In Error"
                    description="An unexpected error occurred during check-in"
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-[#5B6469] mb-1">
                        Member Check-In
                    </DialogTitle>
                    <DialogDescription className="text-[#989C9D] text-sm font-normal">
                        Search for a member and check them into a facility
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Member Search */}
                    <div className="relative">
                        <label className="text-sm font-semibold mb-2 block">
                            Search Member
                        </label>
                        <SearchWithIcon
                            className="bg-white mb-4"
                            value={query}
                            placeholder="Search by name, email, or phone"
                            onChange={handleInputChange}
                        />

                        {showDropdown && (
                            <div className="absolute top-20 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                {filteredMembers.map((memberItem) => (
                                    <div
                                        key={memberItem.id}
                                        role="button"
                                        tabIndex={0}
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' ||
                                                e.key === ' '
                                            ) {
                                                e.preventDefault();
                                                handleMemberSelect(memberItem);
                                            }
                                        }}
                                        onClick={() =>
                                            handleMemberSelect(memberItem)
                                        }
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {memberItem.firstName}{' '}
                                                    {memberItem.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {memberItem.email}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        memberItem.status ===
                                                        'active'
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-red-100 text-red-600'
                                                    }`}
                                                >
                                                    {memberItem.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedMember && (
                            <div className="bg-[#F2F2F2] border border-[#F2F2F2] p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                            {selectedMember.photoUrl ? (
                                                <Image
                                                    src={
                                                        selectedMember.photoUrl
                                                    }
                                                    alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                                                    {(
                                                        selectedMember.firstName?.[0] ??
                                                        ''
                                                    ).toUpperCase()}
                                                    {(
                                                        selectedMember.lastName?.[0] ??
                                                        ''
                                                    ).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {selectedMember.firstName}{' '}
                                                {selectedMember.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {selectedMember.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedMember(null);
                                            setQuery('');
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-[#105F87] mb-2">
                                        Membership Details
                                    </p>
                                    <div className="flex justify-between gap-5 text-xs font-normal">
                                        <p>
                                            <strong>Membership Tier:</strong>{' '}
                                            <span className="text-gray-[#344054] capitalize">
                                                {selectedMember.membershipTier ||
                                                    'No Tier'}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <span
                                                className={
                                                    selectedMember.status ===
                                                    'active'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }
                                            >
                                                {selectedMember.status}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Plan:</strong>{' '}
                                            {selectedMember.plan?.name ||
                                                'No Plan'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <SelectField
                        name="facility"
                        id="facility"
                        label="Select Facility (Optional)"
                        value={selectedFacilityId}
                        onValueChange={setSelectedFacilityId}
                        options={facilityOptions}
                        placeholder="Choose a facility"
                        disabled={isLoading}
                    />

                    <InputField
                        name="purposeOfVisit"
                        id="purposeOfVisit"
                        label="Purpose of Visit"
                        type="text"
                        value={purposeOfVisit}
                        onChange={(e) => setPurposeOfVisit(e.target.value)}
                        placeholder="e.g., Gym workout, Pool access, Meeting"
                        required
                        disabled={isLoading}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes or comments"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-hexbrand resize-none bg-gray-100"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <BrandButton
                        icon={<UserCheck />}
                        onClick={handleCheckIn}
                        loading={isLoading}
                        disabled={
                            isLoading ||
                            !selectedMember ||
                            !purposeOfVisit.trim()
                        }
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        Check In
                    </BrandButton>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CheckInModal;
