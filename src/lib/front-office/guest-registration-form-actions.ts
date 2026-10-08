import type { OrganizationDetail } from '@/hooks/useHotel';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { guestRegistrationPrintTemplate } from '@/lib/front-office/guest-registration-print-template';

export function printGuestRegistrationForm(
    organization: OrganizationDetail | null | undefined,
): void {
    const html = guestRegistrationPrintTemplate(organization, { autoPrint: true });
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
        throw new Error('Could not open print window. Allow pop-ups and try again.');
    }
    printWindow.document.write(html);
    printWindow.document.close();
}

export async function downloadGuestRegistrationFormPdf(
    organization: OrganizationDetail | null | undefined,
): Promise<void> {
    const hotelName =
        organization?.printoutName?.trim() ||
        organization?.name?.trim() ||
        'hotel';
    const slug = hotelName.replace(/\s+/g, '-').toLowerCase();
    const html = guestRegistrationPrintTemplate(organization, { autoPrint: false });
    await downloadHtmlDocumentAsPdf(html, `guest-registration-${slug}.pdf`);
}

export function guestRegistrationPreviewHtml(
    organization: OrganizationDetail | null | undefined,
): string {
    return guestRegistrationPrintTemplate(organization, { autoPrint: false });
}
