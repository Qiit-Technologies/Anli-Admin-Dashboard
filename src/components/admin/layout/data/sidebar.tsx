'use client';
import {
    BookOpen,
    CreditCard,
    LucideLayoutDashboard,
    SquareMenu,
    Users,
    AlertTriangle,
    MessageSquare,
    Globe,
    LineChart,
    Award,
    ShieldCheck,
    Star,
} from 'lucide-react';
import { IconType } from 'react-icons/lib';
import { LuSettings } from 'react-icons/lu';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
    roles: string[];
    service?: string;
}

export const adminNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LucideLayoutDashboard,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Owner Dashboard',
        path: '/owner-dashboard',
        icon: LineChart,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Settings',
        path: '/settings',
        icon: LuSettings,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Staffing',
        path: '/staffing-v2',
        icon: Users,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Accounts',
        path: '/accounts',
        icon: CreditCard,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Internal Accounts',
        path: '/internal-accounts',
        icon: BookOpen,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Approvals',
        path: '/approvals',
        icon: Users,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Petty Cash',
        path: '/petty-cash',
        icon: SquareMenu,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Whistleblowing',
        path: '/whistleblowing',
        icon: AlertTriangle,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Feedback',
        path: '/feedback',
        icon: MessageSquare,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Recognition',
        path: '/recognition',
        icon: Users,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Channel Manager',
        path: '/channel-manager',
        icon: Globe,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
        service: 'channel_manager',
    },
    {
        title: 'Role Management',
        path: '/roles',
        icon: Users,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Loyalty',
        path: '/loyalty',
        icon: Award,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Business Claims',
        path: '/claims',
        icon: ShieldCheck,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
    {
        title: 'Reviews',
        path: '/reviews',
        icon: Star,
        roles: ['administrator', 'manager', 'general manager', 'supervisor'],
    },
];
