export enum RequisitionStage {
    CREATED = 'CREATED',
    APPROVED = 'APPROVED',
    PAID = 'PAID',
    SUPPLIED = 'SUPPLIED',
}

export interface RequisitionActivity {
    id: number;
    stage: RequisitionStage;
    remarks: string;
    updatedBy?: {
        id: number;
        fullName: string;
        email: string;
    };
    createdAt: string;
}

export interface StockRequest {
    id: number;
    item: {
        id: number;
        name: string;
        unitOfMeasurement: string;
    };
    quantity: number;
    department: string;
    status: 'PENDING' | 'REJECTED' | 'APPROVED';
    currentStage: RequisitionStage;
    rejectionReason?: string;
    issuedQuantity?: number;
    issuingRemarks?: string;
    requestedBy: {
        id: number;
        fullName: string;
        email: string;
    };
    issuingOfficer?: {
        id: number;
        fullName: string;
        email: string;
    };
    activities: RequisitionActivity[];
    createdAt: string;
}

export interface UpdateRequisitionStageDto {
    stage: RequisitionStage;
    remarks?: string;
}

export interface RequisitionApprovalDto {
    stockRequestId: number;
    approved: boolean;
    remarks?: string;
    approvedById: number;
}

export interface RequisitionConfirmationDto {
    stockRequestId: number;
    confirmed: boolean;
    remarks?: string;
    confirmedById: number;
}
