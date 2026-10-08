import React from 'react';
import ReservationHeader from '@/components/reservation/ReservationHeader';
import ReservationMap from '@/components/reservation/ReservationMap';
import { ReservationForm } from '@/components/reservation/form';
import { fetchHotelByExternalId } from '@/app/actions/hotel';
import { redirect, notFound } from 'next/navigation';

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

export default async function ReservationPage({ params }: { params: Promise<{ hotelId: string, hotelName: string }> }) {
    const { hotelId, hotelName } = await params;
    const hotelResponse = await fetchHotelByExternalId(hotelId);
    
    // Trigger 404 if hotel not found or if there's an error fetching it
    if (!hotelResponse || hotelResponse.error || !hotelResponse.data) {
        notFound();
    }

    const hotel = hotelResponse.data;

    const correctSlug = slugify(hotel.name);
    if (hotelName !== correctSlug) {
        redirect(`/${correctSlug}/${hotelId}/reservation`);
    }

    return (
        <>
            <ReservationHeader hotelName={hotel?.name} hotelLogo={hotel?.coverImage} />
            <ReservationForm hotelId={hotelId} />
            <ReservationMap />
        </>
    );
}
