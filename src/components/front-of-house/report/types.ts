export interface CashierSalesFiltersState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    outlet: string;
    cashier: string;
    orderType: string;
    menuType: string;
    showVoidedReceipts: boolean;
    showDetailedReceiptList: boolean;
    showMenuItemBreakdown: boolean;
}

export interface ReceiptSummaryItem {
    metric: string;
    value: string | number;
}

export interface SalesSummaryItem {
    description: string;
    amount: number;
}

export interface CategorySummaryItem {
    metric: string;
    qty: number;
    value: number;
}

export interface PaymentSummaryItem {
    paymentType: string;
    count: number;
    value: number;
}

/** Split-tender allocations grouped by the account that received the money. */
export interface ReceivingAccountSummaryItem {
    account: string;
    paymentMethods: string;
    count: number;
    value: number;
}

export interface DetailedReceiptItem {
    guestName: string;
    receiptNo: string;
    amount: number;
    discount: number;
    payment: string;
    staff: string;
    time: string;
}

export interface VoidedReceiptItem {
    receiptNo: string;
    staff: string;
    reason: string;
    customerName: string;
    dineArea: string;
    time: string;
}

export interface MenuItemBreakdownItem {
    itemName: string;
    qtySold: number;
    amount: number;
}

export interface CashierSalesReportData {
    receiptSummary: ReceiptSummaryItem[];
    salesSummary: SalesSummaryItem[];
    netSales: number;
    categorySummary: CategorySummaryItem[];
    paymentSummary: PaymentSummaryItem[];
    receivingAccountSummary?: ReceivingAccountSummaryItem[];
    paymentBalance: number;
    detailedReceiptList: DetailedReceiptItem[];
    voidedReceipts: VoidedReceiptItem[];
    menuItemBreakdown: MenuItemBreakdownItem[];
}

export interface CashierSalesHeaderInfo {
    cashier: string;
    printedAt: string;
    reportPeriodStart: string;
    reportPeriodEnd: string;
    outlet: string;
    orderType: string;
    menuType: string;
    printedBy: string;
}

export interface WorkPeriodPaymentRow {
    method: string;
    percent: number;
    amount: number;
}

export interface WorkPeriodTicketCountRow {
    label: string;
    count: number;
    amount: number;
}

export interface WorkPeriodUserSale {
    userName: string;
    amount: number;
}

export interface WorkPeriodItemSale {
    category: string;
    percent: number;
    amount: number;
}

export interface WorkPeriodReportData {
    businessName: string;
    location: string;
    periodStart: string;
    periodEnd: string;
    ticketSales: number;
    grandTotal: number;
    payments: WorkPeriodPaymentRow[];
    totalPayments: number;
    ticketCounts: WorkPeriodTicketCountRow[];
    deliveryTicketCount: number;
    amountPerTicket: number;
    orderCounts: WorkPeriodTicketCountRow[];
    deliveryOrderCount: number;
    ordersPerTicket: number;
    amountPerOrder: number;
    ticketCountsByState: { state: string; count: number; amount: number }[];
    paymentDetails: WorkPeriodPaymentRow[];
    vatAmount: number;
    deliveryVatAmount: number;
    userSales: WorkPeriodUserSale[];
    settledByUser: {
        userName: string;
        payments: WorkPeriodPaymentRow[];
        totalIncome: number;
    };
    itemSales: WorkPeriodItemSale[];
    totalItemSales: number;
}

export interface MenuItemListSalesItemRow {
    itemName: string;
    quantity: number;
    percent: number;
    amount: number;
}

export interface MenuItemListSalesCategory {
    categoryName: string;
    items: MenuItemListSalesItemRow[];
    totalQuantity: number;
    totalAmount: number;
}

export interface MenuItemListSalesReportData {
    businessName: string;
    location: string;
    periodStart: string;
    periodEnd: string;
    categories: MenuItemListSalesCategory[];
}

export interface RankedSellingItem {
    itemId: number | null;
    itemName: string;
    categoryName: string;
    quantitySold: number;
    revenue: number;
}

export interface TopLowSellingItemsReportData {
    businessName: string;
    location: string;
    periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    periodStart: string;
    periodEnd: string;
    generatedAt: string;
    totalDistinctItemsSold: number;
    totalQuantitySold: number;
    totalRevenue: number;
    totalGuestsCount: number;
    averageSpendPerGuest: number;
    topByQuantity: RankedSellingItem[];
    lowByQuantity: RankedSellingItem[];
    topByRevenue: RankedSellingItem[];
    lowByRevenue: RankedSellingItem[];
}
