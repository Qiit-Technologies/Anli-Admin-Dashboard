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
    reportDate: string;
    reportPeriod: string;
    hotelName: string;
    hotelAddress?: string;
    hotelPhone?: string;
    hotelEmail?: string;
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
        fastFood: number;
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
    topMenuItems: {
        name: string;
        quantity: number;
        revenue: number;
        profit?: number;
    }[];
    hourlyBreakdown: {
        hour: string;
        orders: number;
        revenue: number;
    }[];
    staffPerformance: {
        waiterName: string;
        ordersHandled: number;
        totalRevenue: number;
    }[];
    userSalesSettlement: UserSalesSettlement[];
    generatedAt: string;
    generatedBy: string;
}

export interface HalfDayPeriod {
    MORNING: 'MORNING'; // 6:00 AM - 6:00 PM
    EVENING: 'EVENING'; // 6:00 PM - 6:00 AM
}

export interface HalfDaySalesPrintData {
    reportDate: string;
    reportPeriod: string;
    periodType: 'MORNING' | 'EVENING';
    hotelName: string;
    hotelPhone?: string;
    hotelEmail?: string;
    totalOrders: number;
    totalRevenue: number;
    ordersByType: {
        dineIn: number;
        takeAway: number;
        fastFood: number;
        delivery: number;
        roomService: number;
    };
    paymentMethods: {
        cash: number;
        card: number;
        transfer: number;
        pos: number;
    };
    topMenuItems: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
    hourlyBreakdown: {
        hour: string;
        orders: number;
        revenue: number;
    }[];
    staffPerformance: {
        waiterName: string;
        ordersHandled: number;
        totalRevenue: number;
    }[];
    periodComparison: {
        previousPeriodRevenue: number;
        revenueChange: number;
        changePercentage: number;
    };
    generatedAt: string;
    generatedBy: string;
}
