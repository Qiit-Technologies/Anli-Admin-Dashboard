import CustomLayout from '@/components/layout';
import { membershipAdminNavItems } from '@/components/NavigationItems/Memebership';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Membership Admin Module',
    description: 'Anli Membership Admin Module',
    keywords: ['anli', 'membership', 'admin'],
};

const MembershipAdminLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout
            baseRoute="/membership/admin"
            scopedNavItems={membershipAdminNavItems}
        >
            {children}
        </CustomLayout>
    );
};

export default MembershipAdminLayout;
