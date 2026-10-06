'use client';
import AdminNavButton from '@/components/admin/common/AdminNavButton';
import Logo from '@/components/common/Logo';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useSidebarCollapseStore } from '@/store/useSidebarCollapseStore';
import { useIdleLogoutDynamicExemption } from '@/context/IdleLogoutContext';
import { useUser } from '@/context/useUser';
import { usePermissions } from '@/hooks/auth/usePermission';
import useHotel from '@/hooks/useHotel';
import { useUserProfile } from '@/hooks/useUser';
import { isIdleLogoutExemptPath } from '@/lib/idle-logout-exempt-paths';
import { hasMultipleRolePaths } from '@/lib/role-paths';
import clsx from 'clsx';
import { ChevronDown, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Tooltip } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { settingsNavItems, SidebarNavItemProps } from './data/sidebar';
import UserComponent from './UserComponent';

const DEFAULT_IDLE_LOGOUT_MINUTES = 3;
const MIN_IDLE_LOGOUT_MINUTES = 3;
const MAX_IDLE_LOGOUT_MINUTES = 30;
const IDLE_LOGOUT_MINUTES_PREFIX = 'idle_logout_minutes_';
const IDLE_LAST_ACTIVITY_KEY = 'idle_logout_last_activity_at';
const IDLE_CHECK_INTERVAL_MS = 10000;
const IDLE_ACTIVITY_THROTTLE_MS = 1000;

const CustomSidebar = ({
    role,
    scopedNavItems,
    baseRoute,
}: {
    role: string;
    scopedNavItems: SidebarNavItemProps[];
    baseRoute: string;
}) => {
    useUserProfile();
    const { user } = useUser();
    const { organization } = useHotel();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { organization: hotelDetails } = useHotel();
    const { hasAnyPermission } = usePermissions();
    const isDynamicallyExempt = useIdleLogoutDynamicExemption();
    const { isCollapsed, toggleCollapse } = useSidebarCollapseStore();
    const lastActivityAtRef = useRef(Date.now());

    const isIdleLogoutExempt =
        isIdleLogoutExemptPath(pathname) || isDynamicallyExempt;

    const hotelServices = useMemo(() => {
        if (!hotelDetails?.services) return [];
        return hotelDetails.services.split(',').map((s) => s.trim());
    }, [hotelDetails?.services]);

    const idleTimeoutMs = useMemo(() => {
        const timeoutEntry = hotelServices.find((service) =>
            service.startsWith(IDLE_LOGOUT_MINUTES_PREFIX),
        );
        const configuredMinutes = Number(
            timeoutEntry?.slice(IDLE_LOGOUT_MINUTES_PREFIX.length),
        );
        const safeMinutes = Number.isInteger(configuredMinutes)
            ? Math.min(
                Math.max(configuredMinutes, MIN_IDLE_LOGOUT_MINUTES),
                MAX_IDLE_LOGOUT_MINUTES,
            )
            : DEFAULT_IDLE_LOGOUT_MINUTES;
        return safeMinutes * 60 * 1000;
    }, [hotelServices]);

    useEffect(() => {
        // No longer relying on local hotelId state for gating
    }, []);

    useEffect(() => {
        if (pathname === '/logout') return undefined;

        let lastRecordedAt = 0;

        const recordActivity = () => {
            const now = Date.now();
            if (now - lastRecordedAt < IDLE_ACTIVITY_THROTTLE_MS) return;
            lastRecordedAt = now;
            lastActivityAtRef.current = now;
            localStorage.setItem(IDLE_LAST_ACTIVITY_KEY, String(now));
        };

        const readLastActivityAt = () => {
            const stored = Number(localStorage.getItem(IDLE_LAST_ACTIVITY_KEY));
            return Number.isFinite(stored) && stored > 0
                ? Math.max(stored, lastActivityAtRef.current)
                : lastActivityAtRef.current;
        };

        const checkIdleTimeout = () => {
            if (document.visibilityState !== 'visible') return;
            if (isIdleLogoutExempt) {
                recordActivity();
                return;
            }
            const inactiveForMs = Date.now() - readLastActivityAt();
            if (inactiveForMs >= idleTimeoutMs) {
                window.location.assign('/logout');
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                recordActivity();
            }
        };

        const events = [
            'pointermove',
            'pointerdown',
            'keydown',
            'click',
            'scroll',
            'touchstart',
            'wheel',
            'input',
            'focusin',
        ] as const;

        const listenerOpts = { capture: true, passive: true };

        recordActivity();
        events.forEach((eventName) =>
            document.addEventListener(eventName, recordActivity, listenerOpts),
        );
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', recordActivity);
        window.addEventListener('storage', checkIdleTimeout);
        const intervalId = window.setInterval(
            checkIdleTimeout,
            Math.min(IDLE_CHECK_INTERVAL_MS, idleTimeoutMs),
        );

        return () => {
            window.clearInterval(intervalId);
            events.forEach((eventName) =>
                document.removeEventListener(
                    eventName,
                    recordActivity,
                    listenerOpts,
                ),
            );
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            window.removeEventListener('focus', recordActivity);
            window.removeEventListener('storage', checkIdleTimeout);
        };
    }, [idleTimeoutMs, pathname, isIdleLogoutExempt]);

    const logOut = () => {
        router.push('/logout');
    };

    // Check if user has multiple modules or multi-role paths
    const hasMultipleModules = user && user.modules && user.modules.length > 1;
    const hasMultiRolePaths = hasMultipleRolePaths(role);
    const isMultiAccess = hasMultipleModules || hasMultiRolePaths;

    const accessibleNavItems = useMemo(() => {
        return scopedNavItems.filter((item) => {
            // Check roles first
            if (item.roles && item.roles.length > 0) {
                const hasRole = item.roles.includes(user?.roles?.name || '');
                if (!hasRole) {
                    return false;
                }
            }

            // Filter out Channel Manager if the hotel doesn't have the service enabled
            if (item.path === '/channel-manager') {
                return organization?.services?.includes('channel_manager');
            }

            if (item.permissions && item.permissions.length > 0) {
                return hasAnyPermission(item.permissions);
            }
            return true;
        });
    }, [scopedNavItems, hasAnyPermission, user, organization]);

    const SidebarContent = ({ onItemClick, onToggleCollapse }: { onItemClick?: () => void; onToggleCollapse?: () => void }) => (
        <div className="h-full flex p-3 flex-col justify-between">
            <div className="flex flex-col min-h-0 overflow-y-auto">
                <div className="px-4 py-2 flex items-center justify-center relative">
                    <Logo role={role} />
                    {onToggleCollapse && (
                        <Tooltip content="Collapse sidebar" placement="right">
                            <button
                                onClick={onToggleCollapse}
                                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors absolute left-4 top-5"
                                aria-label="Collapse sidebar"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </Tooltip>
                    )}
                </div>

                <nav>
                    <NavItems
                        baseRoute={baseRoute}
                        items={accessibleNavItems}
                        onItemClick={onItemClick}
                        role={role}
                        user={user}
                    />
                </nav>
            </div>

            <div className="mt-auto">
                <nav>
                    <NavItems
                        baseRoute={baseRoute}
                        items={settingsNavItems}
                        onItemClick={onItemClick}
                        role={role}
                        user={user}
                    />
                </nav>
                <hr className="my-2" />
                <div className="mb-2">
                    <UserComponent user={user} logOut={logOut} />
                </div>
                <AdminNavButton role={role} />
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <>
                <aside className={clsx(
                    'hidden md:flex h-screen relative transition-all bg-white border-r flex-col justify-between overflow-hidden',
                    isCollapsed ? 'w-0 p-0 min-w-0' : 'w-80',
                )}>
                    <SidebarContent onToggleCollapse={toggleCollapse} />
                </aside>
                {isCollapsed && (
                    <Tooltip content="Expand sidebar" placement="right">
                        <button
                            onClick={toggleCollapse}
                            className="hidden md:flex fixed top-1/2 -translate-y-1/2 left-0 z-40 h-12 w-5 items-center justify-center bg-gray-200 border border-r-0 rounded-r-md hover:bg-gray-300 transition-colors"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </Tooltip>
                )}
            </>

            {/* Mobile Sheet */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <button
                        className="md:hidden fixed bottom-6 right-4 z-50 p-2 bg-white border rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-3">
                    <SheetTitle className="sr-only">Menu navigation</SheetTitle>
                    <SidebarContent onItemClick={() => setIsOpen(false)} />
                </SheetContent>
            </Sheet>
        </>
    );
};

const NavItems = ({
    items,
    baseRoute,
    onItemClick,
    role,
    user,
}: {
    items: SidebarNavItemProps[];
    baseRoute: string;
    onItemClick?: () => void;
    role: string;
    user: any;
}) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const pathname = usePathname();
    const { hasAnyPermission } = usePermissions();

    const toggleExpanded = (itemPath: string) => {
        setExpandedItems((prev) =>
            prev.includes(itemPath)
                ? prev.filter((path) => path !== itemPath)
                : [...prev, itemPath],
        );
    };

    const isExpanded = (itemPath: string) => expandedItems.includes(itemPath);
    const isActivePathname = (path: string) => {
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const normalizedPathname = pathname.endsWith('/')
            ? pathname.slice(0, -1)
            : pathname;
        return (
            normalizedPathname === normalizedPath ||
            normalizedPathname.startsWith(normalizedPath + '/')
        );
    };

    // Check if user has multiple modules or multi-role paths
    const hasMultipleModules = user && user.modules && user.modules.length > 1;
    const hasMultiRolePaths = hasMultipleRolePaths(role);
    const isMultiAccess = hasMultipleModules || hasMultiRolePaths;

    const hasAccess = useCallback(
        (item: SidebarNavItemProps) => {
            // Check roles
            if (item.roles && item.roles.length > 0) {
                const hasRole = item.roles.includes(user?.roles?.name || '');
                if (!hasRole) {
                    return false;
                }
            }

            if (item.permissions && item.permissions.length > 0) {
                return hasAnyPermission(item.permissions);
            }

            return true;
        },
        [hasAnyPermission, user],
    );

    return (
        <ul className="flex flex-col gap-1">
            {items.filter(hasAccess).map((item) => (
                <NavItem
                    key={item.path}
                    item={item}
                    baseRoute={baseRoute}
                    onItemClick={onItemClick}
                    hasAccess={hasAccess}
                    isActivePathname={isActivePathname}
                    toggleExpanded={toggleExpanded}
                    isExpanded={isExpanded}
                />
            ))}
        </ul>
    );
};

const NavItem = ({
    item,
    baseRoute,
    onItemClick,
    hasAccess,
    isActivePathname,
    toggleExpanded,
    isExpanded,
}: {
    item: SidebarNavItemProps;
    baseRoute: string;
    onItemClick?: () => void;
    hasAccess: (item: SidebarNavItemProps) => boolean;
    isActivePathname: (path: string) => boolean;
    toggleExpanded: (path: string) => void;
    isExpanded: (path: string) => boolean;
}) => {
    const path = `${baseRoute}${item.path}`;
    const expanded = isExpanded(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
        <li>
            {hasSubItems ? (
                <ExpandableButton
                    item={item}
                    isActive={isActivePathname(path)}
                    expanded={expanded}
                    toggleExpanded={() => toggleExpanded(item.path)}
                />
            ) : (
                <Link href={path}>
                    <SimpleButton
                        item={item}
                        isActive={isActivePathname(path)}
                        onClick={onItemClick}
                    />
                </Link>
            )}

            {hasSubItems && (
                <SubNavList
                    items={item.subItems || []}
                    baseRoute={baseRoute}
                    onItemClick={onItemClick}
                    hasAccess={hasAccess}
                    isActivePathname={isActivePathname}
                    toggleExpanded={toggleExpanded}
                    isExpanded={isExpanded}
                    parentPath={item.path}
                />
            )}
        </li>
    );
};

const ExpandableButton = ({
    item,
    isActive,
    expanded,
    toggleExpanded,
}: any) => {
    const isReportsItem = item.path?.includes('/reports');
    const isMainReportsItem = item.path === '/reports';

    let fontSize = 'text-base';
    if (isReportsItem && isMainReportsItem) {
        fontSize = 'text-base';
    }

    return (
        <button
            className={clsx(
                `flex w-full items-center justify-between transition-all rounded-md px-4 py-2 ${fontSize} hover:text-[#FF872A] hover:bg-[#FFF1E7]`,
                isActive
                    ? 'bg-[#FFF1E7] text-[#FF872A]'
                    : 'text-[#555] bg-transparent',
                'cursor-pointer',
            )}
            onClick={() => toggleExpanded()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpanded();
                }
            }}
            aria-expanded={expanded}
        >
            <div className="flex items-center">
                {item.icon && (
                    <span className="mr-3">
                        {React.createElement(item.icon, { size: 16 })}
                    </span>
                )}
                <span>{item.title}</span>
            </div>
            <span
                className={clsx(
                    'transition-transform duration-200',
                    expanded ? 'rotate-180' : 'rotate-0',
                )}
            >
                <ChevronDown size={16} />
            </span>
        </button>
    );
};

const SimpleButton = ({ item, isActive, onClick }: any) => {
    // Check if this is a Reports-related item
    const isReportsItem = item.path?.includes('/reports');
    const isMainReportsItem = item.path === '/reports';
    const isSecondaryReportsItem =
        item.path?.includes('/reports/') &&
        !item.path?.includes('/reports/advance-report/');
    const isAdvancedReportsItem = item.path?.includes(
        '/reports/advance-report/',
    );

    // Determine font size based on Reports hierarchy
    let fontSize = 'text-base';
    if (isReportsItem) {
        if (isMainReportsItem) {
            fontSize = 'text-sm'; // Main Reports item - same as other main items
        } else if (isSecondaryReportsItem) {
            fontSize = 'text-xs'; // Sub-categories (Main Reports, Secondary Reports, Advanced Reports) - smaller than main Reports
        } else if (isAdvancedReportsItem) {
            fontSize = 'text-xs'; // Individual report items (Payroll Summary Report, etc.) - smallest
        }
    }

    return (
        <button
            className={clsx(
                `flex w-full items-center justify-between transition-all rounded-md px-4 py-2 ${fontSize} hover:text-[#FF872A] hover:bg-[#FFF1E7]`,
                isActive
                    ? 'bg-[#FFF1E7] text-[#FF872A]'
                    : 'text-[#555] bg-transparent',
            )}
            onClick={onClick}
        >
            <div className="flex items-center">
                {item.icon && (
                    <span className="mr-3">
                        {React.createElement(item.icon, { size: 16 })}
                    </span>
                )}
                <span>{item.title}</span>
            </div>
        </button>
    );
};

const SubNavList = ({
    items,
    baseRoute,
    onItemClick,
    hasAccess,
    isActivePathname,
    toggleExpanded,
    isExpanded,
    parentPath,
}: any) => {
    const filteredItems = items.filter(hasAccess);
    const parentExpanded = isExpanded(parentPath);

    return (
        <div
            className={clsx(
                'overflow-hidden transition-all duration-300 ease-in-out',
                parentExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
            )}
        >
            <ul className="pl-4 pt-1">
                {filteredItems.map((subItem: SidebarNavItemProps) => {
                    const subPath = `${baseRoute}${subItem.path}`;
                    const hasNested =
                        subItem.subItems && subItem.subItems.length > 0;
                    const expanded = isExpanded(subItem.path);

                    return (
                        <li key={subItem.path}>
                            {hasNested ? (
                                <ExpandableButton
                                    item={subItem}
                                    isActive={isActivePathname(subPath)}
                                    expanded={expanded}
                                    toggleExpanded={() =>
                                        toggleExpanded(subItem.path)
                                    }
                                />
                            ) : (
                                <Link href={subPath} onClick={onItemClick}>
                                    <SimpleButton
                                        item={subItem}
                                        isActive={isActivePathname(subPath)}
                                    />
                                </Link>
                            )}

                            {hasNested && (
                                <SubNavList
                                    items={subItem.subItems || []}
                                    baseRoute={baseRoute}
                                    onItemClick={onItemClick}
                                    hasAccess={hasAccess}
                                    isActivePathname={isActivePathname}
                                    toggleExpanded={toggleExpanded}
                                    isExpanded={isExpanded}
                                    parentPath={subItem.path}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CustomSidebar;
