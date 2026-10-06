'use client';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { useUser } from '@/context/useUser';
import { TUser } from '@/types/user';
import { useMemo } from 'react';

export interface PermissionCheck {
    hasPermission: (permission: PERMISSIONS) => boolean;
    hasAnyPermission: (permissions: PERMISSIONS[]) => boolean;
    hasAllPermissions: (permissions: PERMISSIONS[]) => boolean;
    hasRole: (role: string) => boolean;
    hasModuleAccess: (moduleName: string) => boolean;
    hasAnyModuleAccess: (moduleNames: string[]) => boolean;
    user: TUser | undefined;
    isLoading: boolean;
}

export function usePermissions(): PermissionCheck {
    const { user } = useUser();

    const permissionChecks = useMemo(() => {
        const isAdmin = user?.roles?.name?.toLowerCase() === 'administrator';

        const hasPermission = (permissionName: string): boolean => {
            if (isAdmin) return true;

            if (!user?.permissions) return false;
            return user.permissions.some(
                (perm) =>
                    perm.name.toLowerCase() === permissionName.toLowerCase(),
            );
        };

        const hasAnyPermission = (permissions: string[]): boolean => {
            if (isAdmin) return true;

            if (!permissions || permissions.length === 0) return true;
            return permissions.some((perm) => hasPermission(perm));
        };

        const hasAllPermissions = (permissions: string[]): boolean => {
            if (isAdmin) return true;

            if (!permissions || permissions.length === 0) return true;
            return permissions.every((perm) => hasPermission(perm));
        };

        const hasRole = (roleName: string): boolean => {
            if (!user?.roles) return false;
            return user.roles.name.toLowerCase() === roleName.toLowerCase();
        };

        const hasModuleAccess = (moduleName: string): boolean => {
            if (isAdmin) return true;

            if (!user?.modules) return false;
            return user.modules.some(
                (module) =>
                    module.name.toLowerCase() === moduleName.toLowerCase(),
            );
        };

        const hasAnyModuleAccess = (moduleNames: string[]): boolean => {
            if (isAdmin) return true;

            if (!moduleNames || moduleNames.length === 0) return true;
            return moduleNames.some((module) => hasModuleAccess(module));
        };

        return {
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            hasRole,
            hasModuleAccess,
            hasAnyModuleAccess,
            user,
            isAdmin,
        };
    }, [user]);

    return {
        ...permissionChecks,
        isLoading: !user,
    };
}
