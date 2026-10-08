import CustomSidebar from '@/components/common/layout/Sidebar';
import { orgAdminNavItems } from '@/components/NavigationItems/OrgAdmin';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Organization Admin Dashboard',
    description: 'Anli Organization Admin Dashboard',
};

const AdminLayout = async ({ children }: { children: ReactNode }) => {
    const headersList = await headers();
    const userRole = headersList.get('user-role');
    const hasMultipleModules =
        headersList.get('has-multiple-modules') === 'true';
    const hasMultipleRolePaths =
        headersList.get('has-multiple-role-paths') === 'true';

    if (
        userRole !== 'manager' &&
        !hasMultipleModules &&
        !hasMultipleRolePaths
    ) {
        redirect('/signin');
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <CustomSidebar
                baseRoute="/manager"
                scopedNavItems={orgAdminNavItems}
                role="manager"
            />
            <main className="bg-gray-50 flex-1 h-full overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
