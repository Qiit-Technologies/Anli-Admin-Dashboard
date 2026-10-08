'use client';
import { Folder } from 'lucide-react';
import { IconType } from 'react-icons/lib';
import {
    LuCalendar,
    LuCalendarSync,
    LuChartArea,
    LuClipboardCheck,
    LuFileText,
    LuGalleryVertical,
    LuHouse,
    LuLayoutDashboard,
    LuUsers,
} from 'react-icons/lu';
import { PERMISSIONS } from '../permission/data/permissions';
import { CgProfile } from 'react-icons/cg';
import { AiOutlineDashboard } from 'react-icons/ai';

interface SidebarSubNav {
    title: string;
    path: string;
    icon?: IconType;
    subItems?: Omit<SidebarSubNav, 'subItems'>[];
    permissions?: PERMISSIONS[];
}

export interface SidebarNavItemProps {
    title: string;
    path: string;
    icon: IconType;
    subItems?: SidebarSubNav[];
    permissions?: PERMISSIONS[];
}

export const frontOfficeNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LuLayoutDashboard,
    },
    {
        title: "Manager's Flash",
        path: '/managers-flash',
        icon: AiOutlineDashboard,
        permissions: [PERMISSIONS.VIEW_MANAGERS_FLASH],
    },
    {
        title: 'Stay View',
        path: '/stay-view',
        icon: LuGalleryVertical,
        permissions: [
            PERMISSIONS.VIEW_ROOM_AVAILABILITY,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Guest Management',
        path: '/guest-management',
        icon: LuUsers,
        permissions: [
            PERMISSIONS.VIEW_GUEST_MANAGEMENT,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Guest Profiles',
        path: '/guest-profiles',
        icon: CgProfile,
        permissions: [
            PERMISSIONS.VIEW_GUEST_MANAGEMENT,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Reservations',
        path: '/reservations',
        icon: LuCalendar,
        permissions: [PERMISSIONS.VIEW_RESERVATIONS, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Room Management',
        path: '/room-management',
        icon: LuHouse,
        permissions: [
            PERMISSIONS.VIEW_ROOM_MANAGEMENT,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Check Ins and Outs',
        path: '/check-in-out',
        icon: LuCalendarSync,
        permissions: [PERMISSIONS.VIEW_CHECK_IN_OUT, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Room Rebating',
        path: '/room-rebating',
        icon: LuCalendarSync,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    // {
    //     title: 'Guest Database',
    //     path: '/guest-database',
    //     icon: FolderArchive,
    //     permissions: [
    //         PERMISSIONS.VIEW_GUEST_MANAGEMENT,
    //         PERMISSIONS.VIEW_ALL_PAGE,
    //     ],
    // },
    {
        title: 'Utilities',
        path: '/account',
        icon: Folder,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
        ],
        subItems: [
            {
                title: 'Account Receivable',
                path: '/account-section/receivables',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
            },
            {
                title: 'PM Folio',
                path: '/account-section/pm-folio',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
            },
            {
                title: 'Account Payable',
                path: '/account-section/payables',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
            },
            // {
            //     title: 'AP Summary',
            //     path: '/account-section/payables/ap-summary',
            //     permissions: [
            //         PERMISSIONS.VIEW_ALL_PAGE,
            //         PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
            //     ],
            // },

            {
                title: 'Account Status',
                path: '/account-section/account-status',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
            },
            {
                title: 'Draft Invoices',
                path: '/account-section/draft-invoices',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.CREATE_RESERVATION,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
            },
            // {
            //     title: 'Transfer Outstanding',
            //     path: '/account-section/transfer-outstanding',
            //     permissions: [
            //         PERMISSIONS.VIEW_ALL_PAGE,
            //         PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
            //     ],
            // },
            {
                title: 'Autobilling Guests',
                path: '/account-section/room-autobilling',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
            },
            {
                title: 'Internal Accounts',
                path: '/internal-accounts',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_INTERNAL_ACCOUNTS,
                ],
            },
        ],
    },
    {
        title: 'Inventory',
        path: '/inventory',
        icon: LuClipboardCheck,
        permissions: [
            PERMISSIONS.VIEW_INVENTORY_LEVELS,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: LuChartArea,
        subItems: [
            {
                title: 'Sales Report',
                path: '/reports/sales-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Night Audit Report',
                path: '/reports/night-audit',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'No-Show Report',
                path: '/reports/no-show-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Arrival Report',
                path: '/reports/arrival-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Guest In-House Report',
                path: '/reports/guest-in-house-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'ADR & RevPAR Report',
                path: '/reports/adr',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Void Report',
                path: '/reports/void-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Complimentary Report',
                path: '/reports/complimentary-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Refund Report',
                path: '/reports/refund-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Tax & Charges Report',
                path: '/reports/tax-charges-report',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
            {
                title: 'Account Receivable Summary',
                path: '/reports/account-receivable-summary',
                icon: LuFileText,
                permissions: [
                    PERMISSIONS.VIEW_BOOKING_REPORTS,
                    PERMISSIONS.VIEW_ALL_PAGE,
                ],
            },
        ],
    },
];
