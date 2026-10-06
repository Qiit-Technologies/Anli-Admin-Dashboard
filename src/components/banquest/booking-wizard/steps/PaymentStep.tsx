'use client';

import {
    calculateBanquetPricing,
    formatMoney,
} from '@/components/banquest/utils/banquet-pricing';
import CostBreakdown from '@/components/banquest/shared/CostBreakdown';
import PaymentPlanSelector from '@/components/banquest/shared/PaymentPlanSelector';
import { AmountInput, InputField, SelectField } from '@/components/common/Form';
import { cn } from '@/lib/utils';
import { BanquetWizardState } from '../types';

interface PaymentStepProps {
    state: BanquetWizardState;
    onChange: <K extends keyof BanquetWizardState>(
        _field: K,
        _value: BanquetWizardState[K],
    ) => void;
}

const METHODS = [
    { id: 'bank' as const, label: 'Bank Transfer' },
    { id: 'cash' as const, label: 'Cash Payment' },
    { id: 'other' as const, label: 'Others' },
];

const PLANS = [
    {
        id: 'full' as const,
        label: 'Full Payment',
        detail: 'Pay the full amount now',
    },
    {
        id: 'partial' as const,
        label: 'Part payment',
        detail: 'Pay Part Payment now',
    },
    { id: 'later' as const, label: 'Pay later', detail: 'No Payment now' },
];

export default function PaymentStep({
    state,
    onChange,
}: Readonly<PaymentStepProps>) {
    const pricing = calculateBanquetPricing(
        state.amenities.filter((a) => Number(a.quantity) > 0),
        state.skipMenu ? [] : state.food.filter((f) => Number(f.quantity) > 0),
        state.discount,
        {
            serviceChargePercent: state.serviceChargePercent,
            vatPercent: state.vatPercent,
        },
    );

    const discountFromPercent =
        pricing.subtotal * (Math.max(0, state.discountPercent) / 100);

    const DISCOUNT_REASONS = [
        { value: 'loyalty', label: 'Loyalty discount' },
        { value: 'promo', label: 'Promotional offer' },
        { value: 'manager', label: 'Manager approval' },
        { value: 'corporate', label: 'Corporate rate' },
    ];

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Payment details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add Amenities and pricing requires for this event
                </p>

                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <h4 className="mb-3 text-lg font-semibold text-gray-900">
                        Payment Amount
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <InputField
                            id="totalPayable"
                            name="totalPayable"
                            label="Total Amount Payable"
                            value={formatMoney(pricing.total)}
                            readOnly
                        />
                        <AmountInput
                            id="amountPaid"
                            name="amountPaid"
                            label="Amount Paid"
                            value={
                                state.amountPaid
                                    ? String(state.amountPaid)
                                    : ''
                            }
                            onChange={(v) =>
                                onChange(
                                    'amountPaid',
                                    Number(v.replace(/[^\d.]/g, '')) || 0,
                                )
                            }
                            inputClassName="bg-gray-100 border-gray-100"
                        />
                        <InputField
                            id="paymentDate"
                            name="paymentDate"
                            label="Payment Date"
                            type="date"
                            value={state.paymentDate}
                            onChange={(e) =>
                                onChange('paymentDate', e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                                Apply Discount %{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </h4>
                        </div>
                        <p className="text-sm font-medium text-emerald-700">
                            Discount will be applied to the total amount payment
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <InputField
                            id="discountPercent"
                            name="discountPercent"
                            label="Discount Percentage"
                            type="number"
                            min="0"
                            max="100"
                            value={
                                state.discountPercent
                                    ? String(state.discountPercent)
                                    : ''
                            }
                            onChange={(e) => {
                                const pct = Number(e.target.value) || 0;
                                onChange('discountPercent', pct);
                                onChange(
                                    'discount',
                                    (pricing.subtotal * pct) / 100,
                                );
                            }}
                        />
                        <InputField
                            id="discountAmount"
                            name="discountAmount"
                            label="Discount Amount"
                            value={formatMoney(discountFromPercent)}
                            readOnly
                        />
                        <SelectField
                            id="discountReason"
                            name="discountReason"
                            label="Discount Reason"
                            value={state.discountReason}
                            onValueChange={(v) =>
                                onChange('discountReason', v)
                            }
                            options={DISCOUNT_REASONS}
                            placeholder="Select reason"
                        />
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/40 p-4">
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">
                        Payment Method & Account
                    </h4>
                    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                        <div className="space-y-3">
                            {METHODS.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() =>
                                        onChange('paymentMethod', m.id)
                                    }
                                    className={cn(
                                        'w-full rounded-lg border px-4 py-3 text-center text-sm font-semibold transition',
                                        state.paymentMethod === m.id
                                            ? 'border-amber-500 bg-amber-500 text-black'
                                            : 'border-gray-200 bg-white text-gray-500',
                                    )}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Account / Bank Details
                            </p>
                            {state.paymentMethod === 'bank' ? (
                                <>
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-xl font-semibold text-gray-900">
                                            Access Bank PLC
                                        </p>
                                        <span className="text-muted-foreground">
                                            ⌄
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-700">
                                        1234567890 - Anli hotel limited
                                    </p>
                                    <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                                        Please ensure payment is made to the
                                        account within the expected time
                                    </div>
                                </>
                            ) : (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Select a payment method to view account
                                    details.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-w-0 space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="mb-4 text-base font-semibold text-gray-900">
                        Selected Payment Plan
                    </h3>
                    <PaymentPlanSelector
                        plans={PLANS}
                        selectedId={state.paymentPlan}
                        amount={pricing.total}
                        onSelect={(id) =>
                            onChange(
                                'paymentPlan',
                                id as BanquetWizardState['paymentPlan'],
                            )
                        }
                    />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="mb-4 text-base font-semibold text-gray-900">
                        Cost Summary
                    </h3>
                    <div className="mb-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">
                                Food &amp; Beverages
                            </span>
                            <span className="font-medium text-gray-900">
                                {formatMoney(pricing.foodSubtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">
                                Amenities &amp; Rentals
                            </span>
                            <span className="font-medium text-gray-900">
                                {formatMoney(pricing.amenitiesSubtotal)}
                            </span>
                        </div>
                    </div>
                    <CostBreakdown
                        subtotal={pricing.subtotal}
                        serviceChargePercent={state.serviceChargePercent}
                        serviceCharge={pricing.serviceCharge}
                        vatPercent={state.vatPercent}
                        vat={pricing.vat}
                        total={pricing.total}
                        discount={pricing.discount}
                    />
                </div>
            </div>
        </div>
    );
}
