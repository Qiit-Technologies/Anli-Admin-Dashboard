import type { BankAccount } from '@/app/actions/bank-accounts';
import type { CreateDraftInvoiceInput } from '@/app/actions/draft-invoices';
import {
    buildDraftLineItems,
    resolveDocumentDateRange,
    resolveReservationLines,
    syncLegacyFormFieldsFromLines,
    type QuotationRoomLine,
} from '@/lib/front-office/quotation-room-lines';
import type {
    DraftInvoiceLineItem,
    DraftInvoicePricing,
} from '@/types/draft-invoice';

type DiscountCalculations = {
    originalPrice: number;
    nights: number;
    subtotal: number;
    vatAmount: number;
    vatRate: number;
    serviceChargeAmount?: number;
    serviceChargeRate?: number;
    tipAmount?: number;
    tipRate?: number;
    discountAmount?: number;
    finalPrice: number;
    customCharges?: Array<{
        id: number;
        name: string;
        rate: number;
        amount: number;
    }>;
    totalCustomChargesAmount?: number;
    totalWithCustomCharges?: number;
    remainingAmount?: number;
};

type BuildDraftInvoiceRequestArgs = {
    formData: Record<string, unknown>;
    roomTypes: Array<{ id: number; name?: string }>;
    discountCalculations: DiscountCalculations;
    outstandingAmount: number;
    bankAccounts: BankAccount[];
    IDNumber?: string;
    IDImage?: string;
    guestProfileId?: number;
    creditToApply?: number;
    includeTip?: boolean;
    /** When updating an existing draft that belongs to a quotation batch. */
    quotationBatchNumber?: string;
    quotationBatchId?: string;
};

function resolveSelectedBankAccount(
    receivingAccount: string | undefined,
    bankAccounts: BankAccount[],
): BankAccount | undefined {
    if (!receivingAccount?.trim()) return undefined;
    const selected = receivingAccount.trim();
    return bankAccounts.find((account) => {
        if (account.id != null && String(account.id) === selected) return true;
        return String(account.accountNumber ?? '').trim() === selected;
    });
}

function bankAccountSnapshot(account: BankAccount | undefined) {
    if (!account) return undefined;
    return {
        id: account.id,
        accountName: account.accountName,
        accountNumber: String(account.accountNumber ?? ''),
        bankName: account.bankName,
    };
}

function roundMoney(value: number): number {
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    return Number(safe.toFixed(2));
}

function resolveGrandTotal(pricing: DraftInvoicePricing): number {
    const candidates = [
        pricing.totalWithCustomCharges,
        pricing.total,
        pricing.finalPrice,
        pricing.outstanding,
        pricing.subtotal,
    ];

    for (const value of candidates) {
        const numeric = Number(value);
        if (!Number.isNaN(numeric) && numeric > 0) return numeric;
    }

    return 0;
}

function splitPricingForLine(
    lineSubtotal: number,
    totalSubtotal: number,
    totalPricing: DraftInvoicePricing,
    isFirstLine: boolean,
): DraftInvoicePricing {
    if (totalSubtotal <= 0) {
        return {
            ...totalPricing,
            subtotal: lineSubtotal,
            finalPrice: lineSubtotal,
            total: lineSubtotal,
            outstanding: isFirstLine ? (totalPricing.outstanding ?? 0) : 0,
            totalWithCustomCharges: lineSubtotal,
        };
    }

    const ratio = lineSubtotal / totalSubtotal;
    const discountAmount = roundMoney(
        (totalPricing.discountAmount ?? 0) * ratio,
    );
    const vatAmount = roundMoney((totalPricing.vatAmount ?? 0) * ratio);
    const serviceChargeAmount = roundMoney(
        (totalPricing.serviceChargeAmount ?? 0) * ratio,
    );
    const tipAmount = roundMoney((totalPricing.tipAmount ?? 0) * ratio);
    const finalPrice = roundMoney(
        Math.max(lineSubtotal - discountAmount, 0) +
            vatAmount +
            serviceChargeAmount +
            tipAmount,
    );
    const totalWithCustomCharges = roundMoney(
        (totalPricing.totalWithCustomCharges ?? finalPrice) * ratio,
    );

    return {
        subtotal: lineSubtotal,
        vatAmount,
        vatRate: totalPricing.vatRate,
        serviceChargeAmount,
        serviceChargeRate: totalPricing.serviceChargeRate,
        tipAmount,
        discountAmount,
        finalPrice,
        total: totalWithCustomCharges,
        outstanding: isFirstLine ? (totalPricing.outstanding ?? 0) : 0,
        totalWithCustomCharges,
    };
}

export function buildReservationPayload(
    args: BuildDraftInvoiceRequestArgs,
    reservationLine: QuotationRoomLine,
    grandTotal: number,
    batchMeta?: {
        quotationBatchId: string;
        quotationBatchNumber: string;
        quotationLineIndex: number;
        quotationLineTotal: number;
    },
): Record<string, unknown> {
    const {
        formData,
        outstandingAmount,
        IDNumber,
        IDImage,
        guestProfileId,
        creditToApply,
        includeTip,
        bankAccounts,
    } = args;

    const selectedBank = resolveSelectedBankAccount(
        formData.receivingAccount
            ? String(formData.receivingAccount)
            : undefined,
        bankAccounts,
    );
    const snapshot = bankAccountSnapshot(selectedBank);

    return {
        ...formData,
        ...syncLegacyFormFieldsFromLines([reservationLine]),
        reservationLines: [reservationLine],
        quotationRooms: [],
        quotationGrandTotal: grandTotal,
        outstanding: outstandingAmount,
        IDNumber: IDNumber ?? '',
        IDImage: IDImage ?? '',
        phoneNumber: formData.phoneNumber || '',
        secondGuestPhoneNumber: formData.secondGuestPhoneNumber || '',
        guestProfileId,
        creditToApply: creditToApply ?? 0,
        includeTip: !!includeTip,
        createdAt: new Date().toISOString(),
        paymentMethod: formData.paymentMethod || 'CASH',
        property: formData.property || 'Hotel',
        numberOfGuests: Number(formData.numberOfGuests ?? 1),
        receivingAccount:
            snapshot?.accountNumber ||
            (formData.receivingAccount
                ? String(formData.receivingAccount)
                : ''),
        bankAccountSnapshot: snapshot,
        ...(batchMeta ?? {}),
        ...(args.quotationBatchNumber
            ? { quotationBatchNumber: args.quotationBatchNumber }
            : {}),
        ...(args.quotationBatchId
            ? { quotationBatchId: args.quotationBatchId }
            : {}),
    };
}

export function buildCombinedReservationPayload(
    args: BuildDraftInvoiceRequestArgs,
    reservationLines: QuotationRoomLine[],
    grandTotal: number,
): Record<string, unknown> {
    const {
        formData,
        outstandingAmount,
        IDNumber,
        IDImage,
        guestProfileId,
        creditToApply,
        includeTip,
        bankAccounts,
    } = args;

    const selectedBank = resolveSelectedBankAccount(
        formData.receivingAccount
            ? String(formData.receivingAccount)
            : undefined,
        bankAccounts,
    );
    const snapshot = bankAccountSnapshot(selectedBank);

    return {
        ...formData,
        ...syncLegacyFormFieldsFromLines(reservationLines),
        reservationLines,
        quotationRooms: [],
        quotationGrandTotal: grandTotal,
        outstanding: outstandingAmount,
        IDNumber: IDNumber ?? '',
        IDImage: IDImage ?? '',
        phoneNumber: formData.phoneNumber || '',
        secondGuestPhoneNumber: formData.secondGuestPhoneNumber || '',
        guestProfileId,
        creditToApply: creditToApply ?? 0,
        includeTip: !!includeTip,
        createdAt: new Date().toISOString(),
        paymentMethod: formData.paymentMethod || 'CASH',
        property: formData.property || 'Hotel',
        numberOfGuests: Number(formData.numberOfGuests ?? 1),
        receivingAccount:
            snapshot?.accountNumber ||
            (formData.receivingAccount
                ? String(formData.receivingAccount)
                : ''),
        bankAccountSnapshot: snapshot,
    };
}

export function buildPricingSnapshot(
    discountCalculations: DiscountCalculations,
    outstandingAmount: number,
): DraftInvoicePricing {
    return {
        subtotal: discountCalculations.subtotal,
        vatAmount: discountCalculations.vatAmount,
        vatRate: discountCalculations.vatRate,
        serviceChargeAmount: discountCalculations.serviceChargeAmount,
        serviceChargeRate: discountCalculations.serviceChargeRate,
        tipAmount: discountCalculations.tipAmount,
        tipRate: discountCalculations.tipRate,
        discountAmount: discountCalculations.discountAmount,
        customCharges: discountCalculations.customCharges,
        finalPrice: discountCalculations.finalPrice,
        total: discountCalculations.totalWithCustomCharges,
        outstanding: outstandingAmount,
        totalWithCustomCharges: discountCalculations.totalWithCustomCharges,
    };
}

function buildSingleDraftInvoiceRequest(
    args: BuildDraftInvoiceRequestArgs,
    lineItem: DraftInvoiceLineItem,
    reservationLine: QuotationRoomLine,
    totalSubtotal: number,
    totalPricing: DraftInvoicePricing,
    grandTotal: number,
    lineIndex: number,
    batchMeta?: {
        quotationBatchId: string;
        quotationBatchNumber: string;
        quotationLineIndex: number;
        quotationLineTotal: number;
    },
): CreateDraftInvoiceInput {
    const pricing = splitPricingForLine(
        lineItem.subtotal,
        totalSubtotal,
        totalPricing,
        lineIndex === 0,
    );

    return {
        guestName: String(args.formData.fullName || ''),
        guestEmail: args.formData.email
            ? String(args.formData.email)
            : undefined,
        guestPhone: args.formData.phoneNumber
            ? String(args.formData.phoneNumber)
            : undefined,
        checkInDate:
            lineItem.checkInDate || String(reservationLine.startDate || ''),
        checkOutDate:
            lineItem.checkOutDate || String(reservationLine.endDate || ''),
        lineItems: [lineItem],
        pricing,
        payload: buildReservationPayload(
            args,
            reservationLine,
            grandTotal,
            batchMeta,
        ),
        bankAccountId: resolveSelectedBankAccount(
            args.formData.receivingAccount
                ? String(args.formData.receivingAccount)
                : undefined,
            args.bankAccounts,
        )?.id,
    };
}

/** Builds one draft per reservation line (batch) or a single draft for one line. */
export function buildDraftInvoiceRequests(
    args: BuildDraftInvoiceRequestArgs,
): CreateDraftInvoiceInput[] {
    const reservationLines = resolveReservationLines(args.formData);
    const lineItems = buildDraftLineItems(args.formData, args.roomTypes);
    const totalPricing = buildPricingSnapshot(
        args.discountCalculations,
        args.outstandingAmount,
    );
    const grandTotal = resolveGrandTotal(totalPricing);

    const { checkInDate, checkOutDate } = resolveDocumentDateRange(lineItems);
    const fallbackLine = reservationLines[0];

    return [
        {
            guestName: String(args.formData.fullName || ''),
            guestEmail: args.formData.email
                ? String(args.formData.email)
                : undefined,
            guestPhone: args.formData.phoneNumber
                ? String(args.formData.phoneNumber)
                : undefined,
            checkInDate: checkInDate || String(fallbackLine?.startDate || ''),
            checkOutDate: checkOutDate || String(fallbackLine?.endDate || ''),
            lineItems,
            pricing: totalPricing,
            payload: {
                ...buildCombinedReservationPayload(
                    args,
                    reservationLines,
                    grandTotal,
                ),
                includeVat: args.formData.includeVat !== false,
                includeServiceCharge:
                    args.formData.includeServiceCharge !== false,
                includeCustomCharges:
                    args.formData.includeCustomCharges !== false,
            },
            bankAccountId: resolveSelectedBankAccount(
                args.formData.receivingAccount
                    ? String(args.formData.receivingAccount)
                    : undefined,
                args.bankAccounts,
            )?.id,
        },
    ];
}

/** Single combined request — same as the first (and only) entry from buildDraftInvoiceRequests. */
export function buildDraftInvoiceRequest(
    args: BuildDraftInvoiceRequestArgs,
): CreateDraftInvoiceInput {
    return buildDraftInvoiceRequests(args)[0];
}
