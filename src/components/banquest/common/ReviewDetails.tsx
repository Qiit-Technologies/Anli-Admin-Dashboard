import BrandButton from '@/components/common/Button';
import { BookingForm } from '../types';
import { calculateBanquetPricing, formatMoney } from '../utils/banquet-pricing';

interface BookingInfoCardProps {
    booking: Partial<BookingForm>;
    onEdit?: () => void;
    onEditPricing?: () => void;
}

const BookingInfoCard = ({
    booking,
    onEdit,
    onEditPricing,
}: BookingInfoCardProps) => {
    const pricing = calculateBanquetPricing(
        booking.amenities ?? [],
        booking.food ?? [],
        booking.discount ?? 0,
        booking.tax ?? 0,
    );

    const bookingDetails = [
        { label: 'Event Name', value: booking.eventName || '—' },
        { label: 'Event Venue', value: booking.eventVenue || '—' },
        { label: 'Customer Name', value: booking.customerName || '—' },
        {
            label: 'Phone Number',
            value: booking.customerPhoneNumber || '—',
        },
        { label: 'Menu Name', value: booking.menuName || '—' },
        { label: 'Menu Type', value: booking.menuType || '—' },
        { label: 'Cuisine Type', value: booking.cuisineType || '—' },
        { label: 'Event Type', value: booking.eventType || '—' },
        { label: 'Event Date', value: booking.eventDate || '—' },
        { label: 'Event Time', value: booking.eventTime || '—' },
        {
            label: 'Customer Email',
            value: booking.customerEmailAddress || '—',
        },
        {
            label: 'Payment Status',
            value: booking.paymentStatus || 'pending',
        },
    ];

    const pricingDetails = [
        {
            label: 'Amenities subtotal',
            value: formatMoney(pricing.amenitiesSubtotal),
        },
        {
            label: 'Food subtotal',
            value: formatMoney(pricing.foodSubtotal),
        },
        { label: 'Discount', value: formatMoney(pricing.discount) },
        { label: 'Tax / charges', value: formatMoney(pricing.tax) },
        {
            label: 'Total',
            value: formatMoney(booking.total ?? pricing.total),
        },
    ];

    return (
        <div className="bg-white flex flex-col gap-4 border-none rounded-lg shadow-none overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-xl font-bold text-gray-800">
                    Booking review
                </h1>
                <div className="flex gap-2">
                    {onEditPricing ? (
                        <BrandButton
                            variant="secondary"
                            onClick={onEditPricing}
                        >
                            Edit pricing
                        </BrandButton>
                    ) : null}
                    {onEdit ? (
                        <BrandButton onClick={onEdit}>Edit details</BrandButton>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-col gap-2 border bg-gray-100 p-4 rounded-lg">
                {bookingDetails.map((detail) => (
                    <div
                        key={detail.label}
                        className="flex items-center justify-between gap-4"
                    >
                        <div className="text-gray-600 text-sm">
                            {detail.label}
                        </div>
                        <div className="text-gray-800 text-sm text-right capitalize">
                            {detail.value}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2 border bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">
                    Pricing summary
                </p>
                {(booking.amenities ?? []).length > 0 ? (
                    <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                        {booking.amenities!.map((a) => (
                            <li key={`${a.id}-${a.name}`}>
                                {a.name} × {a.quantity} —{' '}
                                {formatMoney(
                                    Number(a.cost) * (Number(a.quantity) || 0),
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-muted-foreground mb-2">
                        No amenities selected.
                    </p>
                )}
                {pricingDetails.map((detail) => (
                    <div
                        key={detail.label}
                        className="flex items-center justify-between gap-4"
                    >
                        <div className="text-gray-600 text-sm">
                            {detail.label}
                        </div>
                        <div className="text-gray-800 text-sm text-right font-medium">
                            {detail.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ReviewDetailsProps {
    booking?: Partial<BookingForm>;
    onEdit?: () => void;
    onEditPricing?: () => void;
}

const ReviewDetails = ({
    booking = {},
    onEdit,
    onEditPricing,
}: ReviewDetailsProps) => {
    return (
        <BookingInfoCard
            booking={booking}
            onEdit={onEdit}
            onEditPricing={onEditPricing}
        />
    );
};

export default ReviewDetails;
