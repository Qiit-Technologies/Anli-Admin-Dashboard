import {
    guestInfoSchema,
    guestPreferencesSchema,
    paymentSchema,
    reservationDetailsSchema,
    reservationIDSchema,
} from './schemas';
import { StepConfig } from './types';

export const steps: StepConfig[] = [
    {
        step: 1,
        title: 'Guest Information',
        description: 'Enter your guest information',
        schema: guestInfoSchema,
    },
    {
        step: 2,
        title: 'Guest Preferences',
        description: 'Capture guest preferences and loyalty details',
        schema: guestPreferencesSchema,
    },
    {
        step: 3,
        title: 'Reservation Details',
        description: 'Enter your reservation details',
        schema: reservationDetailsSchema,
    },
    {
        step: 4,
        title: 'Guest ID',
        description: 'Enter your ID number or ID image',
        schema: reservationIDSchema,
    },
    {
        step: 5,
        title: 'Payment Method',
        description: 'Enter your payment method',
        schema: paymentSchema,
    },
];
