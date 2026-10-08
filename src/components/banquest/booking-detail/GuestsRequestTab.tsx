'use client';

import { DetailCard, DetailFieldGrid } from '@/components/banquest/booking-detail/DetailCard';
import { BookingDetailModel } from '@/components/banquest/booking-detail/booking-detail-model';

export default function GuestsRequestTab({
    model,
    editBase,
}: {
    model: BookingDetailModel;
    editBase: string;
}) {
    const { booking } = model;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DetailCard title="Guest requests" editHref={`${editBase}?step=2`}>
                <DetailFieldGrid
                    rows={[
                        {
                            label: 'Guest Count',
                            value: model.guestCountLabel,
                        },
                        {
                            label: 'Contact Name',
                            value: model.customerDisplayName,
                        },
                        {
                            label: 'Phone Number',
                            value: booking.customerPhoneNumber,
                        },
                        {
                            label: 'Email Address',
                            value: booking.customerEmailAddress,
                        },
                    ]}
                />
                {model.vipNotes ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="mb-3 text-sm font-semibold text-gray-900">
                            Customer Notes
                        </p>
                        <ol className="list-decimal space-y-3 pl-5 text-sm font-medium text-gray-900">
                            {[model.vipNotes, model.vipNotes, model.vipNotes].map(
                                (note, index) => (
                                    <li
                                        key={`note-${index}`}
                                        className="break-words whitespace-pre-wrap"
                                    >
                                        {note}
                                    </li>
                                ),
                            )}
                        </ol>
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                        No special guest requests recorded for this booking.
                    </p>
                )}
            </DetailCard>

            <DetailCard title="Event coordination" editHref={`${editBase}?step=1`}>
                <DetailFieldGrid
                    rows={[
                        { label: 'Event Name', value: booking.eventName },
                        { label: 'Venue', value: booking.eventVenue },
                        { label: 'Event Date', value: model.eventDateLabel },
                        { label: 'Event Time', value: model.eventTimeLabel },
                        {
                            label: 'Setup style',
                            value: booking.menuType || 'Banquet Style',
                        },
                    ]}
                />
            </DetailCard>
        </div>
    );
}
