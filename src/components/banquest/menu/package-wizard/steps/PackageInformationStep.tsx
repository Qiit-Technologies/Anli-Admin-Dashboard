'use client';

import { InputField, SelectField } from '@/components/common/Form';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon } from 'lucide-react';
import { MEAL_TYPE_OPTIONS, PORTION_OPTIONS } from '../constants';
import { MenuPackageWizardState } from '../types';

interface StepProps {
    state: MenuPackageWizardState;
    onChange: <K extends keyof MenuPackageWizardState>(
        field: K,
        value: MenuPackageWizardState[K],
    ) => void;
}

function RangeInputs({
    label,
    from,
    to,
    onFrom,
    onTo,
}: {
    label: string;
    from: string;
    to: string;
    onFrom: (v: string) => void;
    onTo: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={from}
                    onChange={(e) => onFrom(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                />
                <span className="text-sm text-muted-foreground">To</span>
                <input
                    type="text"
                    value={to}
                    onChange={(e) => onTo(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                />
            </div>
        </div>
    );
}

export default function PackageInformationStep({
    state,
    onChange,
}: StepProps) {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Package image
                    {state.imageFileName
                        ? ` (1 image uploaded)`
                        : ''}
                </h3>
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 transition hover:border-hexbrand/50">
                    <ImageIcon className="h-8 w-8 text-gray-500" />
                    <p className="mt-3 text-sm text-gray-600">
                        Drag and drop image here or{' '}
                        <span className="font-medium text-hexbrand">
                            browse
                        </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Accepted file formats: .jpg, .png, .webp
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onChange('imageFileName', file.name);
                        }}
                    />
                </label>
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Package Information
                </h3>
                <p className="text-sm text-muted-foreground">
                    Please provide the basic information for this package
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <InputField
                        id="packageName"
                        name="packageName"
                        label="Package Name"
                        placeholder="Enter Package name"
                        value={state.packageName}
                        onChange={(e) =>
                            onChange('packageName', e.target.value)
                        }
                    />
                    <SelectField
                        id="mealType"
                        name="mealType"
                        label="Meal Type"
                        placeholder="Select Meal"
                        value={state.mealType}
                        onValueChange={(v) => onChange('mealType', v)}
                        options={MEAL_TYPE_OPTIONS}
                    />
                    <SelectField
                        id="serviceStyleDropdown"
                        name="serviceStyleDropdown"
                        label="Service Style"
                        placeholder="Select Service"
                        value={state.serviceStyleDropdown}
                        onValueChange={(v) =>
                            onChange('serviceStyleDropdown', v)
                        }
                        options={[
                            { value: 'buffet', label: 'Buffet' },
                            { value: 'plated', label: 'Plated' },
                            { value: 'cocktail', label: 'Cocktail Style' },
                        ]}
                    />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <RangeInputs
                        label="Guest Range"
                        from={state.guestMin}
                        to={state.guestMax}
                        onFrom={(v) => onChange('guestMin', v)}
                        onTo={(v) => onChange('guestMax', v)}
                    />
                    <RangeInputs
                        label="Price Range Per Guest"
                        from={state.priceMin}
                        to={state.priceMax}
                        onFrom={(v) => onChange('priceMin', v)}
                        onTo={(v) => onChange('priceMax', v)}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Portion & Service
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <SelectField
                        id="portionSize"
                        name="portionSize"
                        label="Portion Size"
                        placeholder="Select Portion"
                        value={state.portionSize}
                        onValueChange={(v) => onChange('portionSize', v)}
                        options={PORTION_OPTIONS}
                    />
                    <SelectField
                        id="proteinQuantity"
                        name="proteinQuantity"
                        label="Protein Quantity"
                        placeholder="Select size"
                        value={state.proteinQuantity}
                        onValueChange={(v) => onChange('proteinQuantity', v)}
                        options={PORTION_OPTIONS}
                    />
                    <SelectField
                        id="ricePortion"
                        name="ricePortion"
                        label="Rice Portion"
                        placeholder="Select portion"
                        value={state.ricePortion}
                        onValueChange={(v) => onChange('ricePortion', v)}
                        options={PORTION_OPTIONS}
                    />
                    <SelectField
                        id="soupServing"
                        name="soupServing"
                        label="Soup Serving"
                        placeholder="Select serving"
                        value={state.soupServing}
                        onValueChange={(v) => onChange('soupServing', v)}
                        options={PORTION_OPTIONS}
                    />
                    <SelectField
                        id="saladServing"
                        name="saladServing"
                        label="Salad Serving"
                        placeholder="Select serving"
                        value={state.saladServing}
                        onValueChange={(v) => onChange('saladServing', v)}
                        options={PORTION_OPTIONS}
                    />
                    <SelectField
                        id="dessertPortion"
                        name="dessertPortion"
                        label="Dessert Portion"
                        placeholder="Select portion"
                        value={state.dessertPortion}
                        onValueChange={(v) => onChange('dessertPortion', v)}
                        options={PORTION_OPTIONS}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Event Description{' '}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                    Add a short description or note about the event
                </p>
                <Textarea
                    className="mt-3 min-h-[120px]"
                    placeholder="eg A beautiful white wedding with 250 guests"
                    value={state.eventDescription}
                    onChange={(e) =>
                        onChange('eventDescription', e.target.value)
                    }
                />
            </div>
        </div>
    );
}
