import { getAllMembersForBooking } from '@/app/actions/membership';
import {
    formatMemberFullName,
    memberMatchesQuery,
} from '@/lib/membership/member-utils';
import useBookingStore from '@/store/useBookingStore';
import { Member } from '@/types/membership/membership';
import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import SearchWithIcon from '../searchWithIcon';

interface SearchMemberProps {
    onMemberSelect?: (member: Member | null) => void;
}

const SearchMember: React.FC<SearchMemberProps> = ({ onMemberSelect }) => {
    const { member, setMember } = useBookingStore();
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (member) {
            setQuery(formatMemberFullName(member));
        }
    }, [member]);

    const {
        data: membersData,
        error: membersError,
        isLoading,
    } = useSWR('/api/members/all', () =>
        getAllMembersForBooking({ page: 1, limit: 100 }),
    );

    const members = useMemo(() => {
        const list = membersData?.data?.members;
        return Array.isArray(list) ? (list as Member[]) : [];
    }, [membersData]);

    const filteredMembers = useMemo(() => {
        if (!query.trim()) return [];
        return members.filter((item) => memberMatchesQuery(item, query));
    }, [members, query]);

    const selectedMemberLabel = member ? formatMemberFullName(member) : '';
    const showDropdown =
        query.trim().length > 0 && query.trim() !== selectedMemberLabel;

    const handleMemberSelect = (selectedMember: Member) => {
        setMember(selectedMember);
        setQuery(formatMemberFullName(selectedMember));
        onMemberSelect?.(selectedMember);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() === '') {
            setMember(null);
            onMemberSelect?.(null);
        }
    };

    return (
        <div className="relative">
            <label className="mb-2 block text-sm font-semibold">
                Search Member
            </label>
            <SearchWithIcon
                className="mb-4 bg-white"
                value={query}
                placeholder="Search by name, email, or phone"
                onChange={handleInputChange}
            />

            {isLoading && (
                <p className="text-sm text-muted-foreground">
                    Loading members…
                </p>
            )}

            {membersError && !isLoading && (
                <p className="text-sm text-red-600">
                    Could not load members. Please close and try again.
                </p>
            )}

            {!isLoading && !membersError && members.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No members available for booking. Add members first.
                </p>
            )}

            {showDropdown && (
                <div className="absolute left-0 right-0 top-20 z-10 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    {filteredMembers.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">
                            No members match &quot;{query.trim()}&quot;
                        </p>
                    ) : (
                        filteredMembers.map((memberItem) => (
                            <div
                                key={memberItem.id}
                                role="button"
                                tabIndex={0}
                                className="cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleMemberSelect(memberItem);
                                    }
                                }}
                                onClick={() => handleMemberSelect(memberItem)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {formatMemberFullName(memberItem)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {memberItem.email || 'No email'}{' '}
                                            ·{' '}
                                            {memberItem.phone || 'No phone'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`rounded px-2 py-1 text-xs ${
                                                memberItem.status === 'active'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}
                                        >
                                            {memberItem.status || 'unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {member && (
                <div className="rounded-lg border border-[#F2F2F2] bg-[#F2F2F2] p-3">
                    <p className="mb-3 text-xs font-medium text-[#105F87]">
                        Membership Details
                    </p>
                    <div className="flex flex-wrap justify-between gap-3 text-xs font-normal">
                        <p>
                            <strong>Membership Tier:</strong>{' '}
                            <span className="capitalize text-[#344054]">
                                {member.membershipTier || 'No tier'}
                            </span>
                        </p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span
                                className={
                                    member.status === 'active'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {member.status || 'unknown'}
                            </span>
                        </p>
                        <p>
                            <strong>Plan:</strong>{' '}
                            {member.plan?.name || 'No plan'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchMember;
