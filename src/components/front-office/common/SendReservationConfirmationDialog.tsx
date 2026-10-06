'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type SendReservationConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guestEmail: string;
    loading: boolean;
    onSend: () => void;
};

export function SendReservationConfirmationDialog({
    open,
    onOpenChange,
    guestEmail,
    loading,
    onSend,
}: SendReservationConfirmationDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!loading) onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Send reservation confirmation</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-3 text-sm text-muted-foreground pt-1">
                            <p>
                                This sends an{' '}
                                <strong className="text-foreground">
                                    email
                                </strong>{' '}
                                to the guest with the official reservation
                                confirmation—the same details and terms as print
                                or PDF.
                            </p>
                            <div className="rounded-md border bg-muted/40 px-3 py-2 text-foreground font-medium break-all">
                                {guestEmail}
                            </div>
                            <p className="text-xs">
                                Confirm the address is correct before sending.
                                The guest may reply from their own inbox; this
                                action does not open your mail app.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onSend}
                        disabled={loading || !guestEmail}
                    >
                        {loading ? 'Sending…' : 'Send email'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
