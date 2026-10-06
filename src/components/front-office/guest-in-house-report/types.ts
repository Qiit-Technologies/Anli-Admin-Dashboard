export interface GuestInHouseReportFiltersState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    staff: string;
    roomNumber: string;
    roomType: string;
}

export interface GuestInHouseReportItem {
    reservationNo: string;
    guestName: string;
    roomLabel: string;
    arrivalDate: string;
    departureDate: string;
    nights: number;
    pax: number;
    createdBy: string;
    status: 'In-House' | 'Checked Out' | 'Reserved';
}

export interface GuestInHouseReportData {
    items: GuestInHouseReportItem[];
    generatedAt?: string;
    generatedBy?: string;
}
