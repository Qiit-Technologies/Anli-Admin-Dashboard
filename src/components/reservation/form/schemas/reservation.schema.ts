import { z } from 'zod';

export const customerDetailsSchema = z.object({
    firstName: z
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: z
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^[+]?[\d\s-]+$/, 'Please enter a valid phone number'),
});

export const reservationDateTimeSchema = z.object({
    date: z.string().min(1, 'Please select a reservation date'),
    time: z.string().min(1, 'Please select a reservation time'),
    tableType: z.string().min(1, 'Please select a table type'),
    reservationType: z.enum(
        ['Single Reservation', 'Group Reservation', 'Business Reservation'],
        {
            errorMap: () => ({ message: 'Please select a reservation type' }),
        },
    ),
    guestNumber: z
        .string()
        .min(1, 'Please enter the number of guests')
        .refine((val) => parseInt(val) > 0, 'Guest number must be at least 1'),
    foodType: z.string().optional(),
    foodQuantity: z.string().optional(),
});

export const paymentMethodSchema = z.object({
    paymentOption: z.string().min(1, 'Please select a payment option'),
    accountToPay: z.string().optional(),
    totalCost: z.string().optional(),
});

export const reservationFormSchema = z.object({
    customerDetails: customerDetailsSchema,
    reservationDateTime: reservationDateTimeSchema,
    paymentMethod: paymentMethodSchema,
});

export type CustomerDetailsData = z.infer<typeof customerDetailsSchema>;
export type ReservationDateTimeData = z.infer<typeof reservationDateTimeSchema>;
export type PaymentMethodData = z.infer<typeof paymentMethodSchema>;
export type ReservationFormData = z.infer<typeof reservationFormSchema>;
