import CustomLayout from '@/components/layout';
import { frontOfficeNavItems } from '@/components/NavigationItems/FrontOffice';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Front Office',
    description: 'Anli Front Office Keeping Module',
};

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout
            baseRoute="/front-office"
            scopedNavItems={frontOfficeNavItems}
        >
            <Suspense fallback={<SkeletonLoader type="table" rows={5} />}>
                {children}
            </Suspense>
        </CustomLayout>
    );
};

export default Layout;

