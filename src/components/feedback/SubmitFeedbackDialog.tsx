'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SelectField, TextAreaField } from '@/components/common/Form';
import { createFeedback } from '@/app/actions/feedback';
import toast from 'react-hot-toast';
import {
    FaExclamationTriangle,
    FaLightbulb,
    FaCommentAlt,
    FaTimes,
} from 'react-icons/fa';
import useSWR from 'swr';
import { getDepartments } from '@/app/actions/department';

interface SubmitFeedbackDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmitSuccess?: () => void;
}

interface SubmitFeedbackFormProps {
    onSubmitted?: () => void;
    onCancel?: () => void;
    hideHeader?: boolean;
}

const CATEGORIES = [
    {
        value: 'whistleblowing',
        label: '🚨 Whistleblowing (Report Misconduct)',
        icon: FaExclamationTriangle,
    },
    { value: 'suggestion', label: '💡 Suggestion', icon: FaLightbulb },
    { value: 'complaint', label: '📝 Complaint', icon: FaCommentAlt },
    { value: 'general', label: '💬 General Feedback', icon: FaCommentAlt },
];

const PRIORITIES = [
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'low', label: '🟢 Low' },
];

type Department = {
    id?: number | string;
    name?: string;
    departmentName?: string;
};

export function SubmitFeedbackForm({
    onSubmitted,
    onCancel,
    hideHeader = false,
}: SubmitFeedbackFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: 'general',
        priority: 'medium',
        message: '',
        department: '',
        isAnonymous: true,
    });
    const departmentsResponse = useSWR<Department[]>(
        '/departments',
        getDepartments,
    );
    const departments = departmentsResponse.data ?? [];
    const departmentsLoading = departmentsResponse.isLoading;
    const departmentOptions = Array.isArray(departments)
        ? (departments
              .map((dept) => {
                  const label =
                      dept.name ??
                      dept.departmentName ??
                      `Department ${dept.id ?? ''}`;
                  const value =
                      dept.name ??
                      dept.departmentName ??
                      (dept.id !== undefined ? String(dept.id) : '');

                  if (!value) {
                      return null;
                  }

                  return {
                      value,
                      label,
                  };
              })
              .filter(Boolean) as { value: string; label: string }[])
        : [];

    const selectedDepartmentValue = formData.department
        ? (departmentOptions.find((opt) => opt.label === formData.department)
              ?.value ?? 'none')
        : 'placeholder';

    const handleSubmit = async () => {
        if (!formData.message.trim() || formData.message.length < 10) {
            toast.error(
                'Please provide a detailed message (at least 10 characters)',
            );
            return;
        }

        setLoading(true);
        try {
            await createFeedback({
                category: formData.category,
                priority: formData.priority,
                message: formData.message,
                department: formData.department || undefined,
                isAnonymous: formData.isAnonymous,
            });

            toast.success(
                'Feedback submitted successfully! Thank you for your input.',
            );
            setFormData({
                category: 'general',
                priority: 'medium',
                message: '',
                department: '',
                isAnonymous: true,
            });
            onSubmitted?.();
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to submit feedback';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const isWhistleblowing = formData.category === 'whistleblowing';

    return (
        <div className="space-y-5 px-6 py-4 overflow-y-auto flex-1">
            {!hideHeader && (
                <p className="text-sm text-gray-500">
                    Your voice matters. Share your thoughts securely.
                </p>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                            🔒
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                                Anonymous Submission
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formData.isAnonymous
                                    ? 'Your identity is protected'
                                    : 'Your name will be visible'}
                            </p>
                        </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isAnonymous}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isAnonymous: e.target.checked,
                                })
                            }
                            disabled={isWhistleblowing}
                            className="sr-only peer"
                        />
                        <div
                            className={`w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-orion-blue after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${
                                isWhistleblowing
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }`}
                        ></div>
                    </label>
                </div>

                {isWhistleblowing && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                            <span className="text-red-500">⚠️</span>
                            Whistleblowing reports are always anonymous for your
                            protection
                        </p>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type
                </label>
                <SelectField
                    id="category"
                    name="category"
                    label=""
                    value={formData.category}
                    onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                    }
                    options={CATEGORIES}
                />
                {formData.category === 'whistleblowing' && (
                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                        <div className="flex items-start gap-2">
                            <span className="text-red-500 text-lg mt-0.5">
                                🚨
                            </span>
                            <div>
                                <p className="text-sm font-medium text-red-900 mb-1">
                                    Confidential Report
                                </p>
                                <p className="text-xs text-red-700">
                                    High priority • Management notified •
                                    Identity protected
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level
                    </label>
                    <SelectField
                        id="priority"
                        name="priority"
                        label=""
                        value={formData.priority}
                        onValueChange={(value) =>
                            setFormData({
                                ...formData,
                                priority: value,
                            })
                        }
                        options={PRIORITIES}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department{' '}
                        <span className="text-gray-400">(Optional)</span>
                    </label>
                    <SelectField
                        id="department"
                        name="department"
                        label=""
                        value={selectedDepartmentValue}
                        onValueChange={(value) => {
                            if (value === 'none' || value === 'placeholder') {
                                setFormData({
                                    ...formData,
                                    department: '',
                                });
                                return;
                            }

                            const option = departmentOptions.find(
                                (opt) => opt.value === value,
                            );
                            setFormData({
                                ...formData,
                                department: option?.label ?? value,
                            });
                        }}
                        options={[
                            {
                                value: 'placeholder',
                                label: departmentsLoading
                                    ? 'Loading departments...'
                                    : 'Select department (optional)',
                            },
                            { value: 'none', label: 'No department' },
                            ...departmentOptions,
                        ]}
                    />
                </div>
            </div>

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
                    placeholder="Share your thoughts, suggestions, or concerns in detail..."
                    rows={6}
                    className="w-full resize-none"
                />
                <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-500">
                        {formData.message.length} / 5000 characters
                    </p>
                    {formData.message.length < 10 && (
                        <p className="text-xs text-red-500">
                            Minimum 10 characters required
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    All submissions are secure and confidential
                </p>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onCancel?.()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || formData.message.length < 10}
                        className="bg-orion-blue hover:bg-orion-blue/90 text-white min-w-[140px]"
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
                                Submitting...
                            </span>
                        ) : (
                            'Submit Feedback'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function SubmitFeedbackDialog({
    // trigger,
    open: controlledOpen,
    onOpenChange,
    onSubmitSuccess,
}: SubmitFeedbackDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orion-blue/10 flex items-center justify-center text-xl">
                                💬
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">
                                    Submit Feedback
                                </DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Your voice matters. Share your thoughts
                                    securely.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="rounded-full h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <FaTimes size={16} />
                        </Button>
                    </div>
                </DialogHeader>

                <SubmitFeedbackForm
                    onSubmitted={() => {
                        onSubmitSuccess?.();
                        setOpen(false);
                    }}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
