import type { OrganizationDetail } from '@/hooks/useHotel';
import {
    buildInvoiceBrandHeaderHtml,
    invoicePrintLogoStyles,
    resolveBusinessLogoUrl,
} from '@/lib/front-office/print-branding';
import { reservationConfirmationHotelFromOrg } from '@/lib/front-office/reservation-confirmation-actions';
import type { DraftInvoice, DraftInvoiceBankAccount, DraftInvoiceLineItem } from '@/types/draft-invoice';
import { escapeHtml } from '@/lib/front-office/print-document-utils';

export type QuotationInvoicePrintOptions = {
    autoPrint?: boolean;
};

function lineItemsSubtotal(items: DraftInvoiceLineItem[]): number {
    return items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
}

function resolveTotal(draft: DraftInvoice): number {
    const pricing = draft.pricing ?? {};
    const itemSubtotal = lineItemsSubtotal(draft.lineItems ?? []);
    const candidates = [
        pricing.total,
        pricing.totalWithCustomCharges,
        pricing.finalPrice,
        pricing.outstanding,
        draft.amount,
        itemSubtotal > 0
            ? itemSubtotal +
              Number(pricing.vatAmount ?? 0) +
              Number(pricing.serviceChargeAmount ?? 0) -
              Number(pricing.discountAmount ?? 0)
            : 0,
    ];

    for (const value of candidates) {
        const numeric = Number(value);
        if (!Number.isNaN(numeric) && numeric > 0) return numeric;
    }

    const payloadTotal = Number(draft.payload?.quotationGrandTotal);
    if (!Number.isNaN(payloadTotal) && payloadTotal > 0) {
        return payloadTotal;
    }

    return itemSubtotal;
}

function asBankRecord(value: unknown): DraftInvoiceBankAccount | null {
    if (!value || typeof value !== 'object') return null;
    const record = value as Partial<DraftInvoiceBankAccount>;
    const accountNumber = String(record.accountNumber ?? '').trim();
    if (!accountNumber) return null;
    return {
        id: Number(record.id) || 0,
        accountNumber,
        accountName: String(record.accountName ?? '').trim(),
        bankName: String(record.bankName ?? '').trim(),
    };
}

function resolveInvoiceBank(
    draft: DraftInvoice,
): DraftInvoiceBankAccount | null {
    const fromRelation = asBankRecord(draft.bankAccount);
    if (fromRelation) return fromRelation;

    const payload = draft.payload ?? {};
    const fromSnapshot = asBankRecord(payload.bankAccountSnapshot);
    if (fromSnapshot) return fromSnapshot;

    const fromPayloadBank = asBankRecord(payload.bankAccount);
    if (fromPayloadBank) return fromPayloadBank;

    const receivingAccount = String(payload.receivingAccount ?? '').trim();
    if (!receivingAccount) return null;

    return {
        id: 0,
        accountNumber: receivingAccount,
        accountName: String(payload.accountName ?? '').trim(),
        bankName: String(payload.bankName ?? '').trim(),
    };
}

function formatMoney(amount: number): string {
    const n = Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
        }).format(safe);
    } catch {
        return `₦${safe.toFixed(2)}`;
    }
}

function ordinalDay(day: number): string {
    const teen = day % 100;
    if (teen >= 11 && teen <= 13) return `${day}th`;
    switch (day % 10) {
        case 1:
            return `${day}st`;
        case 2:
            return `${day}nd`;
        case 3:
            return `${day}rd`;
        default:
            return `${day}th`;
    }
}

function formatFullDate(d: string | Date | null | undefined): string {
    if (!d) return '—';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    const month = date.toLocaleString('en-GB', { month: 'long' });
    return `${ordinalDay(date.getDate())} ${month} ${date.getFullYear()}`;
}

function formatTime(t: string | null | undefined, fallback: string): string {
    const trimmed = t?.trim();
    return trimmed || fallback;
}

function detailRow(label: string, value: string): string {
    return `<div class="row"><div class="dl">${escapeHtml(label)}</div><div>${value}</div></div>`;
}

function sanitizeTermsHtml(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

function stayDetailsGrid(draft: DraftInvoice): string {
    const items =
        draft.lineItems.length > 0
            ? draft.lineItems
            : [];
    if (items.length === 0) {
        return `<div class="details-grid">
            ${detailRow('Guest name', escapeHtml(draft.guestName || '—'))}
            ${detailRow('Rate payable', escapeHtml(formatMoney(resolveTotal(draft))))}
        </div>`;
    }

    const guestRow = detailRow(
        'Guest name',
        escapeHtml(draft.guestName || '—'),
    );

    return (
        guestRow
            ? `<div class="details-grid">${guestRow}</div>`
            : ''
    ) +
        items
            .map((item, index) => {
                const heading =
                    items.length > 1
                        ? `<p class="stay-label">Stay ${index + 1}${
                              item.roomTypeName
                                  ? ` — ${escapeHtml(item.roomTypeName)}`
                                  : ''
                          }</p>`
                        : '';
                const roomLabel =
                    item.quantity > 1
                        ? `${escapeHtml(item.roomTypeName)} × ${item.quantity}`
                        : escapeHtml(item.roomTypeName);
                const dateRange =
                    item.checkInDate || item.checkOutDate
                        ? `${formatFullDate(item.checkInDate)} – ${formatFullDate(item.checkOutDate)}`
                        : '';
                return `
        ${heading}
        <div class="details-grid">
            ${detailRow('Room type', roomLabel)}
            ${dateRange ? detailRow('Stay dates', escapeHtml(dateRange)) : ''}
            ${detailRow('Rate description', 'Room rate (per night)')}
            ${detailRow('No. rooms', String(item.quantity || 1))}
            ${detailRow('Nights', String(item.nights || 1))}
            ${detailRow('Rate (per night)', escapeHtml(formatMoney(item.ratePerNight)))}
            ${detailRow('Amount', escapeHtml(formatMoney(item.subtotal)))}
        </div>`;
            })
            .join('');
}

function totalsGrid(draft: DraftInvoice): string {
    const pricing = draft.pricing ?? {};
    const subtotal = Number(pricing.subtotal ?? 0);
    const discountAmount = Number(pricing.discountAmount ?? 0);
    const vatAmount = Number(pricing.vatAmount ?? 0);
    const vatRate = Number(pricing.vatRate ?? 0);
    const serviceChargeAmount = Number(pricing.serviceChargeAmount ?? 0);
    const serviceChargeRate = Number(pricing.serviceChargeRate ?? 0);
    const tipAmount = Number(pricing.tipAmount ?? 0);
    const customCharges = Array.isArray(pricing.customCharges)
        ? pricing.customCharges
        : [];
    const customChargeTotal = customCharges.reduce(
        (sum, charge) => sum + Number(charge.amount ?? 0),
        0,
    );
    const payload = draft.payload ?? {};
    const discountType = payload.discountType as string | undefined;
    const discountValue = Number(payload.discountValue ?? 0);
    const rows: string[] = [];

    const hasAdjustments =
        discountAmount > 0 ||
        vatAmount > 0 ||
        serviceChargeAmount > 0 ||
        tipAmount > 0 ||
        customChargeTotal > 0;

    if (hasAdjustments && subtotal > 0) {
        rows.push(detailRow('Subtotal', escapeHtml(formatMoney(subtotal))));
    }
    if (discountAmount > 0) {
        const discountLabel =
            discountType === 'PERCENTAGE' && discountValue > 0
                ? `Discount (${discountValue}%)`
                : 'Discount';
        rows.push(
            detailRow(
                discountLabel,
                `−${escapeHtml(formatMoney(discountAmount))}`,
            ),
        );
    }
    if (vatAmount > 0) {
        const vatLabel = vatRate > 0 ? `VAT (${vatRate}%)` : 'VAT';
        rows.push(detailRow(vatLabel, escapeHtml(formatMoney(vatAmount))));
    }
    if (serviceChargeAmount > 0) {
        const scLabel =
            serviceChargeRate > 0
                ? `Service charge (${serviceChargeRate}%)`
                : 'Service charge';
        rows.push(
            detailRow(scLabel, escapeHtml(formatMoney(serviceChargeAmount))),
        );
    }
    if (tipAmount > 0) {
        const tipRate = Number(pricing.tipRate ?? 0);
        const tipLabel = tipRate > 0 ? `Tip (${tipRate}%)` : 'Tip';
        rows.push(detailRow(tipLabel, escapeHtml(formatMoney(tipAmount))));
    }
    for (const charge of customCharges) {
        const amount = Number(charge.amount ?? 0);
        if (amount <= 0) continue;
        const rate = Number(charge.rate ?? 0);
        const label =
            rate > 0 ? `${charge.name} (${rate}%)` : charge.name || 'Charge';
        rows.push(detailRow(label, escapeHtml(formatMoney(amount))));
    }
    rows.push(
        detailRow('Rate payable', escapeHtml(formatMoney(resolveTotal(draft)))),
    );

    return `<div class="details-grid totals-grid">${rows.join('')}</div>`;
}

function paymentDetailsGrid(bank: DraftInvoiceBankAccount | null): string {
    if (!bank?.accountNumber) return '';
    const rows = [
        detailRow('Account number', escapeHtml(bank.accountNumber)),
    ];
    if (bank.accountName) {
        rows.push(detailRow('Account name', escapeHtml(bank.accountName)));
    }
    if (bank.bankName) {
        rows.push(detailRow('Bank name', escapeHtml(bank.bankName)));
    }
    return `
      <div class="section-banner">PAYMENT DETAILS</div>
      <div class="details-grid">${rows.join('')}</div>
    `;
}

export function quotationInvoicePrintTemplate(
    draft: DraftInvoice,
    organization: OrganizationDetail | null | undefined,
    options?: QuotationInvoicePrintOptions,
): string {
    const hotel = reservationConfirmationHotelFromOrg(organization);
    const hotelName = hotel?.name?.trim() || 'Hotel';
    const logoUrl = resolveBusinessLogoUrl(organization) ?? hotel?.logoUrl;
    const phone = hotel?.phones?.[0] ?? '';
    const guestName = (draft.guestName || 'Guest').trim();
    const firstStay = draft.lineItems[0];
    const checkInTime = formatTime(
        firstStay?.checkInTime,
        '14:00',
    );
    const checkOutTime = formatTime(
        firstStay?.checkOutTime,
        '12:00',
    );

    const phoneTokens = (hotel?.phones ?? [])
        .map((entry) => entry?.trim())
        .filter((entry): entry is string => Boolean(entry))
        .map((entry) => `Tel: ${escapeHtml(entry)}`);
    const contactRight = [
        ...phoneTokens,
        hotel?.email ? escapeHtml(hotel.email) : '',
        hotel?.website ? escapeHtml(hotel.website) : '',
    ]
        .filter(Boolean)
        .join(' · ');
    const addressLine = hotel?.address ? escapeHtml(hotel.address) : '';
    const regLine = hotel?.taxId ? `VAT: ${escapeHtml(hotel.taxId)}` : '';

    const logoBlock = buildInvoiceBrandHeaderHtml({
        logoUrl,
        businessName: hotelName,
        metaLines: [regLine, addressLine, contactRight].filter(Boolean),
    });

    const customTerms = hotel?.termsHtml?.trim()
        ? sanitizeTermsHtml(hotel.termsHtml)
        : '';
    const termsBlock = customTerms
        ? `<div class="terms terms-custom">${customTerms}</div>`
        : `<div class="terms">
            <p>
                <strong>Deposits / Payment</strong>
            </p>
            <p>
                This invoice is subject to room availability at the time of payment.
                Reservation is confirmed only upon receipt of payment or deposit as per hotel policy.
                ${phone ? `Please forward proof of payment to ${escapeHtml(phone)}.` : ''}
            </p>
            <p>
                <strong>Check-in / Check-out</strong>
            </p>
            <p>
                Check-in time: ${escapeHtml(checkInTime)}.
                Check-out time: ${escapeHtml(checkOutTime)}.
            </p>
            <p>
                <strong>Identification</strong>
            </p>
            <p>
                Guests may be required to present valid government-issued photo
                identification at check-in in accordance with applicable law.
            </p>
        </div>`;

    const printScript = options?.autoPrint
        ? `<script>window.onload=function(){window.print();};</script>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(draft.invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #111;
      line-height: 1.45;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .confirmation-doc {
      padding: 10mm 14mm;
      max-width: 190mm;
      margin: 0 auto;
      background: #fff;
    }
    .header-brand {
      text-align: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
    ${invoicePrintLogoStyles}
    .legal-block {
      font-size: 9.5pt;
      color: #222;
      max-width: 560px;
      margin: 0 auto;
    }
    .legal-block .company {
      font-weight: 700;
      font-size: 11pt;
      margin-bottom: 6px;
    }
    .legal-block .meta {
      font-size: 9pt;
      color: #444;
      margin-bottom: 4px;
      word-break: break-word;
    }
    .section-banner {
      background: #142d52;
      color: #fff;
      text-align: center;
      font-weight: 600;
      font-size: 11pt;
      letter-spacing: 0.04em;
      padding: 8px 12px;
      margin: 10px 0 8px;
    }
    .confirm-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
      font-size: 10pt;
      margin-bottom: 14px;
    }
    .confirm-meta .label {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }
    .letter {
      font-size: 10pt;
      margin: 10px 0 12px;
    }
    .letter .signoff {
      margin-top: 12px;
      font-weight: 500;
    }
    .stay-label {
      font-size: 9pt;
      font-weight: 600;
      color: #142d52;
      margin: 12px 0 4px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 20px;
      font-size: 10pt;
    }
    .details-grid .row {
      display: grid;
      grid-template-columns: 42% 58%;
      border-bottom: 1px solid #eee;
      padding: 6px 0;
    }
    .details-grid .dl { font-weight: 600; color: #333; }
    .totals-grid { margin-top: 8px; }
    .terms {
      font-size: 8.5pt;
      color: #333;
      line-height: 1.5;
    }
    .terms p { margin: 0 0 8px; }
    .terms-custom :first-child { margin-top: 0; }
    .terms-custom :last-child { margin-bottom: 0; }
    .terms-custom h1, .terms-custom h2, .terms-custom h3,
    .terms-custom h4, .terms-custom h5, .terms-custom h6 {
      font-size: 9.5pt;
      margin: 6px 0 4px;
    }
    .terms-custom ul, .terms-custom ol { margin: 4px 0 8px 18px; }
    .terms-custom li { margin: 0 0 3px; }
    .footer-note {
      margin-top: 18px;
      font-size: 8pt;
      color: #666;
      text-align: center;
    }
    @media print {
      .confirmation-doc { padding: 8mm 12mm; }
    }
  </style>
</head>
<body>
  <div class="confirmation-doc">
    <header class="header-brand">
      ${logoBlock}
    </header>

    <div class="section-banner">INVOICE</div>

    <div class="confirm-meta">
      <div>
        <div class="label">Invoice number</div>
        <div>${escapeHtml(draft.invoiceNumber)}</div>
      </div>
      <div>
        <div class="label">Date of invoice</div>
        <div>${formatFullDate(draft.createdAt)}</div>
      </div>
      <div>
        <div class="label">Check-in date</div>
        <div>${formatFullDate(firstStay?.checkInDate || draft.checkInDate)}</div>
      </div>
      <div>
        <div class="label">Check-out date</div>
        <div>${formatFullDate(firstStay?.checkOutDate || draft.checkOutDate)}</div>
      </div>
      <div>
        <div class="label">Check-in time</div>
        <div>${escapeHtml(checkInTime)}</div>
      </div>
      <div>
        <div class="label">Check-out time</div>
        <div>${escapeHtml(checkOutTime)}</div>
      </div>
    </div>

    <div class="letter">
      <p>Dear ${escapeHtml(guestName)},</p>
      <p>
        Thank you for choosing <strong>${escapeHtml(hotelName)}</strong>.
        Please find your invoice details below. This document is for pricing
        review and does not confirm a reservation until payment is received
        as per hotel policy.
      </p>
      <p class="signoff">See you soon,</p>
    </div>

    <div class="section-banner">INVOICE DETAILS</div>
    ${stayDetailsGrid(draft)}
    ${totalsGrid(draft)}

    ${paymentDetailsGrid(resolveInvoiceBank(draft))}

    <div class="section-banner">TERMS &amp; CONDITIONS</div>
    ${termsBlock}

    <div class="footer-note">
      Please present this invoice when you arrive. For questions, contact the hotel using the details above.
    </div>
  </div>
  ${printScript}
</body>
</html>`;
}
