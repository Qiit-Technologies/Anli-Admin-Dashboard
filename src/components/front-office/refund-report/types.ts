export interface RefundReportFiltersState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    user: string;
    paymentMethod: string;
    refundAccount: string;
    /** Partial name / phone when not using a profile pick. */
    guestSearch: string;
    /** Guest profile id from combobox, or 'all'. */
    guestProfileId: string;
    /** Label for the selected profile (UI only). */
    guestFilterLabel: string;
}

export interface RefundReportItem {
    date: string;
    time: string;
    guestName: string;
    roomLabel: string;
    stayPeriod: string;
    nights: number;
    openingBalance: number;
    refundAmount: number;
    remainingBalance: number;
    processedBy: string;
    paymentMethod: string;
    refundFromAccount: string;
    reason: string;
}

export interface RefundReportData {
    items: RefundReportItem[];
    summary: {
        totalRefundCount: number;
        totalRefundAmount: number;
        averageRefundAmount: number;
        guestCount: number;
    };
    generatedAt?: string;
    /** Staff name from the API when the report was generated. */
    generatedBy?: string;
}

export interface RefundReportHeaderInfo {
    hotelName: string;
    printedAt: string;
    reportPeriod: string;
    paymentMethodLabel: string;
    refundAccountLabel: string;
    staffLabel: string;
    generatedBy: string;
    generatedAt: string;
}
