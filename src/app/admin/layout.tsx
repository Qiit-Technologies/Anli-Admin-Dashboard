import { adminNavItems } from '@/components/admin/layout/data/sidebar';
import CustomSidebar from '@/components/common/layout/Sidebar';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Anli - Admin Dashboard',
    description: 'Anli Admin Dashboard',
};

const AdminLayout = async ({ children }: { children: ReactNode }) => {
    const headersList = await headers();
    const userRole = headersList.get('user-role');

    const isAllowed =
        userRole === 'administrator' ||
        userRole === 'manager' ||
        userRole === 'general manager' ||
        userRole === 'supervisor';

    if (!isAllowed) {
        redirect('/signin');
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <CustomSidebar
                baseRoute="/admin"
                scopedNavItems={adminNavItems}
                role={userRole}
            />
            <main className="bg-gray-50 flex-1 h-full overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
