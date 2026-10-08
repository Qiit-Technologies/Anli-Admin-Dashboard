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
    /** FRD §17 lifecycle: PENDING → APPROVED → SENT/IN_TRANSIT → RECEIVED (or REJECTED) */
    status:
        | 'PENDING'
        | 'APPROVED'
        | 'SENT'
        | 'IN_TRANSIT'
        | 'RECEIVED'
        | 'REJECTED';
    remarks?: string;
    rejectionReason?: string;
    transferredBy: Staff;
    receivedBy?: Staff;
    approvedBy?: Staff;
    approvedAt?: string;
    sentAt?: string;
    receivedAt?: string;
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
    inTransit?: number;
    received?: number;
}

export interface GetTransfersResponse {
    data: StockTransfer[];
    stats: TransferStats;
}
