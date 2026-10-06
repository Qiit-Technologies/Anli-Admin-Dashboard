'use client';

import BrandButton from '@/components/common/Button';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

type RegisterMemberButtonProps = {
    href?: string;
    className?: string;
    fullWidth?: boolean;
    children?: ReactNode;
};

export function RegisterMemberButton({
    href = '/membership/members/onboarding',
    className = 'shadow-none p-3',
    fullWidth = false,
    children = 'Register new member',
}: RegisterMemberButtonProps) {
    return (
        <PermissionGate permissions={[PERMISSIONS.ADD_MEMBERS]} blockType="hide">
            <Link
                href={href}
                className={fullWidth ? 'w-full md:w-auto' : undefined}
            >
                <BrandButton
                    icon={<PlusIcon />}
                    className={
                        fullWidth ? `${className} w-full`.trim() : className
                    }
                >
                    {children}
                </BrandButton>
            </Link>
        </PermissionGate>
    );
}
