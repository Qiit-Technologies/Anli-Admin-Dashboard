export interface Amenities {
    id: number;
    name: string;
    available: string | number;
    cost: string;
    quantity: string;
}

export interface AmenitiesExtended {
    id: number;
    type: string;
    quantity: number;
    remaining: number;
    status: 'available' | 'not available';
    unitCost?: number;
}

export interface Food {
    id: number;
    name: string;
    description: string;
    cost: string;
    quantity: string;
}

export interface BookingForm {
    id: number;
    eventName: string;
    eventType: string;
    eventVenue: string;
    eventDate: string;
    eventTime: string;
    eventEndTime?: string | null;
    estimatedGuestCount?: string | null;
    setupTime?: string | null;
    teardownTime?: string | null;
    eventCategory?: string | null;
    eventDescription?: string | null;
    customerTitle: string;
    customerName: string;
    customerEmailAddress: string;
    customerPhoneNumber: string;
    customerCompany?: string | null;
    customerNotes?: string | null;
    cuisineType?: string | null;
    menuName?: string | null;
    menuType?: string | null;
    menuSpecialInstructions?: string | null;
    amenitiesSpecialInstructions?: string | null;
    amenities: Array<Amenities>;
    food: Array<Food>;
    eventDuration?: string;
    paymentStatus?: 'partial' | 'paid' | 'pending';
    bookingStatus?: 'confirmed' | 'cancelled';
    serviceChargePercent?: number;
    vatPercent?: number;
    amountPaid?: number;
    paymentPlan?: 'full' | 'partial' | 'later' | null;
    paymentMethod?: string | null;
    discountReason?: string | null;
    createdAt?: string;
    total: number;
    discount: number;
    tax: number;
}

export interface CreateBookingForm {
    eventName?: string;
    eventType?: string;
    eventVenue?: string;
    eventDate?: string;
    eventTime?: string;
    eventEndTime?: string;
    estimatedGuestCount?: string;
    setupTime?: string;
    teardownTime?: string;
    eventCategory?: string;
    eventDescription?: string;
    customerTitle?: string;
    customerName?: string;
    customerEmailAddress?: string;
    customerPhoneNumber?: string;
    customerCompany?: string;
    customerNotes?: string;
    cuisineType?: string;
    menuName?: string;
    menuType?: string;
    menuSpecialInstructions?: string;
    amenitiesSpecialInstructions?: string;
    amenities?: Array<Amenities>;
    food?: Array<Food>;
    eventDuration?: string;
    paymentStatus?: 'partial' | 'paid' | 'pending';
    bookingStatus?: 'confirmed' | 'cancelled';
    serviceChargePercent?: number;
    vatPercent?: number;
    amountPaid?: number;
    paymentPlan?: 'full' | 'partial' | 'later';
    paymentMethod?: string;
    discountReason?: string;
    total?: number;
    discount?: number;
    tax?: number;
}
