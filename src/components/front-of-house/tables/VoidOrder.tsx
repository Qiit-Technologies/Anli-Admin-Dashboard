'use client';

import { voidOrder } from '@/app/actions/order';
import { InputField } from '@/components/common/Form';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

export default function VoidOrder({
    order,
    onSuccess,
    disabled = false,
}: {
    order: {
        id?: number;
        status?: string;
        isVoided?: boolean;
        paymentStatus?: string;
    };
    onSuccess?: () => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const alreadyVoided =
        disabled ||
        Boolean(order.isVoided) ||
        order.status === 'VOIDED' ||
        order.paymentStatus === 'VOIDED';
    const hasSavedOrder = Number(order.id) > 0;
    const canSubmit =
        hasSavedOrder && !alreadyVoided && reason.trim().length >= 2;

    const handleVoid = async () => {
        if (!order.id || reason.trim().length < 2 || alreadyVoided) return;
        setLoading(true);
        try {
            const response = await voidOrder(Number(order.id), reason.trim());
            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Could not void order"
                        description={String(response.error)}
                        type="error"
                    />
                ));
                return;
            }
            toast.custom(() => (
                <Toast
                    title="Order voided"
                    description="This order is voided and will not count toward sales."
                    type="success"
                />
            ));
            mutate('/orders/query/all');
            mutate('/orders/query/running');
            mutate('/orders/query/ready');
            mutate('/orders/query/settled');
            setOpen(false);
            setReason('');
            onSuccess?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <PermissionGate
            permissions={[PERMISSIONS.VOID_ORDERS]}
            blockType="hide"
        >
            <div className="relative">
            <Button
                type="button"
                size="sm"
                disabled={alreadyVoided}
                title={alreadyVoided ? 'This order is already voided' : 'Void order'}
                className={cn(
                    'flex items-center gap-2 bg-slate-700 text-white hover:bg-slate-800',
                    alreadyVoided && 'pointer-events-none opacity-50',
                )}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (alreadyVoided) return;
                    setOpen((prev) => !prev);
                }}
            >
                {alreadyVoided ? 'Voided' : 'Void'}
            </Button>
            {open && !alreadyVoided ? (
                <div
                    className="absolute left-0 top-full z-[80] mt-2 w-72 rounded-lg border bg-white p-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-sm font-medium mb-2">Void this order?</p>
                    <p className="text-xs text-muted-foreground mb-2">
                        {hasSavedOrder
                            ? 'Order and payment status become Voided. Amount is set to ₦0.00 and excluded from sales.'
                            : 'Save this order first, then void it.'}
                    </p>
                    {hasSavedOrder ? (
                        <InputField
                            type="text"
                            label="Reason"
                            required
                            id="voidReason"
                            name="voidReason"
                            className="border rounded-lg"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    ) : null}
                    <div className="flex items-center gap-2 mt-3">
                        <Button
                            type="button"
                            size="sm"
                            className="bg-orion-blue hover:bg-orion-blue text-white flex-1"
                            disabled={loading || !canSubmit}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                void handleVoid();
                            }}
                        >
                            {loading ? 'Voiding...' : 'Confirm void'}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : null}
            </div>
        </PermissionGate>
    );
}
