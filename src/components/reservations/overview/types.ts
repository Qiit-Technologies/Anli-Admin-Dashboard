export interface Reservation {
    id: string;
    name: string;
    tableNum: number;
    partySize: string;
    status: 'paid' | 'pending';
    startTime: string;
    endTime: string;
    date: string;
}

export interface BlockedDate {
    id: string | number;
    startDate: string;
    endDate: string;
    reason?: string;
    spaceName?: string;
}

export interface DayInfo {
    day: number;
    isCurrentMonth: boolean;
    date: Date;
}

export interface CalendarState {
    currentDate: Date;
    selectedDate: Date;
}

export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const WEEK_DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
