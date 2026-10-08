'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createRecognition } from '@/app/actions/recognition';
import { getStaff } from '@/app/actions/staff';
import toast from 'react-hot-toast';
import { FaStar, FaTimes } from 'react-icons/fa';
import { SelectField, TextAreaField } from '../common/Form';
import { Staff } from '@/types/staff.types';

interface GivePraiseDialogProps {
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export const RECOGNITION_TYPES = [
    { value: 'excellent_service', label: '⭐ Excellent Service' },
    { value: 'teamwork', label: '🤝 Teamwork' },
    { value: 'innovation', label: '💡 Innovation' },
    { value: 'dedication', label: '💪 Dedication' },
    { value: 'leadership', label: '👑 Leadership' },
    { value: 'customer_satisfaction', label: '😊 Customer Satisfaction' },
    { value: 'problem_solving', label: '🧩 Problem Solving' },
    { value: 'going_extra_mile', label: '🏃 Going the Extra Mile' },
];

export function GivePraiseDialog({
    onSuccess,
    trigger,
}: GivePraiseDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [formData, setFormData] = useState({
        recipientId: 0,
        type: 'excellent_service',
        message: '',
        isPublic: true,
        points: 10,
    });

    const loadStaff = async () => {
        try {
            const result = await getStaff(1);
            setStaffList(result.data || result || []);
        } catch (error: any) {
            console.error('Failed to load staff:', error);
        }
    };

    useEffect(() => {
        if (open) {
            loadStaff();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = async () => {
        if (!formData.recipientId) {
            toast.error('Please select a team member to recognize');
            return;
        }

        if (!formData.message.trim() || formData.message.length < 10) {
            toast.error(
                'Please provide a meaningful message (at least 10 characters)',
            );
            return;
        }

        setLoading(true);
        try {
            await createRecognition({
                recipientId: formData.recipientId,
                type: formData.type,
                message: formData.message,
                isPublic: formData.isPublic,
                points: formData.points,
            });

            toast.success('Recognition sent successfully! 🎉');
            setOpen(false);
            setFormData({
                recipientId: 0,
                type: 'excellent_service',
                message: '',
                isPublic: true,
                points: 10,
            });
            onSuccess?.();
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to send recognition';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const staffOptions = staffList.map((staff: Staff) => ({
        value: staff.id?.toString?.() || '',
        label: staff.fullName || 'N/A',
    }));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-orion-blue hover:bg-orion-blue/90 text-white">
                        <FaStar className="mr-2" />
                        Give Praise
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-xl">
                                ⭐
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">
                                    Recognize a Team Member
                                </DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Celebrate achievements and boost team morale
                                </p>
                            </div>
                        </div>
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
                    {/* Team Member Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Member <span className="text-red-500">*</span>
                        </label>
                        <SelectField
                            id="recipientId"
                            name="recipientId"
                            label=""
                            value={formData.recipientId.toString()}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    recipientId: parseInt(value),
                                })
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

                    {/* Recognition Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recognition Type{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <SelectField
                            id="type"
                            name="type"
                            label=""
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    type: value,
                                })
                            }
                            options={RECOGNITION_TYPES}
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Message <span className="text-red-500">*</span>
                        </label>
                        <TextAreaField
                            id="message"
                            name="message"
                            label=""
                            value={formData.message}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    message: e.target.value,
                                })
                            }
                            placeholder="Share why this person deserves recognition. Be specific about what they did and how it made a difference..."
                            rows={5}
                            className="w-full resize-none"
                        />
                        <div className="flex items-center justify-between mt-1.5">
                            <p className="text-xs text-gray-500">
                                {formData.message.length} / 1000 characters
                            </p>
                            {formData.message.length < 10 && (
                                <p className="text-xs text-red-500">
                                    Minimum 10 characters required
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Points */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Points{' '}
                                <span className="text-gray-400">(0-100)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent transition-all"
                                value={formData.points}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        points: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        {/* Public/Private Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Visibility
                            </label>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 h-[42px] flex items-center">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={formData.isPublic}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isPublic: e.target.checked,
                                            })
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

                {/* Submit Button */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 mt-auto">
                    <p className="text-xs text-gray-500">
                        Recognition will be visible to{' '}
                        {formData.isPublic ? 'everyone' : 'recipient only'}
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
                            className="bg-orion-blue hover:bg-orion-blue/90 text-white min-w-[160px]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Send Recognition 🎉'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
