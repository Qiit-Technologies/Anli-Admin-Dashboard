'use client';

import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { MenuPackageWizardState } from '../types';

interface StepProps {
    state: MenuPackageWizardState;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 border-b border-gray-100 py-3 text-sm last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-gray-900 text-right">{value}</span>
        </div>
    );
}

export default function ReviewDetailsStep({ state }: StepProps) {
    const name = state.packageName.trim() || 'Untitled package';

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900">
                    Package summary
                </h3>
                <div className="mt-4">
                    <ReviewRow label="Package name" value={name} />
                    <ReviewRow
                        label="Event suitable"
                        value={state.eventSuitable}
                    />
                    <ReviewRow
                        label="Service style"
                        value={state.serviceStyle}
                    />
                    <ReviewRow
                        label="Guest range"
                        value={`${state.guestMin} – ${state.guestMax}`}
                    />
                    <ReviewRow
                        label="Price per guest"
                        value={formatMoney(
                            Number(state.pricePerGuest.replace(/,/g, '')) ||
                                0,
                        )}
                    />
                    <ReviewRow
                        label="Menu items selected"
                        value={`${state.selectedMenuItemIds.length} items`}
                    />
                    <ReviewRow
                        label="Service charge"
                        value={
                            state.serviceChargeEnabled
                                ? `${state.serviceChargePercent}%`
                                : 'Off'
                        }
                    />
                    <ReviewRow
                        label="VAT"
                        value={
                            state.vatEnabled
                                ? `${state.vatPercent}%`
                                : 'Off'
                        }
                    />
                </div>
            </div>
            {state.eventDescription ? (
                <div className="rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Event description
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {state.eventDescription}
                    </p>
                </div>
            ) : null}
            <p className="text-sm text-muted-foreground">
                Please review all details before saving. Menu package API
                integration will persist this configuration.
            </p>
        </div>
    );
}
