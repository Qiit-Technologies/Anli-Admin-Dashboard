'use client';

import { Button } from '@/components/ui/button';

export default function RoomComp({
    checked,
    onCheckedChange,
    disabled = false,
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant={checked ? 'default' : 'outline'}
            className={
                checked
                    ? 'bg-orion-blue text-white hover:bg-orion-blue/90'
                    : 'border border-orion-blue text-orion-blue hover:bg-orion-blue/10'
            }
            title="When enabled, the food will be posted to the room without being charged."
            aria-pressed={checked}
            onClick={() => onCheckedChange(!checked)}
            disabled={disabled}
        >
            {checked ? 'Comp Applied' : 'Mark as Comp'}
        </Button>
    );
}
