export type TransactionType =
    | 'Bill Posting'
    | 'Opening Balance'
    | 'Adjustment'
    | 'Reversal'
    | 'Funding';

export type LedgerEntryStatus = 'Active' | 'In-Active' | 'Approved' | 'Pending';

export type PostedBillStatus =
    | 'Approved'
    | 'Pending'
    | 'Rejected'
    | 'Reversal Requested'
    | 'Reversed';

export interface InternalAccountTransaction {
    id: string;
    accountId: string;
    dateTime: string;
    transactionId: string;
    type: TransactionType;
    invoiceNo: string;
    sourceModule: string;
    customer: string;
    debit: number | null;
    credit: number | null;
    runningBalance: number | null;
    description: string;
    initiatedBy: string;
    approvedBy: string;
    status: LedgerEntryStatus;
}

export interface PostedBill {
    id: string;
    accountId: string;
    invoiceNo: string;
    sourceModule: string;
    guestCustomer: string;
    roomTableNo: string;
    billDate: string;
    postedDate: string;
    billAmount: number;
    postedBy: string;
    approvedBy: string;
    status: PostedBillStatus;
}

export interface LedgerPageStats {
    currentBalance: number;
    currentBalanceTrend: number;
    totalDebits: number;
    totalDebitsTrend: number;
    totalBillsPosted: number;
    reversedTransactions: number;
    reversedTransactionsTrend: number;
}

export interface CreateTransactionPayload {
    type: TransactionType;
    invoiceNo?: string;
    sourceModule: string;
    customer: string;
    debit?: number;
    credit?: number;
    description: string;
    initiatedBy: string;
    approvedBy?: string;
    status?: LedgerEntryStatus;
}

export interface CreatePostedBillPayload {
    invoiceNo: string;
    sourceModule: string;
    guestCustomer: string;
    roomTableNo?: string;
    billDate: string;
    billAmount: number;
    postedBy: string;
    approvedBy?: string;
}
