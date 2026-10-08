'use client';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@heroui/react';
import { LayoutGridIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/useUser';
import { getRealModuleRoutes, hasMultipleRolePaths } from '@/lib/role-paths';

const AdminNavButton = ({ role }: { role: string }) => {
    const pathname = usePathname();
    const { user } = useUser();

    // Define role configurations
    const roleConfig = {
        administrator: { href: '/admin', tooltip: 'Admin Dashboard' },
        manager: { href: '/manager', tooltip: 'Manager Dashboard' },
    };

    const config = roleConfig[role as keyof typeof roleConfig];

    // Check if user has multiple real modules or multiple role paths
    const realModuleRoutes = getRealModuleRoutes(user?.modules || []);
    const hasMultipleModules = realModuleRoutes.length > 1;
    const hasMultiRolePaths = hasMultipleRolePaths(role);
    const shouldShowManagerButton = hasMultipleModules || hasMultiRolePaths;

    // Determine which dashboard to link to
    let href = config?.href || '/manager';
    let tooltip = config?.tooltip || 'Manager Dashboard';

    // If user is not admin/manager but has multiple modules, link to /manager
    if (!config && shouldShowManagerButton) {
        href = '/manager';
        tooltip = 'Manager Dashboard';
    }

    // Don't show if no conditions met or already on the target page
    if (!config && !shouldShowManagerButton) {
        return null;
    }
    if (pathname.startsWith(href)) {
        return null;
    }

    return (
        <Link href={href}>
            <Tooltip content={tooltip}>
                <Button className="fixed top-6 left-[296px] h-10 w-10 rounded-full bg-hexbrand text-white z-[9999] shadow-md hover:scale-105 transition-transform">
                    <LayoutGridIcon />
                </Button>
            </Tooltip>
        </Link>
    );
};

export default AdminNavButton;
