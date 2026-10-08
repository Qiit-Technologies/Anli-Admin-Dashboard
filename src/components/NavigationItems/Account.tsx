'use client';
import {
    AlignVerticalDistributeStart,
    ClipboardList,
    CreditCard,
    FileText,
    Folder,
    LayoutGrid,
    Pentagon,
    SquareMenu,
} from 'lucide-react';

import { SidebarNavItemProps } from '../common/layout/data/sidebar';
import { PERMISSIONS } from '../permission/data/permissions';

export const accountNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Payroll Summary',
        path: '/payroll-summary',
        icon: CreditCard,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_PAYROLL_DASHBOARD,
        ],
    },
    {
        title: 'Account Management',
        path: '/account-management',
        icon: FileText,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_ACCOUNT_MANAGEMENT,
        ],
    },
    {
        title: 'Vendors Management',
        path: '/vendors-management',
        icon: Pentagon,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_VENDORS_MANAGEMENT,
        ],
    },
    {
        title: 'Purchase Management',
        path: '/purchase-management',
        icon: AlignVerticalDistributeStart,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_PURCHASE_MANAGEMENT,
        ],
    },
    {
        title: 'Daily Transactions',
        path: '/daily-transactions',
        icon: ClipboardList,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_DAILY_TRANSACTIONS,
        ],
    },
    {
        title: 'Petty Cash Management',
        path: '/petty-cash',
        icon: SquareMenu,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_PETTY_CASH_MANAGEMENT,
        ],
    },
    {
        title: 'Reports',
        path: '/reports',
        icon: Folder,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
        ],
        subItems: [
            {
                title: 'Main Report',
                path: '/reports/main-report',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
                subItems: [
                    {
                        title: 'Daily Business Summary Report',
                        path: '/reports/main-report/daily-business',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                        ],
                    },
                    {
                        title: 'Departmental Sales Reports',
                        path: '/reports/main-report/departmental-sales',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                        ],
                    },
                    {
                        title: 'Stock Reports',
                        path: '/reports/main-report/stock-report',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_STOCK_REPORTS,
                        ],
                    },
                ],
            },
            {
                title: 'Secondary Report',
                path: '/reports/secondary-report',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
                subItems: [
                    {
                        title: 'Departmental Expense Report',
                        path: '/reports/secondary-report/departmental-expense-report',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                        ],
                    },
                    {
                        title: 'Petty Cash Reports',
                        path: '/reports/secondary-report/petty-cash-reports',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_PETTY_CASH_MANAGEMENT,
                        ],
                    },
                    {
                        title: 'Vendor Spend Report',
                        path: '/reports/secondary-report/vendor-spend-report',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_VENDORS_MANAGEMENT,
                        ],
                    },
                    {
                        title: 'Cash Flow Summary',
                        path: '/reports/secondary-report/cash-flow-summary',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                        ],
                    },
                ],
            },
            {
                title: 'Advance Report',
                path: '/reports/advance-report',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                ],
                subItems: [
                    {
                        title: 'Payroll Summary Report',
                        path: '/reports/advance-report/payroll-summary',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_PAYROLL_SUMMARY,
                        ],
                    },
                    {
                        title: 'Aging Payables & Receivables',
                        path: '/reports/advance-report/aging',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_ACCOUNTING_REPORTS,
                        ],
                    },
                    {
                        title: 'Reservation Summary (Front Desk)',
                        path: '/reports/advance-report/reservation',
                        permissions: [
                            PERMISSIONS.VIEW_ALL_PAGE,
                            PERMISSIONS.VIEW_BOOKING_REPORTS,
                        ],
                    },
                ],
            },
        ],
    },
];
