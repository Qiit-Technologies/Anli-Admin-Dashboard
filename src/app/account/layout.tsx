import CustomSidebar from '@/components/common/layout/Sidebar';
import { accountNavItems } from '@/components/NavigationItems/Account';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { ReactNode, Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Account Module',
    description: 'Anli Account Module',
};

const Layout = async ({ children }: { children: ReactNode }) => {
    const headersList = await headers();
    const userRole =
        headersList.get('user-role') || 'manager' || 'administrator';
    if (!userRole && !window === undefined) {
        return window.location.replace('/signin');
    }
    return (
        <div className="flex h-screen bg-gray-50">
            <CustomSidebar
                baseRoute="/account"
                scopedNavItems={accountNavItems}
                role={userRole}
            />
            <main className="bg-gray-50 flex-1 h-full overflow-auto">
                <Suspense fallback={<SkeletonLoader type="table" rows={5} />}>
                    {children}
                </Suspense>
            </main>
        </div>
    );
};

export default Layout;
