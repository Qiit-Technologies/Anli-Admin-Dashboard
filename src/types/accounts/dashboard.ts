export interface DashboardSummary {
    total: number;
    totalBalance: number;
    revenue: number;
    expenses: number;
    percentageChange: number;
    revenueChange: number;
    expensesChange: number;
    revenueRecentData?: { date: Date; count: number }[];
    expensesRecentData?: { date: Date; count: number }[];
}

export interface CashFlowData {
    month: string;
    revenue: number;
    expenses: number;
}

export interface RevenueSummary {
    total: number;
    departmentRevenue: {
        frontDesk: number;
        restaurant: number;
        bar: number;
        other: number;
    };
    status: {
        completed: number;
        remaining: number;
        paid: number;
        pending: number;
    };
}

export interface Transaction {
    transactionTime: string;
    transactionType: string;
    amount: string;
    date: string;
    time: string;
    module: string;
    status: 'Pending' | 'Completed';
}
