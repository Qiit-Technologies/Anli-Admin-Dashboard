'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { MENU_PACKAGE_WIZARD_STEPS } from './constants';

interface MenuPackageStepperProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export default function MenuPackageStepper({
    currentStep,
    onStepClick,
}: MenuPackageStepperProps) {
    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex min-w-[640px] items-start justify-between gap-1">
                {MENU_PACKAGE_WIZARD_STEPS.map((step, index) => {
                    const isCompleted = step.step < currentStep;
                    const isCurrent = step.step === currentStep;
                    const isUpcoming = step.step > currentStep;

                    return (
                        <div
                            key={step.step}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {index < MENU_PACKAGE_WIZARD_STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[15px] h-0.5',
                                        isCompleted
                                            ? 'bg-emerald-500'
                                            : 'bg-gray-200',
                                    )}
                                />
                            )}
                            <button
                                type="button"
                                disabled={
                                    !onStepClick || step.step >= currentStep
                                }
                                onClick={() =>
                                    onStepClick && isCompleted
                                        ? onStepClick(step.step)
                                        : undefined
                                }
                                className={cn(
                                    'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition',
                                    isCompleted &&
                                        'bg-emerald-500 text-white',
                                    isCurrent &&
                                        'border-2 border-emerald-500 bg-white text-emerald-600',
                                    isUpcoming &&
                                        'bg-hexbrand text-white',
                                    onStepClick &&
                                        isCompleted &&
                                        'cursor-pointer hover:opacity-90',
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    step.step
                                )}
                            </button>
                            <div className="mt-3 max-w-[140px] text-center">
                                <p
                                    className={cn(
                                        'text-xs font-semibold leading-tight text-gray-900 md:text-sm',
                                        isCurrent && 'text-emerald-700',
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
