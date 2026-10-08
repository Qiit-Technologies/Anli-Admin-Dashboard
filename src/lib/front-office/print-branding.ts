import type { OrganizationDetail } from '@/hooks/useHotel';
import { escapeHtml } from '@/lib/front-office/print-document-utils';

/** Hotel business logo from organization settings (`coverImage`). */
export function resolveBusinessLogoUrl(
    organization: OrganizationDetail | null | undefined,
): string | undefined {
    const candidates = [
        organization?.coverImage,
        (organization as { logoUrl?: string | null } | null | undefined)?.logoUrl,
        (organization as { logo?: string | null } | null | undefined)?.logo,
        organization?.owner?.profileImage,
    ];

    for (const candidate of candidates) {
        const url = candidate?.trim();
        if (url) return url;
    }

    return undefined;
}

/** Shared compact logo styles — keeps A4 documents to one page. */
export const compactPrintLogoStyles = `
  .print-logo-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 0 3px;
    min-height: 0;
  }
  .print-logo-wrap { flex-shrink: 0; line-height: 0; }
  .print-logo-img {
    display: block;
    max-width: 110px;
    max-height: 32px;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  .print-logo-fallback {
    font-size: 10pt;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: 0.02em;
  }
`;

/** Larger stacked brand header for invoices so the logo stays readable. */
export const invoicePrintLogoStyles = `
  .print-invoice-brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    margin: 0 0 12px;
  }
  .print-invoice-logo-wrap { line-height: 0; }
  .print-invoice-logo-img {
    display: block;
    max-width: 240px;
    max-height: 96px;
    width: auto;
    height: auto;
    object-fit: contain;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-invoice-name {
    font-size: 14pt;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1.2;
  }
  .print-invoice-meta {
    font-size: 9.5pt;
    color: #333;
    line-height: 1.4;
  }
`;

export function buildCompactPrintLogoHtml(
    logoUrl: string | undefined,
    businessName: string,
): string {
    const name = businessName.trim() || 'Hotel';

    if (logoUrl?.trim()) {
        return `<div class="print-logo-wrap"><img class="print-logo-img" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)}" /></div>`;
    }

    return `<div class="print-logo-fallback">${escapeHtml(name)}</div>`;
}

export function buildCompactBrandHeaderHtml(args: {
    logoUrl?: string;
    businessName: string;
    metaLines: string[];
}): string {
    const logo = buildCompactPrintLogoHtml(args.logoUrl, args.businessName);
    const meta = args.metaLines
        .filter(Boolean)
        .map((line) => `<div>${escapeHtml(line)}</div>`)
        .join('');

    if (!meta) {
        return `<div class="print-logo-row">${logo}</div>`;
    }

    return `
      <div class="print-logo-row">
        ${logo}
        <div class="print-brand-meta">${meta}</div>
      </div>`;
}

export function buildInvoiceBrandHeaderHtml(args: {
    logoUrl?: string;
    businessName: string;
    metaLines: string[];
}): string {
    const name = args.businessName.trim() || 'Hotel';
    const logo = args.logoUrl?.trim()
        ? `<div class="print-invoice-logo-wrap"><img class="print-invoice-logo-img" src="${escapeHtml(args.logoUrl)}" alt="${escapeHtml(name)}" /></div>`
        : '';
    const meta = args.metaLines
        .filter(Boolean)
        .map((line) => `<div>${escapeHtml(line)}</div>`)
        .join('');

    return `
      <div class="print-invoice-brand">
        ${logo}
        <div class="print-invoice-name">${escapeHtml(name)}</div>
        ${meta ? `<div class="print-invoice-meta">${meta}</div>` : ''}
      </div>`;
}
