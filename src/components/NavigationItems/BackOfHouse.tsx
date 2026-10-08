'use client';
import { Utensils, Eye, EyeOff, Palette } from 'lucide-react';
import { IconType } from 'react-icons/lib';
import {
    LuAlignVerticalDistributeStart,
    LuBox,
    LuClipboardList,
    LuHeadphones,
    LuList,
    LuListTree,
    LuSettings,
    LuSoup,
    LuTableProperties,
    LuTags,
} from 'react-icons/lu';
import { MdRestaurantMenu } from 'react-icons/md';

import { PERMISSIONS } from '../permission/data/permissions';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
    permissions?: PERMISSIONS[];
    subItems?: SidebarNavItemProps[];
}

const bohNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Item Category',
        path: '/item-category',
        icon: LuList,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_ITEM_CATEGORY,
        ],
    },
    {
        title: 'Mini Category',
        path: '/mini-category',
        icon: LuListTree,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_MINI_CATEGORY,
        ],
    },
    {
        title: 'Menu Item',
        path: '/menu-item',
        icon: Utensils,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_MENU_ITEM],
    },
    {
        title: 'Menu Management',
        path: '/menu',
        icon: MdRestaurantMenu,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_ITEM_CATEGORY,
        ],
    },
    {
        title: 'Menu Settings',
        path: '/menu-settings',
        icon: LuSettings,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_MENU_ITEM],
        subItems: [
            {
                title: 'Branding',
                path: '/menu-settings',
                icon: Palette,
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_MENU_ITEM,
                ],
            },
            {
                title: 'Digital Menu Visibility',
                path: '/menu-settings/digital-visibility',
                icon: Eye,
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_MENU_ITEM,
                ],
            },
        ],
    },
    {
        title: 'Modifiers',
        path: '/modifiers',
        icon: LuTags,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_MENU_ITEM],
    },
    {
        title: 'Complementary Policy',
        path: '/complementary-policy',
        icon: LuAlignVerticalDistributeStart,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_MENU_ITEM],
    },
    {
        title: 'Dine Area Management',
        path: '/dine-area',
        icon: LuClipboardList,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_DINE_AREA],
    },
    {
        title: 'Kitchen Management',
        path: '/kitchen-management',
        icon: LuSoup,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_TABLE_MANAGEMENT,
        ],
    },
    {
        title: 'Store Management',
        path: '/store-management',
        icon: LuBox,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_STORE],
    },
    {
        title: 'Table Management',
        path: '/table-management',
        icon: LuTableProperties,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_TABLE_MANAGEMENT,
        ],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: LuClipboardList,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_BACK_OF_HOUSE_REPORTS,
        ],
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

export default bohNavItems;
