'use client';
import { voidReservationAction } from '@/app/actions/reservation';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

interface VoidReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: any;
}

export const VoidReservationDialog = ({
    open,
    onOpenChange,
    reservation,
}: VoidReservationDialogProps) => {
    const [isCheckingIn, setIsCheckingIn] = useState<Set<number>>(new Set());
    const [voidReason, setVoidReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const voidReservation = async () => {
        const id = reservation.id;
        if (isCheckingIn.has(id)) return;

        setIsCheckingIn((prev) => new Set(prev).add(id));
        setIsSubmitting(true);

        try {
            const response = await voidReservationAction({
                reservationId: id,
                voidReason,
            });

            if (response?.message === 'Voided successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('list-data', false);
            } else {
                const errorMsg =
                    response?.message || 'Failed to void reservation';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred while voiding the reservation';

            console.error('Void reservation error:', err);

            toast.custom(() => (
                <Toast title="Error!" description={errorMessage} type="error" />
            ));
        } finally {
            setIsCheckingIn((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Void Reservation</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for voiding this reservation.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col items-start gap-4">
                        <Label
                            htmlFor="voidReason"
                            className="text-right sr-only"
                        >
                            Reason
                        </Label>
                        <Textarea
                            id="voidReason"
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter the reason for voiding..."
                            required
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <BrandButton
                        type="button"
                        onClick={voidReservation}
                        disabled={isSubmitting || !voidReason.trim()}
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Void'}
                    </BrandButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
