import { useState } from 'react';

export const useStepNavigation = (totalSteps: number, initialStep = 1) => {
    const [stepIndex, setStepIndex] = useState(initialStep);

    const nextStep = () => {
        if (stepIndex < totalSteps) {
            setStepIndex(stepIndex + 1);
        }
    };

    const prevStep = () => {
        if (stepIndex > 1) {
            setStepIndex(stepIndex - 1);
        }
    };

    const goToStep = (step: number) => {
        if (step >= 1 && step <= totalSteps) {
            setStepIndex(step);
        }
    };

    const isPrevDisabled = stepIndex === 1;
    const isLastStep = stepIndex === totalSteps;

    return {
        stepIndex,
        setStepIndex,
        nextStep,
        prevStep,
        goToStep,
        isPrevDisabled,
        isLastStep,
    };
};
