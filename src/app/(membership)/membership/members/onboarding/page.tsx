'use client';

import OnboardingForm from '@/components/membership/members/onboarding';
import { PageGuard } from '@/components/permission/PageGuard';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import useMemberOnboardingStore from '@/store/useMemberOnboardingStore';

export default function Page() {
    const { activeStep, setActiveStep } = useMemberOnboardingStore();
    const maxSteps = 3;

    const handleSetActiveStep = (newStep: number) => {
        if (newStep < 0) {
            setActiveStep(0);
        } else if (newStep > maxSteps) {
            setActiveStep(maxSteps);
        } else {
            setActiveStep(newStep);
        }
    };

    return (
        <PageGuard permissions={[PERMISSIONS.ADD_MEMBERS]}>
            <OnboardingForm
                activeStep={activeStep}
                setActiveStep={handleSetActiveStep}
            />
        </PageGuard>
    );
}
