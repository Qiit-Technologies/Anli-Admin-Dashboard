import { getMembershipPlans } from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import useMemberOnboardingStore from '@/store/useMemberOnboardingStore';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { MFormColumn } from '../form';

interface MembershipPlan {
    id: string;
    name: string;
    description?: string;
    price?: number;
    maxDurationMonths: number;
}

const MembershipDetails: React.FC = () => {
    const {
        nextStep,
        membershipDetails,
        setMembershipDetailsField,
        updateMembershipDetails,
        setStepValidation,
        validateCurrentStep,
    } = useMemberOnboardingStore();

    const {
        data,
        error,
        isLoading: loading,
    } = useSWR('/api/membership/plans', getMembershipPlans);

    const membershipPlans = data?.data?.membershipPlans as MembershipPlan[];

    useEffect(() => {
        if (membershipDetails.membershipPlan && membershipPlans) {
            const selectedPlan = membershipPlans.find(
                (plan) => plan.id === membershipDetails.membershipPlan,
            );

            if (selectedPlan) {
                const today = new Date();
                const startDate = today.toISOString().split('T')[0];
                const endDate = new Date(today);
                endDate.setMonth(
                    endDate.getMonth() + selectedPlan.maxDurationMonths,
                );
                const formattedEndDate = endDate.toISOString().split('T')[0];

                updateMembershipDetails({
                    startDate,
                    endDate: formattedEndDate,
                    planId: parseInt(selectedPlan.id),
                });
            }
        }
    }, [
        membershipDetails.membershipPlan,
        membershipPlans,
        updateMembershipDetails,
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateCurrentStep();
        setStepValidation(2, isValid);
        if (isValid) {
            nextStep();
        }
    };

    const inputStyle =
        'w-full border bg-white h-12 shadow-none border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    if (error) {
        toast.custom(
            <Toast
                type="error"
                title="Error loading membership plans"
                description="Please try again later."
            />,
        );
    }

    return (
        <form
            className="space-y-6 w-full max-w-[600px]"
            onSubmit={handleSubmit}
        >
            <SelectField
                id="membershipPlan"
                name="membershipPlan"
                label="Membership Plan"
                options={
                    membershipPlans?.map((plan) => ({
                        value: plan.id,
                        label: plan.name,
                    })) || []
                }
                value={membershipDetails.membershipPlan}
                onValueChange={(value) =>
                    setMembershipDetailsField('membershipPlan', value)
                }
                className={inputStyle}
            />

            <MFormColumn>
                <InputField
                    id="startDate"
                    name="startDate"
                    label="Start Date"
                    type="date"
                    placeholder="dd/mm/yy"
                    value={membershipDetails.startDate}
                    onChange={(e) =>
                        setMembershipDetailsField('startDate', e.target.value)
                    }
                    className={inputStyle}
                />
                <InputField
                    id="endDate"
                    name="endDate"
                    label="End Date"
                    type="date"
                    placeholder="dd/mm/yy"
                    value={membershipDetails.endDate}
                    onChange={(e) =>
                        setMembershipDetailsField('endDate', e.target.value)
                    }
                    className={inputStyle}
                />
            </MFormColumn>

            <BrandButton
                type="submit"
                className="w-full bg-[#007BFF] hover:bg-blue-600 text-white py-3 h-12 rounded-md font-medium"
                disabled={
                    loading || !!error || !membershipDetails.membershipPlan
                }
            >
                Continue
            </BrandButton>
        </form>
    );
};

export default MembershipDetails;
