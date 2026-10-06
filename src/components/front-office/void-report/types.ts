export interface VoidReportFiltersState {
    arrivalDateFrom: string;
    arrivalDateTo: string;
    voidDateFrom: string;
    voidDateTo: string;
    guestName: string;
    room: string;
    rateType: string;
    source: string;
    paxFrom: string;
    paxType: string;
    paxTo: string;
    staff: string;
    voidReason: string;
}

export interface VoidReportItem {
    reservationNo: string;
    reservationDate: string;
    guestName: string;
    roomNo: string;
    arrivalDate: string;
    rateType: string;
    departureDate: string;
    source: string;
    adult: number;
    child: number;
    user: string;
    voidDate: string;
    voidReason: string;
}

export interface VoidReportData {
    items: VoidReportItem[];
}

export interface VoidReportHeaderInfo {
    hotelName?: string;
    printedAt: string;
    businessYear: string;
    printedBy: string;
    source: string;
    room: string;
    dineArea: string;
}
