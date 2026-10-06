'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLayout, Step } from './index';
import SuccessModal from './SuccessModal';
import { createPublicTableReservation } from '@/app/actions/reservation';
import toast from 'react-hot-toast';
import {
    CustomerDetailsForm,
    ReservationDateTimeForm,
    PaymentMethodForm,
} from './steps';
import { reservationFormSchema, ReservationFormData } from './schemas';
import { customerAuthService } from '@/services/customerAuth.service';
import { useEffect } from 'react';

const STEPS: Step[] = [
    { id: 1, label: 'Customer Details' },
    { id: 2, label: 'RSVP Date & time' },
    { id: 3, label: 'Payment method' },
];

const STEP_FIELDS: Record<number, (keyof ReservationFormData)[]> = {
    1: ['customerDetails'],
    2: ['reservationDateTime'],
    3: ['paymentMethod'],
};

export default function ReservationForm({ hotelId }: { hotelId?: string }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ReservationFormData>({
        resolver: zodResolver(reservationFormSchema),
        mode: 'onChange',
        defaultValues: {
            customerDetails: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
            },
            reservationDateTime: {
                date: '',
                time: '',
                tableType: '',
                reservationType: undefined,
                guestNumber: '',
                foodType: '',
                foodQuantity: '',
            },
            paymentMethod: {
                paymentOption: '',
                accountToPay: '',
                totalCost: '234.980.000',
            },
        },
    });

    useEffect(() => {
        const user = customerAuthService.getUser();
        if (user) {
            form.reset({
                ...form.getValues(),
                customerDetails: {
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phoneNumber || '',
                },
            });
        }
    }, [form]);

    const { trigger, getValues, handleSubmit } = form;

    const validateCurrentStep = async (): Promise<boolean> => {
        const fieldsToValidate = STEP_FIELDS[currentStep];
        const result = await trigger(fieldsToValidate);
        return result;
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();

        if (!isValid) {
            return;
        }

        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit(onSubmit, (errors) => {
                console.error('Validation errors:', errors);
                const errorMessages = Object.entries(errors)
                    .map(([key, value]) => {
                        if (
                            typeof value === 'object' &&
                            value !== null &&
                            'message' in value
                        ) {
                            return `${key}: ${value.message}`;
                        }
                        return key;
                    })
                    .join(', ');
                toast.error(`Please fix the following: ${errorMessages}`);
            })();
        }
    };

    const onSubmit = async (data: ReservationFormData) => {
        if (!hotelId) {
            toast.error('Hotel ID is missing');
            return;
        }

        setIsSubmitting(true);
        const user = customerAuthService.getUser();
        const payload = {
            ...data.customerDetails,
            ...data.reservationDateTime,
            ...data.paymentMethod,
            guestNumber: Number(data.reservationDateTime.guestNumber),
            ...(user?.id && { customerId: user.id }),
        };
        const response = await createPublicTableReservation(payload, hotelId);
        setIsSubmitting(false);

        if (response.success) {
            setShowSuccessModal(true);
        } else {
            toast.error(response.message);
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        setCurrentStep(1);
        form.reset();
    };

    const formatReservationDate = () => {
        const date = getValues('reservationDateTime.date');
        if (date) {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: '2-digit',
                year: 'numeric',
            });
        }
        return '2th/ 09/2025';
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <CustomerDetailsForm form={form} />;
            case 2:
                return (
                    <ReservationDateTimeForm form={form} hotelId={hotelId} />
                );
            case 3:
                return <PaymentMethodForm form={form} hotelId={hotelId} />;
            default:
                return null;
        }
    };

    return (
        <>
            <FormLayout
                steps={STEPS}
                currentStep={currentStep}
                onPrevious={handlePrevious}
                onNext={handleNext}
                isFirstStep={currentStep === 1}
                isLastStep={currentStep === STEPS.length}
                isSubmitting={isSubmitting}
            >
                {renderStepContent()}
            </FormLayout>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleCloseModal}
                reservationDate={formatReservationDate()}
            />
        </>
    );
}
