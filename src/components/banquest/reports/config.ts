import {
    AMENITY_CATEGORY_OPTIONS,
    AVAILABILITY_STATUS_OPTIONS,
    BOOKING_STATUS_OPTIONS,
    COORDINATOR_OPTIONS,
    CUSTOMER_STATUS_OPTIONS,
    EVENT_STATUS_OPTIONS,
    EVENT_TYPE_OPTIONS,
    FOLLOW_UP_STATUS_OPTIONS,
    INVOICE_STATUS_OPTIONS,
    PACKAGE_CATEGORY_OPTIONS,
    PAYMENT_METHOD_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    RETURN_STATUS_OPTIONS,
    SERVICE_TYPE_OPTIONS,
    VENUE_OPTIONS,
} from './constants';
import {
    AMENITIES_INVENTORY_ROWS,
    AMENITY_RENTAL_REVENUE_ROWS,
    BOOKING_SUMMARY_ROWS,
    BUSINESS_PERFORMANCE_ROWS,
    CUSTOMER_BOOKING_HISTORY_ROWS,
    EVENT_CALENDAR_ROWS,
    MENU_PACKAGE_PERFORMANCE_ROWS,
    OUTSTANDING_PAYMENT_ROWS,
    OVERDUE_RETURNS_ROWS,
    REVENUE_ROWS,
} from './seed-data';
import {
    BanquetReportConfig,
    BanquetReportFiltersState,
    BanquetReportRow,
} from './types';

function sumNumericField(rows: BanquetReportRow[], key: string) {
    return rows.reduce((sum, row) => {
        const val = row[key];
        return sum + (typeof val === 'number' ? val : 0);
    }, 0);
}

export const BANQUET_REPORTS: BanquetReportConfig[] = [
    {
        slug: 'booking-summary',
        dataSource: 'api',
        title: 'Booking Summary Report',
        subtitle: 'See all banquet bookings for the selected period.',
        description:
            'Overview of bookings with customer, event, venue, and payment details.',
        filters: [
            {
                key: 'bookingStatus',
                label: 'Booking Status',
                type: 'select',
                options: BOOKING_STATUS_OPTIONS,
            },
            {
                key: 'paymentStatus',
                label: 'Payment Status',
                type: 'select',
                options: PAYMENT_STATUS_OPTIONS,
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'venue',
                label: 'Venue/Hall',
                type: 'select',
                options: VENUE_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
            {
                key: 'customerName',
                label: 'Customer Name',
                type: 'text',
                placeholder: 'Search customer',
            },
            {
                key: 'amountMin',
                label: 'Min amount',
                type: 'amountMin',
                placeholder: '0',
            },
            {
                key: 'amountMax',
                label: 'Max amount',
                type: 'amountMax',
                placeholder: 'Any',
            },
        ],
        columns: [
            { key: 'bookingId', label: 'Booking ID' },
            { key: 'customerName', label: 'Customer Name' },
            { key: 'eventType', label: 'Event Type' },
            { key: 'eventDate', label: 'Event Date' },
            { key: 'venue', label: 'Venue' },
            { key: 'guests', label: 'Guests', align: 'right' },
            { key: 'bookingStatus', label: 'Booking Status' },
            { key: 'paymentStatus', label: 'Payment Status' },
            { key: 'totalAmount', label: 'Total Amount', align: 'right' },
            { key: 'coordinator', label: 'Coordinator' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Total bookings' },
            { key: 'totalGuests', label: 'Total guests' },
            { key: 'confirmedCount', label: 'Confirmed' },
            { key: 'pendingCount', label: 'Pending' },
        ],
        seedRows: BOOKING_SUMMARY_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            totalGuests: sumNumericField(rows, 'guests'),
            confirmedCount: rows.filter((r) => r.bookingStatus === 'Confirmed')
                .length,
            pendingCount: rows.filter((r) => r.bookingStatus === 'Pending')
                .length,
        }),
    },
    {
        slug: 'revenue',
        dataSource: 'api',
        title: 'Revenue Report',
        subtitle: 'Track invoice payments and outstanding balances.',
        description: 'Revenue breakdown by invoice, payment method, and tax.',
        filters: [
            {
                key: 'paymentMethod',
                label: 'Payment Method',
                type: 'select',
                options: PAYMENT_METHOD_OPTIONS,
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'customer',
                label: 'Customer',
                type: 'text',
                placeholder: 'Search customer',
            },
            {
                key: 'invoiceStatus',
                label: 'Invoice Status',
                type: 'select',
                options: INVOICE_STATUS_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
            {
                key: 'paymentStatus',
                label: 'Payment Status',
                type: 'select',
                options: PAYMENT_STATUS_OPTIONS,
            },
        ],
        columns: [
            { key: 'invoiceId', label: 'Invoice ID' },
            { key: 'bookingId', label: 'Booking ID' },
            { key: 'customer', label: 'Customer' },
            { key: 'eventType', label: 'Event Type' },
            { key: 'paymentDate', label: 'Payment Date' },
            { key: 'paymentMethod', label: 'Payment Method' },
            { key: 'amountPaid', label: 'Amount Paid', align: 'right' },
            {
                key: 'outstandingBalance',
                label: 'Outstanding Balance',
                align: 'right',
            },
            { key: 'tax', label: 'Tax', align: 'right' },
            { key: 'totalRevenue', label: 'Total Revenue', align: 'right' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Total invoices' },
            { key: 'totalInvoices', label: 'Invoices generated' },
            { key: 'paidInvoices', label: 'Fully paid' },
            { key: 'outstandingInvoices', label: 'With balance' },
        ],
        seedRows: REVENUE_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            totalInvoices: rows.length,
            paidInvoices: rows.filter((r) => r.outstandingBalance === '₦0')
                .length,
            outstandingInvoices: rows.filter(
                (r) => r.outstandingBalance !== '₦0',
            ).length,
        }),
    },
    {
        slug: 'outstanding-payments',
        dataSource: 'api',
        title: 'Outstanding Payment Report',
        subtitle: 'Monitor unpaid and partially paid banquet invoices.',
        description: 'Follow-up status for bookings with outstanding balances.',
        filters: [
            {
                key: 'customerName',
                label: 'Customer Name',
                type: 'text',
                placeholder: 'Search customer',
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
            {
                key: 'venue',
                label: 'Venue/Hall',
                type: 'select',
                options: VENUE_OPTIONS,
            },
            {
                key: 'paymentStatus',
                label: 'Payment Status',
                type: 'select',
                options: PAYMENT_STATUS_OPTIONS,
            },
            {
                key: 'followUpStatus',
                label: 'Follow-up Status',
                type: 'select',
                options: FOLLOW_UP_STATUS_OPTIONS,
            },
        ],
        columns: [
            { key: 'bookingId', label: 'Booking ID' },
            { key: 'customer', label: 'Customer' },
            { key: 'eventDate', label: 'Event Date' },
            { key: 'totalInvoice', label: 'Total Invoice', align: 'right' },
            { key: 'amountPaid', label: 'Amount Paid', align: 'right' },
            {
                key: 'outstandingBalance',
                label: 'Outstanding Balance',
                align: 'right',
            },
            { key: 'dueDate', label: 'Due Date' },
            { key: 'paymentStatus', label: 'Payment Status' },
            { key: 'followUpStatus', label: 'Follow-up Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Outstanding accounts' },
            { key: 'escalatedCount', label: 'Escalated' },
            { key: 'reminderCount', label: 'Reminders sent' },
            { key: 'pendingFollowUp', label: 'Pending follow-up' },
        ],
        seedRows: OUTSTANDING_PAYMENT_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            escalatedCount: rows.filter(
                (r) => r.followUpStatus === 'Escalated',
            ).length,
            reminderCount: rows.filter(
                (r) => r.followUpStatus === 'Reminder Sent',
            ).length,
            pendingFollowUp: rows.filter(
                (r) => r.followUpStatus === 'Pending Follow-up',
            ).length,
        }),
    },
    {
        slug: 'event-calendar',
        dataSource: 'api',
        title: 'Event Calendar Report',
        subtitle: 'Scheduled events across banquet halls.',
        description: 'Calendar view of events with timing and coordinator.',
        filters: [
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'venue',
                label: 'Venue/Hall',
                type: 'select',
                options: VENUE_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
            {
                key: 'eventStatus',
                label: 'Event Status',
                type: 'select',
                options: EVENT_STATUS_OPTIONS,
            },
            {
                key: 'customerName',
                label: 'Customer Name',
                type: 'text',
                placeholder: 'Search customer',
            },
        ],
        columns: [
            { key: 'eventId', label: 'Event ID' },
            { key: 'eventName', label: 'Event Name' },
            { key: 'eventType', label: 'Event Type' },
            { key: 'customer', label: 'Customer' },
            { key: 'eventDate', label: 'Event Date' },
            { key: 'startTime', label: 'Start Time' },
            { key: 'endTime', label: 'End Time' },
            { key: 'venue', label: 'Venue' },
            { key: 'coordinator', label: 'Coordinator' },
            { key: 'status', label: 'Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Total events' },
            { key: 'confirmedCount', label: 'Confirmed' },
            { key: 'completedCount', label: 'Completed' },
            { key: 'pendingCount', label: 'Pending' },
        ],
        seedRows: EVENT_CALENDAR_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            confirmedCount: rows.filter((r) => r.status === 'Confirmed').length,
            completedCount: rows.filter((r) => r.status === 'Completed').length,
            pendingCount: rows.filter((r) => r.status === 'Pending').length,
        }),
    },
    {
        slug: 'menu-package-performance',
        dataSource: 'api',
        title: 'Menu Package Performance Report',
        subtitle: 'Performance metrics for banquet menu packages.',
        description: 'Booking frequency and revenue by menu package.',
        filters: [
            {
                key: 'packageCategory',
                label: 'Package Category',
                type: 'select',
                options: PACKAGE_CATEGORY_OPTIONS,
            },
            {
                key: 'packageName',
                label: 'Package Name',
                type: 'text',
                placeholder: 'Search package',
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: AVAILABILITY_STATUS_OPTIONS,
            },
        ],
        columns: [
            { key: 'packageId', label: 'Package ID' },
            { key: 'packageName', label: 'Package Name' },
            { key: 'category', label: 'Category' },
            { key: 'timesBooked', label: 'Times Booked', align: 'right' },
            { key: 'averageGuests', label: 'Average Guests', align: 'right' },
            {
                key: 'revenueGenerated',
                label: 'Revenue Generated',
                align: 'right',
            },
            {
                key: 'mostCommonEventType',
                label: 'Most Common Event Type',
            },
            { key: 'status', label: 'Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Active packages' },
            { key: 'totalBookings', label: 'Total bookings' },
            { key: 'avgGuests', label: 'Avg guests' },
            { key: 'topPackageBookings', label: 'Top package bookings' },
        ],
        seedRows: MENU_PACKAGE_PERFORMANCE_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            totalBookings: sumNumericField(rows, 'timesBooked'),
            avgGuests: Math.round(sumNumericField(rows, 'averageGuests') / Math.max(rows.length, 1)),
            topPackageBookings: Math.max(
                ...rows.map((r) =>
                    typeof r.timesBooked === 'number' ? r.timesBooked : 0,
                ),
                0,
            ),
        }),
    },
    {
        slug: 'amenities-inventory',
        dataSource: 'api',
        title: 'Amenities Inventory Report',
        subtitle: 'Current stock and availability of banquet amenities.',
        description: 'Inventory levels, condition, and rental fees.',
        filters: [
            {
                key: 'amenityCategory',
                label: 'Amenity Category',
                type: 'select',
                options: AMENITY_CATEGORY_OPTIONS,
            },
            {
                key: 'availabilityStatus',
                label: 'Availability Status',
                type: 'select',
                options: AVAILABILITY_STATUS_OPTIONS,
            },
            {
                key: 'condition',
                label: 'Condition',
                type: 'select',
                options: [
                    { value: 'all', label: 'All' },
                    { value: 'excellent', label: 'Excellent' },
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                ],
            },
            {
                key: 'amenityName',
                label: 'Amenity Name',
                type: 'text',
                placeholder: 'Search amenity',
            },
        ],
        columns: [
            { key: 'amenityId', label: 'Amenity ID' },
            { key: 'amenityName', label: 'Amenity Name' },
            { key: 'category', label: 'Category' },
            { key: 'totalQuantity', label: 'Total Quantity', align: 'right' },
            {
                key: 'availableQuantity',
                label: 'Available Quantity',
                align: 'right',
            },
            { key: 'rentedQuantity', label: 'Rented Quantity', align: 'right' },
            { key: 'condition', label: 'Condition' },
            { key: 'dailyRentalFee', label: 'Daily Rental Fee', align: 'right' },
            { key: 'status', label: 'Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Total amenities' },
            { key: 'totalStock', label: 'Total stock' },
            { key: 'availableStock', label: 'Available' },
            { key: 'rentedStock', label: 'Rented out' },
        ],
        seedRows: AMENITIES_INVENTORY_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            totalStock: sumNumericField(rows, 'totalQuantity'),
            availableStock: sumNumericField(rows, 'availableQuantity'),
            rentedStock: sumNumericField(rows, 'rentedQuantity'),
        }),
    },
    {
        slug: 'amenity-rental-revenue',
        dataSource: 'api',
        title: 'Amenity Rental Revenue Report',
        subtitle: 'Revenue from amenity rentals by period.',
        description: 'Rental fees, delivery charges, and return status.',
        filters: [
            {
                key: 'amenityName',
                label: 'Amenity Name',
                type: 'text',
                placeholder: 'Search amenity',
            },
            {
                key: 'amenityCategory',
                label: 'Amenity Category',
                type: 'select',
                options: AMENITY_CATEGORY_OPTIONS,
            },
            {
                key: 'customerName',
                label: 'Customer Name',
                type: 'text',
                placeholder: 'Search customer',
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'returnStatus',
                label: 'Return Status',
                type: 'select',
                options: RETURN_STATUS_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
        ],
        columns: [
            { key: 'rentalId', label: 'Rental ID' },
            { key: 'amenity', label: 'Amenity' },
            { key: 'customer', label: 'Customer' },
            { key: 'eventType', label: 'Event Type' },
            { key: 'rentalPeriod', label: 'Rental Period' },
            { key: 'quantity', label: 'Quantity', align: 'right' },
            { key: 'rentalFee', label: 'Rental Fee', align: 'right' },
            { key: 'deliveryFee', label: 'Delivery Fee', align: 'right' },
            { key: 'totalRevenue', label: 'Total Revenue', align: 'right' },
            { key: 'returnStatus', label: 'Return Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Total rentals' },
            { key: 'returnedCount', label: 'Returned' },
            { key: 'activeCount', label: 'Active rentals' },
            { key: 'overdueCount', label: 'Overdue' },
        ],
        seedRows: AMENITY_RENTAL_REVENUE_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            returnedCount: rows.filter((r) => r.returnStatus === 'Returned')
                .length,
            activeCount: rows.filter((r) => r.returnStatus === 'Active').length,
            overdueCount: rows.filter((r) => r.returnStatus === 'Overdue')
                .length,
        }),
    },
    {
        slug: 'overdue-returns',
        dataSource: 'api',
        title: 'Overdue Returns Report',
        subtitle: 'Track overdue amenity returns and penalties.',
        description: 'Contact details and escalation status for overdue items.',
        filters: [
            {
                key: 'returnStatus',
                label: 'Return Status',
                type: 'select',
                options: RETURN_STATUS_OPTIONS,
            },
            {
                key: 'customerName',
                label: 'Customer Name',
                type: 'text',
                placeholder: 'Search customer',
            },
            {
                key: 'amenityName',
                label: 'Amenity Name',
                type: 'text',
                placeholder: 'Search amenity',
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
        ],
        columns: [
            { key: 'rentalId', label: 'Rental ID' },
            { key: 'amenity', label: 'Amenity' },
            { key: 'customer', label: 'Customer' },
            { key: 'dueReturnDate', label: 'Due Return Date' },
            { key: 'daysOverdue', label: 'Days Overdue' },
            { key: 'quantity', label: 'Quantity', align: 'right' },
            { key: 'penaltyFee', label: 'Penalty Fee', align: 'right' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'phoneNumber', label: 'Phone Number' },
            { key: 'status', label: 'Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Overdue rentals' },
            { key: 'escalatedCount', label: 'Escalated' },
            { key: 'reminderCount', label: 'Reminders sent' },
            { key: 'pendingReturn', label: 'Pending return' },
        ],
        seedRows: OVERDUE_RETURNS_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            escalatedCount: rows.filter((r) => r.status === 'Escalated').length,
            reminderCount: rows.filter((r) => r.status === 'Reminder Sent')
                .length,
            pendingReturn: rows.filter((r) => r.status === 'Pending Return')
                .length,
        }),
    },
    {
        slug: 'customer-booking-history',
        dataSource: 'api',
        title: 'Customer Booking History Report',
        subtitle: 'Lifetime booking and spend by customer.',
        description: 'Customer loyalty metrics and outstanding balances.',
        filters: [
            {
                key: 'customerName',
                label: 'Customer Name',
                type: 'text',
                placeholder: 'Search customer',
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
            {
                key: 'customerStatus',
                label: 'Customer Status',
                type: 'select',
                options: CUSTOMER_STATUS_OPTIONS,
            },
        ],
        columns: [
            { key: 'customerName', label: 'Customer Name' },
            { key: 'totalBookings', label: 'Total Bookings', align: 'right' },
            { key: 'firstBookingDate', label: 'First Booking Date' },
            { key: 'lastBookingDate', label: 'Last Booking Date' },
            {
                key: 'mostFrequentEventType',
                label: 'Most Frequent Event Type',
            },
            { key: 'totalSpend', label: 'Total Spend', align: 'right' },
            {
                key: 'outstandingBalance',
                label: 'Outstanding Balance',
                align: 'right',
            },
            { key: 'customerStatus', label: 'Customer Status' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Total customers' },
            { key: 'totalBookings', label: 'Total bookings' },
            { key: 'vipCount', label: 'VIP customers' },
            { key: 'withBalance', label: 'With outstanding balance' },
        ],
        seedRows: CUSTOMER_BOOKING_HISTORY_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            totalBookings: sumNumericField(rows, 'totalBookings'),
            vipCount: rows.filter((r) => r.customerStatus === 'VIP').length,
            withBalance: rows.filter((r) => r.outstandingBalance !== '₦0')
                .length,
        }),
    },
    {
        slug: 'business-performance',
        dataSource: 'api',
        title: 'Business Performance Dashboard Report',
        subtitle: 'Monthly banquet business performance overview.',
        description: 'Bookings, revenue, occupancy, and customer growth.',
        filters: [
            {
                key: 'reportingPeriod',
                label: 'Reporting Period',
                type: 'text',
                placeholder: 'e.g. January 2025',
            },
            {
                key: 'eventType',
                label: 'Event Type',
                type: 'select',
                options: EVENT_TYPE_OPTIONS,
            },
            {
                key: 'venue',
                label: 'Venue/Hall',
                type: 'select',
                options: VENUE_OPTIONS,
            },
            {
                key: 'coordinator',
                label: 'Coordinator',
                type: 'select',
                options: COORDINATOR_OPTIONS,
            },
            {
                key: 'serviceType',
                label: 'Service Type',
                type: 'select',
                options: SERVICE_TYPE_OPTIONS,
            },
        ],
        columns: [
            { key: 'reportingPeriod', label: 'Reporting Period' },
            { key: 'totalBookings', label: 'Total Bookings', align: 'right' },
            { key: 'completedEvents', label: 'Completed Events', align: 'right' },
            { key: 'totalRevenue', label: 'Total Revenue', align: 'right' },
            {
                key: 'outstandingPayments',
                label: 'Outstanding Payments',
                align: 'right',
            },
            { key: 'totalCustomers', label: 'Total Customers', align: 'right' },
            {
                key: 'mostPopularEventType',
                label: 'Most Popular Event Type',
            },
            { key: 'occupancyRate', label: 'Occupancy Rate', align: 'right' },
        ],
        summaryCards: [
            { key: 'totalRecords', label: 'Reporting periods' },
            { key: 'totalBookings', label: 'Total bookings' },
            { key: 'completedEvents', label: 'Completed events' },
            { key: 'totalCustomers', label: 'Total customers' },
        ],
        seedRows: BUSINESS_PERFORMANCE_ROWS,
        computeSummary: (rows) => ({
            totalRecords: rows.length,
            totalBookings: sumNumericField(rows, 'totalBookings'),
            completedEvents: sumNumericField(rows, 'completedEvents'),
            totalCustomers: sumNumericField(rows, 'totalCustomers'),
        }),
    },
];

export function getBanquetReportBySlug(
    slug: string,
): BanquetReportConfig | undefined {
    return BANQUET_REPORTS.find((r) => r.slug === slug);
}

export function buildDefaultFilters(
    config: BanquetReportConfig,
    today: string,
): BanquetReportFiltersState {
    const defaults: BanquetReportFiltersState = {
        startDate: today,
        endDate: today,
        startTime: '00:00',
        endTime: '23:59',
    };
    for (const field of config.filters) {
        if (field.type === 'select') {
            defaults[field.key] = 'all';
        } else {
            defaults[field.key] = '';
        }
    }
    return defaults;
}

export function generateBanquetReportData(
    config: BanquetReportConfig,
): import('./types').BanquetReportData {
    const items = [...config.seedRows];
    return {
        items,
        summary: config.computeSummary(items),
        generatedAt: new Date().toISOString(),
    };
}
