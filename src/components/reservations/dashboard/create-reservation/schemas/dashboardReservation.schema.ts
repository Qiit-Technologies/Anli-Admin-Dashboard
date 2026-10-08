import { z } from 'zod';

export const dashboardCustomerDetailsSchema = z.object({
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

export const dashboardReservationDateTimeSchema = z.object({
    date: z.string().min(1, 'Please select a reservation date'),
    time: z.string().min(1, 'Please select a reservation time'),
    tableType: z.string().min(1, 'Please select a table type'),
    tableNumber: z.string().optional(),
    spaceType: z.string().optional(),
    tableId: z.coerce.number().optional(),
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
    specialNote: z.string().optional(),
    eventType: z.string().optional(),
});

export const dashboardPaymentMethodSchema = z.object({
    paymentOption: z.string().min(1, 'Please select a payment option'),
    accountToPay: z.string().optional(),
});

export const dashboardReservationFormSchema = z.object({
    customerDetails: dashboardCustomerDetailsSchema,
    reservationDateTime: dashboardReservationDateTimeSchema,
    paymentMethod: dashboardPaymentMethodSchema,
});

export type DashboardCustomerDetailsData = z.infer<
    typeof dashboardCustomerDetailsSchema
>;
export type DashboardReservationDateTimeData = z.infer<
    typeof dashboardReservationDateTimeSchema
>;
export type DashboardPaymentMethodData = z.infer<
    typeof dashboardPaymentMethodSchema
>;
export type DashboardReservationFormData = z.infer<
    typeof dashboardReservationFormSchema
>;
