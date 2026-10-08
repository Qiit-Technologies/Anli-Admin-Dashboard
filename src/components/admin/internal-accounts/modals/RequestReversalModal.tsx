'use client';

import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface RequestReversalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (reason: string) => Promise<void>;
    submitting?: boolean;
}

function ModalStatusIcon() {
    return (
        <div className="relative mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center">
            <div className="absolute size-[68px] -rotate-6 rounded-[42%] bg-red-200/70" />
            <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-red-500 shadow-sm">
                <X className="size-[22px] text-white" strokeWidth={2.5} />
            </div>
        </div>
    );
}

export default function RequestReversalModal({
    open,
    onOpenChange,
    onSubmit,
    submitting = false,
}: Readonly<RequestReversalModalProps>) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!reason.trim()) {
            setError('Reason for reversal is required.');
            return;
        }
        setError('');
        try {
            await onSubmit(reason.trim());
            setReason('');
            onOpenChange(false);
        } catch {
            // Parent surfaces errors via toast; keep modal open.
        }
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setReason('');
            setError('');
        }
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogPortal>
                <DialogOverlay className="fixed inset-0 z-50 bg-[#4a4a4a]/75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] border-0 bg-white shadow-xl duration-200',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                    )}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="bg-[#FFF5F5] px-6 pb-5 pt-9 text-center">
                            <ModalStatusIcon />
                            <DialogPrimitive.Title className="text-lg font-bold leading-snug text-[#4A2B1D]">
                                Request Reversal
                            </DialogPrimitive.Title>
                        </div>

                        <div className="px-8 pb-8 pt-6">
                            <DialogPrimitive.Description className="mx-auto mb-5 max-w-[320px] text-center text-sm leading-relaxed text-[#6B7280]">
                                This transaction will be submitted for reversal
                                approval. The account balance will only update
                                after approval.
                            </DialogPrimitive.Description>

                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason for reversal (required)"
                                className="min-h-[88px] resize-none rounded-lg border-border text-center text-sm placeholder:text-muted-foreground"
                            />
                            {error && (
                                <p className="mt-2 text-center text-xs text-destructive">
                                    {error}
                                </p>
                            )}

                            <div className="mt-7 space-y-3">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-12 w-full rounded-[10px] bg-orion-blue text-sm font-semibold text-white hover:bg-orion-blue/90"
                                >
                                    {submitting
                                        ? 'Submitting...'
                                        : 'Submit Request'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12 w-full rounded-[10px] border-orion-blue bg-white text-sm font-semibold text-[#304050] hover:bg-slate-50"
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogPrimitive.Content>
            </DialogPortal>
        </Dialog>
    );
}
