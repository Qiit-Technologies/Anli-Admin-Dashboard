export type DeliveryOption = 'self' | 'delivery' | 'setup';

export interface RentAmenitySelection {
    id: string;
    name: string;
    subtitle: string;
    imageUrl: string;
    condition: 'excellent' | 'good';
    unitAvailable: number;
    unitPrice: number;
    quantity: number;
}

export interface RentWizardState {
    selections: RentAmenitySelection[];
    eventType: string;
    startDate: string;
    endDate: string;
    duration: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    deliveryOption: DeliveryOption;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
}

export const INITIAL_RENT_WIZARD_STATE: RentWizardState = {
    selections: [],
    eventType: 'Rental',
    startDate: '',
    endDate: '',
    duration: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    deliveryOption: 'self',
    pickupDate: '',
    pickupTime: '09:00 AM',
    returnDate: '',
    returnTime: '09:00 AM',
};
