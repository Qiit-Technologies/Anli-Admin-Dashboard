'use client';
import {
    LayoutGrid,
    GalleryVertical,
    Folder,
    ClipboardList,
    PanelsTopLeft,
    // SquareMenu,
    WalletCards,
} from 'lucide-react';

import { SidebarNavItemProps } from '../common/layout/data/sidebar';
// import { PERMISSIONS } from '../permission/data/permissions';

// correct permissions will be added later

export const reservationNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'All Reservations',
        path: '/all-reservations',
        icon: GalleryVertical,
        permissions: [],
    },
    {
        title: 'Overview',
        path: '/overview',
        icon: PanelsTopLeft,
        permissions: [],
    },
    {
        title: 'Table / Spaces Setup',
        path: '/table-spaces-setup',
        icon: ClipboardList,
        permissions: [],
    },
    // {
    //     title: 'Menu',
    //     path: '/menu',
    //     icon: SquareMenu,
    //     permissions: [],
    // },
    {
        title: 'Payment',
        path: '/payment',
        icon: WalletCards,
        permissions: [],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: Folder,
        permissions: [],
    },
];
