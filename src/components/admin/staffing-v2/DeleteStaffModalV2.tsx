'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { EmployeeType } from '@/types/employee';
import { deleteStaffV2 } from '@/app/actions/delete-staff-v2';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

interface DeleteStaffModalV2Props {
    staff: EmployeeType | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const DeleteStaffModalV2 = ({
    staff,
    isOpen,
    onOpenChange,
    onSuccess,
}: DeleteStaffModalV2Props) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!staff) return;

        setIsLoading(true);
        try {
            const response = await deleteStaffV2(staff.id);
            if (response?.message?.includes('successfully')) {
                toast.custom(() => (
                    <Toast
                        title="Deleted!"
                        description="Staff member has been removed."
                        type="success"
                    />
                ));
                onSuccess();
            } else {
                toast.error(response?.message || 'Failed to delete user');
            }
        } catch (error: any) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
            onOpenChange(false);
        }
    };

    if (!staff) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-6 text-center rounded-2xl border-none">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FEF3F2] flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-[#D92D20]" />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-bold text-[#101828]">
                            Delete User
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#475467]">
                            Are you sure you want to delete{' '}
                            <span className="font-bold text-[#101828]">
                                {staff.fullName}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </div>

                    <div className="flex gap-3 w-full mt-4">
                        <Button
                            variant="outline"
                            className="flex-1 h-11 border-[#D0D5DD] rounded-xl text-[#344054] font-semibold"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-11 bg-[#D92D20] hover:bg-[#B42318] text-white font-semibold rounded-xl"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
