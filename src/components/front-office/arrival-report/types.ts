export interface ArrivalGuest {
    resNo: string;
    guestName: string;
    room: string;
    rate: number;
    arrivalDate: string;
    arrivalTime: string;
    departureDate: string;
    staff: string;
}

export interface ArrivalReportFiltersState {
    startDate: Date | undefined;
    startTime: string;
    endDate: Date | undefined;
    endTime: string;
    staff: string;
    /** Room type id from API, or "all" */
    roomType: string;
}

export interface ArrivalReportData {
    arrivals: ArrivalGuest[];
    generatedAt: string;
    generatedBy: string;
}

export const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (const minute of ['00', '30']) {
            const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const period = hour < 12 ? 'AM' : 'PM';
            times.push(
                `${String(hour12).padStart(2, '0')}:${minute} ${period}`,
            );
        }
    }
    return times;
};

export const timeOptions = generateTimeOptions();
