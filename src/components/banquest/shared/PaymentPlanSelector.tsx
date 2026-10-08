'use client';

import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { cn } from '@/lib/utils';

export interface PaymentPlanOption {
    id: string;
    label: string;
    detail: string;
}

interface PaymentPlanSelectorProps {
    plans: PaymentPlanOption[];
    selectedId: string;
    amount: number;
    onSelect?: (id: string) => void;
    readOnly?: boolean;
}

export default function PaymentPlanSelector({
    plans,
    selectedId,
    amount,
    onSelect,
    readOnly = false,
}: PaymentPlanSelectorProps) {
    const amountLabel = formatMoney(amount);

    return (
        <div className="space-y-3">
            {plans.map((plan) => {
                const selected = selectedId === plan.id;
                const body = (
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
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
                                <p className="text-sm font-semibold text-gray-900">
                                    {plan.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {plan.detail}
                                </p>
                            </div>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                            {amountLabel}
                        </span>
                    </div>
                );

                if (readOnly) {
                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                'rounded-lg border px-4 py-3',
                                selected
                                    ? 'border-hexbrand bg-orange-50/50'
                                    : 'border-gray-200 bg-white',
                            )}
                        >
                            {body}
                        </div>
                    );
                }

                return (
                    <button
                        key={plan.id}
                        type="button"
                        onClick={() => onSelect?.(plan.id)}
                        className={cn(
                            'w-full rounded-lg border px-4 py-3 text-left transition',
                            selected
                                ? 'border-hexbrand bg-orange-50/50'
                                : 'border-gray-200 bg-white hover:border-gray-300',
                        )}
                    >
                        {body}
                    </button>
                );
            })}
        </div>
    );
}
