export interface SVReservation {
    id: string;
    fullName: string;
    startDate: string;
    endDate: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    roomNumber: number;
    email: string;
    phoneNumber: string;
    amountPaid: number;
    outstanding: number;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    roomType: {
        id: string;
        name: string;
    };
}

export interface SVRoom {
    id: string;
    number: string;
    selected?: boolean;
    reservations: SVReservation[];
    price: string;
    roomCapacity: number;
    floor: number;
    isDirty: boolean;
    roomNumberRoman: string;
}

export interface SVRoomType {
    id: string;
    name: string;
    rooms: SVRoom[];
}
