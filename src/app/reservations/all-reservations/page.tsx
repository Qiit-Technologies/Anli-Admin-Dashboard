import AllReservationTable from '@/components/reservations/allReservations/AllReservationTable';
import Filters from '@/components/reservations/allReservations/Filters';
import OtherReservations from '@/components/reservations/allReservations/OtherReservations';
import ReservationHeader from '@/components/reservations/allReservations/ReservationHeader';
import Header from '@/components/reservations/layout/Header';
import React from 'react';

export default function AllReservations() {
    return (
        <main className="bg-[#F9FCFF] min-h-screen">
            <Header />

            <div className="p-6 flex flex-col gap-6">
                <ReservationHeader />
                <Filters />

                <AllReservationTable />

                <OtherReservations />
            </div>
        </main>
    );
}
