'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/helpers';
import { EmployeeType } from '@/types/employee';

interface ViewStaffDetailsModalV2Props {
    staff: EmployeeType | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ViewStaffDetailsModalV2 = ({
    staff,
    isOpen,
    onOpenChange,
}: ViewStaffDetailsModalV2Props) => {
    if (!staff) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-2xl border-none">
                <div className="p-6 pb-4 flex items-center justify-between border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        User Details
                    </DialogTitle>
                </div>

                <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#EAECF0]">
                        <div className="w-16 h-16 rounded-full bg-[#007BFF] text-white flex items-center justify-center text-2xl font-bold">
                            {staff.fullName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#101828]">
                                {staff.fullName}
                            </h3>
                            <p className="text-sm text-[#475467]">
                                {staff.email}
                            </p>
                            <Badge
                                className={`mt-2 ${staff.isActive ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#FEF3F2] text-[#B42318]'} border-none`}
                            >
                                {staff.isActive ? 'Active' : 'In-Active'}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                                Role
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                {staff.roles.name}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                                Department
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                {staff.roles.department || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                                Date Created
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                {formatDate(staff.createdAt)}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                                User ID
                            </p>
                            <p className="text-sm font-medium text-[#101828]">
                                #{staff.id}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-[#101828] border-b border-[#EAECF0] pb-2">
                            Modules & Permissions
                        </p>
                        <div className="space-y-3">
                            {staff.modules && staff.modules.length > 0 ? (
                                staff.modules.map((mod) => (
                                    <div
                                        key={mod.id}
                                        className="p-3 bg-white border border-[#EAECF0] rounded-lg"
                                    >
                                        <p className="text-sm font-bold text-[#101828] mb-2">
                                            {mod.name}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {staff.permissions
                                                ?.filter(
                                                    (p) =>
                                                        p.moduleId === mod.id,
                                                )
                                                .map((perm) => (
                                                    <Badge
                                                        key={perm.id}
                                                        variant="outline"
                                                        className="text-[10px] font-medium text-[#344054] border-[#D0D5DD]"
                                                    >
                                                        {perm.name}
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-[#667085] italic">
                                    No modules assigned
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        className="w-full h-11 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] font-semibold rounded-lg"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
