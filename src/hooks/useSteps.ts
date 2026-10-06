'use client';
import { ReactElement, useCallback, useState } from 'react';

export type Step = {
    label: string;
    component: ReactElement;
};

export function useSteps() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const next = useCallback(() => {
        setCurrentStepIndex((i) => i + 1);
    }, []);

    const back = useCallback(() => {
        setCurrentStepIndex((i) => i - 1);
    }, []);

    const goTo = useCallback((index: number) => {
        setCurrentStepIndex(index);
    }, []);

    const reset = useCallback(() => {
        setCurrentStepIndex(0);
    }, []);

    return {
        currentStepIndex,
        next,
        back,
        goTo,
        reset,
    };
}
