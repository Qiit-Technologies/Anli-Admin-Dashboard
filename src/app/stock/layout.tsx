import CustomLayout from '@/components/layout';
import stockNavItems from '@/components/NavigationItems/Stock';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Stock',
    description: 'Anli Stock Module',
};

const StockModuleLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout baseRoute="/stock" scopedNavItems={stockNavItems}>
            <Suspense fallback={<SkeletonLoader type="table" rows={5} />}>
                {children}
            </Suspense>
        </CustomLayout>
    );
};

export default StockModuleLayout;

