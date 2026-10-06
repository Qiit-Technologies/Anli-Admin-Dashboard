import { Meta } from '.';

export interface TransactionReponse {
    data: Transaction[];
    meta: Meta;
}

export interface Transaction {
    id: number;
    transactionType: string;
    quantityChange: number;
    transactionDate: string;
    role: {
        department: string;
    };
    staff: {
        fullName: string;
    };
    item: {
        name: string;
    };
}

export interface SimplifiedTransaction {
    id: number;
    type: string;
    quantity: number;
    date: string;
    department: string;
    fullName: string;
}

export type TransactionsColumn = 'type' | 'quantity' | 'date';
