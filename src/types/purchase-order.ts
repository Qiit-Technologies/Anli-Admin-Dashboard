export enum PurchaseOrderStage {
    CREATED = 'CREATED',
    APPROVED = 'APPROVED',
    SUPPLIED = 'SUPPLIED',
    COMPLETED = 'COMPLETED',
    PAID = 'PAID',
}

export interface PurchaseOrderActivity {
    id: number;
    stage: PurchaseOrderStage;
    remarks: string;
    updatedBy?: {
        id: number;
        fullName: string;
        email: string;
    };
    createdAt: string;
}

export interface PurchaseOrderItem {
    id: number;
    item: {
        id: number;
        name: string;
        unitOfMeasurement: string;
    };
    quantity: number;
    amount: number;
    unitOfMeasurement: string;
}

export interface PurchaseOrder {
    id: number;
    poNumber: string;
    vendor: {
        id: number;
        vendorName: string;
        emailAddress: string;
    };
    total: number;
    itemGrouping: string;
    status: 'awaiting_grn' | 'pending_payment' | 'pending' | 'completed';
    currentStage: PurchaseOrderStage;
    dateSent: string;
    sentToAccount: boolean;
    sentToAccountAt?: string;
    grnFileUrl?: string;
    invoiceFileUrl?: string;
    items: PurchaseOrderItem[];
    activities: PurchaseOrderActivity[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdatePurchaseOrderStageDto {
    stage: PurchaseOrderStage;
    remarks?: string;
}

export interface CreatePurchaseOrderActivityDto {
    purchaseOrderId: number;
    stage: PurchaseOrderStage;
    remarks?: string;
    updatedById?: number;
}
