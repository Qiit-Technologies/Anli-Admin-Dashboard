export type BookingStatus =
    | 'BOOKED'
    | 'DIRTY'
    | 'AVAIL'
    | 'MAINTENANCE'
    | 'CLEANING'
    | 'OCCUPIED'
    | 'CHECKOUT'
    | 'CANCELLED';

export interface Booking {
    guestName: string;
    roomNumber: string;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
}

export interface Room {
    id: string;
    roomNumber: string;
    status: BookingStatus;
    guests: any[];
    floor?: number;
    price?: number;
    roomCapacity?: number;
    isBooked?: boolean;
    isOccupied?: boolean;
    roomtype?: any;
    roomNumberRoman?: string;
}

export interface RoomType {
    id: number;
    name: string;
    rooms: Room[];
    bookings: Booking[];
}
