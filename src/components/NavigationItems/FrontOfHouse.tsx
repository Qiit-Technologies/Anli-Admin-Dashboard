'use client';
import { IconType } from 'react-icons/lib';
import {
    LuBolt,
    LuClipboardCheck,
    LuCoffee,
    // LuCreditCard,
    LuFileText,
    LuHeadphones,
    LuPackage,
    LuSettings,
    LuShoppingCart,
    LuTable,
    LuTimer,
    LuTruck,
} from 'react-icons/lu';
import { PERMISSIONS } from '../permission/data/permissions';

interface SidebarNavItemProps {
    title: string;
    path: string;
    icon?: IconType;
    subItems?: Omit<SidebarNavItemProps, 'subItems'>[];
    permissions?: PERMISSIONS[];
}

const frontHouseNavItems: SidebarNavItemProps[] = [
    {
        title: 'Incoming Orders',
        path: '/incoming-orders',
        icon: LuShoppingCart,
    },
    // {
    //     title: 'KOT Overview',
    //     path: '/kot-overview',
    //     icon: LuFileText,
    //     permissions: [PERMISSIONS.VIEW_KOT_OVERVIEW, PERMISSIONS.VIEW_ALL_PAGE],
    // },

    // {
    //     title: 'Payments',
    //     path: '/payments,
    //     icon: LuCreditCard,
    //     permissions: [
    //         PERMISSIONS.VIEW_OR_INITIATE_ORDER_PAYMENT,
    //         PERMISSIONS.VIEW_ALL_PAGE,
    //     ],
    // },
    {
        title: 'Table Services',
        path: '/table-services',
        icon: LuTable,
        permissions: [
            PERMISSIONS.VIEW_TABLE_SERVICES,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Room Service',
        path: '/room-service',
        icon: LuPackage,
        permissions: [PERMISSIONS.VIEW_ROOM_SERVICE, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Take Away',
        path: '/take-away',
        icon: LuPackage,
        permissions: [
            PERMISSIONS.VIEW_TAKEAWAY_ORDERS,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Fast Food',
        path: '/fast-food',
        icon: LuCoffee,
        permissions: [PERMISSIONS.VIEW_FAST_FOOD],
    },
    {
        title: 'Home Delivery',
        path: '/home-delivery',
        icon: LuTruck,
        permissions: [
            PERMISSIONS.VIEW_HOME_DELIVERY_ORDERS,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Inventory',
        path: '/inventory',
        icon: LuClipboardCheck,
    },
    {
        title: 'Internal Accounts',
        path: '/internal-accounts',
        icon: LuFileText,
        permissions: [
            PERMISSIONS.VIEW_ALL_PAGE,
            PERMISSIONS.VIEW_INTERNAL_ACCOUNTS,
        ],
    },
    {
        title: 'Order History',
        path: '/order-history',
        icon: LuFileText,
        permissions: [
            PERMISSIONS.VIEW_ORDER_HISTORY,
            PERMISSIONS.VIEW_ALL_PAGE,
        ],
    },
    {
        title: 'Work Period',
        path: '/work-period',
        icon: LuTimer,
        permissions: [PERMISSIONS.VIEW_WORK_PERIOD, PERMISSIONS.VIEW_ALL_PAGE],
    },
    {
        title: 'Sales Report',
        path: '/sales-report',
        icon: LuFileText,
        permissions: [PERMISSIONS.VIEW_ALL_PAGE],
        subItems: [
            {
                title: 'Time Wise Sales',
                path: '/sales-report/time-wise',
                icon: LuFileText,
            },
            {
                title: 'Cashier Sales',
                path: '/sales-report/cashier-sales',
                icon: LuFileText,
            },
            {
                title: 'Work Period Report',
                path: '/sales-report/work-period-report',
                icon: LuFileText,
            },
            {
                title: 'Menu Item List Sales',
                path: '/sales-report/menu-item-list-sales',
                icon: LuFileText,
            },
            {
                title: 'Top & Low Selling Items',
                path: '/sales-report/top-low-selling-items',
                icon: LuFileText,
            },
            {
                title: 'Complementary Report',
                path: '/sales-report/complimentary-order-audit',
                icon: LuBolt,
                permissions: [PERMISSIONS.VIEW_ALL_PAGE],
            },
        ],
    },

    // {
    //     title: 'Complimentary Order Audit',
    //     path: '/complimentary-order-audit',
    //     icon: LuBolt,
    //     permissions: [PERMISSIONS.VIEW_ALL_PAGE],
    // },
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

export default frontHouseNavItems;
