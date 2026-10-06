import type { QuotationRoomLine } from '@/lib/front-office/quotation-room-lines';
import { z } from 'zod';
import {
    formSchema,
    guestInfoSchema,
    paymentSchema,
    reservationDetailsSchema,
} from './schemas';

export type FormValues = z.infer<typeof formSchema>;

export interface MultiStepFormProps {
    guestDetails?: any;
    date?: Date;
    roomType?: string;
    onClose?: () => void;
    /** After a group is created inside this modal, switch the list to that group. */
    onGroupCreated?: (groupCode: string) => void;
    mode?: 'add' | 'update';
    initialValues?: Partial<FormDataType>;
    /** When set, the wizard opens on this step (e.g. 3 = room selection). */
    initialStep?: number;
    /** Skip reservation type picker and infer flags from initialValues (draft convert). */
    skipTypeSelection?: boolean;
    /** Draft invoice to mark converted after a successful reservation. */
    draftInvoiceId?: number;
    onConversionComplete?: () => void;
}

export interface FormDataType {
    roomtype: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    fullName: string;
    phoneNumber?: string;
    numberOfGuests: number;
    email?: string;
    secondGuestFullName: string;
    secondGuestPhoneNumber?: string;
    secondGuestType?: 'adult' | 'child' | '';
    amountPaid: number;
    outstanding: number;
    paymentMethod: string;
    receivingAccount: string;
    nights?: number;
    roomNumber?: string;
    /** Extra room types included on quotation invoices (excludes primary roomtype). */
    quotationRooms?: QuotationRoomLine[];
    isComplimentary?: boolean;
    isVoid?: boolean;
    voidReason?: string;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue?: number;
    discountReason?: string;
    isWalkIn?: boolean;
    IDNumber?: string;
    IDImage?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    purposeOfVisit?: string;
    loyaltyTier?: string;
    loyaltyPoints?: number;
    eligibleForReward?: boolean;
    birthday?: string;
    feedbackNotes?: string;
    customerType?: string;
    emailConsent?: boolean;
    preferredContactMethod?: string;
    includeTip?: boolean;
    includeVat?: boolean;
    includeServiceCharge?: boolean;
    includeCustomCharges?: boolean;
    waiverReason?: string;
    guestProfileId?: number;
    creditToApply?: number;
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
    mode?: 'add' | 'update';
}

export interface StepperItemProps {
    step: {
        step: number;
        title: string;
        description: string;
    };
    currentStep: number;
    totalSteps: number;
    isValid: boolean;
    onClick: () => void;
}

export interface StepConfig {
    step: number;
    title: string;
    description: string;
    schema: z.ZodSchema<any>;
}

export type ReservationDetailsFormData = z.infer<
    typeof reservationDetailsSchema
>;
export type GuestInfoFormData = z.infer<typeof guestInfoSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;

export interface StepProps {
    formData: Partial<FormDataType>;
    handleInputChange: (field: keyof FormDataType, value: any) => void;
    errors: Record<string, string>;
    inputClass: string;
}
