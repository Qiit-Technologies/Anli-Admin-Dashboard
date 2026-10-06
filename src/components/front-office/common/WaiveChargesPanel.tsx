'use client';

import { InputField } from '@/components/common/Form';
import { ChargeSwitch } from '@/components/front-office/common/ChargeSwitch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export type ChargeWaiverSelection = {
    vat: boolean;
    serviceCharge: boolean;
    tip: boolean;
    customCharges: boolean;
    waiverReason: string;
};

export type ChargeWaiverBreakdown = {
    vatAmount?: number;
    vatRate?: number;
    serviceChargeAmount?: number;
    serviceChargeRate?: number;
    tipAmount?: number;
    tipRate?: number;
    customCharges?: Array<{
        id?: number;
        name: string;
        rate?: number;
        amount?: number;
    }>;
    totalCustomChargesAmount?: number;
    totalWithCustomCharges?: number;
    totalWithTip?: number;
    totalWithServiceCharge?: number;
    totalWithVat?: number;
};

interface WaiveChargesPanelProps {
    waiverData: ChargeWaiverSelection;
    onWaiverChange: (data: ChargeWaiverSelection) => void;
    calculations?: ChargeWaiverBreakdown;
    formatCurrency: (amount: number) => string;
    defaultExpanded?: boolean;
    idPrefix?: string;
    title?: string;
    description?: string;
    reasonInputClassName?: string;
}

export function WaiveChargesPanel({
    waiverData,
    onWaiverChange,
    calculations,
    formatCurrency,
    defaultExpanded = false,
    idPrefix = '',
    title = 'Waive Charges',
    description = 'Select specific tax or fee charges to waive for this reservation',
    reasonInputClassName,
}: WaiveChargesPanelProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const fieldId = (name: string) => `${idPrefix}${name}`;

    const allWaived =
        waiverData.vat &&
        waiverData.serviceCharge &&
        waiverData.tip &&
        waiverData.customCharges;

    const originalTotal =
        calculations?.totalWithCustomCharges ||
        calculations?.totalWithTip ||
        calculations?.totalWithServiceCharge ||
        calculations?.totalWithVat ||
        0;

    const waivedAmount =
        (waiverData.vat ? calculations?.vatAmount || 0 : 0) +
        (waiverData.serviceCharge ? calculations?.serviceChargeAmount || 0 : 0) +
        (waiverData.tip ? calculations?.tipAmount || 0 : 0) +
        (waiverData.customCharges
            ? calculations?.totalCustomChargesAmount || 0
            : 0);

    const anyWaived =
        (waiverData.vat && (calculations?.vatAmount || 0) > 0) ||
        (waiverData.serviceCharge &&
            (calculations?.serviceChargeAmount || 0) > 0) ||
        (waiverData.tip && (calculations?.tipAmount || 0) > 0) ||
        (waiverData.customCharges &&
            (calculations?.totalCustomChargesAmount || 0) > 0);

    return (
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div
                className="flex items-center justify-between pb-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <Label className="text-base font-semibold text-gray-900 block">
                        {title}
                    </Label>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
                <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={(event) => {
                        event.stopPropagation();
                        setExpanded(!expanded);
                    }}
                >
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                </button>
            </div>

            <div
                style={{
                    maxHeight: expanded ? '1200px' : '0px',
                    overflow: 'hidden',
                    transition:
                        'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? 'translateY(0)' : 'translateY(8px)',
                }}
            >
                <div className="pt-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 mb-4">
                        <Checkbox
                            id={fieldId('waiveAll')}
                            checked={allWaived}
                            onCheckedChange={(checked) =>
                                onWaiverChange({
                                    vat: checked === true,
                                    serviceCharge: checked === true,
                                    tip: checked === true,
                                    customCharges: checked === true,
                                    waiverReason: waiverData.waiverReason,
                                })
                            }
                        />
                        <Label
                            htmlFor={fieldId('waiveAll')}
                            className="text-xs font-semibold cursor-pointer text-gray-700 select-none"
                        >
                            Waive All Charges
                        </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {((calculations?.vatRate ?? 0) > 0 ||
                            (calculations?.vatAmount ?? 0) > 0) && (
                            <ChargeSwitch
                                id={fieldId('waiveVat')}
                                compact
                                label="VAT"
                                description={
                                    calculations?.vatAmount != null &&
                                    calculations.vatAmount > 0
                                        ? `Amount: ${formatCurrency(calculations.vatAmount)}`
                                        : calculations?.vatRate != null
                                          ? `${calculations.vatRate.toFixed(2)}%`
                                          : undefined
                                }
                                checked={!waiverData.vat}
                                onCheckedChange={(checked) =>
                                    onWaiverChange({
                                        ...waiverData,
                                        vat: !checked,
                                    })
                                }
                            />
                        )}

                        {((calculations?.serviceChargeRate ?? 0) > 0 ||
                            (calculations?.serviceChargeAmount ?? 0) > 0) && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/70 hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id={fieldId('waiveServiceCharge')}
                                    checked={waiverData.serviceCharge}
                                    onCheckedChange={(checked) =>
                                        onWaiverChange({
                                            ...waiverData,
                                            serviceCharge: checked === true,
                                        })
                                    }
                                    className="mt-0.5"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor={fieldId('waiveServiceCharge')}
                                        className="text-sm font-medium cursor-pointer text-gray-900 flex justify-between items-center"
                                    >
                                        <span>Service Charge</span>
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-200/60 px-2 py-0.5 rounded">
                                            {calculations?.serviceChargeRate !=
                                            null
                                                ? `${calculations.serviceChargeRate.toFixed(2)}%`
                                                : 'Applicable'}
                                        </span>
                                    </Label>
                                    {calculations?.serviceChargeAmount !=
                                        null &&
                                        calculations.serviceChargeAmount >
                                            0 && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Amount:{' '}
                                                {formatCurrency(
                                                    calculations.serviceChargeAmount,
                                                )}
                                            </p>
                                        )}
                                </div>
                            </div>
                        )}

                        {((calculations?.tipRate ?? 0) > 0 ||
                            (calculations?.tipAmount ?? 0) > 0) && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/70 hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id={fieldId('waiveTip')}
                                    checked={waiverData.tip}
                                    onCheckedChange={(checked) =>
                                        onWaiverChange({
                                            ...waiverData,
                                            tip: checked === true,
                                        })
                                    }
                                    className="mt-0.5"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor={fieldId('waiveTip')}
                                        className="text-sm font-medium cursor-pointer text-gray-900 flex justify-between items-center"
                                    >
                                        <span>Tip</span>
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-200/60 px-2 py-0.5 rounded">
                                            {calculations?.tipRate != null
                                                ? `${calculations.tipRate.toFixed(2)}%`
                                                : 'Applicable'}
                                        </span>
                                    </Label>
                                    {calculations?.tipAmount != null &&
                                        calculations.tipAmount > 0 && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Amount:{' '}
                                                {formatCurrency(
                                                    calculations.tipAmount,
                                                )}
                                            </p>
                                        )}
                                </div>
                            </div>
                        )}

                        {calculations?.customCharges &&
                            calculations.customCharges.length > 0 && (
                                <div className="col-span-1 md:col-span-2 flex flex-col gap-2 p-3 bg-gray-50/80 rounded-lg border border-gray-200/70 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id={fieldId('waiveCustomCharges')}
                                            checked={waiverData.customCharges}
                                            onCheckedChange={(checked) =>
                                                onWaiverChange({
                                                    ...waiverData,
                                                    customCharges:
                                                        checked === true,
                                                })
                                            }
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={fieldId(
                                                    'waiveCustomCharges',
                                                )}
                                                className="text-sm font-medium cursor-pointer text-gray-900 flex justify-between items-center"
                                            >
                                                <span>Custom Charges</span>
                                                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                    {
                                                        calculations
                                                            .customCharges
                                                            .length
                                                    }{' '}
                                                    item
                                                    {calculations.customCharges
                                                        .length > 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Total Custom Charges:{' '}
                                                {formatCurrency(
                                                    calculations.totalCustomChargesAmount ||
                                                        0,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-7 mt-1 pt-2 border-t border-gray-200/80 space-y-1.5">
                                        {calculations.customCharges.map(
                                            (charge, idx) => (
                                                <div
                                                    key={charge.id || idx}
                                                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-white border border-gray-200/80 shadow-2xs"
                                                >
                                                    <span className="font-medium text-gray-700">
                                                        {charge.name}{' '}
                                                        {charge.rate != null &&
                                                            `(${charge.rate.toFixed(2)}%)`}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            charge.amount || 0,
                                                        )}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                        <InputField
                            id={fieldId('waiverReason')}
                            name={fieldId('waiverReason')}
                            label="Waiver Reason (Optional)"
                            placeholder="Enter reason for waiving selected charges"
                            className={reasonInputClassName}
                            value={waiverData.waiverReason || ''}
                            onChange={(e) =>
                                onWaiverChange({
                                    ...waiverData,
                                    waiverReason: e.target.value,
                                })
                            }
                        />
                    </div>

                    {anyWaived && (
                        <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-gray-600">
                                <span>Original Total:</span>
                                <span>{formatCurrency(originalTotal)}</span>
                            </div>
                            {waiverData.vat &&
                                (calculations?.vatAmount || 0) > 0 && (
                                    <div className="flex justify-between text-xs font-medium text-emerald-700">
                                        <span>
                                            Waived VAT (
                                            {calculations?.vatRate != null
                                                ? `${calculations.vatRate.toFixed(2)}%`
                                                : ''}
                                            ):
                                        </span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                calculations?.vatAmount || 0,
                                            )}
                                        </span>
                                    </div>
                                )}
                            {waiverData.serviceCharge &&
                                (calculations?.serviceChargeAmount || 0) >
                                    0 && (
                                    <div className="flex justify-between text-xs font-medium text-emerald-700">
                                        <span>
                                            Waived Service Charge (
                                            {calculations?.serviceChargeRate !=
                                            null
                                                ? `${calculations.serviceChargeRate.toFixed(2)}%`
                                                : ''}
                                            ):
                                        </span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                calculations?.serviceChargeAmount ||
                                                    0,
                                            )}
                                        </span>
                                    </div>
                                )}
                            {waiverData.tip &&
                                (calculations?.tipAmount || 0) > 0 && (
                                    <div className="flex justify-between text-xs font-medium text-emerald-700">
                                        <span>
                                            Waived Tip (
                                            {calculations?.tipRate != null
                                                ? `${calculations.tipRate.toFixed(2)}%`
                                                : ''}
                                            ):
                                        </span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                calculations?.tipAmount || 0,
                                            )}
                                        </span>
                                    </div>
                                )}
                            {waiverData.customCharges &&
                                (calculations?.totalCustomChargesAmount || 0) >
                                    0 && (
                                    <div className="flex justify-between text-xs font-medium text-emerald-700">
                                        <span>Waived Custom Charges:</span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                calculations?.totalCustomChargesAmount ||
                                                    0,
                                            )}
                                        </span>
                                    </div>
                                )}
                            <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-amber-200">
                                <span>Total After Waiver:</span>
                                <span>
                                    {formatCurrency(
                                        Math.max(0, originalTotal - waivedAmount),
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
