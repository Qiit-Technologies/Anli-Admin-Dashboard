import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { LoaderCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface EarlyCheckoutDetails {
    reservedNights: number;
    actualNights: number;
    remainingNights: number;
    unusedBalance: number;
    unusedBasePrice: number;
    unusedDiscount: number;
    unusedVat: number;
    unusedServiceCharge: number;
    unusedTip: number;
    unusedCustomCharges: number;
}

interface EarlyCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    earlyCheckoutDetails: EarlyCheckoutDetails | null;
    onCheckoutWithoutTransfer: () => void | Promise<void>;
    onCheckoutWithTransfer: () => void | Promise<void>;
    isLoading: boolean;
}

export function EarlyCheckoutModal({
    isOpen,
    onClose,
    earlyCheckoutDetails,
    onCheckoutWithoutTransfer,
    onCheckoutWithTransfer,
    isLoading,
}: EarlyCheckoutModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Early Checkout Detected
                    </DialogTitle>
                    <DialogDescription>
                        The guest is checking out earlier than scheduled.
                    </DialogDescription>
                </DialogHeader>

                {earlyCheckoutDetails && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Reserved Nights
                                </p>
                                <p className="font-semibold">
                                    {earlyCheckoutDetails.reservedNights}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Used Nights
                                </p>
                                <p className="font-semibold">
                                    {earlyCheckoutDetails.actualNights}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Unused Nights
                                </p>
                                <p className="font-semibold text-orange-600">
                                    {earlyCheckoutDetails.remainingNights}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Unused Balance
                                </p>
                                <p className="font-semibold text-green-600">
                                    {formatCurrency(
                                        earlyCheckoutDetails.unusedBalance,
                                    )}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Would you like to transfer the unused balance to the
                            guest&apos;s Account Payable?
                        </p>
                    </div>
                )}

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onCheckoutWithoutTransfer}
                        disabled={isLoading}
                    >
                        Checkout Without Transfer
                    </Button>
                    <Button
                        onClick={onCheckoutWithTransfer}
                        disabled={isLoading}
                        className="bg-orion-blue"
                    >
                        {isLoading && (
                            <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                        )}
                        Transfer to Account Payable
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
