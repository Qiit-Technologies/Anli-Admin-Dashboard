'use client';
import CertificateForm from '@/components/onboarding/CertificateForm';
import ServicesForm from '@/components/onboarding/ServicesForm';
import ChooseServiceSidebar from '@/components/onboarding/Sidebar';
import { useMultistepForm } from '@/hooks/useMultistepForm';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useCallback, useMemo, useState } from 'react';

type FormData = {
    services: string[];
    orgData: { certificate: File; taxId: string };
};

const INITIAL_DATA: FormData = {
    services: [],
    orgData: { certificate: new File([], ''), taxId: '' },
};

export default function OnBoarding() {
    const [isVerified, setIsVerified] = useState(false);

    const [data, setData] = useState<FormData>(INITIAL_DATA);

    const updateFields = useCallback((fields: Partial<FormData>) => {
        setData((prev) => ({ ...prev, ...fields }));
    }, []);

    const steps = useMemo(
        () => [
            <ServicesForm
                key="services-form"
                {...data}
                updateFields={updateFields}
            />,
            <CertificateForm
                key="certificate-form"
                {...data}
                updateFields={updateFields}
                isVerified={isVerified}
                setIsVerified={setIsVerified}
            />,
        ],
        [data, isVerified, updateFields],
    );

    const { currentStepIndex, step, isLastStep, next, back } =
        useMultistepForm(steps);

    const onSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (!isLastStep) return next();
        },
        [isLastStep, next],
    );

    const canRenderSubmitButton = currentStepIndex === 0;

    return (
        <div className="flex h-screen relative">
            <ChooseServiceSidebar currentStep={currentStepIndex} />
            {currentStepIndex > 0 && (
                <button
                    onClick={back}
                    className="absolute flex items-center gap-2 z-30 top-5 left-10"
                >
                    <ArrowLeft /> Back
                </button>
            )}

            <form
                onSubmit={onSubmit}
                className="flex-1 flex py-10 flex-col h-full items-center justify-center"
            >
                {step}
                {canRenderSubmitButton && (
                    <button
                        className="w-full max-w-md px-6 py-3 mt-auto mb-12 bg-orion-blue text-white rounded-lg font-medium text-sm disabled:bg-blue"
                        type="submit"
                    >
                        Continue
                    </button>
                )}
            </form>
        </div>
    );
}
