export interface DailyStockRegister {
    id: number;
    registerDate: string;
    isClosed: boolean;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    items: DailyStockRegisterItem[];
}

export interface DailyStockRegisterItem {
    id: number;
    item: {
        id: number;
        name?: string;
        itemName?: string;
        category?: string;
        unitOfMeasurement?: string;
        minStock?: number;
    };
    storeOpening: number;
    barOpening: number;
    kitchenOpening: number;
    issueOut: number;
    returnedIn: number;
    damagedWaste: number;
    sold: number;
    transferOut: number;
    transferIn: number;
    storeClosing: number;
    barClosing: number;
    kitchenClosing: number;
    stockLevel: number;
}
