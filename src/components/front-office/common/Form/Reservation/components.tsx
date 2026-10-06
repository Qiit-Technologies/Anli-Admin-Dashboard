import React, { ReactNode } from 'react';
import { Check, Circle, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepperItemProps } from './types';

export function StepperItem({
    step,
    currentStep,
    totalSteps,
    isValid,
    onClick,
}: StepperItemProps) {
    let state: 'completed' | 'active' | 'inactive' = 'inactive';

    if (step.step < currentStep) {
        state = 'completed';
    } else if (step.step === currentStep) {
        state = 'active';
    }

    return (
        <div className="relative flex w-full flex-col items-center justify-center">
            {step.step !== totalSteps && (
                <div
                    className={cn(
                        'absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted',
                        state === 'completed' && 'bg-orion-blue',
                    )}
                />
            )}

            <Button
                variant={
                    state === 'completed' || state === 'active'
                        ? 'default'
                        : 'outline'
                }
                size="icon"
                className={cn(
                    'z-10 rounded-full bg-gray-200 shrink-0',
                    state === 'completed' && 'bg-orion-blue',
                    state === 'active' &&
                    'ring-2 ring-gray-100 bg-orion-blue ring-offset-2 ring-offset-background',
                )}
                disabled={state !== 'completed' && !isValid}
                onClick={onClick}
            >
                {state === 'completed' && <Check className="h-3 w-3" />}
                {state === 'active' && (
                    <Circle className="h-3 w-3 rounded-full" />
                )}
                {state === 'inactive' && (
                    <Dot className="h-3 w-3 bg-white text-white rounded-full" />
                )}
            </Button>

            <div className="mt-5 flex flex-col items-center text-center">
                <div
                    className={cn(
                        'text-sm font-semibold transition lg:text-base',
                        state === 'active' && 'text-primary',
                    )}
                >
                    {step.title}
                </div>
                <div
                    className={cn(
                        'sr-only text-xs text-muted-foreground line-clamp-2 transition md:not-sr-only lg:text-sm',
                        state === 'active' && 'text-primary',
                    )}
                >
                    {step.description}
                </div>
            </div>
        </div>
    );
}

export const FormGroup = ({ children }: { children: ReactNode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    );
};

export const FormColumn = ({ children }: { children: ReactNode }) => {
    return <div className="flex flex-col gap-1">{children}</div>;
};
