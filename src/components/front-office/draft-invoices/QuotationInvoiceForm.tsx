'use client';

import type { BankAccount } from '@/app/actions/bank-accounts';
import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import {
    createDraftInvoice,
    createDraftInvoiceBatch,
    updateDraftInvoice,
} from '@/app/actions/draft-invoices';
import { getCustomCharges } from '@/app/actions/hotel';
import { WaiveChargesPanel } from '@/components/front-office/common/WaiveChargesPanel';
import { GuestSearch } from '@/components/front-office/common/Form/Reservation/GuestSearch';
import { useGuestSearch } from '@/components/front-office/common/Form/Reservation/hooks/useGuestSearch';
import { usePaymentCalculations } from '@/components/front-office/common/Form/Reservation/hooks/usePaymentCalculation';
import { useRoomTypes } from '@/components/front-office/common/Form/Reservation/hooks/useRoomTypes';
import { QuotationReservationLinesEditor } from '@/components/front-office/common/Form/Reservation/steps/QuotationReservationLinesEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useHotel from '@/hooks/useHotel';
import { cn, formatBankAccountLabel } from '@/lib/utils';
import { buildDraftInvoiceRequests } from '@/lib/front-office/build-draft-invoice-request';
import { draftPayloadToFormValues } from '@/lib/front-office/draft-payload-mapper';
import {
    formatPrintMoney,
    toMoneyNumber,
} from '@/lib/front-office/print-document-utils';
import {
    defaultReservationLine,
    type QuotationRoomLine,
    syncLegacyFormFieldsFromLines,
} from '@/lib/front-office/quotation-room-lines';
import type { DraftInvoice } from '@/types/draft-invoice';
import { LayoutDashboard, LoaderCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

export interface QuotationFormState {
    fullName: string;
    email: string;
    phoneNumber: string;
    guestProfileId?: number;
    receivingAccount: string;
    reservationLines: QuotationRoomLine[];
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue?: number;
    discountReason?: string;
    includeVat: boolean;
    includeServiceCharge: boolean;
    includeCustomCharges: boolean;
    includeTip: boolean;
    waiverReason: string;
}

function applyChargeWaiver<
    T extends {
        finalPrice: number;
        vatAmount: number;
        serviceChargeAmount?: number;
        tipAmount?: number;
        customCharges?: Array<{
            id: number;
            name: string;
            rate: number;
            amount: number;
        }>;
        totalCustomChargesAmount?: number;
        totalWithCustomCharges?: number;
        remainingAmount?: number;
    },
>(
    calculations: T,
    selection: Pick<
        QuotationFormState,
        | 'includeVat'
        | 'includeServiceCharge'
        | 'includeCustomCharges'
        | 'includeTip'
    >,
): T {
    const vatAmount = selection.includeVat ? calculations.vatAmount : 0;
    const serviceChargeAmount = selection.includeServiceCharge
        ? (calculations.serviceChargeAmount ?? 0)
        : 0;
    const tipAmount = selection.includeTip ? (calculations.tipAmount ?? 0) : 0;
    const customCharges = selection.includeCustomCharges
        ? calculations.customCharges
        : [];
    const totalCustomChargesAmount = selection.includeCustomCharges
        ? (calculations.totalCustomChargesAmount ?? 0)
        : 0;
    const totalWithCustomCharges = Math.max(
        0,
        calculations.finalPrice +
            vatAmount +
            serviceChargeAmount +
            tipAmount +
            totalCustomChargesAmount,
    );

    return {
        ...calculations,
        vatAmount,
        serviceChargeAmount,
        tipAmount,
        customCharges,
        totalCustomChargesAmount,
        totalWithCustomCharges,
        remainingAmount: totalWithCustomCharges,
    };
}

const defaultQuotationForm = (): QuotationFormState => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const toYmd = (d: Date) => d.toISOString().split('T')[0];

    return {
        fullName: '',
        email: '',
        phoneNumber: '',
        receivingAccount: '',
        reservationLines: [
            defaultReservationLine(toYmd(today), toYmd(tomorrow)),
        ],
        includeVat: true,
        includeServiceCharge: true,
        includeCustomCharges: true,
        includeTip: false,
        waiverReason: '',
    };
};

function LabeledInput({
    id,
    label,
    className,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label: string;
}) {
    return (
        <div className="flex flex-col w-full">
            <label
                htmlFor={id}
                className="text-sm font-medium text-muted-foreground mb-1"
            >
                {label}
            </label>
            <Input
                id={id}
                className={cn(
                    'h-10 bg-white shadow-none border-gray-300',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

function LabeledSelect({
    id,
    label,
    className,
    children,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
    id: string;
    label: string;
}) {
    return (
        <div className="flex flex-col w-full">
            <label
                htmlFor={id}
                className="text-sm font-medium text-muted-foreground mb-1"
            >
                {label}
            </label>
            <select
                id={id}
                className={cn(
                    'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
        </div>
    );
}

interface QuotationInvoiceFormProps {
    draft?: DraftInvoice | null;
    onSaved?: () => void;
}

export function QuotationInvoiceForm({
    draft,
    onSaved,
}: QuotationInvoiceFormProps) {
    const router = useRouter();
    const { organization } = useHotel();
    const { roomTypes } = useRoomTypes();
    const {
        searchQuery,
        setSearchQuery,
        searchingGuest,
        showResults,
        guestHistory,
        setShowResults,
        setGuestHistory,
    } = useGuestSearch();
    const [form, setForm] = useState<QuotationFormState>(defaultQuotationForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [draftId, setDraftId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const hotelVatRate = toMoneyNumber(
        organization?.frontOfficeVatRate ?? organization?.vatRate,
    );
    const hotelServiceChargeRate = toMoneyNumber(
        organization?.frontOfficeServiceChargeRate ??
            organization?.serviceChargeRate,
    );
    const hotelTipRate = toMoneyNumber(
        organization?.frontOfficeTipRate ?? organization?.tipRate,
    );

    const { data: customChargesData } = useSWR('custom-charges', async () => {
        const result = await getCustomCharges();
        if (result.error) return [];
        return (result.data || []).filter(
            (charge: { isActive?: boolean }) => charge.isActive === true,
        );
    });

    const { data: bankAccountsResponse } = useSWR(
        '/accounts',
        getAllBankAccounts,
    );
    const bankAccounts = useMemo((): BankAccount[] => {
        if (Array.isArray(bankAccountsResponse)) return bankAccountsResponse;
        if (
            bankAccountsResponse &&
            typeof bankAccountsResponse === 'object' &&
            Array.isArray(
                (bankAccountsResponse as { data?: BankAccount[] }).data,
            )
        ) {
            return (bankAccountsResponse as { data: BankAccount[] }).data;
        }
        return [];
    }, [bankAccountsResponse]);

    const defaultStartDate =
        form.reservationLines[0]?.startDate ||
        new Date().toISOString().split('T')[0];
    const defaultEndDate =
        form.reservationLines[0]?.endDate ||
        new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const formDataForSave = useMemo(
        () => ({
            ...form,
            ...syncLegacyFormFieldsFromLines(form.reservationLines),
            amountPaid: 0,
        }),
        [form],
    );

    const formDataForPricing = useMemo(
        () => ({
            ...formDataForSave,
            includeVat: true,
            includeServiceCharge: true,
            includeCustomCharges: true,
            includeTip: true,
        }),
        [formDataForSave],
    );

    const { discountCalculations } = usePaymentCalculations({
        formData: formDataForPricing,
        roomTypes,
        vatRate: hotelVatRate,
        serviceChargeRate: hotelServiceChargeRate,
        tipRate: hotelTipRate,
        customCharges: customChargesData || [],
    });

    const appliedCalculations = useMemo(
        () => applyChargeWaiver(discountCalculations, form),
        [discountCalculations, form],
    );

    useEffect(() => {
        if (!draft) {
            setForm(defaultQuotationForm());
            setDraftId(null);
            setErrors({});
            return;
        }

        const values = draftPayloadToFormValues(
            draft.payload ?? {},
            draft.lineItems,
        );
        const savedAccount = String(
            values.receivingAccount ??
                draft.bankAccountId ??
                draft.bankAccount?.accountNumber ??
                '',
        );

        setForm({
            fullName: String(values.fullName ?? draft.guestName ?? ''),
            email: String(values.email ?? draft.guestEmail ?? ''),
            phoneNumber: String(values.phoneNumber ?? draft.guestPhone ?? ''),
            guestProfileId: values.guestProfileId
                ? Number(values.guestProfileId)
                : undefined,
            receivingAccount: savedAccount,
            reservationLines: values.reservationLines?.length
                ? values.reservationLines
                : defaultQuotationForm().reservationLines,
            discountType: values.discountType,
            discountValue: values.discountValue
                ? Number(values.discountValue)
                : undefined,
            discountReason: values.discountReason
                ? String(values.discountReason)
                : undefined,
            includeVat: values.includeVat !== false,
            includeServiceCharge: values.includeServiceCharge !== false,
            includeCustomCharges: values.includeCustomCharges !== false,
            includeTip: values.includeTip === true,
            waiverReason: values.waiverReason
                ? String(values.waiverReason)
                : '',
        });
        setDraftId(draft.id);
    }, [draft]);

    useEffect(() => {
        if (!draft || !bankAccounts.length) return;

        setForm((prev) => {
            const savedAccount = prev.receivingAccount.trim();
            const matchedAccount = bankAccounts.find((account) => {
                if (
                    draft.bankAccountId != null &&
                    account.id === draft.bankAccountId
                ) {
                    return true;
                }
                if (account.id != null && String(account.id) === savedAccount) {
                    return true;
                }
                return (
                    String(account.accountNumber ?? '').trim() === savedAccount
                );
            });
            const nextValue = String(
                matchedAccount?.id ?? draft.bankAccountId ?? savedAccount,
            );
            if (nextValue === prev.receivingAccount) return prev;
            return { ...prev, receivingAccount: nextValue };
        });
    }, [draft, bankAccounts]);

    const applyGuestFromSearch = (guest: {
        fullName?: string;
        email?: string;
        phoneNumber?: string | number;
        guestProfileId?: number;
        preferredRoomType?: string;
        totalStays?: number;
    }) => {
        const phone = String(guest.phoneNumber ?? '')
            .replace(/\D/g, '')
            .slice(0, 11);
        const preferredName = String(guest.preferredRoomType ?? '')
            .trim()
            .toLowerCase();
        const matchedRoomType =
            preferredName && preferredName !== 'unknown'
                ? roomTypes.find(
                      (roomType) =>
                          roomType.name?.trim().toLowerCase() === preferredName,
                  )
                : undefined;

        setForm((prev) => ({
            ...prev,
            fullName: guest.fullName?.trim() || prev.fullName,
            email: guest.email?.trim() || prev.email,
            phoneNumber: phone || prev.phoneNumber,
            guestProfileId: guest.guestProfileId || undefined,
            reservationLines: prev.reservationLines.map((line, index) => {
                if (index !== 0 || !matchedRoomType || line.roomTypeId > 0) {
                    return line;
                }
                return { ...line, roomTypeId: matchedRoomType.id };
            }),
        }));
        setErrors((prev) => {
            if (!prev.fullName && !prev.email && !prev.phoneNumber) return prev;
            const next = { ...prev };
            delete next.fullName;
            delete next.email;
            delete next.phoneNumber;
            return next;
        });

        const name = guest.fullName?.trim();
        if (!name) return;
        if (guest.totalStays && guest.totalStays > 0) {
            toast.success(
                `${name} has stayed ${guest.totalStays} time${guest.totalStays === 1 ? '' : 's'} before.`,
            );
            return;
        }
        toast.success(`Filled details for ${name}.`);
    };

    const setField = <K extends keyof QuotationFormState>(
        key: K,
        value: QuotationFormState[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => {
            if (!prev[key as string]) return prev;
            const next = { ...prev };
            delete next[key as string];
            return next;
        });
    };

    const validate = (): boolean => {
        const next: Record<string, string> = {};
        if (!form.fullName.trim()) {
            next.fullName = 'Guest name is required';
        }

        if (!form.reservationLines.length) {
            next.reservationLines = 'At least one reservation is required';
        }

        form.reservationLines.forEach((line, index) => {
            if (!line.roomTypeId || line.roomTypeId < 1) {
                next[`line-${index}-roomType`] = 'Room type is required';
            }
            if (!line.startDate) {
                next[`line-${index}-startDate`] = 'Check-in is required';
            }
            if (!line.endDate) {
                next[`line-${index}-endDate`] = 'Check-out is required';
            }
            if (
                line.startDate &&
                line.endDate &&
                line.endDate <= line.startDate
            ) {
                next[`line-${index}-endDate`] =
                    'Check-out must be after check-in';
            }
        });

        if (
            form.discountType &&
            (!form.discountValue || form.discountValue <= 0)
        ) {
            next.discountValue = 'Enter a discount value';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handlePrintInvoice = async () => {
        if (saving || !validate()) return;

        setSaving(true);
        try {
            const requestArgs = {
                formData: formDataForSave as Record<string, unknown>,
                roomTypes,
                discountCalculations: appliedCalculations,
                outstandingAmount: appliedCalculations.totalWithCustomCharges ?? 0,
                bankAccounts,
                includeTip: form.includeTip,
                guestProfileId: form.guestProfileId,
                quotationBatchNumber: draft?.payload?.quotationBatchNumber
                    ? String(draft.payload.quotationBatchNumber)
                    : undefined,
                quotationBatchId: draft?.payload?.quotationBatchId
                    ? String(draft.payload.quotationBatchId)
                    : undefined,
            };
            const requests = buildDraftInvoiceRequests(requestArgs);

            const activeId = draft?.id ?? draftId;
            if (activeId && requests.length === 1) {
                const result = await updateDraftInvoice(activeId, requests[0]);
                if (result.error || !result.data) {
                    toast.error(result.error || 'Could not update invoice.');
                    return;
                }
                toast.success(`Invoice ${result.data.invoiceNumber} updated.`);
                mutate('/draft-invoices?status=all');
                onSaved?.();
                router.push('/front-office/account-section/draft-invoices');
                return;
            }

            const result =
                requests.length === 1
                    ? await createDraftInvoice(requests[0]).then((r) =>
                          r.data ? { data: [r.data], error: r.error } : r,
                      )
                    : await createDraftInvoiceBatch(requests);

            if (
                result.error ||
                !(result.data as DraftInvoice[] | undefined)?.length
            ) {
                toast.error(result.error || 'Could not generate invoice.');
                return;
            }

            const created = result.data as DraftInvoice[];
            if (created.length > 1) {
                const batchNumber =
                    created[0].payload?.quotationBatchNumber ??
                    created[0].invoiceNumber;
                toast.success(
                    `Created ${created.length} draft invoices (${batchNumber}) — one per reservation.`,
                );
            } else {
                toast.success(`Invoice ${created[0].invoiceNumber} created.`);
            }

            mutate('/draft-invoices?status=all');
            onSaved?.();
            router.push('/front-office/account-section/draft-invoices');
        } catch (error) {
            console.error('Quotation invoice error:', error);
            toast.error('Failed to generate invoice.');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = 'bg-white shadow-none border-gray-300';
    const bankOptions = bankAccounts
        .map((account) => ({
            label: formatBankAccountLabel(account),
            value:
                account.id != null
                    ? String(account.id)
                    : account.accountNumber?.toString() || '',
        }))
        .filter((option) => option.value);

    const lineErrors = Object.fromEntries(
        Object.entries(errors).filter(([key]) => key.startsWith('line-')),
    );

    return (
        <>
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-24">
                <section className="rounded-md border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">
                        Guest details
                    </h2>
                    <p className="text-xs text-muted-foreground mb-4">
                        Search by name, email, or phone. A match fills the
                        guest details on this invoice.
                    </p>
                    <div className="flex flex-col gap-4">
                        <GuestSearch
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchingGuest={searchingGuest}
                            showResults={showResults}
                            guestHistory={guestHistory}
                            autoFillGuestData={applyGuestFromSearch}
                            setShowResults={setShowResults}
                            setGuestHistory={setGuestHistory}
                            inputClass={inputClass}
                            value={form.fullName}
                            onValueChange={(value) => {
                                setForm((prev) => ({
                                    ...prev,
                                    fullName: value,
                                    guestProfileId: undefined,
                                }));
                                setErrors((prev) => {
                                    if (!prev.fullName) return prev;
                                    const next = { ...prev };
                                    delete next.fullName;
                                    return next;
                                });
                            }}
                        />
                        {errors.fullName && (
                            <p className="text-sm text-red-500 -mt-2">
                                {errors.fullName}
                            </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LabeledInput
                                id="quotation-email"
                                name="email"
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setField('email', e.target.value)
                                }
                            />
                            <LabeledInput
                                id="quotation-phone"
                                name="phoneNumber"
                                label="Phone"
                                value={form.phoneNumber}
                                onChange={(e) =>
                                    setField('phoneNumber', e.target.value)
                                }
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-md border border-gray-200 bg-white p-5">
                    <QuotationReservationLinesEditor
                        lines={form.reservationLines}
                        roomTypes={roomTypes}
                        onChange={(lines) =>
                            setField('reservationLines', lines)
                        }
                        inputClass={inputClass}
                        lineErrors={lineErrors}
                        defaultStartDate={defaultStartDate}
                        defaultEndDate={defaultEndDate}
                        guestName={form.fullName}
                    />
                </section>

                <section className="rounded-md border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">
                        Discount
                    </h2>
                    <p className="text-xs text-muted-foreground mb-4">
                        Optional. Applied to the room subtotal before VAT and
                        service charge on the printed invoice.
                    </p>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LabeledSelect
                                id="quotation-discount-type"
                                name="discountType"
                                label="Discount type"
                                value={form.discountType || 'none'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'none') {
                                        setForm((prev) => ({
                                            ...prev,
                                            discountType: undefined,
                                            discountValue: undefined,
                                            discountReason: undefined,
                                        }));
                                        return;
                                    }
                                    setField(
                                        'discountType',
                                        value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                                    );
                                }}
                            >
                                <option value="none">No discount</option>
                                <option value="PERCENTAGE">
                                    Percentage (%)
                                </option>
                                <option value="FIXED_AMOUNT">
                                    Fixed amount (₦)
                                </option>
                            </LabeledSelect>
                            {form.discountType && (
                                <LabeledInput
                                    id="quotation-discount-value"
                                    name="discountValue"
                                    label={
                                        form.discountType === 'PERCENTAGE'
                                            ? 'Discount (%)'
                                            : 'Discount amount (₦)'
                                    }
                                    type="number"
                                    step="0.01"
                                    value={form.discountValue?.toString() || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setField(
                                            'discountValue',
                                            value === ''
                                                ? undefined
                                                : Number.parseFloat(value),
                                        );
                                    }}
                                />
                            )}
                        </div>
                        {errors.discountValue && (
                            <p className="text-sm text-red-500 -mt-2">
                                {errors.discountValue}
                            </p>
                        )}
                        {form.discountType && (
                            <LabeledInput
                                id="quotation-discount-reason"
                                name="discountReason"
                                label="Discount note (optional)"
                                value={form.discountReason || ''}
                                onChange={(e) =>
                                    setField('discountReason', e.target.value)
                                }
                                placeholder="e.g. Corporate rate, long-stay offer"
                            />
                        )}
                        {form.discountType &&
                            form.discountValue &&
                            form.discountValue > 0 && (
                                <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            Room subtotal
                                        </span>
                                        <span>
                                            {formatPrintMoney(
                                                discountCalculations.subtotal,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4 mt-1 text-green-700">
                                        <span>Discount</span>
                                        <span>
                                            −
                                            {formatPrintMoney(
                                                discountCalculations.discountAmount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4 mt-2 pt-2 border-t border-gray-200 font-medium">
                                        <span>After discount</span>
                                        <span>
                                            {formatPrintMoney(
                                                discountCalculations.finalPrice,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                    </div>
                </section>

                <WaiveChargesPanel
                    defaultExpanded
                    idPrefix="quotation-"
                    title="Waive Charges"
                    description="Turn off VAT, service charge, tip, or custom charges for this invoice. You can waive one charge or all of them."
                    formatCurrency={formatPrintMoney}
                    calculations={discountCalculations}
                    reasonInputClassName={inputClass}
                    waiverData={{
                        vat: !form.includeVat,
                        serviceCharge: !form.includeServiceCharge,
                        tip: !form.includeTip,
                        customCharges: !form.includeCustomCharges,
                        waiverReason: form.waiverReason,
                    }}
                    onWaiverChange={(next) =>
                        setForm((prev) => ({
                            ...prev,
                            includeVat: !next.vat,
                            includeServiceCharge: !next.serviceCharge,
                            includeTip: !next.tip,
                            includeCustomCharges: !next.customCharges,
                            waiverReason: next.waiverReason,
                        }))
                    }
                />

                {bankOptions.length > 0 && (
                    <section className="rounded-md border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                            Payment details
                        </h2>
                            <LabeledSelect
                                id="quotation-bank"
                                name="receivingAccount"
                                label="Bank account on invoice"
                                value={form.receivingAccount}
                                onChange={(e) =>
                                    setField('receivingAccount', e.target.value)
                                }
                            >
                                <option value="">
                                    Select bank account (optional)
                                </option>
                                {bankOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </LabeledSelect>
                    </section>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
                <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Estimated total · {form.reservationLines.length}{' '}
                                reservation
                                {form.reservationLines.length === 1 ? '' : 's'}
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatPrintMoney(
                                    Number(
                                        appliedCalculations?.totalWithCustomCharges ??
                                            appliedCalculations?.finalPrice ??
                                            0,
                                    ),
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/front-office/dashboard">
                                <LayoutDashboard className="size-4 mr-2" />
                                Dashboard
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            className="bg-orion-blue hover:bg-orion-blue"
                            disabled={saving}
                            onClick={handlePrintInvoice}
                        >
                            {saving ? (
                                <LoaderCircle className="size-4 animate-spin mr-2" />
                            ) : (
                                <Printer className="size-4 mr-2" />
                            )}
                            {draftId || draft
                                ? 'Update Invoice'
                                : 'Generate Invoice'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
