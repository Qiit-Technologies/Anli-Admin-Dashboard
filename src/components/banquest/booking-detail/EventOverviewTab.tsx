'use client';

import { BookingDetailModel } from '@/components/banquest/booking-detail/booking-detail-model';
import {
    CostFooter,
    DetailCard,
    DetailFieldGrid,
    LineItemsList,
} from '@/components/banquest/booking-detail/DetailCard';
import {
    amenityLineItems,
    menuLineItems,
} from '@/components/banquest/booking-detail/booking-detail-model';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';

export default function EventOverviewTab({
    model,
    editBase,
}: {
    model: BookingDetailModel;
    editBase: string;
}) {
    const { booking } = model;
    const menuLines = menuLineItems(booking);
    const amenityLines = amenityLineItems(booking);

    const foodPricing = model.pricing.foodSubtotal;
    const amenityPricing = model.pricing.amenitiesSubtotal;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DetailCard title="Event Information" editHref={`${editBase}?step=1`}>
                <DetailFieldGrid
                    rows={[
                        { label: 'Event Name', value: booking.eventName },
                        { label: 'Event Type', value: booking.eventType },
                        { label: 'Event Date', value: model.eventDateLabel },
                        { label: 'Event Time', value: model.eventTimeLabel },
                        { label: 'Venue', value: booking.eventVenue },
                        {
                            label: 'Guest Count',
                            value: model.guestCountLabel,
                        },
                        {
                            label: 'Set up',
                            value: booking.setupTime || '—',
                        },
                        {
                            label: 'Event Theme',
                            value:
                                booking.eventCategory ||
                                booking.eventDescription ||
                                '—',
                        },
                    ]}
                />
                {model.vipNotes ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-muted-foreground mb-1">
                            Customer Notes
                        </p>
                        <p className="text-sm font-medium text-gray-900 break-words whitespace-pre-wrap">
                            {model.vipNotes}
                        </p>
                    </div>
                ) : null}
            </DetailCard>

            <DetailCard title="Customer/ Event contact" editHref={`${editBase}?step=2`}>
                <DetailFieldGrid
                    rows={[
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
                        {
                            label: 'Company',
                            value: booking.customerCompany || '—',
                        },
                        {
                            label: 'Address',
                            value: booking.eventVenue,
                            fullWidth: true,
                        },
                    ]}
                />
            </DetailCard>

            <DetailCard title="Menu summary" editHref={`${editBase}?step=3`}>
                <LineItemsList items={menuLines} />
                <CostFooter
                    subtotalLabel="SubTotal(Food)"
                    subtotal={formatMoney(foodPricing)}
                    serviceCharge={formatMoney(
                        (foodPricing * 5) / 100,
                    )}
                    vat={formatMoney(
                        ((foodPricing + (foodPricing * 5) / 100) * 7.5) / 100,
                    )}
                    total={formatMoney(
                        foodPricing +
                            (foodPricing * 5) / 100 +
                            ((foodPricing + (foodPricing * 5) / 100) * 7.5) /
                                100,
                    )}
                />
            </DetailCard>

            <DetailCard title="Amenities and Rentals" editHref={`${editBase}?step=4`}>
                <LineItemsList items={amenityLines} />
                <CostFooter
                    subtotalLabel="SubTotal"
                    subtotal={formatMoney(amenityPricing)}
                    serviceCharge={formatMoney(
                        (amenityPricing * 5) / 100,
                    )}
                    vat={formatMoney(
                        ((amenityPricing + (amenityPricing * 5) / 100) * 7.5) /
                            100,
                    )}
                    total={formatMoney(
                        amenityPricing +
                            (amenityPricing * 5) / 100 +
                            ((amenityPricing + (amenityPricing * 5) / 100) *
                                7.5) /
                                100,
                    )}
                />
            </DetailCard>
        </div>
    );
}
