import AccessDeniedCompoent from '@/components/common/AccessDenied';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { ReactNode } from 'react';
import { usePermissions } from './usePermission';

export function usePageBlock(
    permissions: PERMISSIONS[] = [],
): ReactNode | null {
    const { hasAllPermissions, isLoading } = usePermissions();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!hasAllPermissions(permissions)) {
        return <AccessDeniedCompoent />;
    }

    return null;
}
