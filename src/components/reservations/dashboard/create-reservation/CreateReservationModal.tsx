'use client';

import React, { useState } from 'react';
import { DefaultValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import { DashboardStepIndicator, type Step } from './DashboardStepIndicator';
import { DashboardCustomerDetailsForm } from './steps/DashboardCustomerDetailsForm';
import { DashboardReservationDateTimeForm } from './steps/DashboardReservationDateTimeForm';
import { DashboardPaymentMethodForm } from './steps/DashboardPaymentMethodForm';
import {
    dashboardReservationFormSchema,
    DashboardReservationFormData,
} from './schemas/dashboardReservation.schema';

interface CreateReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitRequest: (
        data: DashboardReservationFormData,
        customerName: string,
        reservationDate: string,
    ) => void;
    isLoading?: boolean;
}

const STEPS: Step[] = [
    { id: 1, label: 'Customer\nDetails' },
    { id: 2, label: 'RSV Date &\ntime' },
    { id: 3, label: 'Payment\nmethod' },
];

const STEP_FIELDS: Record<number, (keyof DashboardReservationFormData)[]> = {
    1: ['customerDetails'],
    2: ['reservationDateTime'],
    3: ['paymentMethod'],
};

const defaultValues: DefaultValues<DashboardReservationFormData> = {
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
        guestNumber: '',
        foodType: '',
    },
    paymentMethod: {
        paymentOption: '',
        accountToPay: '',
    },
};

export function CreateReservationModal({
    isOpen,
    onClose,
    onSubmitRequest,
    isLoading = false,
}: CreateReservationModalProps) {
    useIdleLogoutExemption(isOpen);

    const [currentStep, setCurrentStep] = useState(1);

    const form = useForm<
        DashboardReservationFormData,
        unknown,
        DashboardReservationFormData
    >({
        resolver: zodResolver(dashboardReservationFormSchema),
        mode: 'onChange',
        defaultValues,
    });

    const { trigger, getValues, handleSubmit, reset } = form;

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
            // Not on last step yet, go to next step
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit((data) => {
                const name = getCustomerName();
                const date = formatReservationDate();
                onSubmitRequest(data, name, date);
            })();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
            // Reset state after a small delay to prevent visual jump
            setTimeout(() => {
                setCurrentStep(1);
                reset();
            }, 300);
        }
    };

    const formatReservationDate = () => {
        const date = getValues('reservationDateTime.date');
        if (date) {
            const dateObj = new Date(date);
            return dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        }
        return '12th April 2026';
    };

    const getCustomerName = () => {
        const firstName = getValues('customerDetails.firstName');
        const lastName = getValues('customerDetails.lastName');
        return firstName || lastName
            ? `${firstName} ${lastName}`.trim()
            : 'Monday Sunday';
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <DashboardCustomerDetailsForm form={form} />;
            case 2:
                return <DashboardReservationDateTimeForm form={form} />;
            case 3:
                return <DashboardPaymentMethodForm form={form} />;
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent
                    className="max-w-[665px] w-full max-h-[90vh] flex flex-col rounded-2xl p-0 [&>button]:hidden"
                    style={{
                        borderRadius: '16px',
                    }}
                >
                    <div className="pt-6 pr-[23px] pb-6 pl-[23px] border-b border-[#EAECF0]">
                        <DialogHeader className="relative">
                            <button
                                onClick={handleClose}
                                className="absolute right-0 top-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <X className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </button>
                            <DialogTitle className="text-lg font-semibold text-[#101828]">
                                Create new reservation
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#667085]">
                                Enter every details to register a new
                                reservation
                            </DialogDescription>
                        </DialogHeader>
 
                        <div className="mt-6">
                            <DashboardStepIndicator
                                steps={STEPS}
                                currentStep={currentStep}
                            />
                        </div>
                    </div>
 
                    <div className="flex-1 overflow-y-auto pt-8 pr-[23px] pb-8 pl-[23px]">
                        {renderStepContent()}
                    </div>

                    <div className="pr-[23px] pb-6 pl-[23px] pt-6 border-t border-[#D6D6D6] bg-white rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentStep === 1 || isLoading}
                                className={`
                                    h-[48px] w-[140px] rounded-lg text-sm font-medium transition-all border border-[#CBCED0]
                                    ${currentStep === 1 || isLoading ? 'cursor-not-allowed opacity-50' : 'text-[#344054] hover:bg-gray-50'}
                                `}
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isLoading}
                                className={`h-[48px] min-w-[180px] bg-[#007BFF] text-white rounded-lg text-sm font-semibold transition-all hover:bg-[#0069d9] flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                        <span>Processing...</span>
                                    </>
                                ) : currentStep === STEPS.length ? (
                                    'Submit'
                                ) : (
                                    'Next'
                                )}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
