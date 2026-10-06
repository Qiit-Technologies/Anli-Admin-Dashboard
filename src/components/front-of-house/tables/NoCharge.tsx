'use client';

import { complimentOrder } from '@/app/actions/order';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import useHotel from '@/hooks/useHotel';
import { Staff } from '@/types/staff.types';
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BiArrowBack } from 'react-icons/bi';
import { OTPInput } from './OTPInput';

type OrderLine = {
    id?: number;
    lineKey?: string;
    name?: string;
    quantity: number;
    price: number | string | null;
    menuItem?: { name?: string };
    isComplimentary?: boolean;
};

type NoChargeOrder = {
    id?: number;
    orderType?: string;
    items?: OrderLine[];
};

export type DraftComplimentaryPayload = {
    lineKeys: string[];
    staffId: number;
    complimentReason: string;
    pin?: string;
    complimentaryAmount?: number;
};

type ApprovalMode = 'within-limit' | 'partial' | 'full';
type SelectionKey = string | number;

const formatNaira = (value: number) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(value);

const getLineLabel = (item: OrderLine) =>
    item.menuItem?.name ?? item.name ?? '—';

const getSelectionKey = (
    item: OrderLine,
    mode: 'draft' | 'persisted',
): SelectionKey | undefined => {
    if (mode === 'draft') {
        return item.lineKey;
    }
    return item.id;
};

export type NoChargeProps = {
    order: NoChargeOrder;
    mode?: 'draft' | 'persisted';
    draftComplimentary?: DraftComplimentaryPayload | null;
    onDraftApply?: (payload: DraftComplimentaryPayload) => void;
    onDraftClear?: () => void;
    onSuccess?: () => void;
    buttonLabel?: string;
    buttonTitle?: string;
    beforeSubmit?: () => Promise<boolean>;
    disabled?: boolean;
};

export default function NoCharge(props: NoChargeProps) {
    const {
        order,
        mode = 'persisted',
        draftComplimentary = null,
        onDraftApply,
        onDraftClear,
        onSuccess,
        buttonLabel,
        buttonTitle,
        beforeSubmit,
    } = props;
    const isLocked = props.disabled === true;
    const { organization } = useHotel();
    const complimentarySettings = organization?.complimentarySettings;

    const approvers = useMemo(
        () => complimentarySettings?.allowedApprovers ?? [],
        [complimentarySettings?.allowedApprovers],
    );

    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'items' | 'approval'>('items');
    const [approvalMode, setApprovalMode] =
        useState<ApprovalMode>('within-limit');
    const [selected, setSelected] = useState<SelectionKey[]>([]);
    const [otp, setOtp] = useState('');
    const [complimentReason, setComplimentReason] = useState('');
    const [staffId, setStaffId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const items: OrderLine[] = (order.items ?? []) as OrderLine[];
    const maxPerOrder = Number(complimentarySettings?.maxAmountPerOrder ?? 0);

    const resetForm = () => {
        setSelected([]);
        setStaffId(null);
        setOtp('');
        setComplimentReason('');
        setStep('items');
        setApprovalMode('within-limit');
    };

    useEffect(() => {
        if (!open || mode !== 'draft' || !draftComplimentary) {
            return;
        }

        setSelected(draftComplimentary.lineKeys);
        setStaffId(draftComplimentary.staffId);
        setComplimentReason(draftComplimentary.complimentReason);
        setOtp(draftComplimentary.pin ?? '');
        setApprovalMode(
            draftComplimentary.complimentaryAmount !== undefined
                ? 'partial'
                : 'within-limit',
        );
    }, [open, mode, draftComplimentary]);

    const handleCheck = (item: OrderLine) => {
        if (item.isComplimentary) return;
        const key = getSelectionKey(item, mode);
        if (key == null) return;

        setSelected((prev) =>
            prev.includes(key)
                ? prev.filter((id) => id !== key)
                : [...prev, key],
        );
    };

    const lineTotal = (item: OrderLine) =>
        Number(item.price ?? 0) * Number(item.quantity ?? 1);

    const selectedLines = items.filter((item) => {
        const key = getSelectionKey(item, mode);
        return key != null && selected.includes(key);
    });
    const selectedTotal = selectedLines.reduce(
        (sum, item) => sum + lineTotal(item),
        0,
    );
    const exceedsLimit = maxPerOrder > 0 && selectedTotal > maxPerOrder;
    const policyComplimentaryAmount = exceedsLimit
        ? maxPerOrder
        : selectedTotal;
    const policyRemaining = exceedsLimit
        ? Math.max(selectedTotal - maxPerOrder, 0)
        : 0;

    const selectableItems = items.filter((i) => !i.isComplimentary);
    const allSelectableSelected =
        selectableItems.length > 0 &&
        selectableItems.every((item) => {
            const key = getSelectionKey(item, mode);
            return key != null && selected.includes(key);
        });
    const someSelectableSelected = selectableItems.some((item) => {
        const key = getSelectionKey(item, mode);
        return key != null && selected.includes(key);
    });

    const toggleSelectAll = () => {
        if (allSelectableSelected) {
            setSelected([]);
            return;
        }
        const keys = selectableItems
            .map((item) => getSelectionKey(item, mode))
            .filter((key): key is SelectionKey => key != null);
        setSelected(keys);
    };

    const approverOptions = approvers.map((s: Staff) => ({
        value: String(s.id),
        label: s.fullName ?? `Staff ${s.id}`,
    }));

    const pinRequired = approvalMode === 'full';
    const pinDigits = otp.replace(/\D/g, '');
    const canSubmitApproval =
        staffId != null &&
        complimentReason.trim().length >= 2 &&
        approverOptions.length > 0 &&
        (!pinRequired || pinDigits.length === 4);

    const buildPayload = (): DraftComplimentaryPayload | null => {
        if (staffId == null) return null;

        const lineKeys = selected.filter(
            (key): key is string => typeof key === 'string',
        );
        const orderItemIds = selected.filter(
            (key): key is number => typeof key === 'number',
        );

        const payload: DraftComplimentaryPayload = {
            lineKeys: mode === 'draft' ? lineKeys : [],
            staffId,
            complimentReason: complimentReason.trim(),
        };

        if (approvalMode === 'partial') {
            payload.complimentaryAmount = policyComplimentaryAmount;
        }

        if (pinRequired) {
            payload.pin = otp;
        }

        if (mode === 'persisted') {
            if (!order.id || orderItemIds.length === 0) return null;
            return payload;
        }

        if (lineKeys.length === 0) return null;
        return payload;
    };

    const submit = async () => {
        const payload = buildPayload();
        if (!payload) return;

        if (mode === 'draft') {
            onDraftApply?.(payload);
            toast.custom(() => (
                <Toast
                    title="No charge configured"
                    description="Complimentary will be applied when you save the order."
                    type="success"
                />
            ));
            setOpen(false);
            resetForm();
            return;
        }

        if (!order.id) return;

        try {
            setIsLoading(true);
            if (beforeSubmit && !(await beforeSubmit())) return;
            const response = await complimentOrder(order.id, {
                orderItemIds: selected.filter(
                    (key): key is number => typeof key === 'number',
                ),
                staffId: payload.staffId,
                complimentReason: payload.complimentReason,
                pin: payload.pin,
                complimentaryAmount: payload.complimentaryAmount,
            });

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error}
                        type="error"
                    />
                ));
                return;
            }

            const result = response.data;
            const description =
                result?.complimentaryStatus === 'PARTIAL'
                    ? `Complimentary ${formatNaira(result.complimentaryAmount ?? 0)} applied. Balance due: ${formatNaira(result.remainingBalance ?? 0)}.`
                    : 'Selected items marked as complimentary.';

            toast.custom(() => (
                <Toast
                    title="Success"
                    description={description}
                    type="success"
                />
            ));
            setOpen(false);
            resetForm();
            onSuccess?.();
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueFromItems = () => {
        if (selected.length === 0) return;

        // Over limit → show Policy limit vs Full complimentary choice (never force Full).
        if (exceedsLimit) {
            setApprovalMode('partial');
        } else {
            setApprovalMode('within-limit');
        }
        setStep('approval');
    };

    const handleSubmitApproval = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            staffId == null ||
            complimentReason.trim().length < 2 ||
            (pinRequired && pinDigits.length !== 4)
        ) {
            return;
        }

        void submit();
    };

    const appliesToOrderType = Boolean(
        order.orderType &&
            complimentarySettings?.appliesTo?.includes(order.orderType),
    );
    const hasPersistedOrderId =
        Number.isFinite(order.id) && Number(order.id) > 0;
    const hasDraftLineKeys =
        items.length > 0 && items.every((item) => Boolean(item.lineKey));
    const canUseNoCharge =
        !isLocked &&
        Boolean(complimentarySettings?.enabled) &&
        appliesToOrderType &&
        (mode === 'draft' ? hasDraftLineKeys : hasPersistedOrderId);

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (isLocked) return;
                setOpen(next);
                if (!next) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-orion-blue hover:text-white bg-orion-blue"
                    disabled={!canUseNoCharge}
                    title={
                        mode === 'draft' && !hasDraftLineKeys
                            ? 'Add items before applying no charge.'
                            : !hasPersistedOrderId && mode === 'persisted'
                              ? 'Save order first before applying no charge.'
                              : !complimentarySettings?.enabled
                                ? 'Complimentary orders are disabled for this hotel.'
                                : !appliesToOrderType
                                  ? 'No charge is not enabled for this order type in hotel settings.'
                                  : buttonTitle
                    }
                >
                    {mode === 'draft' && draftComplimentary
                        ? buttonLabel
                            ? `${buttonLabel} set`
                            : 'No charge set'
                        : (buttonLabel ?? 'No charge')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex flex-row items-center gap-2">
                        {step === 'approval' ? (
                            <BiArrowBack
                                role="button"
                                tabIndex={0}
                                onClick={() => setStep('items')}
                                onKeyDown={(ev) => {
                                    if (ev.key === 'Enter' || ev.key === ' ')
                                        setStep('items');
                                }}
                                style={{ cursor: 'pointer' }}
                                size={30}
                                aria-label="Back"
                            />
                        ) : null}
                        <DialogTitle>
                            {step === 'items'
                                ? 'No charge'
                                : exceedsLimit && approvalMode === 'full'
                                  ? 'High value complimentary'
                                  : 'Complimentary approval'}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {step === 'items'
                            ? mode === 'draft'
                                ? 'Select lines to waive. Complimentary is applied when you save the order.'
                                : 'Select lines to waive. Totals and taxes update on the order.'
                            : pinRequired
                              ? 'This amount exceeds the policy limit. Approver PIN is required.'
                              : 'Select an approver and provide a reason.'}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'draft' && draftComplimentary ? (
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onDraftClear?.();
                                resetForm();
                                setOpen(false);
                            }}
                        >
                            Clear no charge
                        </Button>
                    </div>
                ) : null}

                {step === 'items' ? (
                    <div className="mt-2 rounded-lg border p-4">
                        <h2 className="text-sm font-semibold">Items</h2>
                        <div className="mt-4">
                            <div className="grid grid-cols-4 gap-2 bg-gray-100 p-3 text-sm text-muted-foreground">
                                <span>Item</span>
                                <span>Qty</span>
                                <span>Line total</span>
                                <span className="flex items-center justify-end gap-2">
                                    <span>Select</span>
                                    {selectableItems.length > 0 ? (
                                        <Checkbox
                                            checked={
                                                allSelectableSelected
                                                    ? true
                                                    : someSelectableSelected
                                                      ? 'indeterminate'
                                                      : false
                                            }
                                            aria-label="Select all items"
                                            onCheckedChange={toggleSelectAll}
                                            onClick={(ev) =>
                                                ev.stopPropagation()
                                            }
                                        />
                                    ) : null}
                                </span>
                            </div>
                            {items.map((item) => {
                                const key = getSelectionKey(item, mode);
                                return (
                                    <div
                                        className="grid grid-cols-4 items-center gap-2 border-b px-3 py-3 text-sm text-muted-foreground"
                                        key={key ?? getLineLabel(item)}
                                    >
                                        <span>{getLineLabel(item)}</span>
                                        <span>{item.quantity}</span>
                                        <span>
                                            {item.isComplimentary
                                                ? '0 (complimentary)'
                                                : lineTotal(item).toFixed(2)}
                                        </span>
                                        <div className="flex justify-end">
                                            <Checkbox
                                                checked={
                                                    key != null &&
                                                    selected.includes(key)
                                                }
                                                disabled={
                                                    !!item.isComplimentary ||
                                                    key == null
                                                }
                                                onCheckedChange={() =>
                                                    handleCheck(item)
                                                }
                                                onClick={(ev) =>
                                                    ev.stopPropagation()
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {selected.length > 0 ? (
                            <div className="mt-3 space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Selected total: {formatNaira(selectedTotal)}
                                </p>
                                {exceedsLimit ? (
                                    <p className="text-xs text-muted-foreground">
                                        {allSelectableSelected
                                            ? `All items selected exceeds the ${formatNaira(maxPerOrder)} policy limit — Full complimentary (PIN) is required.`
                                            : `Selection exceeds the ${formatNaira(maxPerOrder)} policy limit. On the next step choose policy limit only, or Full complimentary with PIN.`}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmitApproval}>
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Order total (selected)
                                </span>
                                <span className="font-medium">
                                    {formatNaira(selectedTotal)}
                                </span>
                            </div>
                            {exceedsLimit ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Policy limit
                                        </span>
                                        <span>{formatNaira(maxPerOrder)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Complimentary amount
                                        </span>
                                        <span className="font-medium">
                                            {formatNaira(
                                                approvalMode === 'full'
                                                    ? selectedTotal
                                                    : policyComplimentaryAmount,
                                            )}
                                        </span>
                                    </div>
                                    {approvalMode !== 'full' ? (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Remaining payable
                                            </span>
                                            <span className="font-medium">
                                                {formatNaira(policyRemaining)}
                                            </span>
                                        </div>
                                    ) : null}
                                </>
                            ) : null}
                        </div>

                        {exceedsLimit ? (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        approvalMode === 'partial'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={
                                        approvalMode === 'partial'
                                            ? 'bg-orion-blue text-white hover:bg-orion-blue'
                                            : ''
                                    }
                                    onClick={() => setApprovalMode('partial')}
                                >
                                    Policy limit only
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        approvalMode === 'full'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={
                                        approvalMode === 'full'
                                            ? 'bg-orion-blue text-white hover:bg-orion-blue'
                                            : ''
                                    }
                                    onClick={() => {
                                        setApprovalMode('full');
                                        setOtp('');
                                    }}
                                >
                                    Full complimentary
                                </Button>
                            </div>
                        ) : null}

                        <SelectField
                            id="approver-staff"
                            name="approverStaff"
                            label="Approved by"
                            value={staffId != null ? String(staffId) : ''}
                            onValueChange={(value: string) => {
                                setStaffId(Number(value));
                            }}
                            options={approverOptions}
                            placeholder="Select approver"
                            className="w-full"
                        />

                        {pinRequired ? (
                            <OTPInput
                                length={4}
                                value={otp}
                                onChange={setOtp}
                            />
                        ) : null}

                        <InputField
                            id="complimentReason"
                            name="complimentReason"
                            placeholder="Reason (required)"
                            label="Reason"
                            value={complimentReason}
                            onChange={(e) =>
                                setComplimentReason(e.target.value)
                            }
                        />

                        <Button
                            type="submit"
                            variant="default"
                            size="lg"
                            disabled={isLoading || !canSubmitApproval}
                            className="mt-2 w-full bg-orion-blue text-white hover:bg-orion-blue"
                        >
                            {isLoading
                                ? 'Working…'
                                : mode === 'draft'
                                  ? 'Set no charge'
                                  : pinRequired
                                    ? 'Approve complimentary'
                                    : 'Apply complimentary'}
                        </Button>
                    </form>
                )}

                {step === 'items' ? (
                    <Button
                        type="button"
                        onClick={handleContinueFromItems}
                        variant="default"
                        size="lg"
                        disabled={
                            selected.length === 0 ||
                            approverOptions.length === 0
                        }
                        className="mt-2 w-full bg-orion-blue text-white hover:bg-orion-blue"
                    >
                        Continue
                    </Button>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
