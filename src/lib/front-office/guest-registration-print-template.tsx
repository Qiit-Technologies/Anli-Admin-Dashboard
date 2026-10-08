import type { OrganizationDetail } from '@/hooks/useHotel';
import {
    buildCompactBrandHeaderHtml,
    compactPrintLogoStyles,
    resolveBusinessLogoUrl,
} from '@/lib/front-office/print-branding';
import { reservationConfirmationHotelFromOrg } from '@/lib/front-office/reservation-confirmation-actions';
import { escapeHtml } from '@/lib/front-office/print-document-utils';

export type GuestRegistrationPrintOptions = {
    autoPrint?: boolean;
};

const ID_TYPES = [
    'NIN',
    "Driver's License",
    'International Passport',
    "Voter's Card",
    'Other',
] as const;

const SETTLEMENT_MODES = [
    'CASH',
    'ELECTRONIC FUNDS TRANSFER',
    'VISA',
    'MASTER CARD',
] as const;

function blankLine(width = '100%'): string {
    return `<span class="field-line" style="width:${width}"></span>`;
}

function checkboxCell(label: string): string {
    return `<label class="check-row"><span class="check-box"></span> ${escapeHtml(label)}</label>`;
}

function idTypeRow(): string {
    return ID_TYPES.map(
        (type) =>
            `<label class="check-row inline"><span class="check-box"></span> ${escapeHtml(type)}</label>`,
    ).join('');
}

function settlementGrid(): string {
    return SETTLEMENT_MODES.map((mode) => checkboxCell(mode)).join('');
}

/** Left column: label + blank space for staff to write (date, room no, etc.). */
function labelWriteCell(label: string): string {
    return `
      <div class="label-cell">
        <span class="label-text">${escapeHtml(label)}</span>
        ${blankLine()}
      </div>`;
}

function fieldGroup(label: string, width?: string): string {
    return `<div class="field-group"><span class="field-label">${escapeHtml(label)}</span>${blankLine(width)}</div>`;
}

export function guestRegistrationPrintTemplate(
    organization: OrganizationDetail | null | undefined,
    options?: GuestRegistrationPrintOptions,
): string {
    const hotel = reservationConfirmationHotelFromOrg(organization);
    const hotelName = hotel?.name?.trim() || 'Hotel';
    const logoUrl = resolveBusinessLogoUrl(organization) ?? hotel?.logoUrl;
    const phone = hotel?.phones?.join(' · ') ?? '';

    const metaLines = [
        hotel?.address,
        phone,
        hotel?.email ? `Email: ${hotel.email}` : '',
    ].filter((line): line is string => Boolean(line?.trim()));

    const brandBlock = buildCompactBrandHeaderHtml({
        logoUrl,
        businessName: hotelName,
        metaLines,
    });

    const disclaimer = `I/We agree that the owners will not be held responsible for valuables left in the rooms or public areas of ${hotelName} at any time by myself or any of my guests.`;

    const printScript = options?.autoPrint
        ? `<script>window.onload=function(){window.print();};</script>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Guest Registration Form — ${escapeHtml(hotelName)}</title>
  <style>
    * { box-sizing: border-box; }
    @page { size: A4 portrait; margin: 6mm; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      color: #111;
      background: #fff;
      font-size: 7.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .registration-doc {
      width: 100%;
      max-width: 198mm;
      margin: 0 auto;
      padding: 4mm 5mm;
      border: 1px solid #111;
    }
    .header-row {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: 4px;
      margin-bottom: 3px;
    }
    .form-title {
      grid-column: 1 / -1;
      text-align: center;
      font-weight: 700;
      font-size: 10pt;
      letter-spacing: 0.03em;
      margin: 0 0 4px;
    }
    .folio-box {
      border: 1px solid #111;
      padding: 3px 6px;
      font-weight: 700;
      font-size: 7pt;
      line-height: 1.2;
    }
    .folio-box .field-line { display: block; margin-top: 2px; min-height: 10px; }
    .brand-block { margin-bottom: 3px; }
    .print-brand-meta { font-size: 6.5pt; line-height: 1.25; text-align: left; }
    ${compactPrintLogoStyles}
    .grid-form {
      display: grid;
      grid-template-columns: 72px 1fr;
      border: 1px solid #111;
      width: 100%;
    }
    .grid-form > div {
      border-bottom: 1px solid #111;
      border-right: 1px solid #111;
      padding: 3px 5px;
      min-height: 0;
    }
    .grid-form > div:nth-child(2n) { border-right: none; }
    .grid-form > div:nth-last-child(-n+2) { border-bottom: none; }
    .label-cell {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 2px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6.5pt;
      line-height: 1.15;
    }
    .label-text { display: block; }
    .field-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 10px;
      align-items: flex-end;
    }
    .field-group { flex: 1; min-width: 70px; }
    .field-group.wide { flex: 1 1 100%; min-width: 100%; }
    .field-label {
      display: block;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .field-line {
      display: block;
      border-bottom: 1px solid #111;
      min-height: 11px;
    }
    .policy-block {
      font-size: 6.5pt;
      line-height: 1.25;
    }
    .policy-block strong { font-size: 6.5pt; }
    .check-row {
      display: flex;
      align-items: flex-start;
      gap: 3px;
      font-size: 6.5pt;
      line-height: 1.2;
    }
    .check-row.inline { display: inline-flex; margin-right: 6px; margin-bottom: 2px; }
    .check-box {
      width: 9px;
      height: 9px;
      border: 1px solid #111;
      flex-shrink: 0;
      margin-top: 0;
    }
    .settlement-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px 8px;
    }
    .settlement-label {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .signature-box {
      border: 1px solid #111;
      min-height: 28px;
      margin-top: 2px;
    }
    .id-section {
      margin-top: 4px;
      border: 1px solid #111;
      padding: 4px 5px;
    }
    .id-section .section-label {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .id-types { display: flex; flex-wrap: wrap; gap: 2px 6px; margin-bottom: 3px; }
    .id-fields { display: flex; gap: 10px; flex-wrap: wrap; }
    .id-fields .field-group { min-width: 120px; flex: 1; }
    .footer-note {
      text-align: center;
      margin-top: 4px;
      font-style: italic;
      font-size: 7pt;
    }
    @media print {
      html, body { height: auto; }
      .registration-doc {
        border-width: 1px;
        padding: 3mm 4mm;
        page-break-inside: avoid;
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="registration-doc">
    <div class="header-row">
      <div class="form-title">GUEST REGISTRATION FORM</div>
      <div class="folio-box">
        FOLIO / RESERVATION NO:
        ${blankLine()}
      </div>
    </div>

    <div class="brand-block">
      ${brandBlock}
    </div>

    <div class="grid-form">
      ${labelWriteCell('Check In')}
      <div>
        <div class="field-row">
          ${fieldGroup('Title')}
          ${fieldGroup('First Name')}
          ${fieldGroup('Surname')}
        </div>
      </div>

      ${labelWriteCell('Check Out')}
      <div>${fieldGroup('Residential Address', '100%')}</div>

      ${labelWriteCell('Room No.')}
      <div>
        <div class="field-row">
          ${fieldGroup('E-mail')}
          ${fieldGroup('Phone')}
        </div>
      </div>

      ${labelWriteCell('Room Type')}
      <div class="policy-block">
        <strong>Disclaimer:</strong> ${checkboxCell(disclaimer)}
      </div>

      ${labelWriteCell('Room Rate')}
      <div class="policy-block">
        <strong>Hotel Policy:</strong> ${checkboxCell('Food & Beverages from outside are not allowed on our premises. Our Restaurant & Bar Menu offers great choice.')}
      </div>

      ${labelWriteCell('Loyalty Member Discount')}
      <div>${blankLine()}</div>

      ${labelWriteCell('Amount Due')}
      <div>
        <div class="settlement-label">Settlement Mode (pls tick as appropriate):</div>
        <div class="settlement-grid">${settlementGrid()}</div>
      </div>

      ${labelWriteCell('Cashier')}
      <div>
        <span class="field-label">Guest Signature</span>
        <div class="signature-box"></div>
      </div>
    </div>

    <div class="id-section">
      <div class="section-label">Means of Identification</div>
      <div class="id-types">${idTypeRow()}</div>
      <div class="id-fields">
        ${fieldGroup('ID Number')}
        ${fieldGroup('Nationality')}
      </div>
    </div>

    <p class="footer-note">Thank you for your patronage.</p>
  </div>
  ${printScript}
</body>
</html>`;
}
