'use client';

import AmenityThumbnail from '@/components/banquest/amenities/AmenityThumbnail';
import CostBreakdown from '@/components/banquest/shared/CostBreakdown';
import { RentWizardState } from '@/components/banquest/rented-items/rent-wizard/types';
import { formatDateForDisplay } from '@/components/banquest/rented-items/rent-wizard/utils/rental-dates';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';

function DetailGrid({
    rows,
}: {
    rows: Array<{ label: string; value: string }>;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            {rows.map((row) => (
                <div key={row.label}>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                        {row.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

interface Props {
    state: RentWizardState;
}

export default function ReviewDetailsStep({ state }: Props) {
    const primary = state.selections.find((s) => s.quantity > 0);
    const durationDays = Number(state.duration.replace(/\D/g, '')) || 1;
    const dailyRate = primary?.unitPrice ?? 15000;
    const quantity = primary?.quantity ?? 2;
    const subtotal = dailyRate * quantity * durationDays;
    const serviceCharge = subtotal * 0.05;
    const vat = subtotal * 0.075;
    const total = subtotal + serviceCharge + vat;

    const deliveryLabel =
        state.deliveryOption === 'self'
            ? 'Self Pickup'
            : state.deliveryOption === 'delivery'
              ? 'Delivery'
              : 'Setup Required';

    const startLabel = formatDateForDisplay(state.startDate) || '—';
    const endLabel = formatDateForDisplay(state.endDate) || '—';
    const pickupLabel = state.pickupDate
        ? `${formatDateForDisplay(state.pickupDate)} · ${state.pickupTime}`
        : '—';
    const returnLabel = state.returnDate
        ? `${formatDateForDisplay(state.returnDate)} · ${state.returnTime}`
        : '—';

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Review Details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review all details before creating
                </p>

                {primary ? (
                    <div className="mt-6 flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                            <AmenityThumbnail
                                src={primary.imageUrl}
                                alt={primary.name}
                                size="lg"
                            />
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-lg font-bold text-gray-900">
                                        {primary.name}
                                    </h4>
                                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                        Available
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Audio · Electronic · indoor - outdoor
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Premium professional sound system
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-8 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Quantity
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {formatMoney(dailyRate * quantity)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Daily Rate
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {formatMoney(dailyRate)}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="mt-6 space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                            Event Type
                        </h4>
                        <div className="mt-4">
                            <DetailGrid
                                rows={[
                                    {
                                        label: 'Event Type',
                                        value: state.eventType || 'Rental',
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-semibold text-gray-900">
                            Rental Period
                        </h4>
                        <div className="mt-4">
                            <DetailGrid
                                rows={[
                                    {
                                        label: 'Start Date',
                                        value: startLabel,
                                    },
                                    {
                                        label: 'End Date',
                                        value: endLabel,
                                    },
                                    {
                                        label: 'Duration',
                                        value: state.duration || '—',
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-semibold text-gray-900">
                            Delivery & pickup
                        </h4>
                        <div className="mt-4">
                            <DetailGrid
                                rows={[
                                    {
                                        label: 'Delivery & Pickup',
                                        value: deliveryLabel,
                                    },
                                    {
                                        label: 'Pickup',
                                        value: pickupLabel,
                                    },
                                    {
                                        label: 'Return',
                                        value: returnLabel,
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-semibold text-gray-900">
                            Contact Person
                        </h4>
                        <div className="mt-4">
                            <DetailGrid
                                rows={[
                                    {
                                        label: 'Name',
                                        value: state.contactName || '—',
                                    },
                                    {
                                        label: 'Phone Number',
                                        value: state.contactPhone || '—',
                                    },
                                    {
                                        label: 'Email',
                                        value: state.contactEmail || '—',
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <aside className="h-fit rounded-xl border border-gray-200 bg-slate-50/80 p-5">
                <h3 className="text-base font-semibold text-gray-900">
                    Rental Summary
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                            Daily Rate
                        </span>
                        <span className="font-medium text-gray-900">
                            {formatMoney(dailyRate)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium text-gray-900">
                            {quantity} units
                        </span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium text-gray-900">
                            {durationDays} Days
                        </span>
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <CostBreakdown
                        subtotal={subtotal}
                        serviceCharge={serviceCharge}
                        vat={vat}
                        total={total}
                    />
                </div>
            </aside>
        </div>
    );
}
