'use client';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import React, { useState } from 'react';

interface PlanFormData {
    name: string;
    price: string;
    numberOfReferrals: string;
    maxDurationMonths: string;
}

interface CreatePlanFormProps {
    onSubmit: (planData: {
        name: string;
        price: number;
        numberOfReferrals: number;
        maxDurationMonths: number;
    }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
    initialData?: {
        name: string;
        price: number;
        numberOfReferrals: number;
        maxDurationMonths: number;
    };
    planId?: number;
}

const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
    onSubmit,
    isLoading = false,
    mode = 'create',
    initialData,
}) => {
    const [formData, setFormData] = useState<PlanFormData>({
        name: initialData?.name || '',
        price: initialData?.price?.toString() || '',
        numberOfReferrals: initialData?.numberOfReferrals?.toString() || '',
        maxDurationMonths: initialData?.maxDurationMonths?.toString() || '',
    });

    const handleInputChange = (field: keyof PlanFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const planData = {
                name: formData.name,
                price: parseFloat(formData.price) || 0,
                numberOfReferrals: parseInt(formData.numberOfReferrals) || 0,
                maxDurationMonths: parseInt(formData.maxDurationMonths) || 0,
            };

            await onSubmit(planData);

            setFormData({
                name: '',
                price: '',
                numberOfReferrals: '',
                maxDurationMonths: '',
            });
        } catch (error: any) {
            console.error('Error in form submission:', error);
        }
    };

    const getTierDisplay = (numberOfReferrals: number): string => {
        if (numberOfReferrals <= 0) return '';

        if (numberOfReferrals <= 2) {
            const tiers = [];
            for (let i = 1; i <= numberOfReferrals; i++) {
                tiers.push(`Tier ${i}`);
            }
            return tiers.join(', ');
        } else {
            const tiers = [];
            const tierCount = Math.ceil(numberOfReferrals / 2);

            for (let i = 1; i <= tierCount; i++) {
                tiers.push(`Tier ${i}A`);
                if (tiers.length < numberOfReferrals) {
                    tiers.push(`Tier ${i}B`);
                }
            }

            return tiers.slice(0, numberOfReferrals).join(', ');
        }
    };

    const currentReferrals = parseInt(formData.numberOfReferrals) || 0;
    const tierDisplay = getTierDisplay(currentReferrals);
    const className =
        'bg-white h-12 shadow-none border border-gray-200 rounded-md';

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <InputField
                        id="planName"
                        name="planName"
                        label="Plan Name"
                        type="text"
                        className={className}
                        value={formData.name}
                        onChange={(e) =>
                            handleInputChange('name', e.target.value)
                        }
                        placeholder="e.g Gold Membership"
                        required
                    />

                    <InputField
                        id="numberOfReferrals"
                        name="numberOfReferrals"
                        label="Max Referrals"
                        type="number"
                        maxLength={1}
                        className={className}
                        value={formData.numberOfReferrals}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value <= 10 || e.target.value === '') {
                                handleInputChange(
                                    'numberOfReferrals',
                                    e.target.value,
                                );
                            }
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (parseInt(target.value) > 10) {
                                target.value = '10';
                            }
                        }}
                        placeholder="0"
                        min="0"
                        required
                    />

                    <InputField
                        id="maxDurationMonths"
                        name="maxDurationMonths"
                        label="Max Duration (Months)"
                        type="number"
                        className={className}
                        value={formData.maxDurationMonths}
                        onChange={(e) =>
                            handleInputChange(
                                'maxDurationMonths',
                                e.target.value,
                            )
                        }
                        placeholder="12"
                        min="1"
                        required
                    />
                    <InputField
                        id="planPrice"
                        name="planPrice"
                        label="Price (₦)"
                        type="number"
                        className={className}
                        value={formData.price}
                        onChange={(e) =>
                            handleInputChange('price', e.target.value)
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                {tierDisplay && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">
                            Generated Tiers:
                        </h3>
                        <p className="text-sm text-blue-700">{tierDisplay}</p>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <BrandButton
                        type="submit"
                        loading={isLoading}
                        disabled={isLoading || !formData.name}
                        className="h-12 w-full"
                    >
                        {mode === 'edit' ? 'Update Plan' : 'Create Plan'}
                    </BrandButton>
                </div>
            </form>
        </div>
    );
};

export default CreatePlanForm;
