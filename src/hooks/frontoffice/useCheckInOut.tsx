'use client';
import { checkInGuest } from '@/app/actions/checkIn';
import { checkOutGuest } from '@/app/actions/checkOut';
import { getGuestTotalDue, getEarlyCheckoutDetails } from '@/app/actions/guest';
import {
    EarlyCheckoutModal,
    type EarlyCheckoutDetails,
} from '@/components/front-office/checkout/EarlyCheckoutModal';
import Toast from '@/components/toast';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

function amountOwedFromGuest(guest: {
    totalDue?: number;
    outstanding?: number;
}): number {
    return Math.max(0, Number(guest.totalDue ?? guest.outstanding ?? 0) || 0);
}

const useCheckInOut = () => {
    const [isCheckingOut, setIsCheckingOut] = useState<Set<number>>(new Set());
    const [isCheckingIn, setIsCheckingIn] = useState<Set<number>>(new Set());
    const [balanceCheckoutGuest, setBalanceCheckoutGuest] = useState<Record<
        string,
        unknown
    > | null>(null);
    const [earlyCheckoutDetails, setEarlyCheckoutDetails] =
        useState<EarlyCheckoutDetails | null>(null);
    const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] =
        useState(false);
    const [pendingCheckoutGuestId, setPendingCheckoutGuestId] = useState<
        number | null
    >(null);
    const [
        pendingTransferOutstandingToPmFolio,
        setPendingTransferOutstandingToPmFolio,
    ] = useState(false);

    const handleCheckIn = async (id: number) => {
        if (isCheckingIn.has(id)) return;

        setIsCheckingIn((prev) => new Set(prev).add(id));

        try {
            const response = await checkInGuest(id);

            if (response?.message === 'Check In successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('list-data');
            } else {
                const errorMsg = response?.message || 'Check-in failed';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred';
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

    const executeCheckout = async (
        id: number,
        transferOutstandingToPmFolio?: boolean,
        transferUnusedBalanceToPayable?: boolean,
    ) => {
        if (isCheckingOut.has(id)) return;

        setIsCheckingOut((prev) => new Set(prev).add(id));

        try {
            const response = await checkOutGuest(
                id,
                'GOOD',
                undefined,
                transferOutstandingToPmFolio,
                transferUnusedBalanceToPayable,
            );

            if (response?.message === 'Check Out successfully!') {
                const description = transferUnusedBalanceToPayable
                    ? 'Checked out. Unused balance transferred to Account Payable.'
                    : transferOutstandingToPmFolio
                      ? 'Checked out. Outstanding balance posted to PM folio (Account Receivable).'
                      : response.message;
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={description}
                        type="success"
                    />
                ));
                void mutate('list-data');
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('guest-data-updated'));
                }
            } else if (
                response.message === 'No housekeepers available for this hotel'
            ) {
                toast.custom(() => (
                    <Toast
                        title="Heads up!"
                        description="Guest was checked out successfully, but no housekeeper was assigned."
                        type="info"
                    />
                ));
                void mutate('list-data');
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('guest-data-updated'));
                }
            } else {
                const errorMsg = response?.message || 'Check-out failed';
                toast.custom(() => (
                    <Toast title="Error!" description={errorMsg} type="error" />
                ));
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred during check-out';
            console.error('Check-out error:', err);

            toast.custom(() => (
                <Toast title="Error!" description={errorMessage} type="error" />
            ));
        } finally {
            setIsCheckingOut((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            setPendingCheckoutGuestId(null);
            setPendingTransferOutstandingToPmFolio(false);
            setShowEarlyCheckoutDialog(false);
            setEarlyCheckoutDetails(null);
        }
    };

    const handleCheckout = async (
        guestOrId: number | Record<string, unknown>,
        options?: { transferOutstandingToPmFolio?: boolean },
        transferUnusedBalanceToPayable?: boolean,
        skipEarlyCheckout?: boolean,
    ) => {
        const guest =
            typeof guestOrId === 'number' ? { id: guestOrId } : guestOrId;
        const id = Number(guest.id);

        if (guest.isComplimentary || guest.isVoid) {
            await executeCheckout(
                id,
                options?.transferOutstandingToPmFolio,
                transferUnusedBalanceToPayable,
            );
            return;
        }

        let owed = amountOwedFromGuest(
            guest as { totalDue?: number; outstanding?: number },
        );
        if (owed <= 0) {
            const breakdown = await getGuestTotalDue(id);
            owed = breakdown?.totalDue ?? 0;
        }

        if (owed > 0) {
            setBalanceCheckoutGuest({ ...guest, totalDue: owed });
            return;
        }

        // Check for early checkout details unless skipped
        if (!skipEarlyCheckout) {
            const details = await getEarlyCheckoutDetails(id);
            if (details) {
                setEarlyCheckoutDetails(details);
                setPendingCheckoutGuestId(id);
                setPendingTransferOutstandingToPmFolio(
                    options?.transferOutstandingToPmFolio ?? false,
                );
                setShowEarlyCheckoutDialog(true);
                return;
            }
        }

        await executeCheckout(
            id,
            options?.transferOutstandingToPmFolio,
            transferUnusedBalanceToPayable,
        );
    };

    const handleCompleteBalanceCheckout = async (
        options?: {
            transferOutstandingToPmFolio?: boolean;
        },
        transferUnusedBalanceToPayable?: boolean,
        skipEarlyCheckout?: boolean,
    ) => {
        if (!balanceCheckoutGuest) return;
        const id = Number(balanceCheckoutGuest.id);

        // Check for early checkout details unless skipped
        if (!skipEarlyCheckout) {
            const details = await getEarlyCheckoutDetails(id);
            if (details) {
                setEarlyCheckoutDetails(details);
                setPendingCheckoutGuestId(id);
                setPendingTransferOutstandingToPmFolio(
                    options?.transferOutstandingToPmFolio ?? false,
                );
                setShowEarlyCheckoutDialog(true);
                return;
            }
        }

        await executeCheckout(
            id,
            options?.transferOutstandingToPmFolio,
            transferUnusedBalanceToPayable,
        );
        setBalanceCheckoutGuest(null);
    };

    const EarlyCheckoutModalComponent = () => (
        <EarlyCheckoutModal
            isOpen={showEarlyCheckoutDialog}
            onClose={() => {
                setShowEarlyCheckoutDialog(false);
                setEarlyCheckoutDetails(null);
                setPendingCheckoutGuestId(null);
                setPendingTransferOutstandingToPmFolio(false);
            }}
            earlyCheckoutDetails={earlyCheckoutDetails}
            onCheckoutWithoutTransfer={async () => {
                if (!pendingCheckoutGuestId) return;
                // Use handleCheckout with skipEarlyCheckout=true
                await handleCheckout(
                    pendingCheckoutGuestId,
                    {
                        transferOutstandingToPmFolio:
                            pendingTransferOutstandingToPmFolio,
                    },
                    false,
                    true, // skip early checkout check
                );
                setBalanceCheckoutGuest(null);
            }}
            onCheckoutWithTransfer={async () => {
                if (!pendingCheckoutGuestId) return;
                // Use handleCheckout with skipEarlyCheckout=true
                await handleCheckout(
                    pendingCheckoutGuestId,
                    {
                        transferOutstandingToPmFolio:
                            pendingTransferOutstandingToPmFolio,
                    },
                    true,
                    true, // skip early checkout check
                );
                setBalanceCheckoutGuest(null);
            }}
            isLoading={isCheckingOut.has(pendingCheckoutGuestId ?? 0)}
        />
    );

    const completeBalanceCheckout = async (
        options?: {
            transferOutstandingToPmFolio?: boolean;
        },
        transferUnusedBalanceToPayable?: boolean,
        skipEarlyCheckout?: boolean,
    ) => {
        await handleCompleteBalanceCheckout(
            options,
            transferUnusedBalanceToPayable,
            skipEarlyCheckout,
        );
    };

    return {
        handleCheckout,
        handleCheckIn,
        isCheckingOut,
        isCheckingIn,
        balanceCheckoutGuest,
        clearBalanceCheckout: () => setBalanceCheckoutGuest(null),
        completeBalanceCheckout,
        EarlyCheckoutModal: EarlyCheckoutModalComponent,
    };
};

export default useCheckInOut;
