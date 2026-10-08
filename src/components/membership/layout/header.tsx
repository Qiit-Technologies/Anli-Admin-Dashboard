'use client';

import { Menu, Settings, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect } from 'react';

import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { useUser } from '@/context/useUser';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

const Header = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}) => {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const isAdminRoute = pathname?.includes('/membership/admin');

    const handleToggleView = () => {
        if (isAdminRoute) {
            router.push('/membership');
        } else {
            router.push('/membership/admin');
        }
    };

    if (loading || !user) {
        return (
            <header className="flex justify-between items-center px-6 py-4 border-b top-0 z-50">
                <div className="flex-1"></div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>
        );
    }

    return (
        <header className="flex justify-between items-center px-6 py-4 border-b top-0 z-50">
            <div className="flex-1">
                <PermissionGate
                    permissions={[PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION]}
                    blockType="hide"
                >
                    <button
                        onClick={handleToggleView}
                        className="font-medium cursor-pointer flex items-center justify-center gap-2 border rounded-md px-4 py-2 text-sm text-hexbrand border-hexbrand hover:bg-hexbrand/90 hover:text-white transition-colors"
                    >
                        {isAdminRoute
                            ? 'Switch to Manager View'
                            : 'Switch to Admin View'}
                    </button>
                </PermissionGate>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4">
                    <PermissionGate
                        permissions={[
                            PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION,
                        ]}
                        blockType="hide"
                    >
                        <Link href="/membership/settings">
                            <Settings className="text-gray-500 w-5 h-5 cursor-pointer hover:text-gray-700" />
                        </Link>
                    </PermissionGate>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
                            {getInitials(user?.fullName || 'U')}
                        </div>
                        <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                </div>

                <button onClick={() => setIsOpen(!isOpen)} className="hidden">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>
    );
};

export default Header;
