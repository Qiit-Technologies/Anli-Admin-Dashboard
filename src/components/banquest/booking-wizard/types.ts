import { Amenities, BookingForm, Food } from '../types';

export type PaymentPlan = 'full' | 'partial' | 'later';
export type PaymentMethod = 'bank' | 'cash' | 'other';

/** Wizard-only fields; merged into API payload where supported. */
export interface BanquetWizardExtras {
    eventEndTime: string;
    estimatedGuestCount: string;
    setupTime: string;
    teardownTime: string;
    eventCategory: string;
    eventCategoryOther: string;
    eventTypeOther: string;
    eventDescription: string;
    firstName: string;
    lastName: string;
    company: string;
    customerType: string;
    saveCustomer: boolean;
    billingTitle: string;
    billingFirstName: string;
    billingLastName: string;
    billingAddress: string;
    billingState: string;
    billingCounty: string;
    billingPostalCode: string;
    billingCity: string;
    skipMenu: boolean;
    menuPackageId: string;
    restaurantMenuName: string;
    serviceChargePercent: number;
    vatPercent: number;
    menuSpecialInstructions: string;
    amenityCategoryFilter: string;
    amenitiesSpecialInstructions: string;
    bookingSource: string;
    eventCoordination: string;
    customerNotes: string;
    paymentPlan: PaymentPlan;
    paymentMethod: PaymentMethod;
    discountPercent: number;
    discountReason: string;
    amountPaid: number;
    paymentDate: string;
}

export type BanquetWizardState = Omit<
    BookingForm,
    'id' | 'amenities' | 'food'
> & {
    amenities: Amenities[];
    food: Food[];
} & BanquetWizardExtras;

export const defaultWizardState = (): BanquetWizardState => ({
    eventName: '',
    eventType: '',
    eventVenue: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: '',
    eventEndTime: '',
    estimatedGuestCount: '',
    setupTime: '',
    teardownTime: '',
    eventCategory: '',
    eventCategoryOther: '',
    eventTypeOther: '',
    eventDescription: '',
    customerTitle: 'Mr',
    customerName: '',
    firstName: '',
    lastName: '',
    customerEmailAddress: '',
    customerPhoneNumber: '',
    company: '',
    customerType: '',
    saveCustomer: false,
    billingTitle: 'Mr',
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingState: '',
    billingCounty: '',
    billingPostalCode: '',
    billingCity: '',
    cuisineType: '',
    menuName: '',
    menuType: '',
    skipMenu: false,
    menuPackageId: '',
    restaurantMenuName: '',
    serviceChargePercent: 10,
    vatPercent: 7.5,
    menuSpecialInstructions: '',
    amenities: [],
    food: [],
    amenityCategoryFilter: 'all',
    amenitiesSpecialInstructions: '',
    bookingSource: '',
    eventCoordination: '',
    customerNotes: '',
    total: 0,
    discount: 0,
    tax: 0,
    paymentPlan: 'full',
    paymentMethod: 'bank',
    discountPercent: 0,
    discountReason: '',
    amountPaid: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending',
    bookingStatus: 'confirmed',
});
