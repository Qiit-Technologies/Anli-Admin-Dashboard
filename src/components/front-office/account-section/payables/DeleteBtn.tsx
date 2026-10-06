/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomDialog from '@/components/common/CustomDialog';
import { TextAreaField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { ARAPRow } from '../common/ARAPColumns';
import { X } from 'lucide-react';
import { mutate } from 'swr';
import { deletePayable } from '@/app/actions/payables';
import { toast } from 'sonner';

export const DeleteBtn = ({ selected }: { selected: ARAPRow | null }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
    });

    const canDelete = selected
        ? Number(selected.balance) <= 0 && !!selected.isCheckedOut
        : false;

    // Check if all required fields are filled
    const isFormValid = () => {
        return !!selected && formData.reason.trim() !== '' && canDelete;
    };

    const handleConfirm = async () => {
        if (!selected) return;
        if (!canDelete) {
            toast.error('Cannot delete active account');
            return;
        }
        setLoading(true);
        try {
            const res = await deletePayable(Number(selected.guestId), {
                reason: formData.reason.trim() || undefined,
            });
            if ((res as any)?.error) {
                console.error((res as any).error);
            } else {
                await mutate('/accounts/payables');
                setOpen(false);
                setFormData({ reason: '' });
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormInput = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="w-full"
                disabled={!selected}
                title={
                    !!selected && !canDelete
                        ? 'Cannot delete active account'
                        : undefined
                }
            >
                Delete
            </Button>
            <CustomDialog
                open={open}
                onOpenChange={setOpen}
                title="Are you sure you want to delete this Account"
                description={
                    selected
                        ? canDelete
                            ? 'Please give reason for deleting'
                            : 'Cannot delete active account (outstanding or guest still in-house)'
                        : 'Select a payable row first'
                }
                confirmText="Done"
                onConfirm={handleConfirm}
                isLoading={loading}
                maxWidth="md"
                footerType="full"
                confirmDisabled={!isFormValid()}
            >
                <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-8 h-8 text-white" />
                    </div>
                </div>
                <form className="flex flex-col gap-4">
                    <TextAreaField
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={(e) =>
                            handleFormInput('reason', e.target.value)
                        }
                        placeholder="reason for deletion"
                        label=""
                        disabled={!canDelete}
                    />
                </form>
            </CustomDialog>
        </>
    );
};
