export type DraftInvoiceStatus = 'draft' | 'converted';

export interface DraftInvoiceLineItem {
    roomTypeId: number;
    roomTypeName: string;
    quantity: number;
    ratePerNight: number;
    nights: number;
    checkInDate?: string;
    checkOutDate?: string;
    checkInTime?: string;
    checkOutTime?: string;
    subtotal: number;
}

export interface DraftInvoicePricing {
    subtotal?: number;
    vatAmount?: number;
    vatRate?: number;
    serviceChargeAmount?: number;
    serviceChargeRate?: number;
    tipAmount?: number;
    tipRate?: number;
    discountAmount?: number;
    customCharges?: Array<{
        id: number;
        name: string;
        rate: number;
        amount: number;
    }>;
    total?: number;
    finalPrice?: number;
    outstanding?: number;
    totalWithCustomCharges?: number;
}

export interface DraftInvoiceBankAccount {
    id: number;
    accountName: string;
    accountNumber: string;
    bankName: string;
}

export interface DraftInvoice {
    id: number;
    hotelId: number;
    invoiceNumber: string;
    status: DraftInvoiceStatus;
    guestName: string;
    guestEmail?: string | null;
    guestPhone?: string | null;
    checkInDate: string;
    checkOutDate: string;
    lineItems: DraftInvoiceLineItem[];
    roomTypeSummary: string;
    pricing: DraftInvoicePricing;
    amount: number | string;
    bankAccountId?: number | null;
    bankAccount?: DraftInvoiceBankAccount | null;
    payload: Record<string, unknown>;
    convertedGuestId?: number | null;
    createdById?: number | null;
    createdBy?: { id: number; fullName?: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface DraftInvoiceListResponse {
    data: DraftInvoice[];
    total: number;
    page: number;
    totalPages: number;
}

export type DraftInvoiceAuditAction =
    | 'created'
    | 'updated'
    | 'viewed'
    | 'printed'
    | 'downloaded'
    | 'converted'
    | 'deleted';

export interface DraftInvoiceAuditEntry {
    id: number;
    draftInvoiceId: number;
    action: DraftInvoiceAuditAction;
    details: string | null;
    metadata: Record<string, unknown> | null;
    performedById: number | null;
    performedBy?: { id: number; fullName?: string } | null;
    createdAt: string;
}
