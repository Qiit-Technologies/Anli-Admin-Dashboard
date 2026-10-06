export const IDLE_LOGOUT_EXEMPT_PATHS = [
    // Front of house — order taking & fulfillment
    '/front-of-house/table-services',
    '/front-of-house/room-service',
    '/front-of-house/take-away',
    '/front-of-house/home-delivery',
    '/front-of-house/fast-food',
    '/front-of-house/incoming-orders',
    '/front-of-house/order',
    '/front-of-house/update-item',
    '/front-of-house/update-delivery',
    '/front-of-house/kot-overview',
    '/front-of-house/payments',
    '/front-of-house/split-bills',
    '/front-of-house/sent-items',

    // Back of house — menu & item management
    '/back-of-house/menu',
    '/back-of-house/menu-item',
    '/back-of-house/menu-settings',
    '/back-of-house/modifiers',
    '/back-of-house/mini-category',
    '/back-of-house/item-category',
    '/back-of-house/dine-area',
    '/back-of-house/table-management',
    '/back-of-house/kitchen-management',

    // Front office — guest-facing workflows
    '/front-office/reservations',
    '/front-office/check-in-out',
    '/front-office/guest-management',
    '/front-office/stay-view',
    '/front-office/account-section/pm-folio',
    '/front-office/room-rebating',
    '/front-office/room-management',

    // Reservations module
    '/reservations/table-spaces-setup',
    '/reservations/menu',

    // Stock — long-form create/edit flows
    '/stock/items/create',
    '/stock/items/*',
    '/stock/purchase-order/create',
    '/stock/purchase-order/*',
    '/stock/transfer-management/create',
    '/stock/sales-unit-mapping/create',
    '/stock/purchase-log/*',

    // Employee & banquet workflows
    '/employee/employee-management/*',
    '/employee/attendance-management/checkinout',
    '/employee/attendance-management/shift-management',
    '/banquet/bookings',
    '/banquet/events',
    '/banquet/menu-details',

    // Kitchen display — staff monitor orders for extended periods
    '/kitchen/kds-overview',
    '/kitchen/dashboard',

    // Bar display system
    '/bar/bds',

    // Membership — bookings, check-in, member management
    '/membership/bookings',
    '/membership/check-in',
    '/membership/members/qr-checkin',
    '/membership/members/*',
    '/membership/guest-history/*',
    '/membership/members/onboarding',
    '/membership/admin/plan',
    '/membership/admin/service-list',
    '/membership/admin/accessible',

    // Housekeeping — active task workflows
    '/house-keeping/room-status',
    '/house-keeping/cleaning-requests',
    '/house-keeping/daily-tasks',
    '/house-keeping/maintenance',
    '/house-keeping/lost-items',

    // Reservations module — create & manage bookings
    '/reservations/overview',
    '/reservations/dashboard',
    '/reservations/all-reservations',
    '/reservations/payment',

    // Accounting — long-form data entry
    '/account/daily-transactions',
    '/account/purchase-management/*',
    '/account/payroll-summary/*',
    '/account/account-management/*',
    '/account/petty-cash',
] as const;

export function isIdleLogoutExemptPath(pathname: string): boolean {
    return IDLE_LOGOUT_EXEMPT_PATHS.some((path) => {
        if (path.endsWith('/*')) {
            const base = path.slice(0, -1);
            return pathname.startsWith(base) && pathname.length > base.length;
        }
        return pathname === path || pathname.startsWith(`${path}/`);
    });
}
