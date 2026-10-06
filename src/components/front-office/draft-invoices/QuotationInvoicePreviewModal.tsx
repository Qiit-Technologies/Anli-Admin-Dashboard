'use client';

import { recordDraftInvoiceAction } from '@/app/actions/draft-invoices';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useHotel from '@/hooks/useHotel';
import {
    downloadQuotationInvoicePdf,
    printQuotationInvoice,
    resolveInvoiceDraftForPrint,
} from '@/lib/front-office/quotation-invoice-actions';
import { quotationInvoicePrintTemplate } from '@/lib/front-office/quotation-invoice-template';
import type { DraftInvoice } from '@/types/draft-invoice';
import { DocumentPreviewFrame } from '@/components/front-office/common/DocumentPreviewFrame';
import { DraftInvoiceAuditTrail } from '@/components/front-office/draft-invoices/DraftInvoiceAuditTrail';
import { Download, Loader2, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface QuotationInvoicePreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draft: DraftInvoice | null;
    /** When true, shows that this document does not confirm a reservation. */
    quotationOnly?: boolean;
}

export function QuotationInvoicePreviewModal({
    open,
    onOpenChange,
    draft,
    quotationOnly = false,
}: QuotationInvoicePreviewModalProps) {
    const { organization } = useHotel();
    const [pdfLoading, setPdfLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [printDraft, setPrintDraft] = useState<DraftInvoice | null>(null);

    useEffect(() => {
        if (!open || !draft) {
            setPrintDraft(null);
            return;
        }
        let cancelled = false;
        void resolveInvoiceDraftForPrint(draft).then((resolved) => {
            if (!cancelled) setPrintDraft(resolved);
        });
        return () => {
            cancelled = true;
        };
    }, [open, draft]);

    const previewHtml = useMemo(() => {
        const source = printDraft ?? draft;
        if (!source) return '';
        return quotationInvoicePrintTemplate(source, organization, {
            autoPrint: false,
        });
    }, [printDraft, draft, organization]);

    useEffect(() => {
        if (!open || !draft?.id) return;
        void recordDraftInvoiceAction(draft.id, 'viewed');
    }, [open, draft?.id]);

    const handlePrint = async () => {
        if (!draft) return;
        setPrintLoading(true);
        try {
            await printQuotationInvoice(draft, organization);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not print invoice.';
            toast.error(message);
        } finally {
            setPrintLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!draft) return;
        setPdfLoading(true);
        try {
            await downloadQuotationInvoicePdf(draft, organization);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not download PDF.';
            toast.error(message);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center justify-between gap-4 pr-8">
                        <span>
                            Invoice {draft?.invoiceNumber ?? ''}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={!draft || printLoading}
                            >
                                {printLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Printer className="size-4" />
                                )}
                                <span className="ml-2">Print</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                disabled={!draft || pdfLoading}
                            >
                                {pdfLoading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Download className="size-4" />
                                )}
                                <span className="ml-2">Download PDF</span>
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-muted/30 p-4 overflow-auto max-h-[calc(95vh-88px)] flex flex-col gap-3">
                    {quotationOnly && (
                        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-950">
                            This is an <strong>invoice only</strong> for the
                            guest to review pricing. It does not create a
                            reservation. You can close this after printing or
                            downloading — confirming the booking later is
                            optional.
                        </p>
                    )}
                    {open && draft ? (
                        <DocumentPreviewFrame
                            html={previewHtml}
                            title="Invoice preview"
                        />
                    ) : null}
                    {open && draft?.id ? (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">
                                Activity log
                            </h4>
                            <DraftInvoiceAuditTrail
                                draftId={draft.id}
                                compact
                            />
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
