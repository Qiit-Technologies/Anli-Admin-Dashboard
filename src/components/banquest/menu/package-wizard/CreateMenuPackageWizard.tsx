'use client';

import { createBanquetMenuPackage } from '@/app/actions/banquet-menu-package';
import SectionHeader from '@/components/banquest/booking-wizard/SectionHeader';
import { wizardStateToMenuPackagePayload } from '@/components/banquest/menu/utils/wizard-to-menu-package';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import MenuPackageSidebar from './MenuPackageSidebar';
import MenuPackageStepper from './MenuPackageStepper';
import PackageInformationStep from './steps/PackageInformationStep';
import PricingStep from './steps/PricingStep';
import ReviewDetailsStep from './steps/ReviewDetailsStep';
import SelectMenuItemsStep from './steps/SelectMenuItemsStep';
import {
    defaultMenuPackageWizardState,
    MenuPackageWizardState,
} from './types';

const STEP_META: Record<
    number,
    { title: string; subtitle: string; primary: string }
> = {
    1: {
        title: 'Package Information',
        subtitle: 'Provide basic information about this package',
        primary: 'Next Step',
    },
    2: {
        title: 'Select Menu Item',
        subtitle:
            'Select and configure the menu item from your existing menu',
        primary: 'Next Step',
    },
    3: {
        title: 'Pricing Configuration',
        subtitle: 'Set the price for this menu package',
        primary: 'Next Step',
    },
    4: {
        title: 'Review Details',
        subtitle: 'Review and approval each info',
        primary: 'Save Package',
    },
};

export default function CreateMenuPackageWizard() {
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const [state, setState] = useState<MenuPackageWizardState>(
        defaultMenuPackageWizardState(),
    );
    const [isLoading, setIsLoading] = useState(false);

    const onChange = useCallback(
        <K extends keyof MenuPackageWizardState>(
            field: K,
            value: MenuPackageWizardState[K],
        ) => {
            setState((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const meta = STEP_META[step] ?? STEP_META[1];

    const handlePrimary = async () => {
        if (step < 4) {
            setStep(step + 1);
            return;
        }

        if (!state.packageName.trim()) {
            toast.custom(() => (
                <Toast
                    title="Missing name"
                    description="Enter a package name before saving."
                    type="error"
                />
            ));
            return;
        }

        setIsLoading(true);
        try {
            const payload = await wizardStateToMenuPackagePayload(state);
            const result = await createBanquetMenuPackage(payload);

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error}
                        type="error"
                    />
                ));
                return;
            }

            await mutate('/banquet/menu-packages');
            await mutate('/banquet/menu-packages/stats');

            toast.custom(() => (
                <Toast
                    title="Package saved"
                    description="Menu package created successfully."
                    type="success"
                />
            ));
            router.push('/banquet/menu-details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step <= 1) {
            router.push('/banquet/menu-details');
            return;
        }
        setStep(step - 1);
    };

    const stepContent = () => {
        switch (step) {
            case 1:
                return (
                    <PackageInformationStep state={state} onChange={onChange} />
                );
            case 2:
                return (
                    <SelectMenuItemsStep state={state} onChange={onChange} />
                );
            case 3:
                return <PricingStep state={state} onChange={onChange} />;
            case 4:
                return <ReviewDetailsStep state={state} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <MenuPackageStepper
                currentStep={step}
                onStepClick={(s) => s < step && setStep(s)}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <SectionHeader
                        title={meta.title}
                        subtitle={meta.subtitle}
                    />
                    <div className="mt-6">{stepContent()}</div>
                    <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            disabled={isLoading}
                            onClick={handleBack}
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>
                        <BrandButton
                            type="button"
                            className="w-full sm:w-auto min-w-[160px]"
                            onClick={handlePrimary}
                            disabled={isLoading}
                        >
                            {meta.primary}
                        </BrandButton>
                    </div>
                </div>

                <MenuPackageSidebar
                    state={state}
                    onChange={onChange}
                    showAdditionalItems={step === 2}
                />
            </div>
        </div>
    );
}
