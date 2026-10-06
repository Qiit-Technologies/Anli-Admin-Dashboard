import {
    CashierSalesReportData,
    ReceiptSummaryItem,
    SalesSummaryItem,
    CategorySummaryItem,
    PaymentSummaryItem,
    DetailedReceiptItem,
    VoidedReceiptItem,
    MenuItemBreakdownItem,
} from './types';

export const dummyReceiptSummary: ReceiptSummaryItem[] = [
    { metric: 'Total Pax', value: 37 },
    { metric: 'Total Receipts', value: 18 },
    { metric: 'Total Payments', value: 14 },
    { metric: 'Voided Receipts', value: 1 },
    { metric: 'Sales per Pax', value: '₦4,122.97' },
    { metric: 'Sales per Receipt', value: '₦10,892.86' },
];

export const dummySalesSummary: SalesSummaryItem[] = [
    { description: 'Gross Sales', amount: 152500 },
    { description: 'Discount', amount: 72500 },
    { description: 'Promo Discount', amount: 0 },
    { description: 'Extra Charges', amount: 32500 },
    { description: 'Tips', amount: 42.97 },
    { description: 'Rounding', amount: -20.86 },
];

export const dummyCategorySummary: CategorySummaryItem[] = [
    { metric: 'Food', qty: 24, value: 126000 },
    { metric: 'Drinks', qty: 18, value: 26500 },
    { metric: 'Others', qty: 3, value: 3000 },
];

export const dummyPaymentSummary: PaymentSummaryItem[] = [
    { paymentType: 'Cash', count: 9, value: 82000 },
    { paymentType: 'POS/Card', count: 3, value: 48000 },
    { paymentType: 'Transfer', count: 2, value: 23000 },
];

export const dummyDetailedReceiptList: DetailedReceiptItem[] = [
    {
        guestName: 'Tobi Ezra',
        receiptNo: 'RCP-00912',
        amount: 12000,
        discount: 0,
        payment: 'Cash',
        staff: 'John Doe',
        time: '12:09 PM',
    },
    {
        guestName: 'Sarah Johnson',
        receiptNo: 'RCP-00913',
        amount: 18500,
        discount: 2000,
        payment: 'POS',
        staff: 'Owner',
        time: '12:33 PM',
    },
    {
        guestName: 'Tobi Ezra',
        receiptNo: 'RCP-00914',
        amount: 8000,
        discount: 0,
        payment: 'Transfer',
        staff: 'Mr. Ade',
        time: '1:37 PM',
    },
    {
        guestName: 'Victor',
        receiptNo: 'RCP-00915',
        amount: 22000,
        discount: 500,
        payment: 'POS',
        staff: 'Owner',
        time: '1:01 PM',
    },
];

export const dummyVoidedReceipts: VoidedReceiptItem[] = [
    {
        receiptNo: 'RCP-00912',
        staff: 'Tobi Ezra',
        reason: 'Wrong entry',
        customerName: 'Monday Ozia',
        dineArea: 'Rooftop Bar',
        time: '12:09 PM',
    },
];

export const dummyMenuItemBreakdown: MenuItemBreakdownItem[] = [
    { itemName: 'Jollof Rice', qtySold: 11, amount: 33000 },
    { itemName: 'Fried Rice', qtySold: 8, amount: 24000 },
    { itemName: 'Coke 50cl', qtySold: 14, amount: 14000 },
    { itemName: 'Chicken', qtySold: 6, amount: 18000 },
];

export function generateDummyCashierSalesData(): CashierSalesReportData {
    const categorySummaryTotal = dummyCategorySummary.reduce(
        (sum, item) => sum + item.value,
        0,
    );
    const categorySummaryQty = dummyCategorySummary.reduce(
        (sum, item) => sum + item.qty,
        0,
    );

    return {
        receiptSummary: dummyReceiptSummary,
        salesSummary: dummySalesSummary,
        netSales: 152500,
        categorySummary: [
            ...dummyCategorySummary,
            {
                metric: 'Total',
                qty: categorySummaryQty,
                value: categorySummaryTotal,
            },
        ],
        paymentSummary: dummyPaymentSummary,
        paymentBalance: 15000,
        detailedReceiptList: dummyDetailedReceiptList,
        voidedReceipts: dummyVoidedReceipts,
        menuItemBreakdown: dummyMenuItemBreakdown,
    };
}
