'use client';

import React, { useState } from 'react';
import { CreateReservationModal } from './CreateReservationModal';
import { ReservationSuccessModal } from './ReservationSuccessModal';
import { DashboardReservationFormData } from './schemas/dashboardReservation.schema';
import { createTableReservation } from '@/app/actions/reservation';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { useSWRConfig } from 'swr';

interface UseCreateReservationOptions {
    onSuccess?: () => void;
}

export function useCreateReservation(options?: UseCreateReservationOptions) {
    const { mutate } = useSWRConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reservationDate, setReservationDate] = useState('');
    const [customerName, setCustomerName] = useState('');

    const openModal = () => setIsModalOpen(true);

    const handleSubmitRequest = async (
        data: DashboardReservationFormData,
        formattedName: string,
        formattedDate: string,
    ) => {
        setCustomerName(formattedName);
        setReservationDate(formattedDate);
        setIsSubmitting(true);

        try {
            const payload = {
                ...data.customerDetails,
                ...data.reservationDateTime,
                ...data.paymentMethod,
                guestNumber: Number(data.reservationDateTime.guestNumber),
            };

            const response = await createTableReservation(payload);

            if (response.success) {
                // Refresh reservation lists and table availability
                mutate(
                    (key) =>
                        key === '/table-reservations' ||
                        (Array.isArray(key) &&
                            key[0] === '/table-reservations'),
                );
                mutate('reservation-spaces');

                // First close the creation modal
                setIsModalOpen(false);

                // Then show the success modal after the closing animation finished
                setTimeout(() => {
                    setShowSuccess(true);
                    setIsSubmitting(false);
                }, 400);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.message || 'Failed to create reservation'}
                        type="error"
                    />
                ));
                setIsSubmitting(false);
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred"
                    type="error"
                />
            ));
            setIsSubmitting(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        setReservationDate('');
        setCustomerName('');
        options?.onSuccess?.();
    };

    const CreateReservationFlow = React.useMemo(
        () => (
            <>
                <CreateReservationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmitRequest={handleSubmitRequest}
                    isLoading={isSubmitting}
                />

                <ReservationSuccessModal
                    isOpen={showSuccess}
                    onClose={handleSuccessClose}
                    reservationDate={reservationDate}
                    customerName={customerName}
                />
            </>
        ),
        [
            isModalOpen,
            isSubmitting,
            showSuccess,
            reservationDate,
            customerName,
            handleSubmitRequest,
            handleSuccessClose,
        ],
    );

    return {
        openModal,
        CreateReservationFlow,
        isModalOpen,
        showSuccess,
    };
}
