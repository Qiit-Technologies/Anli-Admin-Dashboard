'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SelectField, TextAreaField } from '../common/Form';
import { Staff } from '@/types/staff.types';
import { getStaff } from '@/app/actions/staff';
import toast from 'react-hot-toast';
import { updateRecognition } from '@/app/actions/recognition';
import { RECOGNITION_TYPES } from './GivePraiseDialog';
import { FaEdit, FaTimes } from 'react-icons/fa';

type RecognitionRecord = {
    id: number;
    recipientId?: number;
    recipient?: { id?: number; fullName?: string };
    type?: string;
    message?: string;
    isPublic?: boolean;
    points?: number;
};

interface EditRecognitionDialogProps {
    recognition: RecognitionRecord;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function EditRecognitionDialog({
    recognition,
    onSuccess,
    trigger,
}: EditRecognitionDialogProps) {
    const [open, setOpen] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        recipientId:
            recognition.recipientId ||
            recognition.recipient?.id ||
            (recognition as any)?.recipient?.recipientId ||
            0,
        type: recognition.type || 'excellent_service',
        message: recognition.message || '',
        isPublic: recognition.isPublic ?? true,
        points: recognition.points ?? 0,
    });

    useEffect(() => {
        if (open) {
            const fetchStaff = async () => {
                try {
                    const result = await getStaff(1);
                    setStaffList(result.data || result || []);
                } catch (error: any) {
                    console.error('Failed to load staff for editing', error);
                }
            };
            fetchStaff();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            setFormData({
                recipientId:
                    recognition.recipientId || recognition.recipient?.id || 0,
                type: recognition.type || 'excellent_service',
                message: recognition.message || '',
                isPublic: recognition.isPublic ?? true,
                points: recognition.points ?? 0,
            });
        }
    }, [open, recognition]);

    const staffOptions = useMemo(
        () =>
            staffList.map((staff) => ({
                value: staff.id?.toString?.() || '',
                label: staff.fullName || 'N/A',
            })),
        [staffList],
    );

    const handleSubmit = async () => {
        if (!formData.recipientId) {
            toast.error('Please select a recipient');
            return;
        }

        if (!formData.message.trim() || formData.message.length < 10) {
            toast.error('Message must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            await updateRecognition(recognition.id, {
                recipientId: formData.recipientId,
                type: formData.type,
                message: formData.message,
                isPublic: formData.isPublic,
                points: formData.points,
            });
            toast.success('Recognition updated successfully');
            setOpen(false);
            onSuccess?.();
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to update recognition';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-2"
                    >
                        <FaEdit size={12} />
                        Edit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Edit Recognition
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="rounded-full h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            disabled={loading}
                        >
                            <FaTimes size={16} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-5 px-6 py-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Member
                        </label>
                        <SelectField
                            id="editRecipientId"
                            name="editRecipientId"
                            label=""
                            value={formData.recipientId.toString()}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    recipientId: parseInt(value),
                                }))
                            }
                            options={[
                                {
                                    value: '0',
                                    label: 'Select a team member...',
                                },
                                ...staffOptions,
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recognition Type
                        </label>
                        <SelectField
                            id="editType"
                            name="editType"
                            label=""
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    type: value,
                                }))
                            }
                            options={RECOGNITION_TYPES}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                        </label>
                        <TextAreaField
                            id="editMessage"
                            name="editMessage"
                            label=""
                            value={formData.message}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    message: e.target.value,
                                }))
                            }
                            rows={5}
                            className="w-full resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.message.length} / 1000 characters
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Points
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent transition-all"
                                value={formData.points}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        points: parseInt(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visibility
                            </label>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 h-[42px] flex items-center">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="editIsPublic"
                                        checked={formData.isPublic}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isPublic: e.target.checked,
                                            }))
                                        }
                                        className="w-4 h-4 text-orion-blue rounded focus:ring-orion-blue"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Make public
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 mt-auto">
                    <p className="text-xs text-gray-500">
                        Updates apply immediately for all viewers.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                loading ||
                                !formData.recipientId ||
                                formData.message.length < 10
                            }
                            className="bg-orion-blue hover:bg-orion-blue/90 text-white min-w-[140px]"
                        >
                            {loading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
