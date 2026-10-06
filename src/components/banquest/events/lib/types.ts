import { BookingForm } from '../../types';

export interface CalendarEventBlock {
    id: number;
    title: string;
    venue: string;
    eventDate: string;
    eventTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    paymentStatus: BookingForm['paymentStatus'];
    bookingStatus: BookingForm['bookingStatus'];
    total: number;
    booking: BookingForm;
}

export interface CalendarVenueRow {
    id: string;
    name: string;
    events: CalendarEventBlock[];
}
