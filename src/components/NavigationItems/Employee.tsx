'use client';
import {
    Clipboard,
    Footprints,
    // HandCoins,
    Home,
    Users,
    Warehouse,
} from 'lucide-react';
import { SidebarNavItemProps } from '../common/layout/data/sidebar';
import { PERMISSIONS } from '../permission/data/permissions';

export const employeeNavItems: Array<SidebarNavItemProps> = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Employee',
        path: '/employee-management',
        icon: Users,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
        ],
    },
    {
        title: 'Department',
        path: '/department-management',
        icon: Warehouse,

        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_DEPARTMENT_MANAGEMENT,
        ],
    },
    {
        title: 'Attendance',
        path: '/attendance-management',
        icon: Footprints,

        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_ATTENDANCE_MANAGEMENT,
        ],
        subItems: [
            {
                title: 'Check In/Out',
                path: '/attendance-management/checkinout',

                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ATTENDANCE_MANAGEMENT,
                ],
            },
            {
                title: 'Shift Management',
                path: '/attendance-management/shift-management',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ATTENDANCE_MANAGEMENT,
                ],
            },
            {
                title: 'Leave Integration',
                path: '/attendance-management/leave-integration',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ATTENDANCE_MANAGEMENT,
                ],
            },
            {
                title: 'Attendance Tracking',
                path: '/attendance-management/logs-tracking',
                permissions: [
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_ATTENDANCE_MANAGEMENT,
                ],
            },
        ],
    },
    // {
    //     title: 'Payroll',
    //     path: '/payroll',
    //     icon: HandCoins,
    //     permissions: [
    //         PERMISSIONS.VIEW_ALL_PAGE,
    //         PERMISSIONS.VIEW_PAYROLL_DASHBOARD,
    //         PERMISSIONS.GENERATE_PAYROLL,
    //         PERMISSIONS.APPROVE_PAYROLL,
    //         PERMISSIONS.DISBURSE_SALARIES,
    //     ],
    // },
    {
        title: 'Report',
        path: '/report',
        icon: Clipboard,

        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_EMPLOYEE_REPORTS,
        ],
    },
];
