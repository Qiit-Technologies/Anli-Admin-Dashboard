import CustomLayout from '@/components/layout';
import housekeepingNavItems from '@/components/NavigationItems/HouseKeeping';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - House Keeping',
    description: 'Anli House Keeping Module',
};

const HKLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout
            baseRoute="/house-keeping"
            scopedNavItems={housekeepingNavItems}
        >
            {children}
        </CustomLayout>
    );
};
export default HKLayout;
