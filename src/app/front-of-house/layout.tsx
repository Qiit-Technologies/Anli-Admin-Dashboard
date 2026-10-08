import CustomLayout from '@/components/layout';
import { HospitalityModuleChrome } from '@/components/layout/HospitalityModuleChrome';
import frontHouseNavItems from '@/components/NavigationItems/FrontOfHouse';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Restaurant',
    description: 'Anli Restaurant Module',
};

const RestaurantLayout = async ({ children }: { children: ReactNode }) => {
    return (
        <CustomLayout
            baseRoute="/front-of-house"
            scopedNavItems={frontHouseNavItems}
        >
            <HospitalityModuleChrome module="restaurant">
                <Suspense fallback={<SkeletonLoader type="table" rows={5} />}>
                    {children}
                </Suspense>
            </HospitalityModuleChrome>
        </CustomLayout>
    );
};

export default RestaurantLayout;

