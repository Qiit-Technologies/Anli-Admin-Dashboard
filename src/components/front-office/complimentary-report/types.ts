export interface ComplimentaryReportFiltersState {
    startDate: string;
    endDate: string;
    guestName: string;
    status: 'all' | 'inhouse' | 'reserved';
    room: string;
    rateType: string;
    user: string;
    reservationNo: string;
}

export interface ComplimentaryReportItem {
    reservationNo: string;
    reservationDate: string;
    guestName: string;
    roomNo: string;
    roomType: string;
    createdBy: string;
    complimentaryValue: number;
    nights: number;
}

export interface ComplimentaryReportData {
    items: ComplimentaryReportItem[];
    summary: {
        totalReservations: number;
        totalNights: number;
        totalComplimentaryValue: number;
    };
}

export interface ComplimentaryReportHeaderInfo {
    hotelName: string;
    printedAt: string;
    dateRange: string;
    room: string;
    roomType: string;
    user: string;
    generatedBy: string;
    generatedAt: string;
    totalComplimentaryValue?: number;
}
