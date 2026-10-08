import { getDraftInvoicesByBatch, recordDraftInvoiceAction } from '@/app/actions/draft-invoices';
import type { OrganizationDetail } from '@/hooks/useHotel';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import {
    mergeBatchDraftsForPrint,
    resolveDraftBatchId,
} from '@/lib/front-office/draft-invoice-display';
import { quotationInvoicePrintTemplate } from '@/lib/front-office/quotation-invoice-template';
import type { DraftInvoice } from '@/types/draft-invoice';

export async function resolveInvoiceDraftForPrint(
    draft: DraftInvoice,
): Promise<DraftInvoice> {
    const batchId = resolveDraftBatchId(draft);
    if (!batchId) return draft;

    const result = await getDraftInvoicesByBatch(batchId);
    if (!result.data?.length) return draft;
    return mergeBatchDraftsForPrint(result.data);
}

export async function printQuotationInvoice(
    draft: DraftInvoice,
    organization: OrganizationDetail | null | undefined,
): Promise<void> {
    const printDraft = await resolveInvoiceDraftForPrint(draft);
    const html = quotationInvoicePrintTemplate(printDraft, organization, {
        autoPrint: true,
    });

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
        throw new Error('Could not open print window. Allow pop-ups and try again.');
    }
    printWindow.document.write(html);
    printWindow.document.close();

    void recordDraftInvoiceAction(draft.id, 'printed');
}

export async function downloadQuotationInvoicePdf(
    draft: DraftInvoice,
    organization: OrganizationDetail | null | undefined,
): Promise<void> {
    const printDraft = await resolveInvoiceDraftForPrint(draft);
    const html = quotationInvoicePrintTemplate(printDraft, organization, {
        autoPrint: false,
    });

    await downloadHtmlDocumentAsPdf(
        html,
        `invoice-${printDraft.invoiceNumber}.pdf`,
    );

    void recordDraftInvoiceAction(draft.id, 'downloaded');
}
