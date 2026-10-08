'use client';
import { BarChart, CupSoda, History } from 'lucide-react';
import { IconType } from 'react-icons/lib';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
}

export const barNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Bar Display System',
        path: '/bds',
        icon: BarChart,
    },
    {
        title: 'Bar Inventory',
        path: '/inventory',
        icon: CupSoda,
    },
    {
        title: 'Order History',
        path: '/order-history',
        icon: History,
    },
];
