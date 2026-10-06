'use client';

import { applyOrderWaiver } from '@/app/actions/order';
import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { BadgePercent, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

export type OrderWaiverOrder = {
    id: number;
    vatAmount?: number | string;
    serviceChargeAmount?: number | string;
    tipAmount?: number | string;
    totalCustomChargesAmount?: number | string;
    vatRateSnapshot?: number | string;
    serviceChargeRateSnapshot?: number | string;
    tipRateSnapshot?: number | string;
    waivedCharges?: {
        vat?: boolean;
        serviceCharge?: boolean;
        tip?: boolean;
        customCharges?: boolean;
        waivedByName?: string | null;
    } | null;
    waivedAmount?: number | string;
    waiverReason?: string | null;
};

interface OrderChargeWaiverProps {
    order: OrderWaiverOrder;
    onSuccess?: () => void;
    /** Render a custom trigger instead of the default button */
    trigger?: React.ReactNode;
    disabled?: boolean;
}

const formatNaira = (v: number | string | undefined) =>
    `₦${Number(v ?? 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function OrderChargeWaiver({
    order,
    onSuccess,
    trigger,
    disabled = false,
}: OrderChargeWaiverProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [waiverData, setWaiverData] = useState({
        vat: order.waivedCharges?.vat ?? false,
        serviceCharge: order.waivedCharges?.serviceCharge ?? false,
        tip: order.waivedCharges?.tip ?? false,
        customCharges: order.waivedCharges?.customCharges ?? false,
        waiverReason: order.waiverReason ?? '',
    });

    const vatAmt = Number(order.vatAmount ?? 0);
    const scAmt = Number(order.serviceChargeAmount ?? 0);
    const tipAmt = Number(order.tipAmount ?? 0);
    const customAmt = Number(order.totalCustomChargesAmount ?? 0);

    const hasAnyCharge = vatAmt > 0 || scAmt > 0 || tipAmt > 0 || customAmt > 0;
    const hasSelection =
        waiverData.vat ||
        waiverData.serviceCharge ||
        waiverData.tip ||
        waiverData.customCharges;

    const handleOpen = (v: boolean) => {
        if (disabled) return;
        if (v) {
            // Reset to current persisted state when re-opening
            setWaiverData({
                vat: order.waivedCharges?.vat ?? false,
                serviceCharge: order.waivedCharges?.serviceCharge ?? false,
                tip: order.waivedCharges?.tip ?? false,
                customCharges: order.waivedCharges?.customCharges ?? false,
                waiverReason: order.waiverReason ?? '',
            });
        }
        setOpen(v);
    };

    const handleApply = async () => {
        setIsLoading(true);
        try {
            const response = await applyOrderWaiver(order.id, {
                vat: waiverData.vat,
                serviceCharge: waiverData.serviceCharge,
                tip: waiverData.tip,
                customCharges: waiverData.customCharges,
                waiverReason: waiverData.waiverReason || undefined,
            });

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error!}
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Waiver applied"
                    description="Charge waiver has been saved on this order."
                    type="success"
                />
            ));

            mutate('order-payment');
            mutate('/orders/query/all');
            mutate('/orders/query/running');
            mutate('/orders/query/ready');
            mutate('/orders/query/settled');

            setOpen(false);
            onSuccess?.();
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasAnyCharge) return null;

    const alreadyWaived =
        Number(order.waivedAmount ?? 0) > 0;

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={disabled}
                        title={disabled ? 'This order is voided.' : undefined}
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                    >
                        <BadgePercent className="w-3.5 h-3.5 ml-0.5" />
                        {alreadyWaived ? 'Edit Waiver' : 'Waive Charges'}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Waive Charges — Order #{order.id}
                    </DialogTitle>
                </DialogHeader>

                {alreadyWaived && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                        A waiver of <strong>{formatNaira(order.waivedAmount)}</strong>{' '}
                        is already applied
                        {order.waivedCharges?.waivedByName
                            ? ` by ${order.waivedCharges.waivedByName}`
                            : ''}.
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <p className="text-sm font-medium text-muted-foreground">
                            Select charges to waive:
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-orange-700 hover:text-orange-800">
                            <Checkbox
                                id="waiver-select-all"
                                checked={
                                    (vatAmt === 0 || waiverData.vat) &&
                                    (scAmt === 0 || waiverData.serviceCharge) &&
                                    (tipAmt === 0 || waiverData.tip) &&
                                    (customAmt === 0 || waiverData.customCharges) &&
                                    hasSelection
                                }
                                onCheckedChange={(v) => {
                                    const checked = v === true;
                                    setWaiverData((p) => ({
                                        ...p,
                                        vat: vatAmt > 0 ? checked : false,
                                        serviceCharge: scAmt > 0 ? checked : false,
                                        tip: tipAmt > 0 ? checked : false,
                                        customCharges: customAmt > 0 ? checked : false,
                                    }));
                                }}
                            />
                            <span>Select All</span>
                        </label>
                    </div>

                    {vatAmt > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                id="waiver-vat"
                                checked={waiverData.vat}
                                onCheckedChange={(v) =>
                                    setWaiverData((p) => ({ ...p, vat: v === true }))
                                }
                            />
                            <span className="text-sm flex-1">
                                VAT
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(vatAmt)})
                                </span>
                            </span>
                        </label>
                    )}

                    {scAmt > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                id="waiver-sc"
                                checked={waiverData.serviceCharge}
                                onCheckedChange={(v) =>
                                    setWaiverData((p) => ({
                                        ...p,
                                        serviceCharge: v === true,
                                    }))
                                }
                            />
                            <span className="text-sm flex-1">
                                Service Charge
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(scAmt)})
                                </span>
                            </span>
                        </label>
                    )}

                    {tipAmt > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                id="waiver-tip"
                                checked={waiverData.tip}
                                onCheckedChange={(v) =>
                                    setWaiverData((p) => ({ ...p, tip: v === true }))
                                }
                            />
                            <span className="text-sm flex-1">
                                Tip
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(tipAmt)})
                                </span>
                            </span>
                        </label>
                    )}

                    {customAmt > 0 && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                id="waiver-custom"
                                checked={waiverData.customCharges}
                                onCheckedChange={(v) =>
                                    setWaiverData((p) => ({
                                        ...p,
                                        customCharges: v === true,
                                    }))
                                }
                            />
                            <span className="text-sm flex-1">
                                Custom Charges
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(customAmt)})
                                </span>
                            </span>
                        </label>
                    )}

                    <InputField
                        id="waiver-reason"
                        name="waiverReason"
                        label="Reason (optional)"
                        type="text"
                        placeholder="Enter reason for waiver"
                        value={waiverData.waiverReason}
                        onChange={(e) =>
                            setWaiverData((p) => ({
                                ...p,
                                waiverReason: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={!hasSelection || isLoading}
                        onClick={handleApply}
                    >
                        {isLoading ? (
                            <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {isLoading ? 'Applying...' : 'Apply Waiver'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export type DraftWaiverPayload = {
    vat?: boolean;
    serviceCharge?: boolean;
    tip?: boolean;
    customCharges?: boolean;
    waiverReason?: string;
};

interface DraftOrderChargeWaiverProps {
    vatAmount?: number;
    serviceChargeAmount?: number;
    tipAmount?: number;
    customChargesAmount?: number;
    pendingWaiver?: DraftWaiverPayload | null;
    onApply: (waiver: DraftWaiverPayload) => void;
    onClear: () => void;
}

export function DraftOrderChargeWaiver({
    vatAmount = 0,
    serviceChargeAmount = 0,
    tipAmount = 0,
    customChargesAmount = 0,
    pendingWaiver,
    onApply,
    onClear,
}: DraftOrderChargeWaiverProps) {
    const [open, setOpen] = useState(false);
    const [waiverData, setWaiverData] = useState<DraftWaiverPayload>({
        vat: pendingWaiver?.vat ?? false,
        serviceCharge: pendingWaiver?.serviceCharge ?? false,
        tip: pendingWaiver?.tip ?? false,
        customCharges: pendingWaiver?.customCharges ?? false,
        waiverReason: pendingWaiver?.waiverReason ?? '',
    });

    const hasSelection =
        waiverData.vat ||
        waiverData.serviceCharge ||
        waiverData.tip ||
        waiverData.customCharges;

    const handleOpen = (v: boolean) => {
        if (v) {
            setWaiverData({
                vat: pendingWaiver?.vat ?? false,
                serviceCharge: pendingWaiver?.serviceCharge ?? false,
                tip: pendingWaiver?.tip ?? false,
                customCharges: pendingWaiver?.customCharges ?? false,
                waiverReason: pendingWaiver?.waiverReason ?? '',
            });
        }
        setOpen(v);
    };

    const handleConfirm = () => {
        onApply({
            vat: waiverData.vat,
            serviceCharge: waiverData.serviceCharge,
            tip: waiverData.tip,
            customCharges: waiverData.customCharges,
            waiverReason: waiverData.waiverReason?.trim() || undefined,
        });
        toast.custom(() => (
            <Toast
                title="Waiver set"
                description="Draft charge waiver configured for this order."
                type="success"
            />
        ));
        setOpen(false);
    };

    const handleClear = () => {
        onClear();
        setWaiverData({
            vat: false,
            serviceCharge: false,
            tip: false,
            customCharges: false,
            waiverReason: '',
        });
        toast.custom(() => (
            <Toast
                title="Waiver cleared"
                description="Draft charge waiver removed."
                type="info"
            />
        ));
        setOpen(false);
    };

    const isPending = Boolean(
        pendingWaiver &&
        (pendingWaiver.vat ||
            pendingWaiver.serviceCharge ||
            pendingWaiver.tip ||
            pendingWaiver.customCharges),
    );

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className={
                        isPending
                            ? 'border-orange-600 text-orange-600 bg-orange-50 font-medium'
                            : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                    }
                >
                    <BadgePercent className="w-3.5 h-3.5 ml-0.5" />
                    {isPending ? 'Waiver (Active)' : 'Waive Charges'}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Waive Charges (Draft Order)
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                        <p className="text-sm font-medium text-muted-foreground">
                            Select charges to waive:
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-orange-700 hover:text-orange-800">
                            <Checkbox
                                id="draft-waiver-select-all"
                                checked={
                                    waiverData.vat &&
                                    waiverData.serviceCharge &&
                                    waiverData.tip &&
                                    waiverData.customCharges
                                }
                                onCheckedChange={(v) => {
                                    const checked = v === true;
                                    setWaiverData((p) => ({
                                        ...p,
                                        vat: checked,
                                        serviceCharge: checked,
                                        tip: checked,
                                        customCharges: checked,
                                    }));
                                }}
                            />
                            <span>Select All</span>
                        </label>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                            id="draft-waiver-vat"
                            checked={waiverData.vat}
                            onCheckedChange={(v) =>
                                setWaiverData((p) => ({ ...p, vat: v === true }))
                            }
                        />
                        <span className="text-sm flex-1">
                            VAT
                            {vatAmount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(vatAmount)})
                                </span>
                            )}
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                            id="draft-waiver-sc"
                            checked={waiverData.serviceCharge}
                            onCheckedChange={(v) =>
                                setWaiverData((p) => ({
                                    ...p,
                                    serviceCharge: v === true,
                                }))
                            }
                        />
                        <span className="text-sm flex-1">
                            Service Charge
                            {serviceChargeAmount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(serviceChargeAmount)})
                                </span>
                            )}
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                            id="draft-waiver-tip"
                            checked={waiverData.tip}
                            onCheckedChange={(v) =>
                                setWaiverData((p) => ({ ...p, tip: v === true }))
                            }
                        />
                        <span className="text-sm flex-1">
                            Tip
                            {tipAmount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(tipAmount)})
                                </span>
                            )}
                        </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                            id="draft-waiver-custom"
                            checked={waiverData.customCharges}
                            onCheckedChange={(v) =>
                                setWaiverData((p) => ({
                                    ...p,
                                    customCharges: v === true,
                                }))
                            }
                        />
                        <span className="text-sm flex-1">
                            Custom Charges
                            {customChargesAmount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    ({formatNaira(customChargesAmount)})
                                </span>
                            )}
                        </span>
                    </label>

                    <InputField
                        id="draft-waiver-reason"
                        name="waiverReason"
                        label="Reason (optional)"
                        type="text"
                        placeholder="Enter reason for waiver"
                        value={waiverData.waiverReason || ''}
                        onChange={(e) =>
                            setWaiverData((p) => ({
                                ...p,
                                waiverReason: e.target.value,
                            }))
                        }
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    {isPending && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={!hasSelection}
                        onClick={handleConfirm}
                    >
                        Apply Waiver
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

