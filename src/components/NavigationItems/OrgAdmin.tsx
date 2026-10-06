'use client';
import { CreditCard, LineChart, LucideLayoutDashboard } from 'lucide-react';
import { IconType } from 'react-icons/lib';
import { LuHeadphones, LuSettings } from 'react-icons/lu';
import { PERMISSIONS } from '../permission/data/permissions';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
    permissions?: PERMISSIONS[];
    roles?: string[];
}

export const orgAdminNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LucideLayoutDashboard,
    },
    {
        title: 'Owner Dashboard',
        path: '/owner-dashboard',
        icon: LineChart,
        roles: ['manager', 'administrator', 'general manager', 'supervisor'],
    },
    {
        title: 'Accounts',
        path: '/accounts',
        icon: CreditCard,
        roles: ['manager'],
    },
    {
        title: 'Support',
        path: '/support',
        icon: LuHeadphones,
        roles: ['manager'],
    },
    {
        title: 'Settings',
        path: '/settings',
        icon: LuSettings,
    },
];
