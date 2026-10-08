'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useCreateReservation } from '@/components/reservations/dashboard/create-reservation/useCreateReservation';

export default function ReservationHeader() {
    const { openModal, CreateReservationFlow } = useCreateReservation();

    return (
        <div className="flex items-center justify-between">
            <PageHeader>
                <PageHeadertitle
                    title="Reservation Overview"
                    subtitle="All details about the table reservations"
                />
            </PageHeader>

            <Button
                className="bg-orion-blue hover:bg-orion-blue py-4 px-9 h-12 rounded-md"
                onClick={openModal}
            >
                Create Reservation
            </Button>

            {CreateReservationFlow}
        </div>
    );
}
