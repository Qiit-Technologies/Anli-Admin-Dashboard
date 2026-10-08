'use client';
import { IconType } from 'react-icons/lib';
import {
    LuBadgeX,
    LuBlend,
    LuChartLine,
    LuChartNoAxesCombined,
    LuClipboardCheck,
    LuClipboardList,
    LuGalleryVertical,
    LuHeadphones,
    LuLayoutDashboard,
    LuNewspaper,
    LuSettings,
} from 'react-icons/lu';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
}

const housekeepingNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LuLayoutDashboard,
    },
    {
        title: 'Room Status',
        path: '/room-status',
        icon: LuGalleryVertical,
    },
    {
        title: 'Cleaning Requests',
        path: '/cleaning-requests',
        icon: LuBlend,
    },
    {
        title: 'Inventory',
        path: '/inventory',
        icon: LuClipboardCheck,
    },
    {
        title: 'Maintenance',
        path: '/maintenance',
        icon: LuChartLine,
    },
    {
        title: 'Lost Items',
        path: '/lost-items',
        icon: LuBadgeX,
    },
    {
        title: 'Daily Task Lists',
        path: '/daily-tasks',
        icon: LuClipboardList,
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: LuNewspaper,
    },
    {
        title: 'Productivity',
        path: '/productivity',
        icon: LuChartNoAxesCombined,
    },
];

export const settingsNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Support',
        path: '/support',
        icon: LuHeadphones,
    },
    {
        title: 'Settings',
        path: '/settings',
        icon: LuSettings,
    },
];

export default housekeepingNavItems;
