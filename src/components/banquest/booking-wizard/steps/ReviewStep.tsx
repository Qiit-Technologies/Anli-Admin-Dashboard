'use client';

import {
    calculateBanquetPricing,
    formatMoney,
    lineTotal,
} from '@/components/banquest/utils/banquet-pricing';
import SelectionDot from '@/components/banquest/shared/SelectionDot';
import BrandButton from '@/components/common/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { BanquetWizardState } from '../types';

interface ReviewStepProps {
    state: BanquetWizardState;
    onChange: <K extends keyof BanquetWizardState>(
        _field: K,
        _value: BanquetWizardState[K],
    ) => void;
    onEditStep: (_step: number) => void;
}

interface ReviewRow {
    label: string;
    value: string;
}

function ReviewInfoCard({
    title,
    rows,
    onEdit,
    columns = 2,
    children,
}: Readonly<{
    title: string;
    rows: ReviewRow[];
    onEdit?: () => void;
    columns?: 2 | 3;
    children?: ReactNode;
}>) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                {onEdit ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-sm font-semibold text-orion-blue hover:underline"
                    >
                        Edit
                    </button>
                ) : null}
            </div>
            <dl
                className={cn(
                    'grid gap-y-4 gap-x-6',
                    columns === 3
                        ? 'grid-cols-1 md:grid-cols-3'
                        : 'grid-cols-1 md:grid-cols-2',
                )}
            >
                {rows.map((row) => (
                    <div key={row.label}>
                        <dt className="text-sm text-muted-foreground">
                            {row.label}
                        </dt>
                        <dd className="text-base font-semibold text-gray-900">
                            {row.value || '—'}
                        </dd>
                    </div>
                ))}
            </dl>
            {children}
        </div>
    );
}

function ReviewLineItems({
    title,
    lines,
    subtotalLabel,
    subtotal,
    serviceCharge,
    vat,
    total,
    onEdit,
}: Readonly<{
    title: string;
    lines: Array<{ name: string; detail: string; amount: string }>;
    subtotalLabel: string;
    subtotal: string;
    serviceCharge: string;
    vat: string;
    total: string;
    onEdit?: () => void;
}>) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                {onEdit ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-sm font-semibold text-orion-blue hover:underline"
                    >
                        Edit
                    </button>
                ) : null}
            </div>
            <div className="space-y-3 rounded-xl border border-gray-100 p-3">
                {lines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No items selected
                    </p>
                ) : (
                    lines.map((line) => (
                        <div
                            key={`${line.name}-${line.detail}`}
                            className="space-y-1"
                        >
                            <div className="flex items-start gap-2">
                                <SelectionDot />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900">
                                        {line.name}
                                    </p>
                                    <div className="mt-0.5 flex items-center justify-between gap-2">
                                        <p className="text-sm text-muted-foreground">
                                            {line.detail}
                                        </p>
                                        <span className="shrink-0 font-semibold text-gray-900">
                                            {line.amount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">
                        {subtotalLabel}
                    </span>
                    <span>{subtotal}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">
                        Service Charge (5%)
                    </span>
                    <span>{serviceCharge}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Vat (7.5%)</span>
                    <span>{vat}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg font-semibold text-emerald-700">
                    <span>Total Estimate</span>
                    <span>{total}</span>
                </div>
            </div>
        </div>
    );
}

export default function ReviewStep({
    state,
    onChange,
    onEditStep,
}: Readonly<ReviewStepProps>) {
    const customerDisplay =
        [state.firstName, state.lastName].filter(Boolean).join(' ').trim() ||
        state.customerName;

    const categoryLabel =
        state.eventCategory === 'Others'
            ? state.eventCategoryOther || 'Others'
            : state.eventCategory;

    const pricing = calculateBanquetPricing(
        state.amenities.filter((a) => Number(a.quantity) > 0),
        state.skipMenu ? [] : state.food.filter((f) => Number(f.quantity) > 0),
        state.discount,
        {
            serviceChargePercent: state.serviceChargePercent,
            vatPercent: state.vatPercent,
        },
    );

    const menuLines = state.food
        .filter((f) => Number(f.quantity) > 0)
        .map((f) => ({
            name: f.name,
            detail: `${f.quantity} * ${formatMoney(Number(f.cost))}`,
            amount: formatMoney(lineTotal(f.cost, f.quantity)),
        }));

    const amenityLines = state.amenities
        .filter((a) => Number(a.quantity) > 0)
        .map((a) => ({
            name: a.name,
            detail: `${a.quantity} * ${formatMoney(Number(a.cost))}`,
            amount: formatMoney(lineTotal(a.cost, a.quantity)),
        }));
    const eventTimeRange = state.eventEndTime
        ? `${state.eventTime} – ${state.eventEndTime}`
        : state.eventTime;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Review booking details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kindly review all information below
                    </p>
                </div>
                <BrandButton type="button" onClick={() => onEditStep(1)}>
                    Edit Bookings
                </BrandButton>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <ReviewInfoCard
                    title="Event Information"
                    onEdit={() => onEditStep(1)}
                    rows={[
                        { label: 'Event name', value: state.eventName },
                        { label: 'Event type', value: state.eventType },
                        { label: 'Event Date', value: state.eventDate },
                        {
                            label: 'Event Time',
                            value: `${state.eventDate} ${eventTimeRange}`,
                        },
                        { label: 'Venue', value: state.eventVenue },
                        {
                            label: 'Guest Count',
                            value: `${state.estimatedGuestCount || 0} Guest`,
                        },
                        {
                            label: 'Set up',
                            value:
                                [state.setupTime, state.teardownTime]
                                    .filter(Boolean)
                                    .join(' / ') || '—',
                        },
                        { label: 'Category', value: categoryLabel },
                    ]}
                >
                    <div className="mt-4">
                        <Label htmlFor="customerNotes" className="mb-2">
                            Customer Notes
                        </Label>
                        <Textarea
                            id="customerNotes"
                            rows={2}
                            value={state.customerNotes}
                            onChange={(e) =>
                                onChange('customerNotes', e.target.value)
                            }
                        />
                    </div>
                </ReviewInfoCard>
                <ReviewInfoCard
                    title="Customer/ Event contact"
                    rows={[
                        { label: 'Contact Name', value: customerDisplay },
                        {
                            label: 'Phone Number',
                            value: state.customerPhoneNumber,
                        },
                        {
                            label: 'Email Address',
                            value: state.customerEmailAddress,
                        },
                        { label: 'Company', value: state.company || '—' },
                        {
                            label: 'Address',
                            value: [state.billingAddress, state.billingCity]
                                .filter(Boolean)
                                .join(' '),
                        },
                    ]}
                    onEdit={() => onEditStep(2)}
                />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <ReviewLineItems
                    title="Menu summary"
                    lines={menuLines}
                    subtotalLabel="SubTotal(Food)"
                    subtotal={formatMoney(pricing.foodSubtotal)}
                    serviceCharge={formatMoney(pricing.serviceCharge)}
                    vat={formatMoney(pricing.vat)}
                    total={formatMoney(
                        pricing.foodSubtotal +
                            pricing.serviceCharge +
                            pricing.vat,
                    )}
                    onEdit={() => onEditStep(3)}
                />
                <ReviewLineItems
                    title="Amenities and Rentals"
                    onEdit={() => onEditStep(4)}
                    lines={amenityLines}
                    subtotalLabel="SubTotal"
                    subtotal={formatMoney(pricing.amenitiesSubtotal)}
                    serviceCharge={formatMoney(pricing.serviceCharge)}
                    vat={formatMoney(pricing.vat)}
                    total={formatMoney(
                        pricing.amenitiesSubtotal +
                            pricing.serviceCharge +
                            pricing.vat,
                    )}
                />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-xl font-semibold text-gray-900">
                    Additional information
                </h3>
                <p className="mt-2 text-sm text-gray-700">
                    Special instruction / Note
                </p>
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Booking Source
                            </p>
                            <p className="font-semibold text-gray-900">
                                {state.bookingSource || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Event Coordination (on-site)
                            </p>
                            <p className="font-semibold text-gray-900">
                                {state.eventCoordination || '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Created By
                            </p>
                            <p className="font-semibold text-gray-900">
                                Frankly
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Date created
                            </p>
                            <p className="font-semibold text-gray-900">
                                {state.eventDate || '—'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Cost Breakdown
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This show all the payment
                    </p>
                    <div className="mt-4 grid gap-4 rounded-xl border border-gray-200 p-4 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <SelectionDot />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">
                                        Food &amp; Beverages
                                    </p>
                                    <div className="mt-0.5 flex items-center justify-between gap-2">
                                        <p className="text-sm text-muted-foreground">
                                            {formatMoney(pricing.foodSubtotal)}
                                        </p>
                                        <span className="shrink-0 font-semibold">
                                            {formatMoney(pricing.foodSubtotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <SelectionDot />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">
                                        Amenities and Rentals
                                    </p>
                                    <div className="mt-0.5 flex items-center justify-between gap-2">
                                        <p className="text-sm text-muted-foreground">
                                            {formatMoney(
                                                pricing.amenitiesSubtotal,
                                            )}
                                        </p>
                                        <span className="shrink-0 font-semibold">
                                            {formatMoney(
                                                pricing.amenitiesSubtotal,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 border-l border-gray-200 pl-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    SubTotal(Food)
                                </span>
                                <span>{formatMoney(pricing.foodSubtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Service Charge (5%)
                                </span>
                                <span>
                                    {formatMoney(pricing.serviceCharge)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Vat (7.5%)
                                </span>
                                <span>{formatMoney(pricing.vat)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-3 text-lg font-semibold text-emerald-700">
                                <span>Total Estimate</span>
                                <span>{formatMoney(pricing.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-lg bg-emerald-100 px-4 py-3 text-sm font-medium text-gray-800">
                Please review all details and edit
            </div>
        </div>
    );
}
