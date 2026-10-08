'use client';

import { RENT_WIZARD_STEPS } from '@/components/banquest/rented-items/rent-wizard/constants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface RentWizardStepperProps {
    currentStep: number;
}

export default function RentWizardStepper({
    currentStep,
}: RentWizardStepperProps) {
    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex min-w-[640px] items-start justify-between gap-1">
                {RENT_WIZARD_STEPS.map((step, index) => {
                    const isCompleted = step.step < currentStep;
                    const isCurrent = step.step === currentStep;

                    return (
                        <div
                            key={step.step}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {index < RENT_WIZARD_STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[15px] h-0.5',
                                        isCompleted
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-200',
                                    )}
                                />
                            )}
                            <div
                                className={cn(
                                    'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                    isCompleted &&
                                        'bg-emerald-500 text-white',
                                    isCurrent &&
                                        'border-2 border-emerald-500 bg-white text-emerald-600',
                                    !isCompleted &&
                                        !isCurrent &&
                                        'border-2 border-emerald-500 bg-white text-emerald-600',
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-4 w-4" />
                                ) : null}
                            </div>
                            <div className="mt-3 max-w-[160px] text-center">
                                <p
                                    className={cn(
                                        'text-xs font-semibold leading-tight text-gray-900 md:text-sm',
                                        (isCurrent || isCompleted) &&
                                            'text-emerald-700',
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
