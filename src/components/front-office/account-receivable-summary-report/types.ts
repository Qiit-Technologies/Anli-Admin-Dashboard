export interface AccountReceivableSummaryFiltersState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reservationNo: string;
    guestName: string;
    roomNumber: string;
    roomType: string;
}

export interface AccountReceivableSummaryItem {
    date: string;
    time: string;
    reservationNo: string;
    guestName: string;
    roomNumber: string;
    roomType: string;
    openingBalance: number;
    amountPaid: number;
    outstandingBalance: number;
    createdBy: string;
    status: 'Outstanding' | 'Cleared';
}

export interface AccountReceivableSummaryData {
    items: AccountReceivableSummaryItem[];
    summary: {
        totalReceivableCount: number;
        totalOutstanding: number;
        totalAmountPaid: number;
        averageOutstanding: number;
        guestCount: number;
    };
    generatedAt?: string;
    generatedBy?: string;
}

