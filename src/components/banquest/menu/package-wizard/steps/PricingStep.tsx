'use client';

import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { AmountInput, SelectField } from '@/components/common/Form';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus } from 'lucide-react';
import { SPECIAL_ADD_ONS } from '../constants';
import { MenuPackageWizardState } from '../types';

interface StepProps {
    state: MenuPackageWizardState;
    onChange: <K extends keyof MenuPackageWizardState>(
        field: K,
        value: MenuPackageWizardState[K],
    ) => void;
}

function PercentStepper({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const num = Number(value) || 0;
    const adjust = (delta: number) => {
        const next = Math.max(0, Math.min(100, num + delta));
        onChange(String(next));
    };

    return (
        <div className="inline-flex items-center rounded-md border border-gray-200">
            <button
                type="button"
                className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                onClick={() => adjust(-0.5)}
            >
                <Minus className="h-3 w-3" />
            </button>
            <input
                type="text"
                value={`${value}%`}
                onChange={(e) =>
                    onChange(e.target.value.replace('%', '').trim())
                }
                className="w-14 border-x border-gray-200 px-1 py-1 text-center text-sm"
            />
            <button
                type="button"
                className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                onClick={() => adjust(0.5)}
            >
                <Plus className="h-3 w-3" />
            </button>
        </div>
    );
}

function ChargeRow({
    label,
    enabled,
    percent,
    onEnabled,
    onPercent,
}: {
    label: string;
    enabled: boolean;
    percent: string;
    onEnabled: (v: boolean) => void;
    onPercent: (v: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
                <Switch
                    checked={enabled}
                    onCheckedChange={onEnabled}
                    className="data-[state=checked]:bg-hexbrand"
                />
                <span className="text-sm font-medium text-gray-800">
                    {label}
                </span>
            </div>
            {enabled ? (
                <PercentStepper value={percent} onChange={onPercent} />
            ) : null}
        </div>
    );
}

const GUEST_OPTIONS = Array.from({ length: 20 }, (_, i) => {
    const n = (i + 1) * 25;
    return { value: String(n), label: `${n} guests` };
});

export default function PricingStep({ state, onChange }: StepProps) {
    const kidMenu = SPECIAL_ADD_ONS.find((a) => a.id === 'kid-menu');

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Pricing Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                    Set the price for this menu package
                </p>
                <div className="mt-4 grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-3">
                    <AmountInput
                        id="pricePerGuest"
                        name="pricePerGuest"
                        label="Price Per Guest"
                        value={state.pricePerGuest}
                        onChange={(v) => onChange('pricePerGuest', v)}
                        inputClassName="border border-gray-200 bg-white"
                    />
                    <SelectField
                        id="minGuestCount"
                        name="minGuestCount"
                        label="Min Guest Count"
                        placeholder="Enter Guest"
                        value={state.minGuestCount}
                        onValueChange={(v) => onChange('minGuestCount', v)}
                        options={GUEST_OPTIONS}
                    />
                    <SelectField
                        id="maxGuestCount"
                        name="maxGuestCount"
                        label="Max Guest Count"
                        placeholder="Enter Guest"
                        value={state.maxGuestCount}
                        onValueChange={(v) => onChange('maxGuestCount', v)}
                        options={GUEST_OPTIONS}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-900">
                    Charges & Taxes
                </h3>
                <p className="text-sm text-muted-foreground">
                    Configure service charges and tax for this package
                </p>
                <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
                    <ChargeRow
                        label="Service Charge"
                        enabled={state.serviceChargeEnabled}
                        percent={state.serviceChargePercent}
                        onEnabled={(v) =>
                            onChange('serviceChargeEnabled', v)
                        }
                        onPercent={(v) =>
                            onChange('serviceChargePercent', v)
                        }
                    />
                    <ChargeRow
                        label="VAT (7.5%)"
                        enabled={state.vatEnabled}
                        percent={state.vatPercent}
                        onEnabled={(v) => onChange('vatEnabled', v)}
                        onPercent={(v) => onChange('vatPercent', v)}
                    />
                    <div className="flex items-center justify-between gap-4 py-3">
                        <label className="flex items-center gap-3 text-sm font-medium text-gray-800">
                            <Checkbox
                                checked={state.kidMenuEnabled}
                                onCheckedChange={(c) =>
                                    onChange('kidMenuEnabled', !!c)
                                }
                            />
                            Kid Menu
                        </label>
                        {kidMenu ? (
                            <span className="text-sm font-medium tabular-nums text-gray-900">
                                {formatMoney(kidMenu.price)}
                            </span>
                        ) : null}
                    </div>
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
