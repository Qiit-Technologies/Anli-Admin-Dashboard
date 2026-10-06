'use client';

import { SelectField } from '@/components/common/Form';
import { Amenities, Food } from '../types';
import { calculateBanquetPricing, formatMoney } from '../utils/banquet-pricing';

interface PaymentSummaryProps {
    amenities: Amenities[];
    food: Food[];
    discount: number;
    tax: number;
    total: number;
    paymentStatus?: 'partial' | 'paid' | 'pending';
    onPaymentStatusChange?: (status: 'partial' | 'paid' | 'pending') => void;
    onGoToAmenities?: () => void;
}

const PaymentSummary = ({
    amenities,
    food,
    discount,
    tax,
    total,
    paymentStatus = 'pending',
    onPaymentStatusChange,
    onGoToAmenities,
}: PaymentSummaryProps) => {
    const pricing = calculateBanquetPricing(amenities, food, discount, tax);

    return (
        <div className="p-4 flex flex-col gap-4 rounded-lg border bg-gray-50">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Quotation</span>
                {onGoToAmenities ? (
                    <button
                        type="button"
                        className="text-sm text-orion-blue hover:underline"
                        onClick={onGoToAmenities}
                    >
                        Edit amenities & pricing
                    </button>
                ) : null}
            </div>

            <div className="rounded-lg border bg-white p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Amenities</span>
                    <span>{formatMoney(pricing.amenitiesSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Food / menu</span>
                    <span>{formatMoney(pricing.foodSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatMoney(pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatMoney(pricing.discount)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax / charges</span>
                    <span>{formatMoney(pricing.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold text-base">
                    <span>Total due</span>
                    <span>{formatMoney(total)}</span>
                </div>
            </div>

            {amenities.length > 0 ? (
                <ul className="text-sm space-y-1 text-muted-foreground">
                    {amenities.map((a) => (
                        <li key={`${a.id}-${a.name}`}>
                            {a.name} × {a.quantity} —{' '}
                            {formatMoney(
                                Number(a.cost) * (Number(a.quantity) || 0),
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No amenity line items.
                </p>
            )}

            <div className="flex flex-col gap-4 pt-2">
                <span className="text-sm font-semibold">Payment</span>
                <SelectField
                    id="paymentStatus"
                    name="paymentStatus"
                    label="Payment status"
                    options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'partial', label: 'Partially paid' },
                        { value: 'paid', label: 'Paid' },
                    ]}
                    value={paymentStatus}
                    onValueChange={(value) =>
                        onPaymentStatusChange?.(
                            value as 'partial' | 'paid' | 'pending',
                        )
                    }
                />
            </div>
        </div>
    );
};

export default PaymentSummary;
