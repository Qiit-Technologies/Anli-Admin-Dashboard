'use client';

import React from 'react';

interface FormNavigationProps {
    onPrevious?: () => void;
    onNext?: () => void;
    isFirstStep?: boolean;
    isLastStep?: boolean;
    nextLabel?: string;
    previousLabel?: string;
    isSubmitting?: boolean;
}

export default function FormNavigation({
    onPrevious,
    onNext,
    isFirstStep = false,
    isLastStep = false,
    nextLabel = 'Next',
    previousLabel = 'Previous',
    isSubmitting = false,
}: FormNavigationProps) {
    return (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-#D6D6D6">
            <button
                type="button"
                onClick={onPrevious}
                disabled={isFirstStep || isSubmitting}
                className={`
                    h-[53px] w-[172px] rounded-[8px] text-base font-medium transition-all border border-#CBCED0
                    ${isFirstStep || isSubmitting ? 'cursor-not-allowed opacity-50' : 'text-[#344054]'}
                `}
            >
                {previousLabel}
            </button>

            <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting}
                className={`h-[53px] w-[172px] bg-blue text-white rounded-[8px] text-base font-semibold transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSubmitting
                    ? 'Submitting...'
                    : isLastStep
                      ? 'Submit'
                      : nextLabel}
            </button>
        </div>
    );
}
