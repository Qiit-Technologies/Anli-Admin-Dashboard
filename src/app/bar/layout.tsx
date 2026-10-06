import CustomLayout from '@/components/layout';
import { HospitalityModuleChrome } from '@/components/layout/HospitalityModuleChrome';
import { barNavItems } from '@/components/NavigationItems/Bar';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Bar Module',
    description: 'Anli Bar Module',
};

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout baseRoute="/bar" scopedNavItems={barNavItems}>
            <HospitalityModuleChrome module="bar">{children}</HospitalityModuleChrome>
        </CustomLayout>
    );
};

export default Layout;
