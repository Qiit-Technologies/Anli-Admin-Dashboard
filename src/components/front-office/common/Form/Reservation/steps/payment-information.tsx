import { GuestProfile } from '@/app/actions/guest-profile';
import { getInternalAccounts } from '@/app/actions/internal-accounts';
import { ChargeSwitch } from '@/components/front-office/common/ChargeSwitch';
import { WaiveChargesPanel } from '@/components/front-office/common/WaiveChargesPanel';
import { InputField, SelectField } from '@/components/common/Form';
import AdrWhatIfReservationCallout from '@/components/front-office/adr-report/AdrWhatIfReservationCallout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import React from 'react';
import useSWR from 'swr';
import useHotel from '@/hooks/useHotel';
import { FormColumn } from '../components';
import { StepProps } from '../types';

export function PaymentMethodStep({
    formData,
    handleInputChange,
    errors,
    inputClass,
    reservationType,
    updatePayment,
    remappedBankAccounts,
    outstandingAmount,
    formatCurrency,
    discountCalculations,
    selectedProfile,
    applyCredit,
    onApplyCreditChange,
    waiverData,
    onWaiverChange,
}: StepProps & {
    reservationType: 'REGULAR' | 'COMPLIMENTARY' | 'DISCOUNT' | 'VOID';
    updatePayment: (field: string, value: string) => void;
    remappedBankAccounts: any[];
    outstandingAmount: number;
    formatCurrency: (amount: number) => string;
    discountCalculations?: {
        originalPrice: number;
        discountAmount: number;
        finalPrice: number;
        remainingAmount: number;
        hasDiscount: boolean;
        nights: number;
        subtotal: number;
        vatAmount: number;
        vatRate: number;
        totalWithVat: number;
        serviceChargeAmount?: number;
        serviceChargeRate?: number;
        totalWithServiceCharge?: number;
        tipAmount?: number;
        tipRate?: number;
        totalWithTip?: number;
        customCharges?: Array<{
            id: number;
            name: string;
            rate: number;
            amount: number;
        }>;
        totalCustomChargesAmount?: number;
        totalWithCustomCharges?: number;
    };
    selectedProfile?: GuestProfile | null;
    applyCredit?: boolean;
    onApplyCreditChange?: (apply: boolean) => void;
    waiverData?: {
        vat: boolean;
        serviceCharge: boolean;
        tip: boolean;
        customCharges: boolean;
        waiverReason: string;
    };
    onWaiverChange?: (data: {
        vat: boolean;
        serviceCharge: boolean;
        tip: boolean;
        customCharges: boolean;
        waiverReason: string;
    }) => void;
}) {
    const { organization } = useHotel();
    const creditBalance = (selectedProfile as any)?.creditBalance || 0;
    const { data: internalAccounts = [] } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );
    const remappedInternalAccounts = internalAccounts.map((account) => ({
        label: `${account.accountName} (${account.accountCode})`,
        value: account.accountCode || account.id,
    }));

    // Automatically apply credit if profile is selected and has sufficient balance
    // User can still toggle it off manually if they don't want to apply credit
    const shouldAutoApply =
        selectedProfile && creditBalance > 0 && outstandingAmount > 0;
    const creditToApply =
        shouldAutoApply || applyCredit
            ? Math.min(creditBalance, outstandingAmount)
            : 0;
    const newOutstanding = Math.max(0, outstandingAmount - creditToApply);

    // Update creditToApply in form data when profile or outstanding changes
    // Note: We don't update outstanding here - it should be the amount BEFORE credit
    // The backend will handle credit application and create receivable correctly
    React.useEffect(() => {
        // Don't update outstanding here - it should remain as outstandingAmount (before credit)
        // The display shows newOutstanding (after credit) but backend needs original outstanding
        // Only update creditToApply, not outstanding

        if (!selectedProfile) {
            // No profile selected, clear credit
            handleInputChange('creditToApply', 0);
            if (onApplyCreditChange && applyCredit) {
                onApplyCreditChange(false);
            }
            return;
        }

        if (shouldAutoApply && creditToApply > 0) {
            // Auto-apply credit when profile is selected with sufficient balance
            handleInputChange('creditToApply', creditToApply);
            if (onApplyCreditChange && !applyCredit) {
                onApplyCreditChange(true);
            }
        } else if (applyCredit && creditToApply > 0) {
            // Manual apply via toggle
            handleInputChange('creditToApply', creditToApply);
        } else {
            // No credit to apply
            handleInputChange('creditToApply', 0);
        }
    }, [selectedProfile?.id, creditBalance, outstandingAmount, newOutstanding, applyCredit, shouldAutoApply]);

    return (
        <>
            {formData.isComplimentary && (
                <FormColumn>
                    <div className="bg-green-100 p-4 rounded-lg flex items-center text-center">
                        <p className="text-green-600 text-sm font-medium">
                            This reservation is marked as Complimentary
                        </p>
                    </div>
                </FormColumn>
            )}

            {formData.isVoid && (
                <FormColumn>
                    <InputField
                        id="voidReason"
                        name="voidReason"
                        label="Void Reason"
                        placeholder="Enter reason for voiding"
                        className={inputClass}
                        value={formData.voidReason || ''}
                        onChange={(e) =>
                            handleInputChange('voidReason', e.target.value)
                        }
                    />
                    {errors.voidReason && (
                        <div className="text-red-500 text-sm">
                            {errors.voidReason}
                        </div>
                    )}
                </FormColumn>
            )}

            {!formData.isVoid &&
                !formData.isComplimentary &&
                formData.startDate &&
                (reservationType === 'REGULAR' ||
                    reservationType === 'DISCOUNT') && (
                    <FormColumn>
                        <AdrWhatIfReservationCallout
                            stayDateYmd={formData.startDate.slice(0, 10)}
                            nightlyRoomRate={
                                discountCalculations?.originalPrice ?? 0
                            }
                        />
                    </FormColumn>
                )}

            {formData.discountType && (
                <>
                    <FormColumn>
                        <InputField
                            id="nightlyRate"
                            name="nightlyRate"
                            label="Nightly Rate"
                            type="text"
                            className={`${inputClass} bg-gray-50`}
                            readOnly={true}
                            value={`${formatCurrency(discountCalculations?.originalPrice || 0)} x ${discountCalculations?.nights}`}
                        />
                    </FormColumn>
                    <FormColumn>
                        <InputField
                            id="numberOfNights"
                            name="numberOfNights"
                            label="Number of Nights"
                            type="text"
                            className={`${inputClass} bg-gray-50`}
                            readOnly={true}
                            value={
                                discountCalculations?.nights?.toString() || ''
                            }
                        />
                    </FormColumn>
                    <FormColumn>
                        <SelectField
                            id="discountType"
                            name="discountType"
                            label="Discount Type"
                            className={inputClass}
                            value={formData.discountType}
                            onValueChange={(value) =>
                                handleInputChange(
                                    'discountType',
                                    value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                                )
                            }
                            options={[
                                {
                                    value: 'PERCENTAGE',
                                    label: 'Percentage',
                                },
                                {
                                    value: 'FIXED_AMOUNT',
                                    label: 'Fixed Amount',
                                },
                            ]}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="discountValue"
                            name="discountValue"
                            label={`Discount Value ${formData.discountType === 'PERCENTAGE' ? '(%)' : '(₦)'}`}
                            type="number"
                            step={
                                formData.discountType === 'PERCENTAGE'
                                    ? 'any'
                                    : '0.01'
                            }
                            placeholder={
                                formData.discountType === 'PERCENTAGE'
                                    ? 'Enter percentage (e.g., 10.5)'
                                    : 'Enter amount (e.g., 1500.50)'
                            }
                            className={inputClass}
                            value={formData.discountValue?.toString() || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                    handleInputChange('discountValue', 0);
                                } else {
                                    const numericValue = parseFloat(value);
                                    if (!isNaN(numericValue)) {
                                        handleInputChange(
                                            'discountValue',
                                            numericValue,
                                        );
                                    }
                                }
                            }}
                            min="0"
                            max={
                                formData.discountType === 'PERCENTAGE'
                                    ? '100'
                                    : undefined
                            }
                        />
                    </FormColumn>

                    {discountCalculations?.hasDiscount &&
                        !formData.isComplimentary && (
                            <>
                                <FormColumn>
                                    <InputField
                                        id="originalPrice"
                                        name="originalPrice"
                                        label="Subtotal (Before VAT)"
                                        type="text"
                                        className={`${inputClass} bg-gray-50`}
                                        readOnly={true}
                                        value={formatCurrency(
                                            discountCalculations.subtotal,
                                        )}
                                    />
                                </FormColumn>

                                <FormColumn>
                                    <InputField
                                        id="discountAmount"
                                        name="discountAmount"
                                        label="Discount Amount"
                                        type="text"
                                        className={`${inputClass} bg-red-50 text-red-600`}
                                        readOnly={true}
                                        value={`-${formatCurrency(discountCalculations.discountAmount)}`}
                                    />
                                </FormColumn>

                                <FormColumn>
                                    <InputField
                                        id="finalPrice"
                                        name="finalPrice"
                                        label="Final Price After Discount"
                                        type="text"
                                        className={`${inputClass} bg-green-50 text-green-600 font-semibold`}
                                        readOnly={true}
                                        value={formatCurrency(
                                            discountCalculations.finalPrice,
                                        )}
                                    />
                                </FormColumn>

                                {(discountCalculations?.vatRate ?? 0) > 0 &&
                                    !(organization?.frontOfficeVatInclusive) && (
                                        <FormColumn>
                                            <ChargeSwitch
                                                id="includeVat-discount"
                                                label={`VAT (${discountCalculations?.vatRate?.toFixed(2)}%)`}
                                                description={
                                                    formData.includeVat !== false
                                                        ? `Amount: ${formatCurrency(discountCalculations?.vatAmount || 0)}`
                                                        : 'VAT will not be added'
                                                }
                                                checked={formData.includeVat !== false}
                                                onCheckedChange={(checked) => {
                                                    handleInputChange(
                                                        'includeVat',
                                                        checked,
                                                    );
                                                    if (waiverData && onWaiverChange) {
                                                        onWaiverChange({
                                                            ...waiverData,
                                                            vat: !checked,
                                                        });
                                                    }
                                                }}
                                            />
                                        </FormColumn>
                                    )}

                                {(discountCalculations?.serviceChargeRate ??
                                    0) > 0 && (
                                        <FormColumn>
                                            <InputField
                                                id="serviceChargeAmount"
                                                name="serviceChargeAmount"
                                                label={`Service Charge (${discountCalculations?.serviceChargeRate?.toFixed(2)}%)`}
                                                type="text"
                                                className={`${inputClass} bg-gray-50`}
                                                readOnly={true}
                                                value={formatCurrency(
                                                    discountCalculations?.serviceChargeAmount ||
                                                    0,
                                                )}
                                            />
                                        </FormColumn>
                                    )}

                                {(discountCalculations?.tipRate ?? 0) > 0 && (
                                    <FormColumn>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Checkbox
                                                id="includeTip"
                                                checked={
                                                    formData.includeTip || false
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleInputChange(
                                                        'includeTip',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="includeTip"
                                                className="text-sm font-medium cursor-pointer"
                                            >
                                                Include Tip (
                                                {discountCalculations?.tipRate?.toFixed(
                                                    2,
                                                )}
                                                %)
                                            </Label>
                                        </div>
                                        {formData.includeTip && (
                                            <InputField
                                                id="tipAmount"
                                                name="tipAmount"
                                                label={`Tip (${discountCalculations?.tipRate?.toFixed(2)}%)`}
                                                type="text"
                                                className={`${inputClass} bg-gray-50`}
                                                readOnly={true}
                                                value={formatCurrency(
                                                    discountCalculations?.tipAmount ||
                                                    0,
                                                )}
                                            />
                                        )}
                                    </FormColumn>
                                )}

                                {/* Custom Charges */}
                                {discountCalculations?.customCharges &&
                                    discountCalculations.customCharges.length >
                                    0 &&
                                    discountCalculations.customCharges.map(
                                        (charge) => (
                                            <FormColumn key={charge.id}>
                                                <InputField
                                                    id={`customCharge-${charge.id}`}
                                                    name={`customCharge-${charge.id}`}
                                                    label={`${charge.name} (${charge.rate.toFixed(2)}%)`}
                                                    type="text"
                                                    className={`${inputClass} bg-gray-50`}
                                                    readOnly={true}
                                                    value={formatCurrency(
                                                        charge.amount,
                                     )}
                                                />
                                            </FormColumn>
                                        ),
                                    )}

                                <FormColumn>
                                    <InputField
                                        id="totalWithServiceCharge"
                                        name="totalWithServiceCharge"
                                        label={
                                            discountCalculations?.totalWithCustomCharges
                                                ? 'Total (Incl. All Charges)'
                                                : discountCalculations?.tipAmount &&
                                                    discountCalculations.tipAmount >
                                                    0
                                                    ? organization?.frontOfficeVatInclusive
                                                        ? 'Total (Incl. Service Charge & Tip)'
                                                        : 'Total (Incl. VAT, Service Charge & Tip)'
                                                    : organization?.frontOfficeVatInclusive
                                                        ? 'Total (Incl. Service Charge)'
                                                        : 'Total (Incl. VAT & Service Charge)'
                                        }
                                        type="text"
                                        className={`${inputClass} bg-gray-50 font-semibold`}
                                        readOnly={true}
                                        value={formatCurrency(
                                            discountCalculations?.totalWithCustomCharges ||
                                            discountCalculations?.totalWithTip ||
                                            discountCalculations?.totalWithServiceCharge ||
                                            discountCalculations?.totalWithVat ||
                                            0,
                                        )}
                                    />
                                </FormColumn>
                            </>
                        )}

                    <FormColumn>
                        <InputField
                            id="discountReason"
                            name="discountReason"
                            label="Discount Reason"
                            placeholder="Reason for Discount"
                            className={inputClass}
                            value={formData.discountReason || ''}
                            onChange={(e) =>
                                handleInputChange(
                                    'discountReason',
                                    e.target.value,
                                )
                            }
                        />
                    </FormColumn>
                </>
            )}

            {reservationType === 'REGULAR' && (
                <>
                    <FormColumn>
                        <InputField
                            id="nightlyRate"
                            name="nightlyRate"
                            label="Nightly Rate"
                            type="text"
                            className={`${inputClass} bg-gray-50`}
                            readOnly={true}
                            value={`${formatCurrency(discountCalculations?.originalPrice || 0)} x ${discountCalculations?.nights}`}
                        />
                    </FormColumn>
                    <FormColumn>
                        <InputField
                            id="numberOfNights"
                            name="numberOfNights"
                            label="Number of Nights"
                            type="text"
                            className={`${inputClass} bg-gray-50`}
                            readOnly={true}
                            value={
                                discountCalculations?.nights?.toString() || ''
                            }
                        />
                    </FormColumn>

                    {!formData.isComplimentary && (
                        <>
                            <FormColumn>
                                <InputField
                                    id="regularSubtotal"
                                    name="regularSubtotal"
                                    label="Subtotal (Before VAT)"
                                    type="text"
                                    className={`${inputClass} bg-gray-50`}
                                    readOnly
                                    value={formatCurrency(
                                        discountCalculations?.finalPrice || 0,
                                    )}
                                />
                            </FormColumn>
                            {(discountCalculations?.vatRate ?? 0) > 0 &&
                                !(organization?.frontOfficeVatInclusive) && (
                                    <FormColumn>
                                        <ChargeSwitch
                                            id="includeVat-regular"
                                            label={`VAT (${discountCalculations?.vatRate.toFixed(2)}%)`}
                                            description={
                                                formData.includeVat !== false
                                                    ? `Amount: ${formatCurrency(discountCalculations?.vatAmount || 0)}`
                                                    : 'VAT will not be added'
                                            }
                                            checked={formData.includeVat !== false}
                                            onCheckedChange={(checked) => {
                                                handleInputChange(
                                                    'includeVat',
                                                    checked,
                                                );
                                                if (waiverData && onWaiverChange) {
                                                    onWaiverChange({
                                                        ...waiverData,
                                                        vat: !checked,
                                                    });
                                                }
                                            }}
                                        />
                                    </FormColumn>
                                )}
                            {(discountCalculations?.serviceChargeRate ?? 0) >
                                0 && (
                                    <FormColumn>
                                        <InputField
                                            id="regularServiceCharge"
                                            name="regularServiceCharge"
                                            label={`Service Charge (${discountCalculations?.serviceChargeRate?.toFixed(2)}%)`}
                                            type="text"
                                            className={`${inputClass} bg-gray-50`}
                                            readOnly
                                            value={formatCurrency(
                                                discountCalculations?.serviceChargeAmount ||
                                                0,
                                            )}
                                        />
                                    </FormColumn>
                                )}
                            {(discountCalculations?.tipRate ?? 0) > 0 && (
                                <FormColumn>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                            id="regularIncludeTip"
                                            checked={
                                                formData.includeTip || false
                                            }
                                            onCheckedChange={(checked) =>
                                                handleInputChange(
                                                    'includeTip',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="regularIncludeTip"
                                            className="text-sm font-medium cursor-pointer"
                                        >
                                            Include Tip (
                                            {discountCalculations?.tipRate?.toFixed(
                                                2,
                                            )}
                                            %)
                                        </Label>
                                    </div>
                                    {formData.includeTip && (
                                        <InputField
                                            id="regularTipAmount"
                                            name="regularTipAmount"
                                            label={`Tip (${discountCalculations?.tipRate?.toFixed(2)}%)`}
                                            type="text"
                                            className={`${inputClass} bg-gray-50`}
                                            readOnly
                                            value={formatCurrency(
                                                discountCalculations?.tipAmount ||
                                                0,
                                            )}
                                        />
                                    )}
                                </FormColumn>
                            )}

                            {/* Custom Charges */}
                            {discountCalculations?.customCharges &&
                                discountCalculations.customCharges.length > 0 &&
                                discountCalculations.customCharges.map(
                                    (charge) => (
                                        <FormColumn key={charge.id}>
                                            <InputField
                                                id={`regularCustomCharge-${charge.id}`}
                                                name={`regularCustomCharge-${charge.id}`}
                                                label={`${charge.name} (${charge.rate.toFixed(2)}%)`}
                                                type="text"
                                                className={`${inputClass} bg-gray-50`}
                                                readOnly
                                                value={formatCurrency(
                                                    charge.amount,
                                                )}
                                            />
                                        </FormColumn>
                                    ),
                                )}

                            <FormColumn>
                                <InputField
                                    id="regularTotalWithServiceCharge"
                                    name="regularTotalWithServiceCharge"
                                    label={
                                        discountCalculations?.totalWithCustomCharges
                                            ? 'Total (Incl. All Charges)'
                                            : discountCalculations?.tipAmount &&
                                                discountCalculations.tipAmount >
                                                0
                                                ? organization?.frontOfficeVatInclusive
                                                    ? 'Total (Incl. Service Charge & Tip)'
                                                    : 'Total (Incl. VAT, Service Charge & Tip)'
                                                : organization?.frontOfficeVatInclusive
                                                    ? 'Total (Incl. Service Charge)'
                                                    : 'Total (Incl. VAT & Service Charge)'
                                    }
                                    type="text"
                                    className={`${inputClass} bg-gray-50 font-semibold`}
                                    readOnly
                                    value={formatCurrency(
                                        discountCalculations?.totalWithCustomCharges ||
                                        discountCalculations?.totalWithTip ||
                                        discountCalculations?.totalWithServiceCharge ||
                                        discountCalculations?.totalWithVat ||
                                        0,
                                    )}
                                />
                            </FormColumn>
                        </>
                    )}
                </>
            )}

            {(reservationType === 'REGULAR' ||
                (reservationType === 'DISCOUNT' &&
                    discountCalculations?.hasDiscount)) && (
                    <>
                        {selectedProfile && creditBalance > 0 && (
                            <FormColumn>
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Wallet className="w-4 h-4 text-blue-600" />
                                                <Label className="text-sm font-semibold text-gray-900">
                                                    Prepaid Funds Available
                                                </Label>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                {selectedProfile.fullName ||
                                                    'Unknown'}{' '}
                                                - Available Credit: ₦
                                                {creditBalance.toLocaleString()}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant={
                                                applyCredit ? 'default' : 'outline'
                                            }
                                            size="sm"
                                            onClick={() => {
                                                if (onApplyCreditChange) {
                                                    onApplyCreditChange(
                                                        !applyCredit,
                                                    );
                                                }
                                            }}
                                            className={`${applyCredit
                                                    ? 'bg-orion-blue hover:bg-blue text-white'
                                                    : 'border-orion-blue text-orion-blue hover:bg-blue'
                                                }`}
                                        >
                                            <Wallet className="w-4 h-4 mr-1" />
                                            {applyCredit
                                                ? 'Funds Activated'
                                                : 'Use Funds'}
                                        </Button>
                                    </div>
                                    {applyCredit && (
                                        <div className="mt-3 pt-3 border-t border-blue-200 space-y-2 bg-green-50/50 rounded p-3">
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-gray-700 font-medium">
                                                    Credit to Apply:
                                                </span>
                                                <span className="font-semibold text-green-700 text-base">
                                                    ₦
                                                    {creditToApply.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-gray-700 font-medium">
                                                    New Outstanding:
                                                </span>
                                                <span
                                                    className={`font-semibold text-base ${newOutstanding > 0 ? 'text-yellow-700' : 'text-green-700'}`}
                                                >
                                                    ₦
                                                    {newOutstanding.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-green-200">
                                                <p className="text-xs text-green-700 font-medium">
                                                    ✓ Funds are now active and will
                                                    be applied to this reservation
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormColumn>
                        )}

                        <FormColumn>
                            <InputField
                                id="outstanding"
                                name="outstanding"
                                label={
                                    reservationType === 'DISCOUNT'
                                        ? 'Remaining Amount to Pay'
                                        : 'Outstanding Amount'
                                }
                                placeholder="Outstanding Amount"
                                type="text"
                                className={`${inputClass} ${newOutstanding > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}
                                readOnly={true}
                                value={formatCurrency(newOutstanding)}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                        /[^0-9.]/g,
                                        '',
                                    );
                                    // Ensure only one decimal point
                                    const parts = rawValue.split('.');
                                    const cleanValue =
                                        parts[0] +
                                        (parts.length > 1 ? '.' + parts[1] : '');

                                    handleInputChange(
                                        'outstanding',
                                        cleanValue ? parseFloat(cleanValue) : 0,
                                    );
                                }}
                            />
                            {errors.outstanding && (
                                <div className="text-red-500 text-sm">
                                    {errors.outstanding}
                                </div>
                            )}
                        </FormColumn>

                        <FormColumn>
                            <InputField
                                id="amountPaid"
                                name="amountPaid"
                                label="Amount Paid"
                                placeholder="Amount Paid"
                                type="text"
                                className={inputClass}
                                value={
                                    formData.amountPaid
                                        ? `₦ ${Number(formData.amountPaid).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                        : '₦ 0'
                                }
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                        /[^0-9.]/g,
                                        '',
                                    );
                                    // Ensure only one decimal point
                                    const parts = rawValue.split('.');
                                    const cleanValue =
                                        parts[0] +
                                        (parts.length > 1 ? '.' + parts[1] : '');

                                    handleInputChange(
                                        'amountPaid',
                                        cleanValue ? parseFloat(cleanValue) : 0,
                                    );
                                }}
                            />
                            {errors.amountPaid && (
                                <div className="text-red-500 text-sm">
                                    {errors.amountPaid}
                                </div>
                            )}
                        </FormColumn>
                        {/* Account Status Indicator */}
                        {(reservationType === 'REGULAR' ||
                            reservationType === 'DISCOUNT') && (
                                <FormColumn>
                                    <AccountStatusIndicator
                                        totalReservationCost={
                                            discountCalculations?.totalWithCustomCharges ||
                                            0
                                        }
                                        totalPaid={Number(formData.amountPaid || 0)}
                                        creditToApply={creditToApply}
                                        selectedProfile={selectedProfile}
                                        includeTip={!!formData.includeTip}
                                        breakdown={{
                                            subtotal:
                                                discountCalculations?.subtotal || 0,
                                            discountAmount:
                                                discountCalculations?.discountAmount ||
                                                0,
                                            finalPrice:
                                                discountCalculations?.finalPrice || 0,
                                            vatAmount:
                                                discountCalculations?.vatAmount || 0,
                                            serviceChargeAmount:
                                                discountCalculations?.serviceChargeAmount ||
                                                0,
                                            tipAmount:
                                                discountCalculations?.tipAmount || 0,
                                            totalCustomChargesAmount:
                                                discountCalculations?.totalCustomChargesAmount ||
                                                0,
                                            totalWithCustomCharges:
                                                discountCalculations?.totalWithCustomCharges ||
                                                0,
                                        }}
                                    />
                                </FormColumn>
                            )}
                        <FormColumn>
                            <SelectField
                                id="paymentMethod"
                                name="paymentMethod"
                                label="Payment Method"
                                className={inputClass}
                                value={formData.paymentMethod || ''}
                                onValueChange={(value) => {
                                    handleInputChange('paymentMethod', value);
                                    updatePayment('receivingAccount', '');
                                }}
                                options={[
                                    {
                                        value: 'credit',
                                        label: 'Credit Card',
                                    },
                                    {
                                        value: 'debit',
                                        label: 'Debit Card',
                                    },
                                    {
                                        value: 'Account Payable',
                                        label: 'Account Payable',
                                    },
                                    {
                                        value: 'cash',
                                        label: 'Cash',
                                    },
                                    {
                                        value: 'bank',
                                        label: 'Bank Transfer',
                                    },
                                    {
                                        value: 'internal_account',
                                        label: 'Internal Account',
                                    },
                                ]}
                                placeholder="Select payment method"
                            />
                            {errors.paymentMethod && (
                                <div className="text-red-500 text-sm">
                                    {errors.paymentMethod}
                                </div>
                            )}
                        </FormColumn>

                        <FormColumn>
                            <SelectField
                                className="bg-white ring-border border shadow-none border-border h-10"
                                name="receivingAccount"
                                id={`receivingAccount`}
                                label={
                                    formData.paymentMethod === 'internal_account'
                                        ? 'Internal Account'
                                        : 'Account to pay into'
                                }
                                options={
                                    formData.paymentMethod === 'internal_account'
                                        ? remappedInternalAccounts
                                        : remappedBankAccounts
                                }
                                value={formData?.receivingAccount || ''}
                                onValueChange={(value) =>
                                    updatePayment('receivingAccount', value)
                                }
                                placeholder={
                                    formData.paymentMethod === 'internal_account'
                                        ? 'Select internal account'
                                        : 'Select account'
                                }
                            />
                            {errors.receivingAccount && (
                                <div className="text-red-500 text-sm">
                                    {errors.receivingAccount}
                                </div>
                            )}
                        </FormColumn>
                    </>
                )}

            {(reservationType === 'REGULAR' ||
                reservationType === 'DISCOUNT') &&
                waiverData &&
                onWaiverChange && (
                    <FormColumn>
                        <WaiveChargesPanel
                            waiverData={waiverData}
                            onWaiverChange={onWaiverChange}
                            calculations={discountCalculations}
                            formatCurrency={formatCurrency}
                        />
                    </FormColumn>
                )}
        </>
    );
}

// Component to show what account action will be taken
// Uses the same calculation as backend: outstandingBalance = totalReservationCost - totalPaid
// and overpaymentAmount = totalPaid - totalReservationCost
// Backend formula: basePrice - discountAmount + vatAmount + serviceChargeAmount + tipAmount + totalCustomChargesAmount
// Frontend should match: (subtotal - discountAmount) + vatAmount + serviceChargeAmount + tipAmount + totalCustomChargesAmount
function AccountStatusIndicator({
    totalReservationCost,
    totalPaid,
    creditToApply = 0,
    selectedProfile,
    includeTip = false,
    breakdown,
}: {
    totalReservationCost: number;
    totalPaid: number;
    creditToApply?: number;
    selectedProfile?: GuestProfile | null;
    includeTip?: boolean;
    breakdown?: {
        subtotal?: number;
        discountAmount?: number;
        finalPrice?: number;
        vatAmount?: number;
        serviceChargeAmount?: number;
        tipAmount?: number;
        totalCustomChargesAmount?: number;
        totalWithCustomCharges?: number;
    };
}) {
    // Calculate outstanding balance BEFORE credit is applied
    // Receivable balance = total reservation cost - total paid
    // Backend formula: outstandingBalance = Math.max(0, totalReservationCost - totalPaid)
    const difference = totalReservationCost - totalPaid;
    let adjustedDifference = difference;
    if (Math.abs(adjustedDifference) <= 1) {
        adjustedDifference = 0;
    }
    const outstandingBeforeCredit = Math.max(0, adjustedDifference);

    // Calculate outstanding balance AFTER credit is applied
    // This is what will actually be created as receivable
    const outstandingAfterCredit = Math.max(
        0,
        outstandingBeforeCredit - creditToApply,
    );

    // Calculate overpayment (what guest overpaid) - same formula as backend
    // Payable balance = total paid - total reservation cost
    // Backend formula: overpaymentAmount = Math.max(0, totalPaid - totalReservationCost)
    const overpaymentAmount = Math.max(0, -adjustedDifference);

    if (outstandingAfterCredit > 0) {
        // Underpayment - Receivable will be created/updated (after credit is applied)
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                !
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 mb-1">
                            Accounts Receivable
                        </p>
                        <p className="text-xs text-yellow-700">
                            {creditToApply > 0 && selectedProfile ? (
                                <>
                                    <span className="font-semibold">
                                        ₦
                                        {creditToApply.toLocaleString('en-NG', {
                                            maximumFractionDigits: 0,
                                        })}
                                    </span>{' '}
                                    will be deducted from the guest&apos;s
                                    payable balance.{' '}
                                    {outstandingAfterCredit > 0 && (
                                        <>
                                            A receivable of{' '}
                                            <span className="font-semibold">
                                                ₦
                                                {outstandingAfterCredit.toLocaleString(
                                                    'en-NG',
                                                    {
                                                        maximumFractionDigits: 0,
                                                    },
                                                )}
                                            </span>{' '}
                                            will be created for this
                                            reservation.
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    A receivable of{' '}
                                    <span className="font-semibold">
                                        ₦
                                        {outstandingAfterCredit.toLocaleString(
                                            'en-NG',
                                            {
                                                maximumFractionDigits: 0,
                                            },
                                        )}
                                    </span>{' '}
                                    will be created for this reservation.
                                </>
                            )}
                            {includeTip ? (
                                <span className="block mt-1 text-yellow-600">
                                    (Includes VAT, Service Charge, Tip, and
                                    Custom Charges)
                                </span>
                            ) : (
                                <span className="block mt-1 text-yellow-600">
                                    (Includes VAT, Service Charge, and Custom
                                    Charges)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    } else if (
        creditToApply > 0 &&
        selectedProfile &&
        outstandingBeforeCredit > 0
    ) {
        // Credit fully covers the outstanding - no receivable will be created
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                ✓
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 mb-1">
                            Payable Applied
                        </p>
                        <p className="text-xs text-green-700">
                            <span className="font-semibold">
                                ₦
                                {creditToApply.toLocaleString('en-NG', {
                                    maximumFractionDigits: 0,
                                })}
                            </span>{' '}
                            will be deducted from the guest&apos;s payable
                            balance. No receivable will be created for this
                            reservation.
                        </p>
                    </div>
                </div>
            </div>
        );
    } else if (overpaymentAmount > 0) {
        // Overpayment - Payable (credit) will be created/updated
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                ✓
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 mb-1">
                            Guest Credit (Payable)
                        </p>
                        <p className="text-xs text-green-700">
                            An overpayment of{' '}
                            <span className="font-semibold">
                                ₦
                                {overpaymentAmount.toLocaleString('en-NG', {
                                    maximumFractionDigits: 0,
                                })}
                            </span>{' '}
                            will be deposited as guest credit. A guest profile
                            will be created/updated if needed.
                            {includeTip ? (
                                <span className="block mt-1 text-green-600">
                                    (Includes VAT, Service Charge, Tip, and
                                    Custom Charges)
                                </span>
                            ) : (
                                <span className="block mt-1 text-green-600">
                                    (Includes VAT, Service Charge, and Custom
                                    Charges)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        // Exact payment - No receivable or payable
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                ✓
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800 mb-1">
                            Fully Paid
                        </p>
                        <p className="text-xs text-blue-700">
                            Payment is complete. No receivable or payable will
                            be created.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
