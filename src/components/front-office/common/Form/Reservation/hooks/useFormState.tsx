import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import { FormDataType, FormValues } from '../types';

interface UseFormStateProps {
    mode: 'add' | 'update';
    guestDetails?: any;
    date?: Date | undefined;
    roomType?: any;
    initialValues?: Partial<FormDataType> | undefined;
    roomTypes: any[];
    defaultFormData: Partial<FormValues>;
}

export const useFormState = ({
    mode,
    guestDetails,
    date,
    roomType,
    initialValues,
    roomTypes,
    defaultFormData,
}: UseFormStateProps) => {
    const [formData, setFormData] =
        useState<Partial<FormValues>>(defaultFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const toDateInputValue = (value?: string | Date) => {
            if (!value) return '';
            const dateValue = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(dateValue.getTime())) {
                return '';
            }
            return format(dateValue, 'yyyy-MM-dd');
        };

        if ((mode === 'update' && guestDetails) || date || initialValues) {
            const resolvedRoomType = (() => {
                if (mode === 'update' && guestDetails?.roomType?.id) {
                    return guestDetails.roomType.id;
                }
                const fromInitial = Number(initialValues?.roomtype);
                if (Number.isFinite(fromInitial) && fromInitial > 0) {
                    return fromInitial;
                }
                const fromLine = Number(
                    (
                        initialValues as {
                            reservationLines?: Array<{ roomTypeId?: number }>;
                        }
                    )?.reservationLines?.[0]?.roomTypeId,
                );
                if (Number.isFinite(fromLine) && fromLine > 0) {
                    return fromLine;
                }
                return roomTypes[0]?.id ?? 0;
            })();

            setFormData((prevData) => ({
                ...prevData,
                roomtype: resolvedRoomType,
                roomNumber:
                    mode === 'update' && guestDetails.roomNumber
                        ? guestDetails.roomNumber
                        : initialValues?.roomNumber || '',
                fullName:
                    mode === 'update'
                        ? guestDetails?.fullName || ''
                        : initialValues?.fullName || '',
                phoneNumber:
                    mode === 'update'
                        ? (() => {
                              const phone = String(
                                  guestDetails?.phoneNumber || '',
                              )
                                  .replace(/\D/g, '')
                                  .slice(0, 11);
                              return phone.length >= 10 ? phone : '';
                          })()
                        : (() => {
                              const phone = String(
                                  initialValues?.phoneNumber || '',
                              )
                                  .replace(/\D/g, '')
                                  .slice(0, 11);
                              return phone.length >= 10 ? phone : '';
                          })(),
                email:
                    mode === 'update'
                        ? guestDetails?.email || ''
                        : initialValues?.email || '',
                startDate:
                    mode === 'update' && guestDetails?.startDate
                        ? format(
                              new Date(guestDetails?.startDate),
                              'yyyy-MM-dd',
                          )
                        : initialValues?.startDate
                          ? initialValues.startDate
                          : date
                            ? format(new Date(date), 'yyyy-MM-dd')
                            : '',
                endDate:
                    mode === 'update' && guestDetails?.endDate
                        ? format(new Date(guestDetails?.endDate), 'yyyy-MM-dd')
                        : initialValues?.endDate
                          ? initialValues.endDate
                          : date
                            ? format(new Date(date), 'yyyy-MM-dd')
                            : '',
                secondGuestFullName:
                    mode === 'update'
                        ? guestDetails?.secondGuestFullName || ''
                        : initialValues?.secondGuestFullName || '',
                secondGuestPhoneNumber:
                    mode === 'update'
                        ? (() => {
                              const phone = String(
                                  guestDetails?.secondGuestPhoneNumber || '',
                              )
                                  .replace(/\D/g, '')
                                  .slice(0, 11);
                              return phone.length >= 10 ? phone : '';
                          })()
                        : (() => {
                              const phone = String(
                                  initialValues?.secondGuestPhoneNumber || '',
                              )
                                  .replace(/\D/g, '')
                                  .slice(0, 11);
                              return phone.length >= 10 ? phone : '';
                          })(),
                secondGuestType:
                    mode === 'update'
                        ? guestDetails?.secondGuestType || 'adult'
                        : initialValues?.secondGuestType || 'adult',
                startTime:
                    mode === 'update'
                        ? (guestDetails?.startTime as string) || ''
                        : initialValues?.startTime || '',
                endTime:
                    mode === 'update'
                        ? (guestDetails?.endTime as string) || ''
                        : initialValues?.endTime || '',
                amountPaid:
                    (mode === 'update' && guestDetails?.isComplimentary) ||
                    (mode === 'add' && initialValues?.isComplimentary)
                        ? 0
                        : mode === 'update'
                          ? Number(guestDetails?.amountPaid || 0)
                          : Number(initialValues?.amountPaid || 0),
                outstanding:
                    mode === 'update'
                        ? Number(guestDetails?.outstanding || 0)
                        : Number(initialValues?.outstanding || 0),
                paymentMethod:
                    mode === 'update'
                        ? guestDetails?.paymentMethod || ''
                        : initialValues?.paymentMethod || '',
                numberOfGuests:
                    mode === 'update'
                        ? guestDetails?.numberOfGuests || 1
                        : initialValues?.numberOfGuests || 1,
                isComplimentary:
                    mode === 'update'
                        ? guestDetails?.isComplimentary || false
                        : initialValues?.isComplimentary || false,
                isVoid:
                    mode === 'update'
                        ? guestDetails?.isVoid || false
                        : initialValues?.isVoid || false,
                isCheckedIn:
                    mode === 'update'
                        ? guestDetails?.isCheckedIn || false
                        : initialValues?.isCheckedIn || false,
                isCheckedOut:
                    mode === 'update'
                        ? guestDetails?.isCheckedOut || false
                        : initialValues?.isCheckedOut || false,
                voidReason:
                    mode === 'update'
                        ? guestDetails?.voidReason || ''
                        : initialValues?.voidReason || '',
                discountType:
                    mode === 'update'
                        ? guestDetails?.discountType || undefined
                        : initialValues?.discountType || undefined,
                discountValue:
                    mode === 'update'
                        ? guestDetails?.discountValue || 0
                        : initialValues?.discountValue || 0,
                discountReason:
                    mode === 'update'
                        ? guestDetails?.discountReason || ''
                        : initialValues?.discountReason || '',
                gender:
                    mode === 'update'
                        ? guestDetails?.gender || ''
                        : initialValues?.gender || '',
                dateOfBirth:
                    mode === 'update'
                        ? toDateInputValue(guestDetails?.dateOfBirth)
                        : initialValues?.dateOfBirth
                          ? toDateInputValue(initialValues.dateOfBirth)
                          : '',
                nationality:
                    mode === 'update'
                        ? guestDetails?.nationality || ''
                        : initialValues?.nationality || '',
                address:
                    mode === 'update'
                        ? guestDetails?.address || ''
                        : initialValues?.address || '',
                purposeOfVisit:
                    mode === 'update'
                        ? guestDetails?.purposeOfVisit || ''
                        : initialValues?.purposeOfVisit || '',
                loyaltyTier:
                    mode === 'update'
                        ? guestDetails?.loyaltyTier || ''
                        : initialValues?.loyaltyTier || '',
                loyaltyPoints:
                    mode === 'update'
                        ? (guestDetails?.loyaltyPoints ?? undefined)
                        : (initialValues?.loyaltyPoints ?? undefined),
                eligibleForReward:
                    mode === 'update'
                        ? (guestDetails?.eligibleForReward ?? undefined)
                        : (initialValues?.eligibleForReward ?? undefined),
                birthday:
                    mode === 'update'
                        ? toDateInputValue(guestDetails?.birthday)
                        : initialValues?.birthday
                          ? toDateInputValue(initialValues.birthday)
                          : '',
                feedbackNotes:
                    mode === 'update'
                        ? guestDetails?.feedbackNotes || ''
                        : initialValues?.feedbackNotes || '',
                customerType:
                    mode === 'update'
                        ? guestDetails?.customerType || ''
                        : initialValues?.customerType || '',
                emailConsent:
                    mode === 'update'
                        ? (guestDetails?.emailConsent ?? undefined)
                        : (initialValues?.emailConsent ?? undefined),
                preferredContactMethod:
                    mode === 'update'
                        ? guestDetails?.preferredContactMethod || ''
                        : initialValues?.preferredContactMethod || '',
                mode: mode,
            }));
        }
    }, [guestDetails, date, roomType, roomTypes, mode, initialValues]);

    return {
        formData,
        setFormData,
        errors,
        setErrors,
    };
};
