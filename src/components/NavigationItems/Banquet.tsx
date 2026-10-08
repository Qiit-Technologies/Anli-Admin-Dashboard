'use client';
import {
    BarChart,
    Box,
    Calendar,
    CreditCard,
    LayoutDashboard,
    Package,
    RotateCcw,
    ShoppingBag,
    Users,
    Utensils,
    Warehouse,
} from 'lucide-react';
import { LuFileText } from 'react-icons/lu';
import { IconType } from 'react-icons/lib';
import { PERMISSIONS } from '../permission/data/permissions';

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
    permissions: PERMISSIONS[];
    subItems?: SidebarNavItemProps[];
}

export const banquetNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Bookings',
        path: '/bookings',
        icon: BarChart,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Events',
        path: '/events',
        icon: Calendar,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Menu Details',
        path: '/menu-details',
        icon: Utensils,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Amenities',
        path: '/amenities',
        icon: Box,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Rented Item',
        path: '/rented-item',
        icon: ShoppingBag,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: BarChart,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
        subItems: [
            {
                title: 'Booking Summary',
                path: '/reports/booking-summary',
                icon: LuFileText,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Revenue Report',
                path: '/reports/revenue',
                icon: CreditCard,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Outstanding Payments',
                path: '/reports/outstanding-payments',
                icon: CreditCard,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Event Calendar',
                path: '/reports/event-calendar',
                icon: Calendar,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Menu Package Performance',
                path: '/reports/menu-package-performance',
                icon: Utensils,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Amenities Inventory',
                path: '/reports/amenities-inventory',
                icon: Warehouse,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Amenity Rental Revenue',
                path: '/reports/amenity-rental-revenue',
                icon: Package,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Overdue Returns',
                path: '/reports/overdue-returns',
                icon: RotateCcw,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Customer Booking History',
                path: '/reports/customer-booking-history',
                icon: Users,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
            {
                title: 'Business Performance',
                path: '/reports/business-performance',
                icon: LayoutDashboard,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
        ],
    },
];
