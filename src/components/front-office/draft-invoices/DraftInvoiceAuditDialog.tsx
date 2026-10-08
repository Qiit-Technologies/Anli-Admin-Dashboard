'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DraftInvoice } from '@/types/draft-invoice';
import { DraftInvoiceAuditTrail } from './DraftInvoiceAuditTrail';

interface DraftInvoiceAuditDialogProps {
    draft: DraftInvoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DraftInvoiceAuditDialog({
    draft,
    open,
    onOpenChange,
}: DraftInvoiceAuditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>
                        Activity log
                        {draft?.invoiceNumber
                            ? ` — ${draft.invoiceNumber}`
                            : ''}
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto min-h-0 flex-1">
                    <DraftInvoiceAuditTrail draftId={draft?.id} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
