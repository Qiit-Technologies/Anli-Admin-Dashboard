import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Member Onboarding',
    description: 'Anli Member Onboarding',
};

const MembershipOnboardingLayout = async ({
    children,
}: {
    children: ReactNode;
}) => {
    return <>{children}</>;
};

export default MembershipOnboardingLayout;
