'use client';

import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';
import IdentityVerification from './identityVerification';
import MembershipDetails from './membershipDetails';
import ProfileInformation from './profileInformation';
import Referrals from './referrals';
import { OnboardingFormProps } from './types';

const steps = [
    {
        title: 'Member Profile Information',
        subTitle: 'Please provide your name and email',
        component: ProfileInformation,
    },
    {
        title: 'Identity Verification',
        subTitle: 'Please provide the user information',
        component: IdentityVerification,
    },
    {
        title: 'Membership Details',
        subTitle: 'Please provide the user information',
        component: MembershipDetails,
    },
    {
        title: 'Referrals',
        subTitle:
            'Each referral entry includes the following fields for this plan. You have access to referral 2 person',
        component: Referrals,
    },
];

const OnboardingForm: React.FC<OnboardingFormProps> = ({
    activeStep,
    setActiveStep,
}) => {
    const pathname = usePathname();
    const editing = pathname.includes('edit');

    return (
        <div className="flex min-h-screen">
            {!editing && (
                <div className="w-1/3 bg-[#150C03] hidden md:block text-white px-10 py-12">
                    <h2 className="text-2xl font-semibold mb-3">
                        New Member Onboarding Form
                    </h2>
                    <p className="text-sm font-normal text-white mb-10">
                        Please complete the form below to register a new member
                        into the system. Ensure that all details are accurate
                        and all required documents are uploaded before
                        submission.
                    </p>

                    <div className="space-y-8">
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 ${
                                            activeStep === idx
                                                ? 'bg-[#FF9933] border-[#FF9933]'
                                                : 'bg-white border-gray-400'
                                        }`}
                                    ></div>
                                    {idx < steps.length - 1 && (
                                        <div className="w-px h-10 bg-gray-500 mt-1"></div>
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-medium ${
                                            activeStep === idx
                                                ? 'text-[#FF9933]'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-[#D9D9D9] font-normal">
                                        {step.subTitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={cn('flex-1 bg-white px-4 md:px-20 py-12')}>
                <button
                    onClick={() => {
                        if (activeStep === 0) {
                            window.history.back();
                        } else {
                            setActiveStep(activeStep - 1);
                        }
                    }}
                    className="text-[#FB923C] font-medium flex items-center gap-2 mb-4 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="my-10">
                    <h1 className="text-4xl font-semibold text-[#2F1802] mb-1">
                        {editing
                            ? `Edit ${steps[activeStep].title}`
                            : steps[activeStep].title}
                    </h1>
                    <p className="text-md font-semibold text-[#455A64] mb-8">
                        {steps[activeStep].subTitle}
                    </p>
                </div>

                {React.createElement(steps[activeStep].component)}
            </div>
        </div>
    );
};

export default OnboardingForm;
