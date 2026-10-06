'use client';

import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';

export function ConfirmGuestActionPanel({
    confirmLabel,
    onClose,
    onConfirm,
}: {
    confirmLabel: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="flex flex-col gap-2.5">
            <BrandButton
                fullWidth
                className="h-10 rounded-md text-sm font-semibold shadow-none"
                onClick={onConfirm}
            >
                {confirmLabel}
            </BrandButton>
            <Button
                variant="outline"
                className="h-10 w-full rounded-md border-orion-blue text-sm font-semibold text-orion-blue shadow-none hover:bg-orion-blue/5 hover:text-orion-blue"
                onClick={onClose}
            >
                No
            </Button>
        </div>
    );
}
