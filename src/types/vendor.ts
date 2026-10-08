export interface Vendor {
    id: string;
    vendorName: string;
    emailAddress: string;
    businessAddress: string;
    phoneNumber: string;
    country: string;
    state: string;
    city: string;
    vendorCode: string;
    bankName: string;
    accountName: string;
    bankAccountNumber: string;
    totalPurchaseValue: number;
    numberOfTransactions: number;
    lastTransactionDate: string;
    status: 'Active' | 'Blacklisted' | 'Completed';
}

export interface VendorTransaction {
    id: string;
    refId: string;
    accountName: string;
    paymentType: string;
    account: string;
    itemPurchased: string;
    datePurchased: string;
    status: 'Pending Payment' | 'Completed';
}

export interface VendorMetrics {
    totalVendors: number;
    blacklistedVendors: number;
    activeVendors: number;
    totalVendorsChange: number;
    blacklistedChange: number;
    activeChange: number;
}
