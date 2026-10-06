import CustomLayout from '@/components/layout';
import { employeeNavItems } from '@/components/NavigationItems/Employee';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Employee Module',
    description: 'Anli Employee Module',
};

const Layout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout baseRoute="/employee" scopedNavItems={employeeNavItems}>
            <Suspense fallback={<SkeletonLoader type="table" rows={5} />}>
                {children}
            </Suspense>
        </CustomLayout>
    );
};

export default Layout;

