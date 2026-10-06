'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import { PageGuard } from '../permission/PageGuard';
import { PERMISSIONS } from '../permission/data/permissions';

interface PageWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
    permissions?: PERMISSIONS[];
}

const PageWrapper = ({
    children,
    className,
    permissions,
    ...props
}: PageWrapperProps) => {
    const content = (
        <div
            {...props}
            className={cn('flex flex-col py-6 px-4 lg:px-8 gap-6', className)}
        >
            {children}
        </div>
    );

    return permissions?.length ? (
        <PageGuard permissions={permissions}>{content}</PageGuard>
    ) : (
        content
    );
};

export default PageWrapper;
