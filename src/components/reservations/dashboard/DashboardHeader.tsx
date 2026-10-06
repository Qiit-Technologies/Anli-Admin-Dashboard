'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import ShareReservationLinkModal from './ShareReservationLinkModal';
import { useCreateReservation } from './create-reservation/useCreateReservation';

/**
 * Dashboard Header with Create Reservation button.
 * Uses the useCreateReservation hook to handle the entire modal flow.
 */
export default function DashboardHeader({
    onMutation,
}: {
    onMutation?: () => void;
}) {
    const { user } = useUser();
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

    const { openModal, CreateReservationFlow } = useCreateReservation({
        onSuccess: onMutation,
    });

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <h1 className="font-semibold text-lg text-foreground tracking-tight leading-none">
                        Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        All details about the table reservations
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        className="border border-orion-blue text-orion-blue hover:text-orion-blue hover:bg-blue-50 px-6 h-12 rounded-md font-sm transition-colors"
                        onClick={() => setIsShareModalOpen(true)}
                    >
                        Customer Reservation Link
                    </button>

                    <Button
                        className="bg-orion-blue hover:bg-orion-blue py-4 px-9 h-12 rounded-md"
                        onClick={openModal}
                    >
                        Create Reservation
                    </Button>
                </div>
            </div>

            {CreateReservationFlow}

            {isShareModalOpen && (
                <ShareReservationLinkModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    hotelName={user?.hotel?.name || ''}
                    hotelId={user?.hotel?.id || ''}
                />
            )}
        </>
    );
}
