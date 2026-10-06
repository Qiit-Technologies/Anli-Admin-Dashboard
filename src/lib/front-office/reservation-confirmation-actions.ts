import { reservationPrintTemplate } from '@/components/front-office/common/Card/reservation-print-template';
import type { OrganizationDetail } from '@/hooks/useHotel';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { resolveBusinessLogoUrl } from '@/lib/front-office/print-branding';
import type { Reservation } from '@/types/reservation';

export type ReservationConfirmationHotelContext = {
    name?: string;
    address?: string;
    /** All hotel phones, parsed from `printoutPhone` (comma/slash/semicolon separated). */
    phones?: string[];
    email?: string;
    website?: string;
    logoUrl?: string;
    taxId?: string;
    /** Per-hotel HTML override for the Terms & Conditions block. */
    termsHtml?: string;
};

/** Split a free-form phone string ("+234... , +234... / 080...") into clean entries. */
function splitPhones(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw
        .split(/[,/;\n]+/)
        .map((p) => p.trim())
        .filter(Boolean);
}

export function reservationConfirmationHotelFromOrg(
    organization: OrganizationDetail | null | undefined,
): ReservationConfirmationHotelContext | undefined {
    if (!organization) return undefined;

    const phones = splitPhones(organization.printoutPhone);
    if (phones.length === 0 && organization.owner?.phoneNumber) {
        phones.push(organization.owner.phoneNumber);
    }

    return {
        name: organization.printoutName?.trim() || organization.name,
        address: organization.printoutAddress?.trim() || organization.address,
        phones,
        email:
            organization.printoutEmail?.trim() ||
            organization.owner?.email ||
            '',
        website: '',
        logoUrl: resolveBusinessLogoUrl(organization),
        taxId: organization.taxId ?? undefined,
        termsHtml: organization.reservationTermsHtml?.trim()
            ? organization.reservationTermsHtml
            : undefined,
    };
}

export function printReservationConfirmation(
    reservation: Reservation,
    organization: OrganizationDetail | null | undefined,
    staffName?: string,
): void {
    const hotel = reservationConfirmationHotelFromOrg(organization);
    const html = reservationPrintTemplate(reservation, hotel, {
        autoPrint: true,
        staffName,
    });
    if (!html) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
        console.error('Could not open print window');
        return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
}

export async function downloadReservationConfirmationPdf(
    reservation: Reservation,
    organization: OrganizationDetail | null | undefined,
    staffName?: string,
): Promise<void> {
    const hotel = reservationConfirmationHotelFromOrg(organization);
    const html = reservationPrintTemplate(reservation, hotel, {
        autoPrint: false,
        staffName,
    });
    if (!html) {
        throw new Error('Cannot generate confirmation for this reservation.');
    }
    await downloadHtmlDocumentAsPdf(
        html,
        `reservation-confirmation-${reservation.id}.pdf`,
    );
}
