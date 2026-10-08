'use client';

import { usePermissions } from '@/hooks/auth/usePermission';
import { ShieldBan } from 'lucide-react';
import React, { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { AccessDeniedDialog } from './AccessDeniedDialog';
import { PERMISSIONS } from './data/permissions';

type PermissionGateProps = {
    /** The content to display if the user has permission. */
    children: ReactNode;
    /** A list of required permissions using the PERMISSIONS enum */
    permissions: PERMISSIONS[];
    /** The behavior when the user lacks permission. */
    blockType: 'hide' | 'modal';
    /** How to check permissions. Defaults to 'all'. */
    permissionType?: 'any' | 'all';
    onAccessDenied?: (attempt: {
        permissions: string[];
        timestamp: number;
    }) => void;
    fallbackComponent?: React.ComponentType;
};

export function PermissionGate({
    children,
    permissions,
    blockType,
    permissionType = 'all',
    onAccessDenied,
    fallbackComponent: FallbackComponent,
}: PermissionGateProps) {
    const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
    const accessAttemptRef = useRef<number>(0);

    const hasAccess = useMemo(() => {
        if (permissionType === 'any') {
            return hasAnyPermission(permissions);
        }
        return hasAllPermissions(permissions);
    }, [permissions, permissionType, hasAnyPermission, hasAllPermissions]);

    const handleAccessDenied = useCallback(() => {
        accessAttemptRef.current += 1;

        onAccessDenied?.({
            permissions,
            timestamp: Date.now(),
        });

        if (process.env.NODE_ENV === 'development') {
            console.warn(
                'PermissionGate: Access denied for permissions:',
                permissions,
            );
        }
    }, [permissions, onAccessDenied]);

    if (isLoading) {
        return (
            <div
                className="animate-pulse bg-secondary/20 rounded"
                style={{ minHeight: '20px' }}
            />
        );
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    handleAccessDenied();

    if (blockType === 'hide') {
        return FallbackComponent ? <FallbackComponent /> : null;
    }

    return (
        <AccessDeniedDialog
            title="Access Denied"
            description="You do not have the required permissions to perform this action. Please contact an administrator if you believe this is an error."
        >
            <div className="relative">
                <div
                    className="pointer-events-none select-none"
                    aria-hidden="true"
                    role="presentation"
                >
                    {children}
                </div>

                <div
                    className="absolute inset-0 bg-secondary/50 backdrop-blur-sm cursor-not-allowed flex items-center justify-center"
                    style={{
                        backdropFilter: 'blur(2px) saturate(0.8)',
                        background: 'rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <ShieldBan className="text-danger-800" />
                </div>
            </div>
        </AccessDeniedDialog>
    );
}

export function withPermissionValidation<T extends object>(
    Component: React.ComponentType<T>,
    requiredPermissions: PERMISSIONS[],
    options?: {
        permissionType?: 'all' | 'any';
        blockType?: 'hide' | 'modal';
    },
) {
    return function PermissionValidatedComponent(props: T) {
        return (
            <PermissionGate
                permissions={requiredPermissions}
                permissionType={options?.permissionType}
                blockType={options?.blockType as 'hide' | 'modal'}
            >
                <Component {...props} />
            </PermissionGate>
        );
    };
}
