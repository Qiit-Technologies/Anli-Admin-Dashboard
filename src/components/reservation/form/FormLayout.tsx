'use client';

import Image from 'next/image';
import React, { ReactNode } from 'react';
import StepIndicator, { Step } from './StepIndicator';
import FormNavigation from './FormNavigation';

interface FormLayoutProps {
    children: ReactNode;
    steps: Step[];
    currentStep: number;
    onPrevious?: () => void;
    onNext?: () => void;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    nextLabel?: string;
    isSubmitting?: boolean;
}

export default function FormLayout({
    children,
    steps,
    currentStep,
    onPrevious,
    onNext,
    isFirstStep = false,
    isLastStep = false,
    nextLabel = 'Next',
    isSubmitting = false,
}: FormLayoutProps) {
    return (
        <div className="relative w-full min-h-[600px] py-28 px-4 overflow-hidden bg-[#F9FCFF]">
            <div className="absolute left-0 bottom-0 -translate-x-1/4 opacity-30 pointer-events-none">
                <Image
                    src="/reservation/eathealthy.png"
                    alt="decorative"
                    width={268}
                    height={322}
                    className="object-contain"
                />
            </div>
            <div className="absolute right-0 top-0 translate-x-1/4 opacity-30 pointer-events-none">
                <Image
                    src="/reservation/eathealthy2.png"
                    alt="decorative"
                    width={268}
                    height={322}
                    className="object-contain"
                />
            </div>

            <div className="relative z-10 w-full max-w-[834px] mx-auto bg-[#FCFDFF]">
                <StepIndicator steps={steps} currentStep={currentStep} />

                <div className="mt-8 rounded-[24px] border border-[#EAECF0] bg-[#FCFDFF] pt-[33px] px-4 md:px-[30px] pb-[54px]">
                    <div className="space-y-6">{children}</div>

                    <FormNavigation
                        onPrevious={onPrevious}
                        onNext={onNext}
                        isFirstStep={isFirstStep}
                        isLastStep={isLastStep}
                        nextLabel={nextLabel}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
}
