'use client';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ChargeSwitchProps {
    id?: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    description?: string;
    disabled?: boolean;
    /** Fits a tight circled slot (Waive Charges, invoice footer). */
    compact?: boolean;
}

export function ChargeSwitch({
    id,
    label,
    checked,
    onCheckedChange,
    description,
    disabled,
    compact = false,
}: ChargeSwitchProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-3',
                compact
                    ? 'rounded-md border border-gray-200 bg-white px-2 py-1'
                    : 'rounded-lg border border-gray-200 bg-slate-50 px-3 py-2.5',
            )}
        >
            <div className="min-w-0">
                <label
                    htmlFor={id}
                    className={cn(
                        'font-medium text-gray-900 cursor-pointer',
                        compact ? 'text-xs' : 'text-sm',
                    )}
                >
                    {label}
                </label>
                {description ? (
                    <p
                        className={cn(
                            'text-muted-foreground',
                            compact ? 'text-[10px] leading-tight' : 'text-xs mt-0.5',
                        )}
                    >
                        {description}
                    </p>
                ) : null}
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={cn(
                    'data-[state=checked]:bg-orion-blue shrink-0',
                    compact && 'h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3',
                )}
            />
        </div>
    );
}
