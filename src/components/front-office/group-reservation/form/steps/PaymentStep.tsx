'use client';

import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import { getInternalAccounts } from '@/app/actions/internal-accounts';
import { WaiveChargesPanel } from '@/components/front-office/common/WaiveChargesPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn, formatBankAccountLabel, formatCurrency } from '@/lib/utils';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
    GROUP_PAYMENT_METHODS,
    groupFieldClass,
    groupLabelClass,
} from '../../constants';
import type { GroupBillingMode, GroupPaymentMethod } from '../../types';
import {
    GroupReadOnlyField,
    GroupSelectField,
    GroupTextField,
} from '../GroupFormFields';

const BILLING_OPTIONS = [
    { value: 'group', label: 'Group Billing (master folio)' },
    { value: 'individual', label: 'Individual Billing (per guest folio)' },
];

const DISCOUNT_TYPE_OPTIONS = [
    { value: 'PERCENTAGE', label: 'Percentage (%)' },
    { value: 'FIXED_AMOUNT', label: 'Fixed amount (₦)' },
];

export type GroupPaymentAdjustments = {
    standardize: boolean;
    standardRate: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | '';
    discountValue: string;
    waiveVat: boolean;
    waiveServiceCharge: boolean;
    waiveTip: boolean;
    waiveCustomCharges: boolean;
    waiverReason: string;
};

export type GroupChargeBreakdown = {
    roomSubtotal: number;
    discountAmount: number;
    afterDiscount: number;
    vat: number;
    serviceCharge: number;
    grandTotal: number;
    vatRate: number;
    serviceChargeRate: number;
    tip: number;
    tipRate: number;
    unwaivedVat: number;
    unwaivedServiceCharge: number;
    unwaivedTip: number;
    customChargeLines: Array<{
        id?: number;
        name: string;
        rate: number;
        amount: number;
    }>;
    unwaivedCustomCharges: number;
    unwaivedTotal: number;
};

export function PaymentStep({
    nights,
    totalRooms,
    breakdown,
    paymentMethod,
    receivingAccount,
    billingMode,
    deposit,
    adjustments,
    onPaymentMethod,
    onReceivingAccount,
    onBillingMode,
    onDeposit,
    onAdjustments,
}: {
    nights: number;
    totalRooms: number;
    breakdown: GroupChargeBreakdown;
    paymentMethod: GroupPaymentMethod | '';
    receivingAccount: string;
    billingMode: GroupBillingMode;
    deposit: string;
    adjustments: GroupPaymentAdjustments;
    onPaymentMethod: (value: GroupPaymentMethod | '') => void;
    onReceivingAccount: (value: string) => void;
    onBillingMode: (value: GroupBillingMode) => void;
    onDeposit: (value: string) => void;
    onAdjustments: (patch: Partial<GroupPaymentAdjustments>) => void;
}) {
    const [showHint, setShowHint] = useState(true);
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { data: internalAccounts = [] } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );
    const accountOptions = useMemo(() => {
        if (paymentMethod === 'internal_account') {
            return (Array.isArray(internalAccounts) ? internalAccounts : []).map(
                (account) => ({
                    value: account.accountCode || String(account.id),
                    label: `${account.accountName} (${account.accountCode})`,
                }),
            );
        }
        return (Array.isArray(bankAccounts) ? bankAccounts : []).map(
            (account) => ({
                value: String(account.accountNumber || ''),
                label: formatBankAccountLabel(account),
            }),
        ).filter((option) => option.value);
    }, [bankAccounts, internalAccounts, paymentMethod]);
    const paid = Math.min(
        Math.max(0, Number(deposit) || 0),
        breakdown.grandTotal,
    );
    const outstanding = Math.max(0, breakdown.grandTotal - paid);
    const nightlyDisplay =
        totalRooms > 0
            ? breakdown.roomSubtotal / Math.max(1, nights) / totalRooms
            : 0;

    return (
        <div className="space-y-4">
            <p className="-mt-2 text-sm text-muted-foreground">
                Payment method is optional. Select one if you are collecting
                payment now.
            </p>

            {showHint && (
                <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50/70 px-4 py-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-emerald-800">
                            Check ADR before you discount
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-700">
                            Opens the same what-if calculator as the ADR page,
                            with this stay&apos;s first night and nightly rate
                            pre-filled.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Dismiss"
                        onClick={() => setShowHint(false)}
                        className="text-emerald-700 hover:text-emerald-900"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            <label className="flex items-start gap-3 rounded-md border border-gray-200 px-3 py-3">
                <Checkbox
                    checked={adjustments.standardize}
                    onCheckedChange={(checked) =>
                        onAdjustments({
                            standardize: checked === true,
                            standardRate:
                                checked === true
                                    ? adjustments.standardRate ||
                                      String(Math.round(nightlyDisplay) || '')
                                    : adjustments.standardRate,
                        })
                    }
                />
                <span>
                    <span className="block text-sm font-medium text-foreground">
                        Pricing standardization
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                        Apply one flat nightly rate to every room in this group,
                        regardless of room type.
                    </span>
                </span>
            </label>

            {adjustments.standardize ? (
                <GroupTextField
                    id="standard-rate"
                    label="Standard nightly rate"
                    placeholder="Enter flat rate for all rooms"
                    inputMode="decimal"
                    value={adjustments.standardRate}
                    onChange={(standardRate) =>
                        onAdjustments({ standardRate })
                    }
                />
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GroupReadOnlyField
                    id="nightly-rate"
                    label="Nightly Rate"
                    value={`${formatCurrency(nightlyDisplay)} × ${nights} night${nights === 1 ? '' : 's'} × ${totalRooms} room${totalRooms === 1 ? '' : 's'}`}
                />
                <GroupReadOnlyField
                    id="nights"
                    label="Number Of Nights"
                    value={String(nights)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GroupSelectField
                    id="discount-type"
                    label="Discount Type"
                    placeholder="No discount"
                    value={adjustments.discountType || '__none'}
                    options={[
                        { value: '__none', label: 'No discount' },
                        ...DISCOUNT_TYPE_OPTIONS,
                    ]}
                    onChange={(value) =>
                        onAdjustments({
                            discountType:
                                value === '__none'
                                    ? ''
                                    : (value as 'PERCENTAGE' | 'FIXED_AMOUNT'),
                            discountValue:
                                value === '__none'
                                    ? ''
                                    : adjustments.discountValue,
                        })
                    }
                />
                {adjustments.discountType ? (
                    <GroupTextField
                        id="discount-value"
                        label={
                            adjustments.discountType === 'PERCENTAGE'
                                ? 'Discount Value (%)'
                                : 'Discount Value (₦)'
                        }
                        placeholder="0"
                        inputMode="decimal"
                        value={adjustments.discountValue}
                        onChange={(discountValue) =>
                            onAdjustments({ discountValue })
                        }
                    />
                ) : (
                    <GroupReadOnlyField
                        id="discount-amount"
                        label="Discount"
                        value={formatCurrency(breakdown.discountAmount)}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <GroupReadOnlyField
                    id="subtotal"
                    label="Subtotal (before VAT)"
                    value={formatCurrency(breakdown.afterDiscount)}
                />
                <GroupReadOnlyField
                    id="vat"
                    label={`VAT (${breakdown.vatRate.toFixed(2)}%)`}
                    value={formatCurrency(breakdown.vat)}
                />
                <GroupReadOnlyField
                    id="outstanding"
                    label="Outstanding Amount"
                    value={formatCurrency(outstanding)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GroupReadOnlyField
                    id="service-charge"
                    label={`Service Charge (${breakdown.serviceChargeRate.toFixed(2)}%)`}
                    value={formatCurrency(breakdown.serviceCharge)}
                />
                {breakdown.tipRate > 0 ? (
                    <GroupReadOnlyField
                        id="tip"
                        label={`Tip (${breakdown.tipRate.toFixed(2)}%)`}
                        value={formatCurrency(breakdown.tip)}
                    />
                ) : null}
                {breakdown.customChargeLines.length > 0 ? (
                    <GroupReadOnlyField
                        id="custom-charges"
                        label="Custom Charges"
                        value={formatCurrency(
                            adjustments.waiveCustomCharges
                                ? 0
                                : breakdown.unwaivedCustomCharges,
                        )}
                    />
                ) : null}
                <GroupReadOnlyField
                    id="grand-total"
                    label="Total (Incl. All Charges)"
                    value={formatCurrency(breakdown.grandTotal)}
                />
            </div>

            <WaiveChargesPanel
                idPrefix="group-"
                defaultExpanded
                title="Waive Charges"
                description="Select specific tax or fee charges to waive for this reservation"
                formatCurrency={formatCurrency}
                waiverData={{
                    vat: adjustments.waiveVat,
                    serviceCharge: adjustments.waiveServiceCharge,
                    tip: adjustments.waiveTip,
                    customCharges: adjustments.waiveCustomCharges,
                    waiverReason: adjustments.waiverReason,
                }}
                onWaiverChange={(waiver) =>
                    onAdjustments({
                        waiveVat: waiver.vat,
                        waiveServiceCharge: waiver.serviceCharge,
                        waiveTip: waiver.tip,
                        waiveCustomCharges: waiver.customCharges,
                        waiverReason: waiver.waiverReason,
                    })
                }
                calculations={{
                    vatAmount: breakdown.unwaivedVat,
                    vatRate: breakdown.vatRate,
                    serviceChargeAmount: breakdown.unwaivedServiceCharge,
                    serviceChargeRate: breakdown.serviceChargeRate,
                    tipAmount: breakdown.unwaivedTip,
                    tipRate: breakdown.tipRate,
                    customCharges: breakdown.customChargeLines,
                    totalCustomChargesAmount: breakdown.unwaivedCustomCharges,
                    totalWithCustomCharges: breakdown.unwaivedTotal,
                    totalWithTip:
                        breakdown.afterDiscount +
                        breakdown.unwaivedVat +
                        breakdown.unwaivedServiceCharge +
                        breakdown.unwaivedTip,
                    totalWithServiceCharge:
                        breakdown.afterDiscount +
                        breakdown.unwaivedVat +
                        breakdown.unwaivedServiceCharge,
                    totalWithVat: breakdown.afterDiscount + breakdown.unwaivedVat,
                }}
            />

            <div>
                <label
                    htmlFor="amount-paid"
                    className={cn(
                        groupLabelClass,
                        'text-xs font-medium uppercase tracking-wide',
                    )}
                >
                    Amount Paid
                </label>
                <Input
                    id="amount-paid"
                    inputMode="decimal"
                    value={
                        deposit
                            ? Number(deposit).toLocaleString('en-NG', {
                                  maximumFractionDigits: 2,
                              })
                            : ''
                    }
                    placeholder="0"
                    onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = raw.split('.');
                        const clean =
                            parts[0] +
                            (parts.length > 1 ? `.${parts[1]}` : '');
                        onDeposit(clean);
                    }}
                    className={groupFieldClass}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GroupSelectField
                    id="payment-method"
                    label="Payment Method"
                    placeholder="Select payment method (optional)"
                    value={paymentMethod || '__none'}
                    options={[
                        { value: '__none', label: 'None' },
                        ...GROUP_PAYMENT_METHODS,
                    ]}
                    onChange={(value) =>
                        onPaymentMethod(
                            value === '__none'
                                ? ''
                                : (value as GroupPaymentMethod),
                        )
                    }
                />
                <GroupSelectField
                    id="receiving-account"
                    label={
                        paymentMethod === 'internal_account'
                            ? 'Internal Account'
                            : 'Account to pay into'
                    }
                    placeholder={
                        !paymentMethod
                            ? 'Select a payment method first'
                            : accountOptions.length === 0
                              ? paymentMethod === 'internal_account'
                                  ? 'No internal accounts available'
                                  : 'No bank accounts available'
                              : paymentMethod === 'internal_account'
                                ? 'Select internal account'
                                : 'Select account'
                    }
                    value={receivingAccount}
                    options={accountOptions}
                    disabled={!paymentMethod || accountOptions.length === 0}
                    onChange={onReceivingAccount}
                />
            </div>

            <GroupSelectField
                id="billing-mode"
                label="Billing"
                value={billingMode}
                options={BILLING_OPTIONS}
                onChange={(value) =>
                    onBillingMode(value as GroupBillingMode)
                }
            />
        </div>
    );
}
