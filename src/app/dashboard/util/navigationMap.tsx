import React from 'react';

const main = {
    dashboard: React.lazy(() => import('../components/Main/Dashboard')),
    // TODO: Fix import path for ChannelManager
    // channelManager: React.lazy(
    //     () => import('../../components/ChannelManager/ChannelManagerDashboard'),
    // ),
};

const frontOffice = {
    dashboard: React.lazy(
        () => import('../components/FrontOffice/dashboard/Dashboard'),
    ),
    guest: React.lazy(() => import('../components/FrontOffice/GuestList')),
    reservations: React.lazy(
        () => import('../components/FrontOffice/dashboard/ReservationList'),
    ),
    roomSystem: React.lazy(
        () => import('../components/FrontOffice/RoomSystem'),
    ),
    // inventory: React.lazy(() => import('../components/Inventory/Inventory')),
    reports: React.lazy(() => import('../components/FrontOffice/Reports')),
    // settings: React.lazy(() => import('../components/Profile/Settings')),
    checkIns: React.lazy(() => import('../components/FrontOffice/CheckIns')),
    stayView: React.lazy(() => import('../components/FrontOffice/StayView')),
    support: React.lazy(
        () => import('../components/FrontOffice/support/Support'),
    ),
};

// const stock = {
//     // items: React.lazy(() => import('../components/Stock/Items')),
//     // transactions: React.lazy(() => import('../components/Stock/Transactions')),
//     // inventory: React.lazy(() => import('../components/Inventory/Inventory')),
//     dashboard: React.lazy(() => import('../components/Stock/dashboard/page')),
//     issuedStock: React.lazy(
//         () => import('../components/Stock/issued-stock/page'),
//     ),
//     goodsReceived: React.lazy(
//         () => import('../components/Stock/goods-receive-note/page'),
//     ),
//     stockRequest: React.lazy(
//         () => import('../components/Stock/stock-requests/page'),
//     ),
//     items: React.lazy(() => import('../components/Stock/items/page')),
//     generateStockList: React.lazy(
//         () =>
//             import(
//                 '../components/Stock/goods-receive-note/generate-restocking-list/page'
//             ),
//     ),
//     recentActivities: React.lazy(
//         () =>
//             import('../components/Stock/stock-requests/recent-activities/page'),
//     ),
//     reports: React.lazy(() => import('../components/Stock/reports/page')),
// };

const profile = {
    settings: React.lazy(() => import('../components/Profile/Settings')),
};

// const staffing = {
//     dashboard: React.lazy(() => import('../components/Staffing/StaffingMain')),
//     manaagerole: React.lazy(() => import('../components/Staffing/ManageRole')),
// };

// const kitchen = {
//     inventory: React.lazy(() => import('../components/Inventory/Inventory')),
// };

// const houseKeeping = {
//     dashboard: React.lazy(
//         () => import('../components/HouseKeeping/dashboard/page'),
//     ),
//     inventory: React.lazy(
//         () => import('../components/HouseKeeping/inventory/page'),
//     ),
//     roomStatus: React.lazy(
//         () => import('../components/HouseKeeping/room-status/page'),
//     ),
//     cleaningRequest: React.lazy(
//         () => import('../components/HouseKeeping/cleaning-requests/page'),
//     ),
//     maintenance: React.lazy(
//         () => import('../components/HouseKeeping/maintenance/page'),
//     ),
//     lostItems: React.lazy(
//         () => import('../components/HouseKeeping/lost-items/page'),
//     ),
//     dailyTask: React.lazy(
//         () => import('../components/HouseKeeping/daily-tasks/page'),
//     ),
//     reports: React.lazy(
//         () => import('../components/HouseKeeping/reports/page'),
//     ),
//     roomTypes: React.lazy(
//         () => import('../components/HouseKeeping/dashboard/roomtypes/page'),
//     ),
//     roomActivities: React.lazy(
//         () =>
//             import(
//                 '../components/HouseKeeping/room-status/all-room-activities/page'
//             ),
//     ),
// };

export const navigationMap: Record<
    string,
    { [key: string]: React.ElementType }
> = {
    main: {
        dashboard: main.dashboard,
        // TODO: Add channelManager when import is fixed
        // channelManager: main.channelManager,
    },
    frontoffice: {
        dashboard: frontOffice.dashboard,
        guest: frontOffice.guest,
        reservationlist: frontOffice.reservations,
        reservations: frontOffice.reservations,
        'room-system': frontOffice.roomSystem,
        reports: frontOffice.reports,
        'check-ins': frontOffice.checkIns,
        'stay-view': frontOffice.stayView,
        support: frontOffice.support,
    },
    // stock: {
    //     dashboard: stock.dashboard,
    //     'issued-stock': stock.issuedStock,
    //     'goods-received': stock.goodsReceived,
    //     'stock-request': stock.stockRequest,
    //     items: stock.items,
    //     'generate-restocking-list': stock.generateStockList,
    //     'recent-activities': stock.recentActivities,
    //     reports: stock.reports,
    // },
    profile: {
        settings: profile.settings,
    },
    // staffing: {
    //     dashboard: staffing.dashboard,
    //     managerole: staffing.manaagerole,
    // },
    // housekeeping: {
    //     dashboard: houseKeeping.dashboard,
    //     inventory: houseKeeping.inventory,
    //     'room-status': houseKeeping.roomStatus,
    //     'cleaning-requests': houseKeeping.cleaningRequest,
    //     maintenance: houseKeeping.maintenance,
    //     'lost-items': houseKeeping.lostItems,
    //     'daily-task': houseKeeping.dailyTask,
    //     reports: houseKeeping.reports,
    //     'room-types': houseKeeping.roomTypes,
    //     'all-room-activities': houseKeeping.roomActivities,
    // },
    default: {
        page: main.dashboard,
    },
};
