'use client';

import { applyOrderDiscount } from '@/app/actions/order';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
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
import { cn } from '@/lib/utils';
import { BadgePercent } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import {
    discountOffLabel,
    hasOrderDiscount,
    previewDiscountAmount,
    type OrderDiscountFields,
} from '../complimentary/OrderDiscountBadge';
import { formatOrderMoney } from '../utils/complimentary';

export type DraftOrderDiscountPayload = {
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    discountReason: string;
};

export type OrderDiscountBillLine = {
    label: string;
    amount: number;
};

export type OrderDiscountBill = {
    lines: OrderDiscountBillLine[];
    total: number;
};

type DiscountOrder = OrderDiscountFields & {
    id?: number;
    status?: string;
    isVoided?: boolean;
    paymentStatus?: string;
    complimentaryStatus?: string | null;
    isComplimented?: boolean;
    subtotal?: number | string | null;
    vatAmount?: number | string | null;
    serviceChargeAmount?: number | string | null;
    tipAmount?: number | string | null;
    customCharges?: Array<{ name: string; amount: number }> | null;
    waivedAmount?: number | string | null;
    totalPrice?: number | string | null;
    totalWithCustomCharges?: number | string | null;
    remainingBalance?: number | string | null;
    payments?: Array<{ amount?: number | string | null }> | null;
};

function toMoney(value?: number | string | null) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function billFromOrder(order: DiscountOrder): OrderDiscountBill {
    const lines: OrderDiscountBillLine[] = [];
    const subtotal = toMoney(order.subtotal);
    if (subtotal > 0) lines.push({ label: 'Items', amount: subtotal });
    const vat = toMoney(order.vatAmount);
    if (vat > 0) lines.push({ label: 'VAT', amount: vat });
    const service = toMoney(order.serviceChargeAmount);
    if (service > 0) lines.push({ label: 'Service charge', amount: service });
    const tip = toMoney(order.tipAmount);
    if (tip > 0) lines.push({ label: 'Tip', amount: tip });
    for (const charge of order.customCharges ?? []) {
        const amount = toMoney(charge.amount);
        if (amount > 0) lines.push({ label: charge.name, amount });
    }
    const waived = toMoney(order.waivedAmount);
    if (waived > 0) lines.push({ label: 'Waived charges', amount: -waived });
    const existing = toMoney(order.discountAmount);
    if (hasOrderDiscount(order) && existing > 0) {
        lines.push({
            label: `Discount already applied (${discountOffLabel(order)})`,
            amount: -existing,
        });
    }

    const total = toMoney(order.totalPrice || order.totalWithCustomCharges);
    return { lines, total };
}

export default function OrderDiscount({
    order,
    onSuccess,
    disabled = false,
    mode = 'persisted',
    draftDiscount,
    onDraftApply,
    onDraftClear,
    bill,
}: {
    order: DiscountOrder;
    onSuccess?: () => void;
    disabled?: boolean;
    mode?: 'draft' | 'persisted';
    draftDiscount?: DraftOrderDiscountPayload | null;
    onDraftApply?: (payload: DraftOrderDiscountPayload) => void;
    onDraftClear?: () => void;
    bill?: OrderDiscountBill;
}) {
    const [open, setOpen] = useState(false);
    const [discountType, setDiscountType] = useState<
        'PERCENTAGE' | 'FIXED_AMOUNT'
    >(draftDiscount?.discountType || order.discountType || 'PERCENTAGE');
    const [discountValue, setDiscountValue] = useState(
        draftDiscount?.discountValue?.toString() ||
            (order.discountValue != null ? String(order.discountValue) : ''),
    );
    const [discountReason, setDiscountReason] = useState(
        draftDiscount?.discountReason || order.discountReason || '',
    );
    const [loading, setLoading] = useState(false);

    const fullyComplimentary =
        order.complimentaryStatus === 'FULL' ||
        Boolean(order.isComplimented) ||
        order.paymentStatus === 'COMPLEMENTED';
    const alreadyBlocked =
        disabled ||
        Boolean(order.isVoided) ||
        order.status === 'VOIDED' ||
        order.paymentStatus === 'VOIDED' ||
        fullyComplimentary;
    const hasSavedOrder = Number(order.id) > 0;
    const parsedValue = Number(discountValue);
    const resolvedBill = bill ?? billFromOrder(order);
    const currentTotal = Math.max(0, resolvedBill.total);
    const discountAmount = useMemo(() => {
        if (!Number.isFinite(parsedValue) || parsedValue <= 0) return 0;
        return previewDiscountAmount(currentTotal, discountType, parsedValue);
    }, [currentTotal, discountType, parsedValue]);
    const newTotal = Math.max(0, Math.round((currentTotal - discountAmount) * 100) / 100);
    const paid = useMemo(() => {
        if (order.payments?.length) {
            return order.payments.reduce(
                (sum, payment) => sum + toMoney(payment.amount),
                0,
            );
        }
        if (order.remainingBalance == null || mode === 'draft') return 0;
        return Math.max(0, currentTotal - toMoney(order.remainingBalance));
    }, [order.payments, order.remainingBalance, currentTotal, mode]);
    const dueAfter = Math.max(0, Math.round((newTotal - paid) * 100) / 100);
    const canSubmit =
        discountReason.trim().length >= 2 &&
        discountAmount > 0 &&
        currentTotal > 0 &&
        (discountType === 'PERCENTAGE' ? parsedValue <= 100 : true);
    const queued = Boolean(draftDiscount);
    const savedDiscount = hasOrderDiscount(order);
    let buttonTitle = 'Apply discount';
    if (alreadyBlocked && fullyComplimentary) {
        buttonTitle = 'A fully complimentary order cannot be discounted';
    } else if (alreadyBlocked) {
        buttonTitle = 'Discount is not available for this order';
    }

    const openModal = () => {
        setDiscountType(
            draftDiscount?.discountType || order.discountType || 'PERCENTAGE',
        );
        setDiscountValue(
            draftDiscount?.discountValue?.toString() ||
                (savedDiscount && order.discountValue != null
                    ? String(order.discountValue)
                    : ''),
        );
        setDiscountReason(
            draftDiscount?.discountReason ||
                (savedDiscount ? order.discountReason || '' : ''),
        );
        setOpen(true);
    };

    const handleApply = async () => {
        if (!canSubmit || alreadyBlocked) return;

        if (mode === 'draft') {
            onDraftApply?.({
                discountType,
                discountValue: parsedValue,
                discountReason: discountReason.trim(),
            });
            toast.custom(() => (
                <Toast
                    title="Discount queued"
                    description="Discount will apply when you save this order."
                    type="success"
                />
            ));
            setOpen(false);
            return;
        }

        if (!order.id) return;
        setLoading(true);
        try {
            const response = await applyOrderDiscount(Number(order.id), {
                discountType,
                discountValue: parsedValue,
                discountReason: discountReason.trim(),
            });
            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Could not apply discount"
                        description={String(response.error)}
                        type="error"
                    />
                ));
                return;
            }
            toast.custom(() => (
                <Toast
                    title="Discount applied"
                    description="Order total has been updated."
                    type="success"
                />
            ));
            mutate('/orders/query/all');
            mutate('/orders/query/running');
            mutate('/orders/query/ready');
            mutate('/orders/query/settled');
            setOpen(false);
            onSuccess?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <PermissionGate
            permissions={[PERMISSIONS.APPLY_DISCOUNT_TO_ORDERS]}
            blockType="hide"
        >
            <div className="relative">
                <Button
                    type="button"
                    size="sm"
                    disabled={alreadyBlocked}
                    title={buttonTitle}
                    className={cn(
                        'flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700',
                        alreadyBlocked && 'pointer-events-none opacity-50',
                    )}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (alreadyBlocked) return;
                        openModal();
                    }}
                >
                    <BadgePercent className="h-3.5 w-3.5" />
                    Discount
                </Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    data-discount-modal=""
                    modalMarker
                    overlayClassName="z-[80]"
                    className="z-[80] max-w-3xl gap-0 p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DialogHeader className="border-b px-4 py-3 text-left">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <BadgePercent className="h-4 w-4 text-orion-blue" />
                            Apply order discount
                        </DialogTitle>
                        <DialogDescription>
                            Taken off the full bill. Item prices stay the same.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid sm:grid-cols-2">
                        <div className="border-b bg-slate-50 p-4 sm:border-b-0 sm:border-r">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Applies to this bill
                            </p>
                            {resolvedBill.lines.length > 0 ? (
                                <div className="max-h-40 space-y-1 overflow-y-auto text-sm">
                                    {resolvedBill.lines.map((line) => (
                                        <div
                                            key={line.label}
                                            className="flex justify-between gap-3 text-slate-600"
                                        >
                                            <span className="min-w-0 truncate">
                                                {line.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    'shrink-0 tabular-nums',
                                                    line.amount < 0 &&
                                                        'text-orion-blue',
                                                )}
                                            >
                                                {line.amount < 0 ? '-' : ''}
                                                {formatOrderMoney(
                                                    Math.abs(line.amount),
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600">
                                    The whole order total.
                                </p>
                            )}
                            <div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
                                <span>Current total</span>
                                <span className="tabular-nums">
                                    {formatOrderMoney(currentTotal)}
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                VAT, service, tip, and custom charges already
                                on the bill are included.
                            </p>
                        </div>
                        <div className="space-y-3 p-4">
                            {mode === 'persisted' && !hasSavedOrder ? (
                                <p className="text-xs text-muted-foreground">
                                    Save this order first, then apply a
                                    discount.
                                </p>
                            ) : null}
                            {savedDiscount && mode === 'persisted' ? (
                                <p className="rounded-md border border-orion-blue/30 bg-[#E8F3FF] px-2.5 py-1.5 text-xs text-orion-blue">
                                    Already{' '}
                                    {discountOffLabel(order).toLowerCase()}. A
                                    new discount replaces it, on the current
                                    total.
                                </p>
                            ) : null}
                            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                                {(
                                    [
                                        ['PERCENTAGE', 'Percentage'],
                                        ['FIXED_AMOUNT', 'Fixed amount'],
                                    ] as const
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={cn(
                                            'rounded-md px-2 py-1.5 text-sm',
                                            discountType === value
                                                ? 'bg-white font-medium text-orion-blue shadow-sm'
                                                : 'text-slate-600',
                                        )}
                                        onClick={() => setDiscountType(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="block text-sm">
                                    <span className="mb-1 block text-xs text-slate-600">
                                        {discountType === 'PERCENTAGE'
                                            ? 'Percent off'
                                            : 'Amount off (₦)'}
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={
                                            discountType === 'PERCENTAGE'
                                                ? 100
                                                : undefined
                                        }
                                        step="0.01"
                                        value={discountValue}
                                        onChange={(e) =>
                                            setDiscountValue(e.target.value)
                                        }
                                        className="h-9 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-orion-blue/40"
                                    />
                                </label>
                                <label className="block text-sm">
                                    <span className="mb-1 block text-xs text-slate-600">
                                        Reason
                                    </span>
                                    <input
                                        type="text"
                                        value={discountReason}
                                        onChange={(e) =>
                                            setDiscountReason(e.target.value)
                                        }
                                        placeholder="Why"
                                        className="h-9 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-orion-blue/40"
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 rounded-lg border border-orion-blue/30 bg-[#E8F3FF] p-2.5 text-sm">
                                <div>
                                    <p className="text-[11px] text-orion-blue">
                                        Discount
                                        {discountType === 'PERCENTAGE' &&
                                        parsedValue > 0
                                            ? ` (${Math.min(parsedValue, 100)}%)`
                                            : ''}
                                    </p>
                                    <p className="font-medium tabular-nums text-orion-blue">
                                        -{formatOrderMoney(discountAmount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-500">
                                        New total
                                    </p>
                                    <p className="font-semibold tabular-nums text-slate-900">
                                        {formatOrderMoney(newTotal)}
                                    </p>
                                </div>
                                {paid > 0 ? (
                                    <>
                                        <div>
                                            <p className="text-[11px] text-slate-500">
                                                Already paid
                                            </p>
                                            <p className="tabular-nums text-slate-700">
                                                {formatOrderMoney(paid)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-slate-500">
                                                Still due
                                            </p>
                                            <p className="font-medium tabular-nums text-slate-900">
                                                {formatOrderMoney(dueAfter)}
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="border-t px-4 py-3">
                        {queued ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    onDraftClear?.();
                                    setOpen(false);
                                }}
                            >
                                Clear
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="button"
                            size="sm"
                            className="bg-orion-blue text-white hover:bg-orion-blue"
                            disabled={
                                loading ||
                                !canSubmit ||
                                (mode === 'persisted' && !hasSavedOrder)
                            }
                            onClick={() => {
                                void handleApply();
                            }}
                        >
                            {loading ? 'Applying…' : 'Apply discount'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PermissionGate>
    );
}
