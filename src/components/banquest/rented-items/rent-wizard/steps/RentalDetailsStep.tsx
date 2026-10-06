'use client';

import {
    DeliveryOption,
    RentWizardState,
} from '@/components/banquest/rented-items/rent-wizard/types';
import { computeRentalDuration } from '@/components/banquest/rented-items/rent-wizard/utils/rental-dates';
import { InputField, SelectField } from '@/components/common/Form';
import { cn } from '@/lib/utils';

const EVENT_TYPE_OPTIONS = [
    { value: 'Rental', label: 'Rental' },
    { value: 'Corporate event', label: 'Corporate event' },
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Birthday Party', label: 'Birthday Party' },
    { value: 'Church Event', label: 'Church Event' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Other', label: 'Other' },
];

const DELIVERY_OPTIONS: Array<{
    value: DeliveryOption;
    title: string;
    subtitle: string;
}> = [
    {
        value: 'self',
        title: 'Self Delivery',
        subtitle: 'You will pickup the item',
    },
    {
        value: 'delivery',
        title: 'Delivery',
        subtitle: 'We will deliver to your location',
    },
    {
        value: 'setup',
        title: 'Setup Required',
        subtitle: 'We will deliver to your location',
    },
];

const TIME_OPTIONS = [
    { value: '09:00 AM', label: '09:00 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '02:00 PM', label: '02:00 PM' },
    { value: '06:00 PM', label: '06:00 PM' },
];

const fieldClass =
    'bg-white min-h-[40px] rounded-md shadow-none border border-gray-200';

interface Props {
    state: RentWizardState;
    onChange: (patch: Partial<RentWizardState>) => void;
}

export default function RentalDetailsStep({ state, onChange }: Props) {
    const updatePeriod = (patch: Partial<RentWizardState>) => {
        const next = { ...state, ...patch };
        const duration = computeRentalDuration(next.startDate, next.endDate);
        onChange({
            ...patch,
            ...(duration ? { duration } : {}),
        });
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Rental Details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Set the rental period, delivery optional.
                </p>

                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900">
                        Event details
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <SelectField
                            id="eventType"
                            name="eventType"
                            label="Event Type"
                            placeholder="Select event type"
                            value={state.eventType}
                            onValueChange={(v) => onChange({ eventType: v })}
                            options={EVENT_TYPE_OPTIONS}
                            className={fieldClass}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-900">
                        Rental period
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <InputField
                            id="startDate"
                            name="startDate"
                            label="Start Date"
                            type="date"
                            value={state.startDate}
                            onChange={(e) =>
                                updatePeriod({ startDate: e.target.value })
                            }
                            className={fieldClass}
                        />
                        <InputField
                            id="endDate"
                            name="endDate"
                            label="End Date"
                            type="date"
                            min={state.startDate || undefined}
                            value={state.endDate}
                            onChange={(e) =>
                                updatePeriod({ endDate: e.target.value })
                            }
                            className={fieldClass}
                        />
                        <InputField
                            id="duration"
                            name="duration"
                            label="Duration"
                            placeholder="e.g. 2 days"
                            value={state.duration}
                            readOnly
                            className={cn(fieldClass, 'bg-gray-50')}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-900">
                        Contact Person
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <InputField
                            id="contactName"
                            name="contactName"
                            label="Name"
                            placeholder="Enter contact name"
                            value={state.contactName}
                            onChange={(e) =>
                                onChange({ contactName: e.target.value })
                            }
                            className={fieldClass}
                        />
                        <InputField
                            id="contactPhone"
                            name="contactPhone"
                            label="Phone Number"
                            type="tel"
                            placeholder="Enter phone number"
                            value={state.contactPhone}
                            onChange={(e) =>
                                onChange({ contactPhone: e.target.value })
                            }
                            className={fieldClass}
                        />
                        <InputField
                            id="contactEmail"
                            name="contactEmail"
                            label="Email Address"
                            type="email"
                            placeholder="Enter email address"
                            value={state.contactEmail}
                            onChange={(e) =>
                                onChange({ contactEmail: e.target.value })
                            }
                            className={fieldClass}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h4 className="text-sm font-semibold text-gray-900">
                        Delivery & Pickup{' '}
                        <span className="font-normal text-muted-foreground">
                            (Delivery Option)
                        </span>
                    </h4>
                    <div className="mt-4 space-y-3">
                        {DELIVERY_OPTIONS.map((opt) => {
                            const selected =
                                state.deliveryOption === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                        onChange({
                                            deliveryOption: opt.value,
                                        })
                                    }
                                    className={cn(
                                        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition',
                                        selected
                                            ? 'border-hexbrand bg-orange-50/30'
                                            : 'border-gray-200 hover:border-gray-300',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                                            selected
                                                ? 'border-hexbrand'
                                                : 'border-gray-300',
                                        )}
                                    >
                                        {selected ? (
                                            <span className="h-2 w-2 rounded-full bg-hexbrand" />
                                        ) : null}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {opt.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {opt.subtitle}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InputField
                            id="pickupDate"
                            name="pickupDate"
                            label="Pickup Date"
                            type="date"
                            value={state.pickupDate}
                            onChange={(e) =>
                                onChange({ pickupDate: e.target.value })
                            }
                            className={fieldClass}
                        />
                        <SelectField
                            id="pickupTime"
                            name="pickupTime"
                            label="Time"
                            value={state.pickupTime}
                            onValueChange={(v) =>
                                onChange({ pickupTime: v })
                            }
                            options={TIME_OPTIONS}
                            className={fieldClass}
                        />
                        <InputField
                            id="returnDate"
                            name="returnDate"
                            label="Return Date"
                            type="date"
                            min={state.pickupDate || state.startDate || undefined}
                            value={state.returnDate}
                            onChange={(e) =>
                                onChange({ returnDate: e.target.value })
                            }
                            className={fieldClass}
                        />
                        <SelectField
                            id="returnTime"
                            name="returnTime"
                            label="Time"
                            value={state.returnTime}
                            onValueChange={(v) =>
                                onChange({ returnTime: v })
                            }
                            options={TIME_OPTIONS}
                            className={fieldClass}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
