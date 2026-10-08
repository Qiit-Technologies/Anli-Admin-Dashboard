export interface PurchaseLog {
    id: number;
    logId: string;
    purchaseDate: string;
    totalCost: number;
    miscellaneousExpense?: number;
    totalItems: number;
    receivedBy: {
        id: number;
        fullName: string;
    } | string | null;
    remarks?: string;
    createdAt: string;
    items?: any[];
}
