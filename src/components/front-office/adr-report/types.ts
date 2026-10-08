export type AdrReportFiltersState = {
    mode: 'single' | 'range';
    singleDate: string;
    fromDate: string;
    toDate: string;
    includePending: boolean;
    roomTypeId: 'all' | string;
    includeNoShows: boolean;
    bookingSource: string;
};
