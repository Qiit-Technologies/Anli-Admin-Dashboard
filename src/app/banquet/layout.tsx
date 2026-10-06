import CustomLayout from '@/components/layout';
import { banquetNavItems } from '@/components/NavigationItems/Banquet';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Banquet Module',
    description: 'Anli Banquet Module',
};

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout baseRoute="/banquet" scopedNavItems={banquetNavItems}>
            {children}
        </CustomLayout>
    );
};

export default Layout;
