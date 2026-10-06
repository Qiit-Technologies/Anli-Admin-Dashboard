import CustomLayout from '@/components/layout';
import { HospitalityModuleChrome } from '@/components/layout/HospitalityModuleChrome';
import kitchenNavItems from '@/components/NavigationItems/Kitchen';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Kitchen',
    description: 'Anli Kitchen Module',
};

const KitchenLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout baseRoute="/kitchen" scopedNavItems={kitchenNavItems}>
            <HospitalityModuleChrome module="kitchen">
                <Suspense fallback={<SkeletonLoader type="table" rows={5} />}>
                    {children}
                </Suspense>
            </HospitalityModuleChrome>
        </CustomLayout>
    );
};

export default KitchenLayout;

