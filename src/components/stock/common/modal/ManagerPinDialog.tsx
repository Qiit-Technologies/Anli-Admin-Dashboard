'use client';

import { OTPInput } from '@/components/front-of-house/tables/OTPInput';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

type ManagerPinDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    isLoading?: boolean;
    onConfirm: (pin: string) => void | Promise<void>;
};

export function ManagerPinDialog({
    open,
    onOpenChange,
    title = 'Manager PIN approval',
    description = 'Enter a valid 4-digit Manager/Admin PIN to approve this request.',
    confirmLabel = 'Approve with PIN',
    isLoading = false,
    onConfirm,
}: Readonly<ManagerPinDialogProps>) {
    const [pin, setPin] = useState('');

    const handleOpenChange = (next: boolean) => {
        if (!next) setPin('');
        onOpenChange(next);
    };

    const handleConfirm = async () => {
        if (pin.length !== 4 || isLoading) return;
        await onConfirm(pin);
        setPin('');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <OTPInput length={4} value={pin} onChange={setPin} />
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            disabled={isLoading}
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-orion-blue hover:bg-orion-blue text-white"
                            disabled={pin.length !== 4 || isLoading}
                            onClick={() => void handleConfirm()}
                        >
                            {isLoading ? 'Approving…' : confirmLabel}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
