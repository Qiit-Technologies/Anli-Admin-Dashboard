import { createBooking } from '@/app/actions/membership';
import Toast from '@/components/toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useIdleLogoutExemption } from '@/context/IdleLogoutContext';
import useBookingStore from '@/store/useBookingStore';
import {
    CreateBookingDto,
    Facility,
    Member,
} from '@/types/membership/membership';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import BookDateTime from './bookDateTime';
import SearchMember from './searchMember';
import SelectFacility from './selectFacility';
import Summary from './summary';
import { BookingModalProps } from './types';

const steps = [
    'Search Member',
    'Select Facility',
    'Book Date & Time',
    'Summary',
];

const BookingModal: React.FC<BookingModalProps & { open: boolean }> = ({
    onClose,
    open,
}) => {
    const {
        member,
        facility,
        dateTime,
        currentStep,
        isLoading,
        setMember,
        setFacility,
        setDateTime,
        setCurrentStep,
        setIsLoading,
        resetBookingData,
    } = useBookingStore();

    useIdleLogoutExemption(open);

    useEffect(() => {
        if (open) {
            resetBookingData();
        }
    }, [open, resetBookingData]);

    const handleClose = () => {
        resetBookingData();
        onClose();
    };

    const handleMemberSelect = (member: Member | null) => {
        setMember(member);
    };

    const handleFacilitySelect = (facility: Facility | null) => {
        setFacility(facility);
    };

    const handleDateTimeSelect = (
        dateTime: { date: string; time: string; duration: number } | null,
    ) => {
        setDateTime(dateTime);
    };

    const handleConfirmBooking = async () => {
        if (!member || !facility || !dateTime) {
            toast.custom(() => (
                <Toast
                    title="Booking Failed"
                    description="Please complete all required fields"
                    type="error"
                />
            ));
            return;
        }

        if (!dateTime.date || !dateTime.time) {
            toast.custom(() => (
                <Toast
                    title="Booking Failed"
                    description="Please select both date and time"
                    type="error"
                />
            ));
            return;
        }

        setIsLoading(true);

        try {
            const dateTimeString = `${dateTime.date}T${dateTime.time}:00`;
            const startDateTime = new Date(dateTimeString);

            if (isNaN(startDateTime.getTime())) {
                toast.custom(() => (
                    <Toast
                        title="Booking Failed"
                        description="Invalid date or time format. Please try again."
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            const endDateTime = new Date(
                startDateTime.getTime() + dateTime.duration * 60 * 60 * 1000,
            );

            const now = new Date();
            if (startDateTime <= now) {
                toast.custom(() => (
                    <Toast
                        title="Booking Failed"
                        description="Cannot create bookings in the past"
                        type="error"
                    />
                ));
                setIsLoading(false);
                return;
            }

            const bookingPayload: CreateBookingDto = {
                memberId: member.id,
                facilityId: facility.id,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
            };
            const result = await createBooking(bookingPayload);

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Booking Failed"
                        description={result.error}
                        type="error"
                    />
                ));
                return;
            }

            mutate('/membership/booking');
            if (member) {
                mutate(`/membership/booking/member/${member.id}`);
            }

            toast.custom(() => (
                <Toast
                    title="Booking Confirmed"
                    description={
                        result.message ||
                        'The facility has been successfully booked for the member.'
                    }
                    type="success"
                />
            ));

            resetBookingData();
            onClose();
        } catch (error: any) {
            let errorMessage =
                'There was an error creating the booking. Please try again.';

            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = error.message as string;
            }

            toast.custom(() => (
                <Toast
                    title="Booking Failed"
                    description={errorMessage}
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepComponent = () => {
        switch (currentStep) {
            case 0:
                return <SearchMember onMemberSelect={handleMemberSelect} />;
            case 1:
                return (
                    <SelectFacility onFacilitySelect={handleFacilitySelect} />
                );
            case 2:
                return (
                    <BookDateTime
                        onDateTimeSelect={handleDateTimeSelect}
                        selectedDateTime={dateTime}
                    />
                );
            case 3:
                return (
                    <Summary
                        bookingData={{ member, facility, dateTime }}
                        onConfirmBooking={handleConfirmBooking}
                        isLoading={isLoading}
                    />
                );
            default:
                return null;
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return member !== null;
            case 1:
                return facility !== null;
            case 2:
                return dateTime !== null;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleStepChange = () => {
        if (currentStep < 3 && canProceed()) {
            setCurrentStep(currentStep + 1);
        } else if (currentStep < 3) {
            toast.custom(() => (
                <Toast
                    title="Step Incomplete"
                    description="Please complete the current step before proceeding."
                    type="error"
                />
            ));
        }
    };

    const handleStepClick = (stepIndex: number) => {
        if (stepIndex <= currentStep) {
            setCurrentStep(stepIndex);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="w-full max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-md font-bold text-[#5B6469] mb-1">
                        New booking form
                    </DialogTitle>
                    <DialogDescription className="text-[#989C9D] text-sm font-normal">
                        Please enter the following details to book a guest for
                        our facility
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mb-8 px-6">
                    <div className="absolute top-4 left-8 right-8 h-1 bg-gray-200 rounded-full z-0 shadow-sm">
                        <div
                            className="h-1 bg-gradient-to-r from-[#FF872A] to-[#FF6B00] rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{
                                width: `${(currentStep / (steps.length - 1)) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                        {steps.map((label, index) => {
                            const alignment =
                                index === 0
                                    ? 'items-start'
                                    : index === steps.length - 1
                                      ? 'items-end'
                                      : 'items-center';

                            const textAlignment =
                                index === 0
                                    ? 'text-left'
                                    : index === steps.length - 1
                                      ? 'text-right'
                                      : 'text-center';

                            const isCompleted = index < currentStep;
                            const isCurrent = currentStep === index;
                            //const isFuture = index > currentStep;

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col ${alignment} cursor-pointer group transition-all duration-200 hover:scale-105`}
                                    onClick={() => handleStepClick(index)}
                                >
                                    <div
                                        className={`relative w-8 h-8 rounded-full z-10 flex items-center justify-center transition-all duration-300 shadow-lg ${
                                            isCurrent
                                                ? 'bg-gradient-to-br from-[#FF872A] to-[#FF6B00] ring-4 ring-[#FF872A]/20 scale-110'
                                                : isCompleted
                                                  ? 'bg-gradient-to-br from-green-500 to-green-600 ring-2 ring-green-500/20'
                                                  : 'bg-white border-2 border-gray-300 group-hover:border-gray-400'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <span
                                                className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-gray-500'}`}
                                            >
                                                {index + 1}
                                            </span>
                                        )}

                                        {isCurrent && (
                                            <div className="absolute inset-0 rounded-full bg-[#FF872A] animate-ping opacity-20"></div>
                                        )}
                                    </div>

                                    <span
                                        className={`text-sm mt-3 ${textAlignment} transition-all duration-200 max-w-20 ${
                                            isCurrent
                                                ? 'text-[#2F1802] font-semibold'
                                                : isCompleted
                                                  ? 'text-green-700 font-medium'
                                                  : 'text-gray-500 group-hover:text-gray-600'
                                        }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-8 px-2">{renderStepComponent()}</div>

                <div className="flex gap-4 px-2">
                    {currentStep > 0 && (
                        <button
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
                            onClick={() => setCurrentStep(currentStep - 1)}
                        >
                            Back
                        </button>
                    )}
                    {currentStep < steps.length - 1 && (
                        <button
                            className={`px-6 py-3 rounded-lg flex-1 cursor-pointer transition-all duration-200 font-medium shadow-sm ${
                                canProceed()
                                    ? 'bg-gradient-to-r from-[#007BFF] to-[#0056CC] text-white hover:from-[#0056CC] hover:to-[#004BB5] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                            onClick={handleStepChange}
                            disabled={!canProceed()}
                        >
                            Continue
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
