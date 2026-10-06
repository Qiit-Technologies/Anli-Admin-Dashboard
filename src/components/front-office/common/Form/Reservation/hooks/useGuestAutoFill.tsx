import Toast from '@/components/toast';
import React from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import type { GuestProfile } from '@/app/actions/guest-profile';

interface UseGuestAutoFillProps {
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setGuestHistory: React.Dispatch<React.SetStateAction<any[]>>;
    steps: Array<{ schema: z.ZodSchema<any> }>;
    onProfileSelected?: (profile: GuestProfile | null) => void;
}

export const useGuestAutoFill = ({
    setFormData,
    setErrors,
    setGuestHistory,
    steps,
    onProfileSelected,
}: UseGuestAutoFillProps) => {
    const autoFillGuestData = (guestRecord: any) => {
        const newData = {
            fullName: guestRecord.fullName || '',
            phoneNumber: guestRecord.phoneNumber
                ? String(guestRecord.phoneNumber)
                      .replace(/\D/g, '')
                      .slice(0, 11)
                : '',
            email: guestRecord.email || '',
            secondGuestFullName: guestRecord.secondGuestFullName || '',
            secondGuestPhoneNumber: guestRecord.secondGuestPhoneNumber
                ? String(guestRecord.secondGuestPhoneNumber)
                      .replace(/\D/g, '')
                      .slice(0, 11)
                : '',
            secondGuestType: guestRecord.secondGuestType || 'adult',
            paymentMethod:
                guestRecord.preferredPaymentMethod ||
                guestRecord.paymentMethod ||
                '',
            gender: guestRecord.gender || '',
            dateOfBirth: guestRecord.dateOfBirth || '',
            nationality: guestRecord.nationality || '',
            address: guestRecord.address || '',
            purposeOfVisit: guestRecord.purposeOfVisit || '',
            loyaltyTier: guestRecord.loyaltyTier || '',
            loyaltyPoints:
                guestRecord.loyaltyPoints !== undefined &&
                guestRecord.loyaltyPoints !== null
                    ? Number(guestRecord.loyaltyPoints)
                    : undefined,
            eligibleForReward:
                guestRecord.eligibleForReward === undefined
                    ? undefined
                    : Boolean(guestRecord.eligibleForReward),
            birthday: guestRecord.birthday || '',
            feedbackNotes: guestRecord.feedbackNotes || '',
            customerType: guestRecord.customerType || '',
            emailConsent:
                guestRecord.emailConsent === undefined
                    ? undefined
                    : Boolean(guestRecord.emailConsent),
            preferredContactMethod: guestRecord.preferredContactMethod || '',
            guestProfileId: guestRecord.guestProfileId || undefined,
        };

        setFormData((prevData: any) => ({
            ...prevData,
            ...newData,
        }));

        Object.entries(newData).forEach(([field, value]) => {
            try {
                const relevantSchema = steps.find((step) =>
                    Object.keys(
                        (step.schema as z.ZodObject<any>).shape,
                    ).includes(field),
                )?.schema;

                if (relevantSchema) {
                    const fieldData = { [field]: value };
                    (relevantSchema as z.ZodObject<any>)
                        .pick({ [field]: true })
                        .parse(fieldData);

                    setErrors((prev) => {
                        if (!prev[field]) return prev;
                        const newErrors = { ...prev };
                        delete newErrors[field];
                        return newErrors;
                    });
                }
            } catch (error: any) {
                if (error instanceof z.ZodError) {
                    const newErrors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                        if (err.path) {
                            newErrors[err.path[0]] = err.message;
                        }
                    });
                    setErrors((prev) => ({ ...prev, ...newErrors }));
                }
            }
        });

        setGuestHistory([]);

        // If guest has guestProfileId (Accounts Payable guest), set the profile
        if (guestRecord.guestProfileId && onProfileSelected) {
            // Create a profile object from the guest record for Accounts Payable guests
            const profile: GuestProfile = {
                id: guestRecord.guestProfileId,
                fullName: guestRecord.fullName,
                email: guestRecord.email,
                phoneNumber: guestRecord.phoneNumber?.toString(),
                address: guestRecord.address,
                IDNumber: guestRecord.IDNumber,
                nationality: guestRecord.nationality,
                gender: guestRecord.gender,
                dateOfBirth: guestRecord.dateOfBirth,
                notes: guestRecord.notes,
                guestType: guestRecord.guestType,
                createdAt: guestRecord.createdAt || new Date().toISOString(),
                updatedAt: guestRecord.updatedAt || new Date().toISOString(),
            };

            // Add credit balance if available
            (profile as any).creditBalance = guestRecord.creditBalance || 0;

            onProfileSelected(profile);
        } else if (onProfileSelected) {
            // Clear profile if no guestProfileId
            onProfileSelected(null);
        }

        if (guestRecord.totalStays > 0) {
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={`Welcome back! ${guestRecord.fullName} has stayed ${guestRecord.totalStays} times before.`}
                    type="success"
                />
            ));
        }
    };

    return { autoFillGuestData };
};
