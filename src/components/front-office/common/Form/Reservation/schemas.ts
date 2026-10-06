import { z } from 'zod';

export const reservationDetailsSchema = z.object({
    roomtype: z.coerce.number().min(1, { message: 'Room type is required' }),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    endDate: z.string().min(1, { message: 'End date is required' }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    numberOfGuests: z.coerce
        .number()
        .min(1, { message: 'Number of guests is required' }),
    nights: z.coerce.number().optional(),
    roomNumber: z.string().min(1, { message: 'Room Number is required' }),
});

export const reservationIDSchema = z.object({
    IDNumber: z.string().optional(),
    IDImage: z.string().optional(),
});

export const guestInfoSchema = z.object({
    fullName: z.string().min(1, { message: 'Full name is required' }),
    // email: z.string().email({ message: 'Invalid email address' }).optional(),
    phoneNumber: z
        .string()
        .max(11, { message: 'Phone number must be at most 11 digits' })
        .refine((val) => val.length === 0 || val.length >= 10, {
            message: 'Phone number must be at least 10 digits if provided',
        })
        .refine((val) => val.length === 0 || /^\d+$/.test(val), {
            message: 'Phone number must contain only digits',
        })
        .optional()
        .or(z.literal('')),
    secondGuestFullName: z.string().optional(),
    secondGuestPhoneNumber: z
        .string()
        .max(11, { message: 'Phone number must be at most 11 digits' })
        .refine((val) => val.length === 0 || val.length >= 10, {
            message: 'Phone number must be at least 10 digits if provided',
        })
        .refine((val) => val.length === 0 || /^\d+$/.test(val), {
            message: 'Phone number must contain only digits',
        })
        .optional()
        .or(z.literal('')),
    secondGuestType: z.enum(['adult', 'child']).optional().or(z.literal('')),
});

export const guestPreferencesSchema = z.object({
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    purposeOfVisit: z.string().optional(),
    loyaltyTier: z.string().optional(),
    loyaltyPoints: z.coerce.number().optional(),
    eligibleForReward: z.boolean().optional(),
    birthday: z.string().optional(),
    feedbackNotes: z.string().optional(),
    customerType: z.string().optional(),
    emailConsent: z.boolean().optional(),
    preferredContactMethod: z.string().optional(),
});

/** Minimum fields to generate a quotation invoice — no room assignment or payment required. */
export const quotationInvoiceSchema = z.object({
    fullName: z.string().min(1, { message: 'Guest name is required' }),
    roomtype: z.coerce.number().min(1, { message: 'Room type is required' }),
    startDate: z.string().min(1, { message: 'Check-in date is required' }),
    endDate: z.string().min(1, { message: 'Check-out date is required' }),
});

export const paymentSchema = z.object({
    amountPaid: z.coerce.number().optional(),
    outstanding: z.coerce.number().optional(),
    paymentMethod: z.string().optional(),
    receivingAccount: z.string().optional(),
});

export const formSchema = z
    .object({
        ...reservationDetailsSchema.shape,
        ...guestInfoSchema.shape,
        ...guestPreferencesSchema.shape,
        ...paymentSchema.shape,

        // Enhanced reservation fields
        isComplimentary: z.boolean().optional(),
        isVoid: z.boolean().optional(),
        voidReason: z.string().optional(),
        discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
        discountValue: z.coerce.number().optional(),
        discountReason: z.string().optional(),
        includeTip: z.boolean().optional(),
        includeVat: z.boolean().optional(),
        guestProfileId: z.coerce.number().optional(),
        creditToApply: z.coerce.number().optional(),
        isCheckedIn: z.boolean().optional(),
        isCheckedOut: z.boolean().optional(),
        mode: z.enum(['add', 'update']).optional(),
    })
    .superRefine((data, ctx) => {
        const isRegular =
            !data.isComplimentary && !data.isVoid && !data.discountType;

        // Skip strict payment validation during updates to allow flexibility
        if (isRegular && data.mode !== 'update') {
            if (!data.amountPaid && data.amountPaid !== 0) {
                ctx.addIssue({
                    path: ['amountPaid'],
                    message: 'Amount paid is required',
                    code: z.ZodIssueCode.custom,
                });
            }
            if (!data.paymentMethod) {
                ctx.addIssue({
                    path: ['paymentMethod'],
                    message: 'Payment method is required',
                    code: z.ZodIssueCode.custom,
                });
            }
            if (!data.receivingAccount) {
                ctx.addIssue({
                    path: ['receivingAccount'],
                    message: 'Receiving account is required',
                    code: z.ZodIssueCode.custom,
                });
            }
        }

        if (data.isVoid && !data.voidReason?.trim()) {
            ctx.addIssue({
                path: ['voidReason'],
                message: 'Void reason is required',
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.discountType) {
            if (!data.discountValue || data.discountValue <= 0) {
                ctx.addIssue({
                    path: ['discountValue'],
                    message: 'Discount value must be greater than 0',
                    code: z.ZodIssueCode.custom,
                });
            }
            if (!data.discountReason?.trim()) {
                ctx.addIssue({
                    path: ['discountReason'],
                    message: 'Discount reason is required',
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    });
