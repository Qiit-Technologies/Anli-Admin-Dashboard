export interface StockTransferItem {
    id: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalValue: number;
    item: {
        id: number;
        name: string;
        code?: string;
        price?: number;
    };
}

export interface Staff {
    id: number;
    fullName: string;
    email?: string;
    role?: string;
}

export interface StockTransfer {
    id: number;
    transferId: string;
    transferDate: string;
    transferType: 'INTER' | 'INTRA';
    fromDepartment: string;
    toDepartment: string;
    fromSubUnit?: string;
    toSubUnit?: string;
    totalValue: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    remarks?: string;
    rejectionReason?: string;
    transferredBy: Staff;
    receivedBy?: Staff;
    approvedBy?: Staff;
    approvedAt?: string;
    items: StockTransferItem[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateStockTransfer {
    transferDate: string;
    transferType: string;
    toDepartment: string;
    fromDepartment: string;
    receivedById?: number;
    items: {
        itemId: number;
        quantity: number;
        unit: string;
    }[];
    remarks?: string;
}

export interface TransferStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface GetTransfersResponse {
    data: StockTransfer[];
    stats: TransferStats;
}
