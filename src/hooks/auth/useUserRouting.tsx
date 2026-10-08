'use client';
import { serviceModules } from '@/components/services';
import { usePermissions } from './usePermission';

export interface ModuleCardData {
    title: string;
    description: string;
    href: string;
    service: string;
    icon?: any;
}

export function useUserRouting() {
    const { user, isLoading } = usePermissions();

    const getUserType = () => {
        if (!user) return null;

        const roleName = user.roles.name.toLowerCase();

        switch (roleName) {
            case 'administrator':
                return 'administrator';
            case 'manager':
                return 'manager';
            default:
                return 'staff';
        }
    };

    const getUserAccessibleModules = (): typeof serviceModules => {
        if (!user?.modules) return [];
        const userModuleNames = user.modules.map((m) => {
            const moduleName = m.name.toLowerCase();
            return moduleName;
        });

        const normalizedUserModules = new Set<string>();
        userModuleNames.forEach((name) => {
            normalizedUserModules.add(name);
            // Also add variations
            if (name === 'front_office')
                normalizedUserModules.add('front-office');
            if (name === 'front-office')
                normalizedUserModules.add('front_office');
            if (name === 'restaurant') {
                normalizedUserModules.add('front-of-house');
            }
        });

        const seenHrefs = new Set<string>();
        return serviceModules.filter((module) => {
            if (seenHrefs.has(module.href)) return false;
            const isIncluded = normalizedUserModules.has(
                module.service.toLowerCase(),
            );
            if (isIncluded) seenHrefs.add(module.href);
            return isIncluded;
        });
    };

    return {
        user,
        isLoading,
        getUserType,
        getUserAccessibleModules,
    };
}
