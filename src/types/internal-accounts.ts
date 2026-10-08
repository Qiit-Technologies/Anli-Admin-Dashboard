export type InternalAccountType = string;

export type InternalAccountStatus = 'Active' | 'In-Active';

export interface InternalAccount {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: InternalAccountType;
    openingBalance: number;
    currentBalance: number;
    owner: string;
    contactEmail: string;
    contactPhone: string;
    approvalRequired: boolean;
    referenceNumber?: string;
    description?: string;
    fundingSourceNote?: string;
    status: InternalAccountStatus;
    lastTransaction: string | null;
    dateCreated: string;
    responsiblePerson?: string;
    defaultApprover?: string;
    totalFundingAdded?: number;
    totalBillsPosted?: number;
    reversedTransactions?: number;
    pendingApproval?: number;
}

export interface InternalAccountStats {
    totalAccounts: number;
    active: number;
    positiveBalance: number;
    negativeBalance: number;
}

export interface CreateInternalAccountPayload {
    accountName: string;
    owner: string;
    contactEmail: string;
    contactPhone: string;
    accountType: InternalAccountType;
    approvalRequired: boolean;
    openingBalance: number;
    description?: string;
    fundingSourceNote?: string;
    referenceNumber?: string;
}

export interface InternalAccountFormDraft extends CreateInternalAccountPayload {
    accountCode: string;
}

export const INTERNAL_ACCOUNT_TYPE_OPTIONS: {
    value: InternalAccountType;
    label: string;
}[] = [
    { value: 'Director Ledger', label: 'Director Ledger' },
    { value: 'Manager Ledger', label: 'Manager Ledger' },
    { value: 'House Account', label: 'House Account' },
    { value: 'Owner Account', label: 'Owner Account' },
    { value: 'Staff Account', label: 'Staff Account' },
    { value: 'VIP Account', label: 'VIP Account' },
];

export const APPROVAL_REQUIRED_OPTIONS = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

export const FUNDING_SOURCE_OPTIONS = [
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Internal Transfer', label: 'Internal Transfer' },
    { value: 'Other', label: 'Other' },
];

export interface AddFundsFormValues {
    amount: number;
    fundingDate: string;
    accountReceivedInto: string;
    approvalRequired: 'yes' | 'no';
    fundingSource: string;
    description: string;
}
