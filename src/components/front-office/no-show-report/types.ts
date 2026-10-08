export interface NoShowReportFiltersState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    reservationNo: string;
    guestName: string;
    roomNumber: string;
    roomType: string;
}

export interface NoShowReportItem {
    reservationNo: string;
    roomLabel: string;
    guestName: string;
    bookingDate: string;
    adult: number;
    child: number;
    createdBy: string;
    noShowDate: string;
    markedBy: string;
    reason: string;
}

export interface NoShowReportData {
    items: NoShowReportItem[];
    generatedAt?: string;
    generatedBy?: string;
}

