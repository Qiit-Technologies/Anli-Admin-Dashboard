'use client';

import Image from 'next/image';
import React from 'react';

export interface Step {
    id: number;
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export default function StepIndicator({
    steps,
    currentStep,
}: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center w-full max-w-[509px] h-auto md:h-[51px] mx-auto px-4 md:px-0">
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isActiveOrCompleted = isCurrent || isCompleted;
                const isLast = index === steps.length - 1;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center flex-shrink-0">
                            {isActiveOrCompleted ? (
                                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-[#F9F5FF] rounded-full">
                                    <Image
                                        src="/reservation/recheck.svg"
                                        alt="check"
                                        width={20}
                                        height={20}
                                        className="md:w-6 md:h-6"
                                    />
                                </div>
                            ) : (
                                <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#344054]" />
                                </div>
                            )}

                            <span
                                className={`
                                    mt-2 text-[10px] sm:text-xs md:text-[14px] whitespace-nowrap
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
                                    flex-1 min-w-[40px] sm:min-w-[80px] md:w-[167px] h-[1px] -mx-2 sm:-mx-4 md:-mx-[2.25rem] -mt-5 md:-mt-6
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
