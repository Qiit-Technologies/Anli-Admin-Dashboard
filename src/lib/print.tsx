import { printToIP } from '@/app/actions/print';
import type {
    CashierSalesHeaderInfo,
    CashierSalesReportData,
    MenuItemListSalesReportData,
    WorkPeriodReportData,
} from '@/components/front-of-house/report/types';

const ESC = String.fromCharCode(27);
const GS = String.fromCharCode(29);

const COMMANDS = {
    INIT: ESC + '@',
    ALIGN_LEFT: ESC + 'a' + String.fromCharCode(0),
    ALIGN_CENTER: ESC + 'a' + String.fromCharCode(1),
    ALIGN_RIGHT: ESC + 'a' + String.fromCharCode(2),
    BOLD_ON: ESC + 'E' + String.fromCharCode(1),
    BOLD_OFF: ESC + 'E' + String.fromCharCode(0),
    UNDERLINE_ON: ESC + '-' + String.fromCharCode(1),
    UNDERLINE_OFF: ESC + '-' + String.fromCharCode(0),
    DOUBLE_HEIGHT: ESC + '!' + String.fromCharCode(16),
    NORMAL_SIZE: ESC + '!' + String.fromCharCode(0),
    FEED_LINES: ESC + 'd',
    CUT_PAPER: GS + 'V' + String.fromCharCode(1),
};

export interface PrintOrderData {
    hotel?: string;
    email?: string;
    phone?: string;
    hotelId?: string;
    orderId: string;
    orderDate: Date | string;
    orderTime?: string;
    room?: string;
    table?: {
        number: string;
    };
    waiter?: {
        fullName: string;
    };
    paymentMethod?: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        specialInstructions: string;
    }>;
    billAmount: number;
    vat: number | string;
    totalTax: number | string;
    restaurantVatInclusive?: boolean;
    restaurantServiceChargeInclusive?: boolean;
    restaurantTipInclusive?: boolean;
    restaurantCustomChargesInclusive?: boolean;
    serviceCharge?: number | string;
    serviceChargeRate?: number;
    tip?: number | string;
    tipRate?: number;
    total: number;
    complimentaryAmount?: number;
    amountDue?: number;
    preparedBy?: string;
    takenBy?: string;
}

export interface PaymentMethodDetail {
    method: string;
    count: number;
    amount: number;
    percentage: number;
}

export interface CategorySales {
    category: string;
    items: Array<{
        name: string;
        quantity: number;
        revenue: number;
        profit?: number;
        percentage: number;
    }>;
    totalRevenue: number;
    totalProfit?: number;
    percentage: number;
}

export interface UserSalesSettlement {
    userName: string;
    totalSales: number;
    settledBy: Array<{
        paymentMethod: string;
        amount: number;
        percentage: number;
    }>;
    totalIncome: number;
}

export interface DailySalesPrintData {
    hotelName: string;
    hotelAddress?: string;
    hotelEmail?: string;
    hotelPhone?: string;
    reportDate: string;
    reportPeriod: string;
    totalOrders: number;
    totalRevenue: number;
    totalProfit?: number;
    subtotal: number;
    vatAmount: number;
    vatRate: number;
    serviceChargeAmount: number;
    deliveryFees: number;
    unpaidBalance: number;
    ordersByType: {
        dineIn: number;
        takeAway: number;
        delivery: number;
        roomService: number;
        driveThru?: number;
        pickUp?: number;
    };
    ordersByTypeAmounts: {
        dineIn: number;
        takeAway: number;
        delivery: number;
        roomService: number;
        driveThru?: number;
        pickUp?: number;
    };
    paymentMethods: PaymentMethodDetail[];
    categorySales: CategorySales[];
    topMenuItems?: Array<{
        name: string;
        quantity: number;
        revenue: number;
        profit?: number;
    }>;
    hourlyBreakdown?: Array<{
        hour: string;
        orders: number;
        revenue: number;
    }>;
    staffPerformance?: Array<{
        waiterName: string;
        ordersHandled: number;
        totalRevenue: number;
    }>;
    userSalesSettlement: UserSalesSettlement[];
    generatedAt: string;
    generatedBy: string;
}

export interface HalfDaySalesPrintData {
    hotelName: string;
    hotelEmail?: string;
    hotelPhone?: string;
    periodType: string;
    reportDate: string;
    reportPeriod: string;
    totalOrders: number;
    totalRevenue: number;
    ordersByType: {
        dineIn: number;
        takeAway: number;
        delivery: number;
        roomService: number;
    };
    paymentMethods: {
        cash: number;
        card: number;
        transfer: number;
        pos: number;
    };
    periodComparison?: {
        previousPeriodRevenue: number;
        revenueChange: number;
        changePercentage: number;
    };
    topMenuItems?: Array<{
        name: string;
        quantity: number;
        revenue: number;
    }>;
    hourlyBreakdown?: Array<{
        hour: string;
        orders: number;
        revenue: number;
    }>;
    staffPerformance?: Array<{
        waiterName: string;
        ordersHandled: number;
        totalRevenue: number;
    }>;
    generatedAt: string;
    generatedBy: string;
}

export function formatReceipt(order: PrintOrderData): string {
    const lines = [];
    const width = 48; // 58mm thermal paper width

    lines.push(COMMANDS.INIT);

    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push(order.hotel?.toUpperCase() || 'RESTAURANT');
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);

    if (order.email) lines.push(order.email);
    if (order.phone) lines.push(order.phone);
    if (order.hotelId) lines.push(`ID: ${order.hotelId}`);

    lines.push('');

    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(`ORDER #: ${order.orderId || 'N/A'}`);
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(formatDateTime(order.orderDate));
    if (order.orderTime) lines.push(`Time: ${order.orderTime}`);

    if (order.room?.trim()) lines.push(`Room: ${order.room}`);
    if (order.table?.number) lines.push(`Table: ${order.table.number}`);
    if (order.paymentMethod) lines.push(`Payment: ${order.paymentMethod}`);

    if (order.waiter?.fullName) lines.push(`Waiter: ${order.waiter.fullName}`);
    if (order.preparedBy) lines.push(`Prepared by: ${order.preparedBy}`);
    const takenBy = order.takenBy || order.waiter?.fullName;
    if (takenBy) lines.push(`Taken by: ${takenBy}`);

    lines.push(createSeparator('=', width));

    // Header for items (48-char line — wider item column for thermal rolls)
    lines.push(COMMANDS.BOLD_ON);
    lines.push(padRight('Item', 24) + padLeft('Qty', 6) + padLeft('Price', 18));
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));

    for (const item of order.items) {
        const itemTotal = Number(item.quantity) * Number(item.price);

        if (item.name.length > 24) {
            lines.push(item.name);
            lines.push(
                padRight('', 24) +
                    padLeft(item.quantity.toString(), 6) +
                    padLeft(itemTotal.toFixed(2), 18),
            );
        } else {
            lines.push(
                padRight(item.name, 24) +
                    padLeft(item.quantity.toString(), 6) +
                    padLeft(itemTotal.toFixed(2), 18),
            );
        }

        if (item.specialInstructions) {
            lines.push(` * ${item.specialInstructions}`);
        }
    }

    lines.push(createSeparator('-', width));

    lines.push(formatSummaryLine('Bill Amount:', order.billAmount, width));

    if (+order.vat > 0 && !order.restaurantVatInclusive) {
        lines.push(formatSummaryLine('VAT:', Number(order.vat), width));
    }

    if (order.serviceCharge && +order.serviceCharge > 0 && !order.restaurantServiceChargeInclusive) {
        const serviceChargeLabel = order.serviceChargeRate
            ? `S.Chg(${Number(order.serviceChargeRate).toFixed(0)}%):`
            : 'S.Chg:';
        lines.push(
            formatSummaryLine(
                serviceChargeLabel,
                Number(order.serviceCharge),
                width,
            ),
        );
    }

    if (order.tip && +order.tip > 0 && !order.restaurantTipInclusive) {
        const tipLabel = order.tipRate
            ? `Tip (${Number(order.tipRate).toFixed(0)}%):`
            : 'Tip:';
        lines.push(formatSummaryLine(tipLabel, Number(order.tip), width));
    }

    if (+order.totalTax > 0) {
        lines.push(
            formatSummaryLine('Total Tax:', Number(order.totalTax), width),
        );
    }

    lines.push(createSeparator('=', width));

    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push(`TOTAL: N${order.total.toFixed(2)}`);
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);
    if (Number(order.complimentaryAmount ?? 0) > 0.009) {
        lines.push(
            formatSummaryLine(
                'Complimentary:',
                -Number(order.complimentaryAmount),
                width,
            ),
        );
        lines.push(
            formatSummaryLine(
                'AMOUNT DUE:',
                Number(order.amountDue ?? 0),
                width,
            ),
        );
    }
    lines.push('');

    lines.push('THANK YOU FOR YOUR ORDER!');
    lines.push('Please come again');
    lines.push(COMMANDS.ALIGN_LEFT);

    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

export function formatKOT(order: PrintOrderData): string {
    const lines = [];
    const width = 48; // 58mm thermal paper width

    lines.push(COMMANDS.INIT);

    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push('*** KITCHEN ORDER ***');
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);

    lines.push(order.hotel?.toUpperCase() || 'RESTAURANT');

    if (order.email) lines.push(order.email);
    if (order.phone) lines.push(order.phone);
    if (order.hotelId) lines.push(`ID: ${order.hotelId}`);

    lines.push(`Order: ${order.orderId || 'N/A'}`);
    lines.push(formatDateTime(order.orderDate));
    if (order.orderTime) lines.push(`Time: ${order.orderTime}`);

    if (order.room?.trim()) lines.push(`Room: ${order.room}`);
    if (order.table?.number) lines.push(`Table: ${order.table.number}`);

    if (order.waiter?.fullName) lines.push(`Waiter: ${order.waiter.fullName}`);
    if (order.preparedBy) lines.push(`Prepared: ${order.preparedBy}`);
    const kotTakenBy = order.takenBy || order.waiter?.fullName;
    if (kotTakenBy) lines.push(`Taken by: ${kotTakenBy}`);

    lines.push(createSeparator('=', width));

    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(padRight('ITEM', 24) + 'QTY');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));

    for (const item of order.items) {
        const itemName = truncateText(item.name, 24);
        const qtyStr = Number(item.quantity).toString();

        lines.push(padRight(itemName, 24) + qtyStr);

        if (item.specialInstructions?.trim()) {
            lines.push(`  * ${item.specialInstructions.trim()}`);
        }
    }

    lines.push(createSeparator('=', width));

    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push('PREPARE ORDER');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

export function formatBOT(order: PrintOrderData): string {
    const lines = [];
    const width = 48; // 58mm thermal paper width

    lines.push(COMMANDS.INIT);

    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push('*** BAR ORDER ***');
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);

    lines.push(order.hotel?.toUpperCase() || 'RESTAURANT');

    if (order.email) lines.push(order.email);
    if (order.phone) lines.push(order.phone);
    if (order.hotelId) lines.push(`ID: ${order.hotelId}`);

    lines.push(`Order: ${order.orderId || 'N/A'}`);
    lines.push(formatDateTime(order.orderDate));
    if (order.orderTime) lines.push(`Time: ${order.orderTime}`);

    if (order.room?.trim()) lines.push(`Room: ${order.room}`);
    if (order.table?.number) lines.push(`Table: ${order.table.number}`);

    if (order.waiter?.fullName) lines.push(`Waiter: ${order.waiter.fullName}`);
    if (order.preparedBy) lines.push(`Prepared: ${order.preparedBy}`);
    const botTakenBy = order.takenBy || order.waiter?.fullName;
    if (botTakenBy) lines.push(`Taken by: ${botTakenBy}`);

    lines.push(createSeparator('=', width));

    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(padRight('ITEM', 24) + 'QTY');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));

    for (const item of order.items) {
        const itemName = truncateText(item.name, 24);
        const qtyStr = Number(item.quantity).toString();

        lines.push(padRight(itemName, 24) + qtyStr);

        if (item.specialInstructions?.trim()) {
            lines.push(`  * ${item.specialInstructions.trim()}`);
        }
    }

    lines.push(createSeparator('=', width));

    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push('PREPARE ORDER');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

/**const handlePrint = useCallback(
        () => handlePrintOrder(order, hotel ?? undefined),
        [order, hotel],
    ); */

export function formatDailySalesReport(report: DailySalesPrintData): string {
    const lines = [];
    const width = 48; // 58mm thermal paper width

    // Initialize printer
    lines.push(COMMANDS.INIT);

    // ========== HEADER SECTION (CENTERED) ==========
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push(report.hotelName.toUpperCase());
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);

    if (report.hotelEmail) {
        lines.push(report.hotelEmail);
    }
    if (report.hotelPhone) {
        lines.push(report.hotelPhone);
    }
    lines.push('');

    lines.push(COMMANDS.BOLD_ON);
    lines.push('DAILY SALES REPORT');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push('');
    lines.push(`Date: ${report.reportDate}`);
    lines.push(`Period: ${report.reportPeriod}`);
    lines.push('');
    lines.push(createSeparator('=', width));
    lines.push('');

    // ========== SALES SUMMARY SECTION (LEFT-ALIGNED) ==========
    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push('SALES SUMMARY');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));

    lines.push(formatSummaryLine('Total Orders:', report.totalOrders, width));
    lines.push(
        formatSummaryLine(
            'Total Revenue:',
            formatCurrency(report.totalRevenue),
            width,
        ),
    );
    lines.push('');

    // ========== ORDER TYPES SECTION ==========
    lines.push(COMMANDS.BOLD_ON);
    lines.push('ORDER TYPES');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));
    lines.push(
        formatSummaryLine('Dine-In:', report.ordersByType.dineIn, width),
    );
    lines.push(
        formatSummaryLine('Takeaway:', report.ordersByType.takeAway, width),
    );
    lines.push(
        formatSummaryLine('Delivery:', report.ordersByType.delivery, width),
    );
    lines.push(
        formatSummaryLine(
            'Room Service:',
            report.ordersByType.roomService,
            width,
        ),
    );
    lines.push('');

    // ========== PAYMENT METHODS SECTION ==========
    lines.push(COMMANDS.BOLD_ON);
    lines.push('PAYMENT METHODS');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));

    if (report.paymentMethods && report.paymentMethods.length > 0) {
        for (const payment of report.paymentMethods) {
            lines.push(
                formatSummaryLine(
                    `${payment.method}:`,
                    formatCurrency(payment.amount),
                    width,
                ),
            );
            lines.push(
                `  ${payment.percentage.toFixed(2)}% (${payment.count} orders)`,
            );
        }
    }
    lines.push('');

    // ========== MENU SALES BY PRODUCT DETAIL ==========
    if (report.topMenuItems?.length) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('MENU SALES BY PRODUCT DETAIL');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('=', width));

        // Column headers
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            padRight('Item', 16) + padLeft('Qty', 5) + padLeft('Value', 11),
        );
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('-', width));

        // Menu items
        for (const item of report.topMenuItems) {
            const name = truncateText(item.name, 16);
            const qty = item.quantity.toString();
            const val = formatCurrency(item.revenue);

            lines.push(padRight(name, 16) + padLeft(qty, 5) + padLeft(val, 11));
        }

        lines.push(createSeparator('=', width));
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            formatSummaryLine(
                'Total:',
                formatCurrency(report.totalRevenue),
                width,
            ),
        );
        lines.push(COMMANDS.BOLD_OFF);
        lines.push('');
    }

    // ========== HOURLY SALES BREAKDOWN ==========
    if (report.hourlyBreakdown?.length) {
        const activeHours = report.hourlyBreakdown.filter(
            (h) => h.orders > 0 || h.revenue > 0,
        );

        if (activeHours.length > 0) {
            lines.push(COMMANDS.BOLD_ON);
            lines.push('HOURLY SALES BREAKDOWN');
            lines.push(COMMANDS.BOLD_OFF);
            lines.push(createSeparator('-', width));

            for (const h of activeHours) {
                const hourLine =
                    padRight(h.hour, 8) +
                    padRight(`${h.orders} ord`, 10) +
                    padLeft(formatCurrency(h.revenue), 14);
                lines.push(hourLine);
            }
            lines.push('');
        }
    }

    // ========== STAFF PERFORMANCE ==========
    if (report.staffPerformance?.length) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('STAFF PERFORMANCE');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('-', width));

        for (const staff of report.staffPerformance) {
            lines.push(COMMANDS.BOLD_ON);
            lines.push(truncateText(staff.waiterName, width));
            lines.push(COMMANDS.BOLD_OFF);
            lines.push(
                formatSummaryLine('  Orders:', staff.ordersHandled, width),
            );
            lines.push(
                formatSummaryLine(
                    '  Revenue:',
                    formatCurrency(staff.totalRevenue),
                    width,
                ),
            );
            lines.push('');
        }
    }

    // ========== FOOTER ==========
    lines.push(createSeparator('=', width));
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push('');
    lines.push(`Generated: ${formatDateTime(report.generatedAt)}`);
    lines.push(`By: ${report.generatedBy}`);
    lines.push('');
    lines.push(createSeparator('=', width));

    // Feed and cut
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

// Helper for currency formatting if not already present
function formatCurrency(amount: number | string): string {
    const num = Number(amount);
    return isNaN(num) ? 'N0.00' : `N${num.toFixed(2)}`;
}

export function formatDailySalesReportForBrowser(
    report: DailySalesPrintData,
): string {
    const formatCurrency = (value: number | undefined) => {
        const num = Number(value || 0);
        return isNaN(num) ? 'N0.00' : `N${num.toFixed(2)}`;
    };

    const activeHours = report.hourlyBreakdown?.filter(
        (h) =>
            (h.orders && h.orders > 0) || (h.revenue && Number(h.revenue) > 0),
    );

    const html = `
    <html>
    <head>
        <title>Daily Sales Report - ${report.hotelName}</title>
        <style>
            /* Modern typography and layout */
            :root {
                --text-color: #333;
                --light-gray: #f5f5f5;
                --medium-gray: #e0e0e0;
                --dark-gray: #777;
            }
            
            body {
                font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: var(--text-color);
                line-height: 1.5;
            }
            
            .report {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.05);
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid var(--medium-gray);
            }
            
            .hotel-name {
                font-weight: 700;
                font-size: 28px;
                margin-bottom: 5px;
                letter-spacing: 0.5px;
            }
            
            .report-title {
                font-size: 20px;
                font-weight: 600;
                margin: 15px 0;
                color: var(--text-color);
            }
            
            .report-meta {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 10px;
                font-size: 15px;
                color: var(--dark-gray);
            }
            
            .section {
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            
            .section-title {
                font-weight: 600;
                font-size: 17px;
                margin-bottom: 12px;
                padding-bottom: 5px;
                border-bottom: 1px solid var(--medium-gray);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .separator {
                border-top: 1px dashed var(--medium-gray);
                margin: 25px 0;
            }
            
            .footer {
                margin-top: 30px;
                font-size: 13px;
                color: var(--dark-gray);
                text-align: center;
            }
            
            .grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .card {
                background: var(--light-gray);
                padding: 15px;
                border-radius: 4px;
            }
            
            .card-title {
                font-weight: 600;
                margin-bottom: 10px;
                font-size: 15px;
            }
            
            .row {
                display: flex;
                margin-bottom: 8px;
            }
            
            .label {
                font-weight: 500;
                width: 120px;
                flex-shrink: 0;
            }
            
            .value {
                flex: 1;
                text-align: right;
            }
            
            .highlight {
                font-weight: 600;
            }
            
            .staff-item, .menu-item {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid var(--medium-gray);
            }
            
            .staff-item:last-child, .menu-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .hourly-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .hour-card {
                background: var(--light-gray);
                padding: 10px;
                border-radius: 4px;
                text-align: center;
            }
            
            .hour-time {
                font-weight: 500;
                margin-bottom: 5px;
            }
            
            .hour-stats {
                font-size: 14px;
            }
            
            @media print {
                body {
                    padding: 0;
                    background: white;
                }
                
                .report {
                    box-shadow: none;
                    padding: 15px;
                }
                
                .no-print {
                    display: none;
                }
            }
            
            .print-btn {
                display: block;
                width: 200px;
                margin: 30px auto 0;
                padding: 10px 15px;
                background: #333;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                text-align: center;
                transition: background 0.2s;
            }
            
            .print-btn:hover {
                background: #555;
            }
        </style>
    </head>
    <body>
        <div class="report">
            <div class="header">
                <div class="hotel-name">${report.hotelName.toUpperCase()}</div>
                ${report.hotelEmail ? `<div style="font-size: 14px; color: var(--dark-gray); margin-top: 5px;">${report.hotelEmail}</div>` : ''}
                ${report.hotelPhone ? `<div style="font-size: 14px; color: var(--dark-gray);">${report.hotelPhone}</div>` : ''}
                <div class="report-title">DAILY SALES REPORT</div>
                <div class="report-meta">
                    <span>Date: ${report.reportDate}</span>
                    <span>Period: ${report.reportPeriod}</span>
                </div>
            </div>
            
            <!-- Order Summary -->
            <div class="section">
                <div class="section-title">Sales Overview</div>
                <div class="grid-container">
                    <div class="card">
                        <div class="card-title">Total Orders</div>
                        <div class="highlight" style="font-size: 24px;">${report.totalOrders}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">Total Revenue</div>
                        <div class="highlight" style="font-size: 24px;">${formatCurrency(report.totalRevenue)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Orders by Type -->
            <div class="section">
                <div class="section-title">Order Types</div>
                <div class="grid-container">
                    <div class="card">
                        <div class="row">
                            <div class="label">Dine-In:</div>
                            <div class="value">${report.ordersByType.dineIn}</div>
                        </div>
                        <div class="row">
                            <div class="label">Takeaway:</div>
                            <div class="value">${report.ordersByType.takeAway}</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row">
                            <div class="label">Delivery:</div>
                            <div class="value">${report.ordersByType.delivery}</div>
                        </div>
                        <div class="row">
                            <div class="label">Room Service:</div>
                            <div class="value">${report.ordersByType.roomService}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Payment Methods -->
            <div class="section">
                <div class="section-title">Payment Methods</div>
                ${
                    report.paymentMethods && report.paymentMethods.length > 0
                        ? `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--light-gray); border-bottom: 1px solid var(--medium-gray);">
                            <th style="padding: 10px; text-align: left;">Method</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                            <th style="padding: 10px; text-align: right;">%</th>
                            <th style="padding: 10px; text-align: right;">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.paymentMethods
                            .map(
                                (payment) => `
                        <tr style="border-bottom: 1px solid var(--medium-gray);">
                            <td style="padding: 10px;">${payment.method}</td>
                            <td style="padding: 10px; text-align: right; font-weight: 500;">${formatCurrency(payment.amount)}</td>
                            <td style="padding: 10px; text-align: right;">${payment.percentage.toFixed(2)}%</td>
                            <td style="padding: 10px; text-align: right;">${payment.count}</td>
                        </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>
                `
                        : '<p>No payment data available</p>'
                }
            </div>
            
            <!-- Top Menu Items -->
            ${
                report.topMenuItems?.length
                    ? `
            <div class="section">
                <div class="section-title">Top Selling Items</div>
                <div class="grid-container">
                    ${report.topMenuItems
                        .map(
                            (item) => `
                    <div class="card menu-item">
                        <div style="font-weight: 500; margin-bottom: 8px;">${item.name}</div>
                        <div class="row">
                            <div class="label">Quantity:</div>
                            <div class="value">${item.quantity}</div>
                        </div>
                        <div class="row">
                            <div class="label">Revenue:</div>
                            <div class="value">${formatCurrency(item.revenue)}</div>
                        </div>
                    </div>
                    `,
                        )
                        .join('')}
                </div>
            </div>
            `
                    : ''
            }
            
            <!-- Hourly Breakdown (only if we have active hours) -->
            ${
                activeHours?.length
                    ? `
            <div class="section">
                <div class="section-title">Peak Hours</div>
                <div class="hourly-grid">
                    ${activeHours
                        .map(
                            (h) => `
                    <div class="hour-card">
                        <div class="hour-time">${h.hour}</div>
                        <div class="hour-stats">
                            ${h.orders} orders<br>
                            ${formatCurrency(h.revenue)}
                        </div>
                    </div>
                    `,
                        )
                        .join('')}
                </div>
            </div>
            `
                    : ''
            }
            
            <!-- Staff Performance -->
            ${
                report.staffPerformance?.length
                    ? `
            <div class="section">
                <div class="section-title">Staff Performance</div>
                <div class="grid-container">
                    ${report.staffPerformance
                        .map(
                            (staff) => `
                    <div class="card staff-item">
                        <div style="font-weight: 500; margin-bottom: 8px;">${staff.waiterName}</div>
                        <div class="row">
                            <div class="label">Orders:</div>
                            <div class="value">${staff.ordersHandled}</div>
                        </div>
                        <div class="row">
                            <div class="label">Revenue:</div>
                            <div class="value">${formatCurrency(staff.totalRevenue)}</div>
                        </div>
                    </div>
                    `,
                        )
                        .join('')}
                </div>
            </div>
            `
                    : ''
            }
            
            <div class="separator"></div>
            <div class="footer">
                <div>Report generated at ${report.generatedAt}</div>
                <div>Prepared by ${report.generatedBy}</div>
            </div>
            
            <button class="print-btn no-print" onclick="window.print()">
                Print Report
            </button>
        </div>
    </body>
    </html>
    `;

    return html;
}

export function formatHalfDaySalesReport(
    report: HalfDaySalesPrintData,
): string {
    const lines = [];
    const width = 48; // 58mm thermal paper width

    // Initialize printer
    lines.push(COMMANDS.INIT);

    // ========== HEADER SECTION (CENTERED) ==========
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push(report.hotelName.toUpperCase());
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);

    if (report.hotelEmail) {
        lines.push(report.hotelEmail);
    }
    if (report.hotelPhone) {
        lines.push(report.hotelPhone);
    }
    lines.push('');

    lines.push(COMMANDS.BOLD_ON);
    lines.push(`${report.periodType} SALES REPORT`);
    lines.push(COMMANDS.BOLD_OFF);
    lines.push('');
    lines.push(`Date: ${report.reportDate}`);
    lines.push(`Period: ${report.reportPeriod}`);
    lines.push('');
    lines.push(createSeparator('=', width));
    lines.push('');

    // ========== SALES SUMMARY SECTION (LEFT-ALIGNED) ==========
    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push('SALES SUMMARY');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));

    lines.push(formatSummaryLine('Total Orders:', report.totalOrders, width));
    lines.push(
        formatSummaryLine(
            'Total Revenue:',
            formatCurrency(report.totalRevenue),
            width,
        ),
    );
    lines.push('');

    // ========== PERIOD COMPARISON (if available) ==========
    if (report.periodComparison) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('PERIOD COMPARISON');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('-', width));
        lines.push(
            formatSummaryLine(
                'Previous Period:',
                formatCurrency(report.periodComparison.previousPeriodRevenue),
                width,
            ),
        );
        lines.push(
            formatSummaryLine(
                'Change:',
                formatCurrency(report.periodComparison.revenueChange),
                width,
            ),
        );
        lines.push(
            formatSummaryLine(
                'Percentage:',
                `${report.periodComparison.changePercentage.toFixed(2)}%`,
                width,
            ),
        );
        lines.push('');
    }

    // ========== ORDER TYPES SECTION ==========
    lines.push(COMMANDS.BOLD_ON);
    lines.push('ORDER TYPES');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));
    lines.push(
        formatSummaryLine('Dine-In:', report.ordersByType.dineIn, width),
    );
    lines.push(
        formatSummaryLine('Takeaway:', report.ordersByType.takeAway, width),
    );
    lines.push(
        formatSummaryLine('Delivery:', report.ordersByType.delivery, width),
    );
    lines.push(
        formatSummaryLine(
            'Room Service:',
            report.ordersByType.roomService,
            width,
        ),
    );
    lines.push('');

    // ========== PAYMENT METHODS SECTION ==========
    lines.push(COMMANDS.BOLD_ON);
    lines.push('PAYMENT METHODS');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(createSeparator('-', width));
    lines.push(
        formatSummaryLine(
            'Cash:',
            formatCurrency(report.paymentMethods.cash),
            width,
        ),
    );
    lines.push(
        formatSummaryLine(
            'Card:',
            formatCurrency(report.paymentMethods.card),
            width,
        ),
    );
    lines.push(
        formatSummaryLine(
            'Transfer:',
            formatCurrency(report.paymentMethods.transfer),
            width,
        ),
    );
    lines.push(
        formatSummaryLine(
            'POS:',
            formatCurrency(report.paymentMethods.pos),
            width,
        ),
    );
    lines.push('');

    // ========== MENU SALES BY PRODUCT DETAIL ==========
    if (report.topMenuItems?.length) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('MENU SALES BY PRODUCT DETAIL');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('=', width));

        // Column headers
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            padRight('Item', 16) + padLeft('Qty', 5) + padLeft('Value', 11),
        );
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('-', width));

        // Menu items
        for (const item of report.topMenuItems) {
            const name = truncateText(item.name, 16);
            const qty = item.quantity.toString();
            const val = formatCurrency(item.revenue);

            lines.push(padRight(name, 16) + padLeft(qty, 5) + padLeft(val, 11));
        }

        lines.push(createSeparator('=', width));
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            formatSummaryLine(
                'Total:',
                formatCurrency(report.totalRevenue),
                width,
            ),
        );
        lines.push(COMMANDS.BOLD_OFF);
        lines.push('');
    }

    // ========== HOURLY SALES BREAKDOWN ==========
    if (report.hourlyBreakdown?.length) {
        const activeHours = report.hourlyBreakdown.filter(
            (h) => h.orders > 0 || h.revenue > 0,
        );

        if (activeHours.length > 0) {
            lines.push(COMMANDS.BOLD_ON);
            lines.push('HOURLY SALES BREAKDOWN');
            lines.push(COMMANDS.BOLD_OFF);
            lines.push(createSeparator('-', width));

            for (const h of activeHours) {
                const hourLine =
                    padRight(h.hour, 8) +
                    padRight(`${h.orders} ord`, 10) +
                    padLeft(formatCurrency(h.revenue), 14);
                lines.push(hourLine);
            }
            lines.push('');
        }
    }

    // ========== STAFF PERFORMANCE ==========
    if (report.staffPerformance?.length) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('STAFF PERFORMANCE');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(createSeparator('-', width));

        for (const staff of report.staffPerformance) {
            lines.push(COMMANDS.BOLD_ON);
            lines.push(truncateText(staff.waiterName, width));
            lines.push(COMMANDS.BOLD_OFF);
            lines.push(
                formatSummaryLine('  Orders:', staff.ordersHandled, width),
            );
            lines.push(
                formatSummaryLine(
                    '  Revenue:',
                    formatCurrency(staff.totalRevenue),
                    width,
                ),
            );
            lines.push('');
        }
    }

    // ========== FOOTER ==========
    lines.push(createSeparator('=', width));
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push('');
    lines.push(`Generated: ${formatDateTime(report.generatedAt)}`);
    lines.push(`By: ${report.generatedBy}`);
    lines.push('');
    lines.push(createSeparator('=', width));

    // Feed and cut
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

/** Format Work Period Report for thermal printer (ESC/POS). Matches on-screen order, reduced spacing. */
export function formatWorkPeriodReport(report: WorkPeriodReportData): string {
    const lines: string[] = [];
    const width = 48;
    const fmt = (n: number) =>
        Number.isNaN(n)
            ? '0.00'
            : n.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    const sep = () => lines.push(createSeparator('-', width));

    lines.push(COMMANDS.INIT);
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push((report.businessName || '').toUpperCase());
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);
    if (report.location) lines.push(report.location.toUpperCase());
    lines.push(COMMANDS.BOLD_ON);
    lines.push('WORK PERIOD REPORT');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(report.periodStart);
    lines.push(report.periodEnd);
    sep();

    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push('Sales');
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    lines.push(formatSummaryLine('Ticket', fmt(report.ticketSales), width));
    lines.push(formatSummaryLine('GRAND TOTAL', fmt(report.grandTotal), width));
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Payments');
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    for (const p of report.payments) {
        lines.push(
            formatSummaryLine(
                `${p.method} ${p.percent.toFixed(2)}%`,
                fmt(p.amount),
                width,
            ),
        );
    }
    lines.push(formatSummaryLine('Total', fmt(report.totalPayments), width));
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Ticket Details');
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    lines.push('Ticket Counts');
    for (const r of report.ticketCounts) {
        const val =
            r.amount > 0
                ? `${r.count} ..... ${fmt(r.amount)}`
                : String(r.count);
        lines.push(padRight(r.label, width - val.length - 1) + ' ' + val);
    }
    const ticketTotal = report.ticketCounts.reduce((a, r) => a + r.count, 0);
    const ticketAmount = report.ticketCounts.reduce((a, r) => a + r.amount, 0);
    lines.push(
        formatSummaryLine(
            'Total',
            `${ticketTotal} ..... ${fmt(ticketAmount)}`,
            width,
        ),
    );
    lines.push(
        formatSummaryLine(
            'Amount per Ticket',
            fmt(report.amountPerTicket),
            width,
        ),
    );
    lines.push('Order Counts');
    for (const r of report.orderCounts) {
        const val =
            r.amount > 0
                ? `${r.count} ..... ${fmt(r.amount)}`
                : String(r.count);
        lines.push(padRight(r.label, width - val.length - 1) + ' ' + val);
    }
    const orderTotal = report.orderCounts.reduce((a, r) => a + r.count, 0);
    const orderAmount = report.orderCounts.reduce((a, r) => a + r.amount, 0);
    lines.push(
        formatSummaryLine(
            'Total',
            `${orderTotal} ..... ${fmt(orderAmount)}`,
            width,
        ),
    );
    lines.push(
        formatSummaryLine(
            'Orders per Ticket',
            report.ordersPerTicket.toFixed(2),
            width,
        ),
    );
    lines.push(
        formatSummaryLine(
            'Amount per Order',
            fmt(report.amountPerOrder),
            width,
        ),
    );
    lines.push('Ticket Counts per State');
    for (const r of report.ticketCountsByState || []) {
        const val = `${r.count} ..... ${fmt(r.amount)}`;
        lines.push(padRight(r.state, width - val.length - 1) + ' ' + val);
    }
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Payment Details');
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    for (const p of report.paymentDetails) {
        lines.push(
            formatSummaryLine(
                `${p.method} ${p.percent.toFixed(2)}%`,
                fmt(p.amount),
                width,
            ),
        );
    }
    lines.push(formatSummaryLine('7.5% VAT', fmt(report.vatAmount), width));
    if (report.deliveryVatAmount != null && report.deliveryVatAmount > 0) {
        lines.push('Delivery Ticket');
        lines.push(
            formatSummaryLine('7.5% VAT', fmt(report.deliveryVatAmount), width),
        );
    }
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('User Sales');
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    for (const u of report.userSales) {
        lines.push(formatSummaryLine(u.userName, fmt(u.amount), width));
    }
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push(`Settled by ${report.settledByUser.userName}`);
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    for (const p of report.settledByUser.payments) {
        lines.push(
            formatSummaryLine(
                `${p.method} ${p.percent.toFixed(2)}%`,
                fmt(p.amount),
                width,
            ),
        );
    }
    lines.push(
        formatSummaryLine(
            'Total Income',
            fmt(report.settledByUser.totalIncome),
            width,
        ),
    );
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Item Sales');
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    for (const i of report.itemSales) {
        lines.push(
            formatSummaryLine(
                `${i.category} ${i.percent.toFixed(2)}%`,
                fmt(i.amount),
                width,
            ),
        );
    }
    lines.push(formatSummaryLine('Total', fmt(report.totalItemSales), width));

    lines.push(createSeparator('=', width));
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

/** Format Menu Item List Sales for thermal printer. Matches on-screen order (Item, Qty, %, Amount), reduced spacing. */
export function formatMenuItemListSalesReport(
    report: MenuItemListSalesReportData,
): string {
    const lines: string[] = [];
    const width = 48;
    const fmt = (n: number) =>
        Number.isNaN(n)
            ? '0.00'
            : n.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });
    const sep = () => lines.push(createSeparator('-', width));

    lines.push(COMMANDS.INIT);
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push((report.businessName || '').toUpperCase());
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);
    if (report.location) lines.push(report.location.toUpperCase());
    lines.push(COMMANDS.BOLD_ON);
    lines.push('MENU ITEM LIST SALES');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(report.periodStart);
    lines.push(report.periodEnd);
    sep();

    lines.push(COMMANDS.ALIGN_LEFT);
    for (const cat of report.categories) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push(cat.categoryName);
        lines.push(COMMANDS.BOLD_OFF);
        sep();
        for (const item of cat.items) {
            const namePart = truncateText(item.itemName, 20);
            const qtyStr = String(item.quantity);
            const pctStr = `${item.percent.toFixed(2)}%`;
            const amtStr = fmt(item.amount);
            const row =
                padRight(namePart, 20) +
                padRight(qtyStr, 5) +
                padRight(pctStr, 8) +
                amtStr;
            lines.push(row);
        }
        lines.push(
            formatSummaryLine(
                `TOTAL (${cat.totalQuantity})`,
                fmt(cat.totalAmount),
                width,
            ),
        );
        sep();
    }

    lines.push(createSeparator('=', width));
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

export function formatCashierSalesReport(
    report: CashierSalesReportData,
    header: CashierSalesHeaderInfo,
    options: {
        showVoidedReceipts?: boolean;
        showDetailedReceiptList?: boolean;
        showMenuItemBreakdown?: boolean;
    } = {},
): string {
    const lines: string[] = [];
    const width = 48;
    const CAT_METRIC_W = 24;
    const CAT_QTY_W = 6;
    const CAT_VAL_W = 18;
    const MENU_NAME_W = 18;
    const MENU_QTY_W = 5;
    const MENU_AMT_W = 12;
    const VOID_RCPT_W = 11;
    const VOID_STAFF_W = 11;
    const VOID_REASON_W = width - VOID_RCPT_W - VOID_STAFF_W;
    const DET_GUEST_W = 14;
    const DET_RCPT_W = 10;
    const DET_AMT_W = 12;
    const DET_PAY_W = width - DET_GUEST_W - DET_RCPT_W - DET_AMT_W;

    const fmt = (n: number) =>
        Number.isNaN(n)
            ? 'N0.00'
            : `N${n.toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })}`;
    const sep = () => lines.push(createSeparator('-', width));
    const sectionHeaderRow = (left: string, right: string) => {
        lines.push(COMMANDS.BOLD_ON);
        lines.push(formatSummaryLine(left, right, width));
        lines.push(COMMANDS.BOLD_OFF);
    };

    lines.push(COMMANDS.INIT);
    lines.push(COMMANDS.ALIGN_CENTER);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(COMMANDS.DOUBLE_HEIGHT);
    lines.push('CASHIER SALES REPORT');
    lines.push(COMMANDS.NORMAL_SIZE);
    lines.push(COMMANDS.BOLD_OFF);
    if (header.cashier) lines.push(`Cashier: ${header.cashier}`);
    if (header.reportPeriodStart && header.reportPeriodEnd) {
        lines.push(`${header.reportPeriodStart} - ${header.reportPeriodEnd}`);
    }
    if (header.outlet) lines.push(`Dine Area: ${header.outlet}`);
    if (header.orderType) lines.push(`Order: ${header.orderType}`);
    if (header.menuType) lines.push(`Menu: ${header.menuType}`);
    if (header.printedBy) lines.push(`By: ${header.printedBy}`);
    sep();

    lines.push(COMMANDS.ALIGN_LEFT);
    lines.push(COMMANDS.BOLD_ON);
    lines.push('Receipt Summary');
    lines.push(COMMANDS.BOLD_OFF);
    sectionHeaderRow('Metric', 'Value');
    sep();
    for (const r of report.receiptSummary) {
        const val =
            typeof r.value === 'number' ||
            (typeof r.value === 'string' &&
                /^[\dN]/.test(r.value))
                ? fmt(Number(r.value))
                : String(r.value);
        lines.push(formatSummaryLine(r.metric, val, width));
    }
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Sales Summary');
    lines.push(COMMANDS.BOLD_OFF);
    sectionHeaderRow('Description', 'Amount');
    sep();
    for (const s of report.salesSummary) {
        lines.push(formatSummaryLine(s.description, fmt(s.amount), width));
    }
    lines.push(formatSummaryLine('Net Sales', fmt(report.netSales), width));
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Category Summary');
    lines.push(COMMANDS.BOLD_OFF);
    lines.push(COMMANDS.BOLD_ON);
    lines.push(
        padRight('Metric', CAT_METRIC_W) +
            padLeft('Qty', CAT_QTY_W) +
            padLeft('Value', CAT_VAL_W),
    );
    lines.push(COMMANDS.BOLD_OFF);
    sep();
    for (const c of report.categorySummary) {
        lines.push(
            padRight(truncateText(c.metric, CAT_METRIC_W), CAT_METRIC_W) +
                padLeft(String(c.qty), CAT_QTY_W) +
                padLeft(fmt(c.value), CAT_VAL_W),
        );
    }
    sep();

    lines.push(COMMANDS.BOLD_ON);
    lines.push('Payment Summary');
    lines.push(COMMANDS.BOLD_OFF);
    sectionHeaderRow('Payment (count)', 'Value');
    sep();
    for (const p of report.paymentSummary) {
        lines.push(
            formatSummaryLine(
                `${p.paymentType} (${p.count})`,
                fmt(p.value),
                width,
            ),
        );
    }
    lines.push(
        formatSummaryLine(
            'Payment Balance',
            fmt(report.paymentBalance),
            width,
        ),
    );
    sep();

    if (
        options.showDetailedReceiptList &&
        report.detailedReceiptList.length > 0
    ) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('Detailed Receipt List');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            padRight('Guest', DET_GUEST_W) +
                padRight('Rcpt', DET_RCPT_W) +
                padLeft('Amount', DET_AMT_W) +
                padLeft('Pay', DET_PAY_W),
        );
        lines.push(COMMANDS.BOLD_OFF);
        sep();
        for (const d of report.detailedReceiptList.slice(0, 12)) {
            lines.push(
                padRight(truncateText(d.guestName, DET_GUEST_W), DET_GUEST_W) +
                    padRight(
                        truncateText(d.receiptNo, DET_RCPT_W),
                        DET_RCPT_W,
                    ) +
                    padLeft(fmt(d.amount), DET_AMT_W) +
                    padLeft(
                        truncateText(d.payment, DET_PAY_W),
                        DET_PAY_W,
                    ),
            );
        }
        if (report.detailedReceiptList.length > 12) {
            lines.push(
                `... +${report.detailedReceiptList.length - 12} more receipts`,
            );
        }
        sep();
    }

    if (options.showVoidedReceipts && report.voidedReceipts.length > 0) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('Voided Receipts');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            padRight('Receipt', VOID_RCPT_W) +
                padRight('Staff', VOID_STAFF_W) +
                padRight('Reason', VOID_REASON_W),
        );
        lines.push(COMMANDS.BOLD_OFF);
        sep();
        for (const v of report.voidedReceipts.slice(0, 10)) {
            lines.push(
                padRight(truncateText(v.receiptNo, VOID_RCPT_W), VOID_RCPT_W) +
                    padRight(truncateText(v.staff, VOID_STAFF_W), VOID_STAFF_W) +
                    truncateText(v.reason, VOID_REASON_W),
            );
        }
        if (report.voidedReceipts.length > 10) {
            lines.push(`... +${report.voidedReceipts.length - 10} more`);
        }
        sep();
    }

    if (
        options.showMenuItemBreakdown &&
        report.menuItemBreakdown.length > 0
    ) {
        lines.push(COMMANDS.BOLD_ON);
        lines.push('Menu Item Breakdown');
        lines.push(COMMANDS.BOLD_OFF);
        lines.push(COMMANDS.BOLD_ON);
        lines.push(
            padRight('Item', MENU_NAME_W) +
                padLeft('Qty', MENU_QTY_W) +
                padLeft('Amount', MENU_AMT_W),
        );
        lines.push(COMMANDS.BOLD_OFF);
        sep();
        for (const m of report.menuItemBreakdown.slice(0, 15)) {
            const name = truncateText(m.itemName, MENU_NAME_W);
            lines.push(
                padRight(name, MENU_NAME_W) +
                    padLeft(String(m.qtySold), MENU_QTY_W) +
                    padLeft(fmt(m.amount), MENU_AMT_W),
            );
        }
        if (report.menuItemBreakdown.length > 15) {
            lines.push(`... +${report.menuItemBreakdown.length - 15} more`);
        }
        sep();
    }

    lines.push(createSeparator('=', width));
    if (header.printedAt) lines.push(header.printedAt);
    lines.push(COMMANDS.FEED_LINES + String.fromCharCode(3));
    lines.push(COMMANDS.CUT_PAPER);

    return lines.join('\n');
}

// Helper functions

function padRight(str: string, len: number): string {
    return str + ' '.repeat(Math.max(0, len - str.length));
}

function padLeft(str: string, len: number): string {
    return ' '.repeat(Math.max(0, len - str.length)) + str;
}

function truncateText(str: string, len: number): string {
    if (str.length <= len) return str;
    return str.substring(0, len - 3) + '...';
}

function createSeparator(char: string, width: number): string {
    return char.repeat(width);
}

function formatSummaryLine(
    label: string,
    value: number | string,
    width: number,
): string {
    let valStr: string;

    if (typeof value === 'string') {
        // Already formatted (e.g., "N1234.56")
        valStr = value;
    } else {
        // Raw number - format it
        valStr = value.toString();
    }

    const labelWidth = width - valStr.length - 1; // -1 for space
    return padRight(label, labelWidth) + ' ' + valStr;
}

function formatDateTime(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return d.toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

export function formatForQZTray(
    order: PrintOrderData,
    type: 'receipt' | 'kot' | 'bot' = 'receipt',
): any {
    let receiptData;

    switch (type) {
        case 'kot':
            receiptData = formatKOT(order);
            break;
        case 'bot':
            receiptData = formatBOT(order);
            break;
        default:
            receiptData = formatReceipt(order);
            break;
    }

    return {
        type: 'raw',
        format: 'plain',
        data: receiptData,
        options: {
            language: 'ESCPOS',
            charset: 'UTF-8',
        },
    };
}

export function formatForQZTraySalesReport(
    report: DailySalesPrintData | HalfDaySalesPrintData,
    type: 'full' | 'half' = 'full',
): any {
    const receiptData =
        type === 'full'
            ? formatDailySalesReport(report as DailySalesPrintData)
            : formatHalfDaySalesReport(report as HalfDaySalesPrintData);

    return {
        type: 'raw',
        format: 'command',
        flavor: 'plain',
        data: receiptData,
        options: {
            language: 'ESCPOS',
            charset: 'UTF-8',
        },
    };
}

export function isNativeEnvironment(): boolean {
    return (
        !!(window as any).electronAPI ||
        !!(window as any).__TAURI__ ||
        navigator.userAgent.includes('Electron')
    );
}

// export async function printOrder(
//     order: PrintOrderData,
//     type: 'receipt' | 'kot' | 'bot' = 'receipt',
//     printerName?: string,
//     forceMethod?: 'qz' | 'ip',
// ): Promise<{ success: boolean; message: string }> {
//     if (forceMethod === 'ip') {
//         return await printToIP(order, type);
//     }

//     return await printWithQZTray(order, type, printerName);
// }

// export async function printToIP(
//     order: PrintOrderData,
//     type: 'receipt' | 'kot' | 'bot' = 'receipt',
// ): Promise<{ success: boolean; message: string }> {
//     try {
//         let printData: string;

//         switch (type) {
//             case 'receipt':
//                 printData = formatReceipt(order);
//                 break;
//             case 'kot':
//                 printData = formatKOT(order);
//                 break;
//             case 'bot':
//                 printData = formatBOT(order);
//                 break;
//             default:
//                 printData = formatReceipt(order);
//         }

//         const response = await fetch('/api/print/ip', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${localStorage.getItem('authToken')}`,
//             },
//             body: JSON.stringify({
//                 data: printData,
//                 type: type,
//             }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//             return { success: true, message: 'Print job sent successfully' };
//         } else {
//             return {
//                 success: false,
//                 message: result.message || 'Print failed',
//             };
//         }
//     } catch (error: any) {
//         return { success: false, message: `Print error: ${error.message}` };
//     }
// }

export async function printWithQZTray(
    order: PrintOrderData,
    type: 'receipt' | 'kot' | 'bot' = 'receipt',
    printerName?: string,
): Promise<{ success: boolean; message: string }> {
    try {
        if (typeof (window as any).qz === 'undefined') {
            return { success: false, message: 'QZ Tray not available' };
        }

        const qz = (window as any).qz;
        const config = qz.configs.create(printerName || 'XPrinter');
        const data = formatForQZTray(order, type);

        await qz.print(config, data);
        return { success: true, message: 'Printed via QZ Tray' };
    } catch (error: any) {
        return { success: false, message: `QZ Tray error: ${error.message}` };
    }
}

export async function printSalesReport(
    report: DailySalesPrintData | HalfDaySalesPrintData,
    type: 'full' | 'half' = 'full',
    forceMethod?: 'qz' | 'ip',
): Promise<{ success: boolean; message: string }> {
    const useIPPrinting =
        forceMethod === 'ip' || (forceMethod !== 'qz' && isNativeEnvironment());

    if (useIPPrinting) {
        const printData =
            type === 'full'
                ? formatDailySalesReport(report as DailySalesPrintData)
                : formatHalfDaySalesReport(report as HalfDaySalesPrintData);

        return await printReportToIP(printData);
    } else {
        return await printReportWithQZTray(report, type);
    }
}

export async function printReportToIP(
    reportData: string,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch('/api/print/ip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
                data: reportData,
                type: 'report',
            }),
        });

        const result = await response.json();
        return response.ok
            ? { success: true, message: 'Report printed successfully' }
            : { success: false, message: result.message || 'Print failed' };
    } catch (error: any) {
        return { success: false, message: `Print error: ${error.message}` };
    }
}

export async function printToIPWrapper(
    printData: string,
    type: 'receipt' | 'kot' | 'bot',
) {
    const result = await printToIP(printData, type);
    if (result.error) {
        throw new Error(result.error);
    }
    return result.data;
}

export async function printReportWithQZTray(
    report: DailySalesPrintData | HalfDaySalesPrintData,
    type: 'full' | 'half' = 'full',
): Promise<{ success: boolean; message: string }> {
    try {
        if (typeof (window as any).qz === 'undefined') {
            return { success: false, message: 'QZ Tray not available' };
        }

        const qz = (window as any).qz;
        const config = qz.configs.create('XPrinter');
        const data = formatForQZTraySalesReport(report, type);

        await qz.print(config, data);
        return { success: true, message: 'Report printed via QZ Tray' };
    } catch (error: any) {
        return { success: false, message: `QZ Tray error: ${error.message}` };
    }
}

export async function testPrinterConnection(): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        const response = await fetch('/api/print/test-connection', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        return {
            success: false,
            message: `Connection test failed: ${error.message}`,
        };
    }
}
