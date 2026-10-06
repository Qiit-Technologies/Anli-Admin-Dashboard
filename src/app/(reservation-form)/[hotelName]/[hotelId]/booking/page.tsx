import React from 'react';
import BookingHeader from '@/components/booking/BookingHeader';
import BookingFooter from '@/components/booking/BookingFooter';
import BookingForm from '@/components/booking/form/BookingForm';
import { fetchHotelByExternalId } from '@/app/actions/hotel';
import { getRoomByHotelIdForPublic } from '@/app/actions/room';
import { getHotelDisplayAddress } from '@/components/booking/hotel-info.utils';
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

export default async function BookingPage({
    params,
}: {
    params: Promise<{ hotelId: string; hotelName: string }>;
}) {
    const { hotelId, hotelName } = await params;
    const hotelResponse = await fetchHotelByExternalId(hotelId);

    // Trigger 404 if hotel not found or if there's an error fetching it
    if (!hotelResponse || hotelResponse.error || !hotelResponse.data) {
        notFound();
    }

    const hotel = hotelResponse.data;

    const roomsResponse = await getRoomByHotelIdForPublic(hotelId);
    const roomCount = Array.isArray(roomsResponse?.data)
        ? roomsResponse.data.length
        : 0;

    const correctSlug = slugify(hotel.name);
    if (hotelName !== correctSlug) {
        redirect(`/${correctSlug}/${hotelId}/booking`);
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col font-sans antialiased">
            <BookingHeader
                hotelName={hotel?.name}
                hotelAddress={getHotelDisplayAddress(hotel)}
                hotelLogo={hotel?.coverImage}
            />

            <div className="flex-1 py-6 md:py-8 space-y-6 md:space-y-8">
                <BookingForm hotel={hotel} roomCount={roomCount} />
            </div>

            <BookingFooter />
        </main>
    );
}
