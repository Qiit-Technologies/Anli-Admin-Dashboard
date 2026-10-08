import CustomLayout from '@/components/layout';
import bohNavItems from '@/components/NavigationItems/BackOfHouse';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Back of House',
    description: 'Anli Back of House Module',
};

const BOHLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout baseRoute="/back-of-house" scopedNavItems={bohNavItems}>
            {children}
        </CustomLayout>
    );
};

export default BOHLayout;
