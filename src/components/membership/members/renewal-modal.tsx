'use client';

import { editMember, getMembershipPlans } from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { CustomSheet } from '@/components/common/CustomSheet';
import { SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import {
    getMaximumBirthDateForMinAge,
    validateMemberDateOfBirth,
} from '@/lib/membership/member-utils';
import { Member } from '@/types/membership/membership';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import FileUploader from '../fileUploader';

const RenewalModal = ({
    onClose,
    onRenewed,
    member,
    open,
}: {
    onClose: () => void;
    onRenewed?: () => void | Promise<void>;
    member: Member;
    open: boolean;
}) => {
    const [formData, setFormData] = useState({
        endDate: member.endDate ? member.endDate.split('T')[0] : '',
        planId: member.plan?.id?.toString() || '',
        reason: '',
        dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileUrl] = useState<string>('');

    const { data: plansData } = useSWR(
        '/api/membership-plans',
        getMembershipPlans,
    );
    const plans = plansData?.data.membershipPlans || [];

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'anli_default');

        try {
            const uploadResponse = await fetch(
                'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            const imageData = await uploadResponse.json();
            return imageData.secure_url;
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.custom(
                <Toast
                    title="Upload Failed"
                    description="File upload failed. Please try again."
                    type="error"
                />,
            );
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const planIdNumber = parseInt(formData.planId.toString(), 10);
        if (isNaN(planIdNumber)) {
            toast.custom(
                <Toast
                    title="Invalid Plan"
                    description="Please select a valid membership plan"
                    type="error"
                />,
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const dobValidation = validateMemberDateOfBirth(formData.dateOfBirth);
            if (!dobValidation.valid) {
                toast.custom(
                    <Toast
                        title="Invalid date of birth"
                        description={
                            dobValidation.message ?? 'Invalid date of birth'
                        }
                        type="error"
                    />,
                );
                setIsSubmitting(false);
                return;
            }

            let fileUrl = uploadedFileUrl;
            if (selectedFile) {
                const uploadedUrl = await uploadFile(selectedFile);
                if (uploadedUrl !== null) {
                    fileUrl = uploadedUrl;
                }
                if (!fileUrl) {
                    setIsSubmitting(false);
                    return;
                }
            }

            const updateData = {
                endDate: formData.endDate,
                planId: planIdNumber,
                dateOfBirth: formData.dateOfBirth || undefined,
                renewalReason: formData.reason || undefined,
                ...(fileUrl && { identificationUrl: fileUrl }),
            };

            const response = await editMember(member.id, updateData);

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.data) {
                throw new Error('Failed to renew membership');
            }

            await Promise.all([
                mutate(
                    (key) =>
                        Array.isArray(key) && String(key[0]) === '/api/members',
                ),
                mutate(`/api/members/${member.id}`),
            ]);
            await onRenewed?.();

            toast.custom(
                <Toast
                    title="Membership Renewed"
                    description="Membership has been successfully renewed"
                    type="success"
                />,
            );

            onClose();
        } catch (error: any) {
            console.error('Renewal error:', error);
            toast.custom(
                <Toast
                    title="Renewal Failed"
                    description={
                        error instanceof Error
                            ? error.message
                            : 'An error occurred while renewing membership'
                    }
                    type="error"
                />,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const planOptions = plans.map((plan: any) => ({
        value: plan.id.toString(),
        label: `${plan.name} - ₦${plan.price}`,
    }));

    return (
        <CustomSheet
            trigger={<div />}
            title="Renew Membership"
            open={open}
            setOpen={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
            onClose={onClose}
        >
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#111111] mb-1">
                            New Expiry Date *
                        </label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) =>
                                handleInputChange('endDate', e.target.value)
                            }
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-md placeholder:font-normal"
                        />
                    </div>

                    <SelectField
                        id="planId"
                        name="planId"
                        label="Membership Plan *"
                        className="bg-white h-12 shadow-none border border-gray-300"
                        value={formData.planId.toString()}
                        onValueChange={(value) =>
                            handleInputChange('planId', value)
                        }
                        options={planOptions}
                        placeholder="Select membership plan"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-[#111111] mb-1">
                            Reason for change (optional)
                        </label>
                        <input
                            type="text"
                            value={formData.reason}
                            onChange={(e) =>
                                handleInputChange('reason', e.target.value)
                            }
                            placeholder="Internal notes (e.g., loyalty upgrade)"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-md placeholder:font-normal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111111] mb-1">
                            Date of birth
                        </label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                                handleInputChange('dateOfBirth', e.target.value)
                            }
                            max={getMaximumBirthDateForMinAge()}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-md placeholder:font-normal"
                        />
                    </div>

                    <div>
                        <FileUploader
                            label="File upload (Eg passport or any accepted ID) optional"
                            onFileChange={(file) => setSelectedFile(file)}
                            value={uploadedFileUrl}
                        />
                    </div>

                    <BrandButton
                        type="submit"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        className="h-12 w-full"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Renewal'}
                    </BrandButton>
                </form>
            </div>
        </CustomSheet>
    );
};

export default RenewalModal;
