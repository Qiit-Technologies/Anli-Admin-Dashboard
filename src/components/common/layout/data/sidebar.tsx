import { PERMISSIONS } from '@/components/permission/data/permissions';
import { IconType } from 'react-icons/lib';
import { LuHeadphones, LuSettings } from 'react-icons/lu';

interface SidebarSubNav {
    title: string;
    path: string;
    icon?: IconType;
    subItems?: Omit<SidebarSubNav, 'subItems'>[];
    permissions?: PERMISSIONS[];
    service?: string;
}

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon?: IconType;
    subItems?: SidebarSubNav[];
    permissions?: PERMISSIONS[];
    service?: string;
    roles?: string[];
}

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
