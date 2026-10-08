'use client';
import {
    BarChart3,
    Bell,
    Calendar,
    CheckCheck,
    CreditCard,
    History,
    LayoutDashboard,
    List,
    LucideIcon,
    Settings,
    UserPlus,
    Users,
} from 'lucide-react';
import { PERMISSIONS } from '../permission/data/permissions';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: LucideIcon;
    permissions?: PERMISSIONS[];
}

export const membershipNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permissions: [
            PERMISSIONS.VIEW_MEMBERSHIP_DASHBOARD,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Membership Directory',
        path: '/members',
        icon: Users,
        permissions: [PERMISSIONS.VIEW_MEMBERS, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Referrals',
        path: '/referrals',
        icon: UserPlus,
        permissions: [PERMISSIONS.VIEW_MEMBERS, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Guest History',
        path: '/guest-history',
        icon: History,
        permissions: [
            PERMISSIONS.VIEW_MEMBERSHIP_GUEST_HISTORY,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Bookings',
        path: '/bookings',
        icon: Calendar,
        permissions: [
            PERMISSIONS.MANAGE_MEMBERSHIP_BOOKINGS,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Quick CheckIn',
        path: '/check-in',
        icon: CheckCheck,
        permissions: [PERMISSIONS.CHECK_IN_MEMBERS, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Alerts',
        path: '/alerts',
        icon: Bell,
        permissions: [
            PERMISSIONS.VIEW_MEMBERSHIP_REPORTS,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: BarChart3,
        permissions: [
            PERMISSIONS.VIEW_MEMBERSHIP_REPORTS,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
];

export const membershipAdminNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Membership Plan',
        path: '/plan',
        icon: CreditCard,
        permissions: [
            PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Plan Accessible',
        path: '/accessible',
        icon: Settings,
        permissions: [
            PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Service List',
        path: '/service-list',
        icon: List,
        permissions: [
            PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
];
