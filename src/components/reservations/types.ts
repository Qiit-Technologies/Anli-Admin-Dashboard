export type ReservationStatus =
    | 'Booked'
    | 'Completed'
    | 'In Progress'
    | 'Pending'
    | 'Cancelled';

export type PaymentStatus = 'Paid' | 'Refund' | 'Pending Payment';

export type PaymentType = 'Bank Transfer' | 'Card' | 'Cash' | 'POS';

export interface Reservation {
    id: string;
    rsvId: string;
    customerName: string;
    tableType: string;
    tableNumber: string;
    spaceType: string;
    rsvTime: string;
    reservationDate: string;
    status: ReservationStatus;
    paymentStatus: PaymentStatus;
    paymentType: PaymentType;
    amountPaid: string;
    tableId?: number;
}

export const statusStyles: Record<ReservationStatus, string> = {
    Booked: 'text-[#02542D] bg-[#EBFFEE] px-2 py-1 rounded-full',
    Completed: 'text-[#02542D] bg-[#EBFFEE] px-2 py-1 rounded-full',
    'In Progress': 'text-[#175CD3] bg-[#EFF8FF] px-2 py-1 rounded-full',
    Pending: 'text-[#A02724] bg-[#FFF0F0] px-2 py-1 rounded-full',
    Cancelled: 'text-[#A02724] bg-[#FFF0F0] px-2 py-1 rounded-full',
};

export const paymentStyles: Record<PaymentStatus, string> = {
    Paid: 'text-[#02542D] bg-[#EBFFEE] px-2 py-1 rounded-full',
    'Pending Payment': 'text-[#B54708] bg-[#FFFAEB] px-2 py-1 rounded-full',
    Refund: 'text-[#026AA2] bg-[#F0F9FF] px-2 py-1 rounded-full',
};
