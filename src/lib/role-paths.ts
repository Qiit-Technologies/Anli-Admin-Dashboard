import { serviceModules } from '@/components/services';
import type { Module } from '@/types/user';

export const ROLE_PATHS: Record<string, string[]> = {
    'super admin': ['/admin', '*'],
    administrator: ['/admin', '*'],
    'general manager': ['/admin', '*'],
    manager: ['/manager', '*'],
    supervisor: ['/manager', '*'],
    'front desk officer': ['/front-office'],
    cashier: ['/front-of-house'],
    accountant: ['/account'],
    auditor: ['/account'],
    hr: ['/employee'],
    it: ['/manager', '*'],
    procurement: ['/stock'],
    'head chef': ['/kitchen'],
    'bar manager': ['/bar'],
    bar: ['/bar'],
    waiter: ['/front-of-house'],
    waitress: ['/front-of-house'],
    'f&b supervisor': ['/front-of-house', '/back-of-house', '/bar', '/kitchen'],
    "maître d'hotel": ['/membership'],
    'housekeeping supervisor': ['/house-keeping'],
    housekeeper: ['/house-keeping'],
    'stock manager': ['/stock'],
    valet: ['/membership'],
};

export const MULTI_MODULE_PATHS = ['/manager', '/dashboard', '/membership'];

export type UserRole = keyof typeof ROLE_PATHS;

export const getDefaultPathForRole = (role: string): string => {
    if (!role) return '/manager';
    const normalizedRole = role.toLowerCase();
    return ROLE_PATHS[normalizedRole]?.[0] || '/manager';
};

export const hasMultipleRolePaths = (role: string): boolean => {
    if (!role) return false;
    const normalizedRole = role.toLowerCase();
    const paths = ROLE_PATHS[normalizedRole];
    return !!paths && paths.length > 1;
};

const IGNORED_MODULE_NAMES = [
    'general',
    'system admin',
    'system configuration',
    'internal account',
    'internal_accounts',
    'system_admin',
];

const MODULE_ROUTE_MAP: Record<string, string> = {
    front_office: '/front-office',
    'front-office': '/front-office',
    'front office': '/front-office',
    reservation: '/reservations',
    reservations: '/reservations',
    housekeeping: '/house-keeping',
    stock: '/stock',
    bar: '/bar',
    account: '/account',
    restaurant: '/front-of-house',
    'front-of-house': '/front-of-house',
    front_of_house: '/front-of-house',
    kitchen: '/kitchen',
    back_of_house: '/back-of-house',
    employee: '/employee',
    banquet: '/banquet',
    membership: '/membership',
};

const normalizeModuleName = (value: string | undefined | null): string => {
    if (!value) return '';

    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
};

const getMatchingServiceModule = (moduleName: string | undefined | null) => {
    const normalizedName = normalizeModuleName(moduleName);

    if (!normalizedName) {
        return null;
    }

    if (IGNORED_MODULE_NAMES.includes(normalizedName)) {
        return null;
    }

    const directRoute = MODULE_ROUTE_MAP[normalizedName];
    if (directRoute) {
        return {
            href: directRoute,
            service: normalizedName,
            title: normalizedName,
            description: '',
            icon: undefined,
        } as unknown as (typeof serviceModules)[number];
    }

    return serviceModules.find(
        (sm) => normalizeModuleName(sm.service) === normalizedName,
    );
};

export const getRealModuleRoutes = (
    modules: Array<{ name?: string | null }> = [],
) => {
    const routes = modules
        .map((module) => getMatchingServiceModule(module?.name)?.href)
        .filter((href): href is string => Boolean(href));

    return Array.from(new Set(routes));
};

export const getDefaultPathForModules = (modules: Module[]): string => {
    const realRoutes = getRealModuleRoutes(modules || []);

    if (realRoutes.length === 0) {
        return '/manager';
    }

    if (realRoutes.length > 1) {
        return '/manager';
    }

    return realRoutes[0];
};

export const checkModuleAccess = (
    modules: Array<{ id: number; name: string }>,
    path: string,
): boolean => {
    const realRoutes = getRealModuleRoutes(modules || []);

    if (realRoutes.length === 0) {
        return false;
    }

    if (realRoutes.length > 1) {
        return path === '/manager' || path.startsWith('/manager/');
    }

    const [singleRoute] = realRoutes;
    return path === singleRoute || path.startsWith(`${singleRoute}/`);
};
