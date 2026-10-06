import { BookingForm } from './index';

export type RentedItemReturnStatus = 'returned' | 'pending';

export interface RentedItemRow {
    id: number;
    bookingId: number;
    customerName: string;
    eventName: string;
    eventDate: string;
    assignedDate: string;
    returnedDate: string | null;
    amountPaid: number;
    totalQuantity: number;
    returnStatus: RentedItemReturnStatus;
    booking: BookingForm;
}
