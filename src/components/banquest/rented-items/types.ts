export type RentedItemStatus = 'returned' | 'rented' | 'over-due';

export type RentedItemCondition = 'excellent' | 'good';

export interface RentedItemContact {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    phone: string;
}

export interface RentedItemRow {
    id: string;
    amenityId: string;
    amenityName: string;
    amenitySubtitle: string;
    imageUrl: string;
    category: string;
    description: string;
    renterPhone: string;
    renterName: string;
    rentedDate: string;
    rentedTime: string;
    eventType: string;
    dueDate: string;
    dueTime: string;
    rentedQuantity: number;
    condition: RentedItemCondition;
    status: RentedItemStatus;
    amountPaid: number;
    returnedDate?: string;
    returnedTime?: string;
    createdBy?: string;
    dateCreated?: string;
    contact: RentedItemContact;
}

export interface RentalStats {
    totalRented: number;
    currentlyRented: number;
    returnedThisMonth: number;
    overdue: number;
    totalTrend: number;
    rentedTrend: number;
    returnedTrend: number;
    overdueTrend: number;
}
