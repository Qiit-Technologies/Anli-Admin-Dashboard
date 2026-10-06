'use client';

import { getAllBanquetBookings } from '@/app/actions/banquet-booking';
import BrandButton from '@/components/common/Button';
import { SelectField } from '@/components/common/Form';
import { mapApiBookingToForm } from '@/components/banquest/utils/build-booking-payload';
import { BookingForm } from '@/components/banquest/types';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

export interface AssignAmenityFormProps {
    bookingId: string;
}

const zodSchema = z.object({
    bookingId: z.string().min(1, 'Select an event booking'),
});

function bookingLabel(booking: BookingForm): string {
    const date = booking.eventDate || 'No date';
    return `${booking.eventName} — ${date} — ${booking.customerName}`;
}

const AssignAmenityToEventForm = ({
    onAssigned,
}: {
    onAssigned?: () => void;
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [bookingId, setBookingId] = useState('');

    const { data, isLoading } = useSWR('/banquet/bookings', getAllBanquetBookings);

    const bookings = useMemo((): BookingForm[] => {
        if (!data || typeof data !== 'object' || 'error' in data) return [];
        if (!Array.isArray(data)) return [];
        return data.map(
            (row) =>
                mapApiBookingToForm(row as Record<string, unknown>) as BookingForm,
        );
    }, [data]);

    const bookingOptions = useMemo(
        () =>
            bookings.map((b) => ({
                value: String(b.id),
                label: bookingLabel(b),
            })),
        [bookings],
    );

    const selectedBooking = bookings.find((b) => String(b.id) === bookingId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = zodSchema.safeParse({ bookingId });
        if (!result.success) {
            setLoading(false);
            return;
        }

        onAssigned?.();
        router.push(`/banquet/bookings/${bookingId}/edit?step=4`);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Choose the event booking this rental is for. You will add or
                update amenities on that booking&apos;s amenities step.
            </p>

            <SelectField
                id="bookingId"
                name="bookingId"
                label="Event booking"
                value={bookingId}
                onValueChange={setBookingId}
                options={bookingOptions}
                placeholder={
                    isLoading ? 'Loading bookings…' : 'Select event booking'
                }
                disabled={isLoading || bookingOptions.length === 0}
                required
            />

            {selectedBooking && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                    <p>
                        <span className="text-muted-foreground">Venue: </span>
                        <span className="font-medium">
                            {selectedBooking.eventVenue}
                        </span>
                    </p>
                    <p>
                        <span className="text-muted-foreground">Contact: </span>
                        <span className="font-medium">
                            {selectedBooking.customerPhoneNumber}
                        </span>
                    </p>
                </div>
            )}

            {bookingOptions.length === 0 && !isLoading && (
                <p className="text-sm text-destructive">
                    No bookings yet. Create a booking first, then assign amenities.
                </p>
            )}

            <div className="flex justify-end pt-2">
                <BrandButton
                    loading={loading}
                    disabled={!bookingId || loading || isLoading}
                    type="submit"
                    className="bg-orion-blue hover:bg-orion-blue/90 w-full h-12"
                >
                    Continue to assign amenities
                </BrandButton>
            </div>
        </form>
    );
};

export default AssignAmenityToEventForm;
