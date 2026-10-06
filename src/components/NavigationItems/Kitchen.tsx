'use client';
import { IconType } from 'react-icons/lib';
import {
    LuBlend,
    LuClipboardList,
    LuGalleryVertical,
    LuHeadphones,
    LuSettings,
} from 'react-icons/lu';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
}

const kitchenNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'KDS Overview',
        path: '/kds-overview',
        icon: LuGalleryVertical,
    },
    {
        title: 'Kitchen Inventory',
        path: '/inventory',
        icon: LuBlend,
    },
    {
        title: 'Order History',
        path: '/order-history',
        icon: LuClipboardList,
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

export default kitchenNavItems;
