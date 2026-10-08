'use client';
import { usePermissions } from '@/hooks/auth/usePermission';
import React from 'react';
import AccessDeniedCompoent from '../common/AccessDenied';
import CustomLoader from '../Loader';
import { PERMISSIONS } from './data/permissions';

interface PageGuardProps {
    permissions: PERMISSIONS[];
    children: React.ReactNode;
}

export const PageGuard: React.FC<PageGuardProps> = ({
    permissions,
    children,
}) => {
    const { hasAnyPermission, isLoading } = usePermissions();

    if (isLoading) {
        return <CustomLoader />;
    }

    if (!hasAnyPermission(permissions)) {
        return <AccessDeniedCompoent />;
    }

    return <>{children}</>;
};
