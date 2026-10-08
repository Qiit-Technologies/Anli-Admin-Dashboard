export type SalesReportStatusFilter =
    | 'all'
    | 'inhouse'
    | 'reserved'
    | 'checked-out';

export interface SalesReportFiltersState {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    room: string;
    rateType: string;
    user: string;
    source: string;
    status: SalesReportStatusFilter;
    inHouseOnly: boolean;
}

export interface SalesReportItem {
    reservationNo: string;
    roomNumType: string;
    guestName: string;
    arrivalDate: string;
    departureDate: string;
    status: string;
    nightsInPeriod: number;
    pax: number;
    user: string;
    originalRate: number;
    discount: number;
    discountTotal: number;
}

export interface SalesReportSummary {
    totalPaymentsReceived: number;
    expectedRoomRevenue: number;
    checkedOutCount: number;
    realisedRoomRevenue: number;
    outstandingAr: number;
    totalAccountsPayable: number;
    totalBookings: number;
    inHouseCount: number;
    fbRevenue: number;
    totalDiscounts: number;
}

export interface SalesReportData {
    items: SalesReportItem[];
    summary: SalesReportSummary;
    generatedAt?: string;
    generatedBy?: string;
}

export interface SalesReportHeaderInfo {
    hotelName: string;
    printedAt: string;
    dateRange: string;
    room: string;
    roomType: string;
    user: string;
    source: string;
    status: string;
    inHouseOnly: boolean;
    generatedBy: string;
    generatedAt: string;
}
