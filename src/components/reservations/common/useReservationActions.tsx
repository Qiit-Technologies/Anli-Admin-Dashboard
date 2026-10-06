'use client';

import React, { useState } from 'react';
import ReservationDetailsModal from './ReservationDetailsModal';
import CancelReservationModal from './CancelReservationModal';
import EditReservationModal, {
    EditReservationData,
} from './EditReservationModal';
import { Reservation } from '@/components/reservations/types';
import { mutate } from 'swr';
import {
    deleteTableReservation,
    updateTableReservation,
} from '@/app/actions/reservation';

interface UseReservationActionsOptions {
    onView?: (reservation: Reservation) => void;
    onEdit?: (reservation: Reservation) => void;
    onCancelSuccess?: (reservation: Reservation, reason: string) => void;
    onEditSuccess?: (
        reservation: Reservation,
        updates: EditReservationData,
    ) => void;
}

interface ReservationModalsProps {
    isViewModalOpen: boolean;
    setIsViewModalOpen: (open: boolean) => void;
    isCancelModalOpen: boolean;
    setIsCancelModalOpen: (open: boolean) => void;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (open: boolean) => void;
    selectedReservation: Reservation | null;
    isSubmitting: boolean;
    handleExtendReservation: (r: Reservation) => void;
    handleCancelReservation: (r: Reservation) => void;
    handleEditReservation: (r: Reservation) => void;
    handleConfirmCancel: (r: Reservation, reason: string) => void;
    handleSaveEdit: (r: Reservation, data: EditReservationData) => void;
}

const ReservationModals = ({
    isViewModalOpen,
    setIsViewModalOpen,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedReservation,
    isSubmitting,
    handleExtendReservation,
    handleCancelReservation,
    handleEditReservation,
    handleConfirmCancel,
    handleSaveEdit,
}: ReservationModalsProps) => (
    <>
        <ReservationDetailsModal
            open={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            reservation={selectedReservation}
            onExtendReservation={handleExtendReservation}
            onCancelReservation={handleCancelReservation}
            onEditReservation={handleEditReservation}
        />

        <CancelReservationModal
            open={isCancelModalOpen}
            onOpenChange={setIsCancelModalOpen}
            reservation={selectedReservation}
            onConfirmCancel={handleConfirmCancel}
        />

        <EditReservationModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            reservation={selectedReservation}
            onSave={handleSaveEdit}
            isLoading={isSubmitting}
        />
    </>
);

export function useReservationActions(options?: UseReservationActionsOptions) {
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Open View modal
    const handleView = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setIsViewModalOpen(true);
        options?.onView?.(reservation);
    };

    // Open Edit modal directly from table
    const handleEdit = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setIsEditModalOpen(true);
    };

    // From View modal -> Extend button
    const handleExtendReservation = (reservation: Reservation) => {
        setIsViewModalOpen(false);
        setSelectedReservation(reservation);
        setIsEditModalOpen(true);
    };

    // From View modal -> Cancel button
    const handleCancelReservation = (reservation: Reservation) => {
        setIsViewModalOpen(false);
        setSelectedReservation(reservation);
        setIsCancelModalOpen(true);
    };

    // From View modal -> Edit button
    const handleEditReservation = (reservation: Reservation) => {
        setIsViewModalOpen(false);
        setSelectedReservation(reservation);
        setIsEditModalOpen(true);
        options?.onEdit?.(reservation);
    };

    // Confirm cancel
    const handleConfirmCancel = async (
        reservation: Reservation,
        reason: string,
    ) => {
        setIsSubmitting(true);
        try {
            const { error } = await deleteTableReservation(reservation.id);
            if (error) {
                alert(error);
            } else {
                mutate('/table-reservations');
                options?.onCancelSuccess?.(reservation, reason);
                setIsCancelModalOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to cancel reservation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Save edit
    const handleSaveEdit = async (
        reservation: Reservation,
        updates: EditReservationData,
    ) => {
        setIsSubmitting(true);
        try {
            const mappedUpdates = {
                ...updates,
                date: updates.reservationDate,
                time: updates.reservationTime,
            };
            const { error } = await updateTableReservation(
                reservation.id,
                mappedUpdates,
            );
            if (error) {
                alert(error);
            } else {
                mutate('/table-reservations');
                if (options?.onEditSuccess) {
                    await options.onEditSuccess(reservation, updates);
                }
                // Add a very small delay to ensure the loader is visible to the user
                await new Promise((resolve) => setTimeout(resolve, 800));
                setIsEditModalOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to save edit:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reservationModals = (
        <ReservationModals
            isViewModalOpen={isViewModalOpen}
            setIsViewModalOpen={setIsViewModalOpen}
            isCancelModalOpen={isCancelModalOpen}
            setIsCancelModalOpen={setIsCancelModalOpen}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            selectedReservation={selectedReservation}
            isSubmitting={isSubmitting}
            handleExtendReservation={handleExtendReservation}
            handleCancelReservation={handleCancelReservation}
            handleEditReservation={handleEditReservation}
            handleConfirmCancel={handleConfirmCancel}
            handleSaveEdit={handleSaveEdit}
        />
    );

    return {
        handleView,
        handleEdit,
        reservationModals,
        selectedReservation,
        isViewModalOpen,
        isCancelModalOpen,
        isEditModalOpen,
    };
}
