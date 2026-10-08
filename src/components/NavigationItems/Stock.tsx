'use client';
import { IconType } from 'react-icons/lib';
import {
    LuArrowLeftRight,
    LuBadgeX,
    LuChartLine,
    LuClipboardCheck,
    LuGalleryVertical,
    LuHeadphones,
    LuHistory,
    LuLayoutDashboard,
    LuSettings,
    LuTriangleAlert,
    LuArrowUpDown,
} from 'react-icons/lu';
import { PERMISSIONS } from '../permission/data/permissions';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
    permissions?: string[];
    subItems?: SidebarNavItemProps[];
}

const stockNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LuLayoutDashboard,
    },
    {
        title: 'Items',
        path: '/items',
        icon: LuGalleryVertical,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_STOCK_ITEMS],
    },
    {
        title: 'Stock Movement',
        path: '/stock-movement',
        icon: LuArrowUpDown,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_STOCK_ITEMS],
    },
    {
        title: 'Protein Stock',
        path: '/protein-stock',
        icon: LuArrowUpDown,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_STOCK_ITEMS],
    },
    {
        title: 'Purchase Log',
        path: '/purchase-log',
        icon: LuHistory,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Sales Unit Mapping',
        path: '/sales-unit-mapping',
        icon: LuArrowLeftRight,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Issued Stock',
        path: '/issued-stock',
        icon: LuClipboardCheck,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE, PERMISSIONS.VIEW_ISSUED_STOCK],
    },
    {
        title: 'Purchase Order',
        path: '/purchase-order',
        icon: LuChartLine,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_STOCK_PURCHASE_ORDER,
        ],
    },
    {
        title: 'Bad & Perishable',
        path: '/bad-perishable',
        icon: LuTriangleAlert,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    // Sales Log disabled until Recipe & Ingredient Management is ready (ANLI-INV-012)
    {
        title: 'Transfer Management',
        path: '/transfer-management',
        icon: LuArrowLeftRight,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: LuBadgeX,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_STOCK_REPORTS,
        ],
    },
];

export const settingsNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Support',
        path: '/support',
        icon: LuHeadphones,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Settings',
        path: '/settings',
        icon: LuSettings,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
];

export default stockNavItems;
