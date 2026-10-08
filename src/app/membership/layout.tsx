import CustomLayout from '@/components/layout';
import { membershipNavItems } from '@/components/NavigationItems/Memebership';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Membership Module',
    description: 'Anli Membership Module',
};

const MembershipLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout
            baseRoute="/membership"
            scopedNavItems={membershipNavItems}
        >
            {children}
        </CustomLayout>
    );
};

export default MembershipLayout;
