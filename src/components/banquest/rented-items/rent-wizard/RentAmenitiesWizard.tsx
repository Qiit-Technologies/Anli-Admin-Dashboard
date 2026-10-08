'use client';

import { createBanquetRental } from '@/app/actions/banquet-rental';
import { wizardStateToRentalPayload } from '@/components/banquest/rented-items/utils/wizard-to-rental';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import RentWizardStepper from './RentWizardStepper';
import RentalDetailsStep from './steps/RentalDetailsStep';
import ReviewDetailsStep from './steps/ReviewDetailsStep';
import SelectAmenitiesStep from './steps/SelectAmenitiesStep';
import {
    INITIAL_RENT_WIZARD_STATE,
    RentWizardState,
} from './types';

interface Props {
    onComplete?: () => void;
}

export default function RentAmenitiesWizard({ onComplete }: Props) {
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(1);
    const [state, setState] = useState<RentWizardState>(
        INITIAL_RENT_WIZARD_STATE,
    );
    const [submitting, setSubmitting] = useState(false);

    const patch = (p: Partial<RentWizardState>) =>
        setState((prev) => ({ ...prev, ...p }));

    const canContinue =
        step !== 1 || state.selections.some((s) => s.quantity > 0);

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
            return;
        }

        setSubmitting(true);
        try {
            const payload = wizardStateToRentalPayload(state);
            const result = await createBanquetRental(payload);

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

            await mutate('/banquet/rentals');
            await mutate('/banquet/rentals/stats');
            await mutate('/banquet/inventory');
            await mutate('/banquet/inventory/stats');

            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Rental confirmed successfully"
                    type="success"
                />
            ));

            onComplete?.();
            router.push('/banquet/rented-item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="space-y-8">
            <RentWizardStepper currentStep={step} />

            {step === 1 && (
                <SelectAmenitiesStep state={state} onChange={patch} />
            )}
            {step === 2 && (
                <RentalDetailsStep state={state} onChange={patch} />
            )}
            {step === 3 && <ReviewDetailsStep state={state} />}

            <div className="flex flex-wrap items-center justify-between gap-3">
                {step > 1 ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="border-gray-200"
                        onClick={handleBack}
                        disabled={submitting}
                    >
                        Back
                    </Button>
                ) : (
                    <span />
                )}
                <div className="flex gap-3">
                    {step === 3 ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-200"
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <BrandButton
                                type="button"
                                onClick={handleNext}
                                disabled={submitting}
                            >
                                {submitting
                                    ? 'Confirming…'
                                    : 'Confirm Rental'}
                            </BrandButton>
                        </>
                    ) : (
                        <BrandButton
                            type="button"
                            disabled={!canContinue || submitting}
                            onClick={handleNext}
                        >
                            {step === 2 ? 'Save & Continue' : 'Continue'}
                        </BrandButton>
                    )}
                </div>
            </div>
        </div>
    );
}
