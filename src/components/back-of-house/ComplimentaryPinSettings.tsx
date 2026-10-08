'use client';

import { updateMyComplimentaryPin } from '@/app/actions/staff';
import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import { Eye, EyeOff } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ComplimentaryPinSettings() {
    const { user } = useUser();
    const { organization } = useHotel();
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [storedPin, setStoredPin] = useState('');
    const [showStoredPin, setShowStoredPin] = useState(false);
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allowedApprovers =
        organization?.complimentarySettings?.allowedApprovers ?? [];
    const isApprover = allowedApprovers.some(
        (approver) => approver.id === user?.id,
    );

    useEffect(() => {
        const pin = window.localStorage.getItem('complimentary_pin_preview') || '';
        setStoredPin(pin);
    }, []);

    if (!isApprover) {
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!/^\d{4}$/.test(newPin)) {
            toast.custom(() => (
                <Toast
                    title="Invalid PIN"
                    description="PIN must be exactly 4 digits."
                    type="error"
                />
            ));
            return;
        }

        if (newPin !== confirmPin) {
            toast.custom(() => (
                <Toast
                    title="PIN mismatch"
                    description="PIN and confirmation do not match."
                    type="error"
                />
            ));
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateMyComplimentaryPin(newPin);
            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error}
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Complimentary approval PIN updated."
                    type="success"
                />
            ));
            window.localStorage.setItem('complimentary_pin_preview', newPin);
            setStoredPin(newPin);
            setIsChangingPin(false);
            setNewPin('');
            setConfirmPin('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-8 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">
                Complimentary approval PIN
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Set your personal 4-digit PIN for approving high-value
                complimentary orders. Configure this under User Settings →
                Profile.
            </p>

            <form className="mt-4 grid max-w-md gap-4" onSubmit={handleSubmit}>
                {!isChangingPin ? (
                    <>
                        <div className="relative">
                            <InputField
                                id="complimentary-current-pin"
                                name="currentPin"
                                label="Current PIN"
                                type={showStoredPin ? 'text' : 'password'}
                                inputMode="numeric"
                                value={storedPin || '****'}
                                readOnly={true}
                                placeholder="PIN configured"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-muted-foreground"
                                onClick={() => setShowStoredPin((prev) => !prev)}
                                aria-label={
                                    showStoredPin ? 'Hide PIN' : 'Show PIN'
                                }
                            >
                                {showStoredPin ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <Button
                            type="button"
                            className="w-fit bg-orion-blue text-white hover:bg-orion-blue"
                            onClick={() => setIsChangingPin(true)}
                        >
                            Change PIN
                        </Button>
                    </>
                ) : (
                    <>
                        <InputField
                            id="complimentary-new-pin"
                            name="newPin"
                            label="New PIN"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={newPin}
                            onChange={(e) =>
                                setNewPin(
                                    e.target.value.replace(/\D/g, '').slice(0, 4),
                                )
                            }
                            placeholder="4-digit PIN"
                        />
                        <InputField
                            id="complimentary-confirm-pin"
                            name="confirmPin"
                            label="Confirm PIN"
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) =>
                                setConfirmPin(
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 4),
                                )
                            }
                            placeholder="Re-enter PIN"
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting || newPin.length !== 4}
                                className="w-fit bg-orion-blue text-white hover:bg-orion-blue"
                            >
                                {isSubmitting ? 'Saving…' : 'Save PIN'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsChangingPin(false);
                                    setNewPin('');
                                    setConfirmPin('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </section>
    );
}
