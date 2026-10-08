'use client';

import React, { useState } from 'react';
import PageWrapper from '@/components/common/PageWrapper';
import { Search, Bell, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AddStaffModalV2,
    DeleteStaffModalV2,
    StaffingTableV2,
    ViewStaffDetailsModalV2,
} from '@/components/admin/staffing-v2';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useUser } from '@/context/useUser';
import { getEmployees } from '@/app/actions/employee';
import useSWR from 'swr';
import { EmployeeType } from '@/types/employee';

const StaffingPageV2 = () => {
    const { user } = useUser();
    const [selectedUser, setSelectedUser] = useState<EmployeeType | null>(null);

    const {
        isOpen: isViewModalOpen,
        onOpen: onViewModalOpen,
        onOpenChange: onViewModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isDeleteModalOpen,
        onOpen: onDeleteModalOpen,
        onOpenChange: onDeleteModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isAddModalOpen,
        onOpen: onAddModalOpen,
        onClose: onAddModalClose,
        onOpenChange: onAddModalOpenChange,
    } = useDisclosure();

    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: staffMembers,
        isLoading,
        mutate,
    } = useSWR('/staff-members', getEmployees);

    return (
        <PageWrapper>
            <div className="flex flex-col gap-6 p-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-md text-gray-800">
                            Staffing (user management)
                        </h1>
                        <p className="text-base text-[#667085]">
                            Manage Team, Roles and Permission
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                            <Input
                                placeholder="Search"
                                className="pl-10 h-11 border-[#D0D5DD] rounded-lg bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full border border-[#D0D5DD] w-11 h-11"
                        >
                            <Bell className="w-5 h-5 text-[#667085]" />
                        </Button>
                        <div className="flex items-center gap-2 border border-[#D0D5DD] rounded-full pl-1 pr-3 py-1 bg-white cursor-pointer">
                            <Avatar className="w-8 h-8">
                                <AvatarImage
                                    src={
                                        user?.profileImage ||
                                        '/avatar-placeholder.png'
                                    }
                                />
                                <AvatarFallback className="bg-[#FEF0C7] text-[#DC6803] font-medium text-xs">
                                    {user?.fullName
                                        ?.split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase() || 'GU'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-[#101828]">
                                {user?.fullName || 'Guest'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-b border-[#EAECF0]" />

                <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAECF0]">
                        <h2 className="text-lg font-semibold text-[#101828]">
                            All Users
                        </h2>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="h-10 border-[#D0D5DD] text-[#344054] font-semibold gap-2"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5 10H15M2.5 5H17.5M7.5 15H12.5"
                                        stroke="#344054"
                                        strokeWidth="1.66667"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Apply filter
                            </Button>
                            <Button
                                onClick={onAddModalOpen}
                                className="h-10 bg-[#007BFF] hover:bg-[#0069D9] text-white font-semibold gap-2 rounded-lg"
                            >
                                <Plus className="w-5 h-5" />
                                Add New User
                            </Button>
                        </div>
                    </div>

                    <StaffingTableV2
                        data={staffMembers || []}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        onView={(staff) => {
                            setSelectedUser(staff);
                            onViewModalOpen();
                        }}
                        onEdit={(staff) => {
                            setSelectedUser(staff);
                            onAddModalOpen();
                        }}
                        onDelete={(staff) => {
                            setSelectedUser(staff);
                            onDeleteModalOpen();
                        }}
                    />
                </div>
            </div>

            <AddStaffModalV2
                isOpen={isAddModalOpen}
                onOpenChange={(open) => {
                    onAddModalOpenChange(open);
                    if (!open) setSelectedUser(null);
                }}
                onClose={() => {
                    onAddModalClose();
                    setSelectedUser(null);
                }}
                onSuccess={() => {
                    mutate();
                    onAddModalClose();
                    setSelectedUser(null);
                }}
                staff={selectedUser}
            />

            <ViewStaffDetailsModalV2
                isOpen={isViewModalOpen}
                onOpenChange={(open) => {
                    onViewModalOpenChange(open);
                    if (!open) setSelectedUser(null);
                }}
                staff={selectedUser}
            />

            <DeleteStaffModalV2
                isOpen={isDeleteModalOpen}
                onOpenChange={(open) => {
                    onDeleteModalOpenChange(open);
                    if (!open) setSelectedUser(null);
                }}
                onSuccess={() => {
                    mutate();
                    onDeleteModalOpenChange(false);
                }}
                staff={selectedUser}
            />
        </PageWrapper>
    );
};

export default StaffingPageV2;
