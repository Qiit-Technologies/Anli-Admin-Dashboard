'use client';

import Image from 'next/image';
import React from 'react';

export interface Step {
    id: number;
    label: string;
}

interface DashboardStepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export function DashboardStepIndicator({
    steps,
    currentStep,
}: DashboardStepIndicatorProps) {
    return (
        <div className="flex items-center justify-center w-full max-w-[400px] mx-auto">
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isActiveOrCompleted = isCurrent || isCompleted;
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center flex-shrink-0">
                            {isActiveOrCompleted ? (
                                <div className="w-5 h-5 flex items-center justify-center bg-[#F9F5FF] rounded-full">
                                    <Image
                                        src="/reservation/recheck.svg"
                                        alt="check"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                            ) : (
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#344054]" />
                                </div>
                            )}

                            <span
                                className={`
                                    mt-2 text-xs whitespace-nowrap text-center
                                    ${
                                        isCurrent
                                            ? 'text-[#2F1802] font-medium'
                                            : isCompleted
                                              ? 'text-[#2F1802] font-medium'
                                              : 'text-[#8B8E95]'
                                    }
                                `}
                            >
                                {step.label}
                            </span>
                        </div>

                        {!isLast && (
                            <div
                                className={`
                                    flex-1 min-w-[60px] h-[1px] -mx-4 -mt-5
                                    ${isCompleted ? 'bg-[#FF872A]' : 'bg-[#CFD0D2]'}
                                `}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
