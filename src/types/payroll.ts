export interface PayrollRecord {
    id: string;
    referenceId: string;
    payrollRef: string;
    period: string;
    numberOfStaff: number;
    totalAmount: number;
    paymentStatus: 'Pending' | 'Paid' | 'failed';
}

export interface PayrollFilters {
    search: string;
    period: 'All' | 'Months' | 'Weeks' | 'Daily';
}
